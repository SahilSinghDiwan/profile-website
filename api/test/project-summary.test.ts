import { SELF } from "cloudflare:test";
import { describe, it, expect } from "vitest";

describe("GET /api/projects/:slug/summary", () => {
  it("unknown slug returns 404", async () => {
    const res = await SELF.fetch("https://api.test/api/projects/unknown-slug/summary");
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: "not_found" });
  });

  it("known slug returns 200 with summary and generatedAt", async () => {
    const res = await SELF.fetch(
      "https://api.test/api/projects/incident-resolution-assistant/summary",
    );
    expect(res.status).toBe(200);

    const body = (await res.json()) as { summary?: string; generatedAt?: string };
    expect(body.summary).toBeTruthy();
    expect(body.generatedAt).toBeTruthy();
    expect(typeof body.summary).toBe("string");
    expect(typeof body.generatedAt).toBe("string");
  });

  it("second call within TTL served from cache", async () => {
    const slug = "real-time-log-analysis-pipeline";

    // First request
    const res1 = await SELF.fetch(`https://api.test/api/projects/${slug}/summary`);
    expect(res1.status).toBe(200);
    const body1 = await res1.json();

    // Second request (should be cached)
    const res2 = await SELF.fetch(`https://api.test/api/projects/${slug}/summary`);
    expect(res2.status).toBe(200);
    const body2 = await res2.json();

    // Both responses should be identical
    expect(body1.summary).toBe(body2.summary);
    expect(body1.generatedAt).toBe(body2.generatedAt);
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
      const res = await SELF.fetch(`https://api.test/api/projects/${slug}/summary`);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.summary).toBeTruthy();
      expect(body.generatedAt).toBeTruthy();
    }
  });
});
