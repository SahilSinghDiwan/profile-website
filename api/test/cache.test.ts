import { env } from "cloudflare:test";
import { describe, it, expect } from "vitest";
import { cacheKey, createKvCache } from "../src/lib/cache";

describe("cache", () => {
  it("set then get returns the value", async () => {
    const cache = createKvCache<{ a: number }>((env as any).CACHE);
    await cache.set("k1", { a: 1 }, 60);
    const got = await cache.get("k1");
    expect(got).toEqual({ a: 1 });
  });

  it("hash is deterministic for the same question", async () => {
    const a = await cacheKey("what is your background?");
    const b = await cacheKey("what is your background?");
    expect(a).toBe(b);
  });

  it("different questions produce different keys", async () => {
    const a = await cacheKey("a");
    const b = await cacheKey("b");
    expect(a).not.toBe(b);
  });
});
