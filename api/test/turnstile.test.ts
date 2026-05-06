import { fetchMock } from "cloudflare:test";
import { describe, it, expect, beforeAll, afterEach } from "vitest";
import { verifyTurnstile } from "../src/lib/turnstile";

beforeAll(() => {
  fetchMock.activate();
  fetchMock.disableNetConnect();
});
afterEach(() => fetchMock.assertNoPendingInterceptors());

describe("turnstile", () => {
  it("valid token returns ok", async () => {
    fetchMock
      .get("https://challenges.cloudflare.com")
      .intercept({ path: "/turnstile/v0/siteverify", method: "POST" })
      .reply(200, { success: true });

    const r = await verifyTurnstile("secret", "good-token");
    expect(r.ok).toBe(true);
  });

  it("invalid token returns ok=false with error codes", async () => {
    fetchMock
      .get("https://challenges.cloudflare.com")
      .intercept({ path: "/turnstile/v0/siteverify", method: "POST" })
      .reply(200, { success: false, "error-codes": ["invalid-input-response"] });

    const r = await verifyTurnstile("secret", "bad-token");
    expect(r.ok).toBe(false);
    expect(r.errorCodes).toContain("invalid-input-response");
  });

  it("missing secret throws helpful error", async () => {
    await expect(verifyTurnstile(undefined, "x")).rejects.toThrow(/TURNSTILE_SECRET_KEY/);
  });
});
