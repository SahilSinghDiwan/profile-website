import { SELF, fetchMock, env } from "cloudflare:test";
import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import corpus from "../data/corpus.json";

const LLM_HOST = "https://generativelanguage.googleapis.com";
const CHAT_PATH = "/v1beta/openai/chat/completions";
const EMBED_PATH = "/v1beta/openai/embeddings";

// A query vector identical to a corpus chunk scores cosine 1.0 (relevant);
// a one-hot vector scores near 0 against real embeddings (off-topic).
const relevantVec = (corpus as { chunks: { embedding: number[] }[] }).chunks[0].embedding;
const offTopicVec = relevantVec.map((_, i) => (i === 0 ? 1 : 0));

function mockEmbedding(vec: number[]) {
  fetchMock
    .get(LLM_HOST)
    .intercept({ path: EMBED_PATH, method: "POST" })
    .reply(200, JSON.stringify({ data: [{ embedding: vec }] }));
}

beforeAll(() => {
  fetchMock.activate();
  fetchMock.disableNetConnect();
});

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

  it("valid request with dev mode returns 200 with streaming response", async () => {
    mockEmbedding(relevantVec);
    fetchMock
      .get(LLM_HOST)
      .intercept({ path: CHAT_PATH, method: "POST" })
      .reply(200, 'data: {"choices":[{"delta":{"content":"Hello"}}]}\ndata: [DONE]');

    const res = await SELF.fetch("https://api.test/api/chat?dev=1", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: "Tell me about your experience",
        turnstileToken: "valid-token",
      }),
    });

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("text/event-stream");
    await res.text(); // drain the stream so isolated storage can settle
  });

  it("identical request served from cache on second call", async () => {
    mockEmbedding(relevantVec);
    fetchMock
      .get(LLM_HOST)
      .intercept({ path: CHAT_PATH, method: "POST" })
      .reply(200, 'data: {"choices":[{"delta":{"content":"Cached"}}]}\ndata: [DONE]');

    // First request
    const res1 = await SELF.fetch("https://api.test/api/chat?dev=1", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: "Unique cache Q1",
        turnstileToken: "valid-token",
      }),
    });
    expect(res1.status).toBe(200);
    const body1 = await res1.text();
    expect(body1).toBeTruthy();

    // Second request with same question
    const res2 = await SELF.fetch("https://api.test/api/chat?dev=1", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: "Unique cache Q1",
        turnstileToken: "valid-token",
      }),
    });
    expect(res2.status).toBe(200);
    expect(res2.headers.get("X-Cache-Status")).toBe("hit");
    const body2 = await res2.text();
    expect(body1).toBe(body2);
  });

  it("low-relevance question returns scope refusal", async () => {
    mockEmbedding(offTopicVec);
    const res = await SELF.fetch("https://api.test/api/chat?dev=1", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: "What is 2+2? What time is it? Random noise",
        turnstileToken: "valid-token",
      }),
    });

    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toContain("scope");
  });

  it("dev mode bypasses turnstile requirement", async () => {
    mockEmbedding(relevantVec);
    fetchMock
      .get(LLM_HOST)
      .intercept({ path: CHAT_PATH, method: "POST" })
      .reply(200, 'data: {"choices":[{"delta":{"content":"Dev"}}]}\ndata: [DONE]');

    const res = await SELF.fetch("https://api.test/api/chat?dev=1", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: "Dev test question",
        turnstileToken: "ignored",
      }),
    });

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("text/event-stream");
    await res.text(); // drain the stream so isolated storage can settle
  });
});
