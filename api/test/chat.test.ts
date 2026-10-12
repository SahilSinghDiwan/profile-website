import { SELF, env } from "cloudflare:test";
import { describe, it, expect, beforeEach } from "vitest";
import corpus from "../data/corpus.json";
import { handleChat } from "../src/routes/chat";
import type { AiBinding } from "../src/lib/llm";

// A query vector identical to a corpus chunk scores cosine 1.0 (relevant);
// a one-hot vector scores near 0 against real embeddings (off-topic).
const relevantVec = (corpus as { chunks: { embedding: number[] }[] }).chunks[0].embedding;
const offTopicVec = relevantVec.map((_, i) => (i === 0 ? 1 : 0));

const sse = (text: string) =>
  new ReadableStream<Uint8Array>({
    start(c) {
      const enc = new TextEncoder();
      c.enqueue(enc.encode(`data: {"response":${JSON.stringify(text)}}\n\ndata: [DONE]\n\n`));
      c.close();
    },
  });

function fakeAi(vec: number[], reply = "Hello"): AiBinding & { calls: string[] } {
  const calls: string[] = [];
  return {
    calls,
    async run(model, input) {
      calls.push(model);
      if (model.includes("bge")) return { data: [vec] };
      if (input.stream) return sse(reply);
      return { response: reply };
    },
  };
}

function ask(question: string, ai: AiBinding) {
  const req = new Request("https://api.test/api/chat?dev=1", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, turnstileToken: "valid-token" }),
  });
  return handleChat(req, { ...(env as any), AI: ai });
}

beforeEach(async () => {
  const list = await (env as any).CACHE.list();
  for (const k of list.keys) await (env as any).CACHE.delete(k.name);
});

describe("POST /api/chat", () => {
  it("missing turnstile token returns 401", async () => {
    const res = await SELF.fetch("https://api.test/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: "What is your experience?" }),
    });
    expect(res.status).toBe(401);
  });

  it("empty body returns 400", async () => {
    const res = await SELF.fetch("https://api.test/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    });
    expect(res.status).toBe(400);
  });

  it("valid request streams the Workers AI reply", async () => {
    const ai = fakeAi(relevantVec, "Hello from Workers AI");
    const res = await ask("Tell me about your experience", ai);
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("text/event-stream");
    expect(await res.text()).toBe("Hello from Workers AI");
    expect(ai.calls).toHaveLength(2); // embed + chat
  });

  it("identical request served from cache on second call", async () => {
    const ai = fakeAi(relevantVec, "Cached");
    const res1 = await ask("Cache me please", ai);
    const body1 = await res1.text();
    expect(res1.headers.get("X-Cache-Status")).toBe("miss");

    const ai2 = fakeAi(relevantVec, "SHOULD NOT BE CALLED");
    const res2 = await ask("Cache me please", ai2);
    expect(res2.headers.get("X-Cache-Status")).toBe("hit");
    expect(await res2.text()).toBe(body1);
    expect(ai2.calls).toHaveLength(0);
  });

  it("low-relevance question returns scope refusal without calling the chat model", async () => {
    const ai = fakeAi(offTopicVec);
    const res = await ask("What is 2+2? What time is it? Random noise", ai);
    expect(res.status).toBe(200);
    expect(await res.text()).toContain("scope");
    expect(ai.calls.every((m) => m.includes("bge"))).toBe(true);
  });

  it("embedding failure returns 502", async () => {
    const ai: AiBinding = { run: async () => { throw new Error("boom"); } };
    const res = await ask("Anything about experience", ai);
    expect(res.status).toBe(502);
  });

  it("parses OpenAI-style streaming chunks too", async () => {
    const ai: AiBinding = {
      async run(model) {
        if (model.includes("bge")) return { data: [relevantVec] };
        return new ReadableStream<Uint8Array>({
          start(c) {
            c.enqueue(new TextEncoder().encode('data: {"choices":[{"delta":{"content":"Chunky"}}]}\n\ndata: [DONE]\n\n'));
            c.close();
          },
        });
      },
    };
    const res = await ask("Tell me about your projects", ai);
    expect(await res.text()).toBe("Chunky");
  });
});
