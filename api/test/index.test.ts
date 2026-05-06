import { SELF } from "cloudflare:test";
import { describe, expect, it } from "vitest";

describe("API smoke", () => {
  it("GET /healthz returns 200 ok", async () => {
    const res = await SELF.fetch("https://api.test/healthz");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });

  it("Unknown route returns 404 not_found", async () => {
    const res = await SELF.fetch("https://api.test/nope");
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: "not_found" });
  });

  it("OPTIONS /api/chat returns CORS allow-origin", async () => {
    const res = await SELF.fetch("https://api.test/api/chat", { method: "OPTIONS" });
    expect(res.status).toBe(204);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBeTruthy();
  });
});
