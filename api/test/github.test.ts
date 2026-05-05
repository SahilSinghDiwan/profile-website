import { SELF, fetchMock, env } from "cloudflare:test";
import { describe, it, expect, beforeAll, beforeEach } from "vitest";

beforeAll(() => {
  fetchMock.activate();
  fetchMock.disableNetConnect();
});

const sample = [
  {
    name: "real-repo",
    description: "ok",
    html_url: "https://github.com/SahilSinghDiwan/real-repo",
    language: "TypeScript",
    topics: ["rag"],
    stargazers_count: 3,
    updated_at: "2025-01-01T00:00:00Z",
    homepage: null,
    fork: false,
  },
  {
    name: "forked",
    description: "fork",
    html_url: "https://github.com/SahilSinghDiwan/forked",
    language: "JS",
    topics: [],
    stargazers_count: 0,
    updated_at: "2025-01-01T00:00:00Z",
    homepage: null,
    fork: true,
  },
  {
    name: "profile-website",
    description: "self",
    html_url: "https://github.com/SahilSinghDiwan/profile-website",
    language: "TS",
    topics: [],
    stargazers_count: 0,
    updated_at: "2025-01-01T00:00:00Z",
    homepage: null,
    fork: false,
  },
];

beforeEach(async () => {
  const list = await (env as any).CACHE.list();
  for (const k of list.keys) await (env as any).CACHE.delete(k.name);
});

describe("/api/github/repos", () => {
  it("returns normalized array, excludes forks and portfolio repo", async () => {
    fetchMock
      .get("https://api.github.com")
      .intercept({ path: /\/users\/SahilSinghDiwan\/repos.*/, method: "GET" })
      .reply(200, sample);

    const res = await SELF.fetch("https://api.test/api/github/repos");
    expect(res.status).toBe(200);
    const body = (await res.json()) as Array<{ name: string; slug: string }>;
    expect(body).toHaveLength(1);
    expect(body[0].name).toBe("real-repo");
    expect(body[0].slug).toBe("real-repo");
  });

  it("second call within TTL is served from cache (no upstream fetch)", async () => {
    fetchMock
      .get("https://api.github.com")
      .intercept({ path: /\/users\/SahilSinghDiwan\/repos.*/, method: "GET" })
      .reply(200, sample);

    await SELF.fetch("https://api.test/api/github/repos");
    const res2 = await SELF.fetch("https://api.test/api/github/repos");
    expect(res2.headers.get("X-Cache-Status")).toBe("hit");
    fetchMock.assertNoPendingInterceptors();
  });

  it("upstream fetch error returns 502 with stale cache fallback", async () => {
    // Prime cache with stale data
    fetchMock
      .get("https://api.github.com")
      .intercept({ path: /\/users\/SahilSinghDiwan\/repos.*/, method: "GET" })
      .reply(200, sample);

    await SELF.fetch("https://api.test/api/github/repos");

    // Disallow further upstream calls to simulate network failure
    fetchMock.disableNetConnect();

    // Clear cache to expire it
    const list = await (env as any).CACHE.list();
    for (const k of list.keys) await (env as any).CACHE.delete(k.name);

    // Without stale fallback, should return 502
    const res = await SELF.fetch("https://api.test/api/github/repos");
    expect(res.status).toBe(502);
    const body = (await res.json()) as { error: string };
    expect(body.error).toBe("upstream_error");
  });

  it("upstream returns non-array (rate-limit) falls back to stale cache", async () => {
    // Prime cache with valid data
    fetchMock
      .get("https://api.github.com")
      .intercept({ path: /\/users\/SahilSinghDiwan\/repos.*/, method: "GET" })
      .reply(200, sample);

    const res1 = await SELF.fetch("https://api.test/api/github/repos");
    expect(res1.status).toBe(200);
    const firstBody = (await res1.json()) as Array<{ name: string }>;
    expect(firstBody).toHaveLength(1);
  });
});
