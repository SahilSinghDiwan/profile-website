import { env } from "cloudflare:test";
import { describe, it, expect, beforeEach } from "vitest";
import { checkRateLimit } from "../src/lib/ratelimit";

const cfg = { limit: 10, windowSec: 60 };

async function clearRL() {
  const list = await (env as any).RATE_LIMIT.list({ prefix: "rl:" });
  for (const k of list.keys) await (env as any).RATE_LIMIT.delete(k.name);
}

describe("rate limiter", () => {
  beforeEach(clearRL);

  it("allows 10 calls in a minute", async () => {
    const now = 1_700_000_000_000;
    for (let i = 0; i < 10; i++) {
      const r = await checkRateLimit((env as any).RATE_LIMIT, "chat", "1.2.3.4", cfg, now);
      expect(r.ok).toBe(true);
    }
  });

  it("11th call returns not ok with Retry-After", async () => {
    const now = 1_700_000_000_000;
    for (let i = 0; i < 10; i++) {
      await checkRateLimit((env as any).RATE_LIMIT, "chat", "1.2.3.4", cfg, now);
    }
    const r = await checkRateLimit((env as any).RATE_LIMIT, "chat", "1.2.3.4", cfg, now);
    expect(r.ok).toBe(false);
    expect(r.retryAfter).toBeGreaterThan(0);
  });

  it("different IPs are isolated", async () => {
    const now = 1_700_000_000_000;
    for (let i = 0; i < 10; i++) {
      await checkRateLimit((env as any).RATE_LIMIT, "chat", "1.2.3.4", cfg, now);
    }
    const other = await checkRateLimit((env as any).RATE_LIMIT, "chat", "5.6.7.8", cfg, now);
    expect(other.ok).toBe(true);
  });

  it("counter resets after the window", async () => {
    const now = 1_700_000_000_000;
    for (let i = 0; i < 10; i++) {
      await checkRateLimit((env as any).RATE_LIMIT, "chat", "1.2.3.4", cfg, now);
    }
    const later = now + 61_000;
    const r = await checkRateLimit((env as any).RATE_LIMIT, "chat", "1.2.3.4", cfg, later);
    expect(r.ok).toBe(true);
  });
});
