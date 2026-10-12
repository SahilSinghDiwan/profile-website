import { env } from "cloudflare:test";
import { describe, it, expect, beforeEach } from "vitest";
import { handleProjectSummary } from "../src/routes/project-summary";
import type { AiBinding } from "../src/lib/llm";

const okAi: AiBinding = { run: async () => ({ response: "A concise generated summary." }) };
const failingAi: AiBinding = { run: async () => { throw new Error("boom"); } };

const call = (slug: string, ai?: AiBinding) =>
  handleProjectSummary(new Request(`https://api.test/api/projects/${slug}/summary`), { ...(env as any), AI: ai }, slug);

beforeEach(async () => {
  const list = await (env as any).CACHE.list();
  for (const k of list.keys) await (env as any).CACHE.delete(k.name);
});

describe("GET /api/projects/:slug/summary", () => {
  it("unknown slug returns 404", async () => {
    const res = await call("unknown-slug", okAi);
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: "not_found" });
  });

  it("known slug returns 200 with the Workers AI summary and generatedAt", async () => {
    const res = await call("incident-resolution-assistant", okAi);
    expect(res.status).toBe(200);
    const body = (await res.json()) as { summary?: string; generatedAt?: string };
    expect(body.summary).toBe("A concise generated summary.");
    expect(body.generatedAt).toBeTruthy();
  });

  it("falls back to the canned summary when Workers AI fails", async () => {
    const res = await call("incident-resolution-assistant", failingAi);
    expect(res.status).toBe(200);
    const body = (await res.json()) as { summary?: string };
    expect(body.summary).toBeTruthy();
    expect(body.summary).not.toBe("A concise generated summary.");
  });

  it("second call within TTL served from cache", async () => {
    const slug = "real-time-log-analysis-pipeline";
    const body1 = await (await call(slug, okAi)).json();
    const body2 = await (await call(slug, failingAi)).json();
    expect(body2).toEqual(body1);
  });

  it("handles all known slugs", async () => {
    const slugs = [
      "incident-resolution-assistant",
      "real-time-log-analysis-pipeline",
      "hybrid-retrieval-system",
      "cloud-native-anomaly-detection",
      "rag-chatbot-with-live-internet-access",
      "multimodal-ai-generation",
    ];
    for (const slug of slugs) {
      const res = await call(slug, okAi);
      expect(res.status).toBe(200);
    }
  });
});
