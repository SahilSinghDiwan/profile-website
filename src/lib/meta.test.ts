import { describe, it, expect } from "vitest";
import { resolveImage } from "./meta";
import { buildSitemap } from "../../vite.site-meta";

describe("resolveImage", () => {
  const available = ["/writing/a.png"];
  it("falls back to the default when no image is given", () => {
    expect(resolveImage(undefined, available)).toBe("https://sahildiwan.in/og-default.png");
  });
  it("falls back to the default when the card image is missing from public/", () => {
    expect(resolveImage("/writing/missing.png", available)).toBe("https://sahildiwan.in/og-default.png");
  });
  it("uses an existing card image as an absolute URL", () => {
    expect(resolveImage("/writing/a.png", available)).toBe("https://sahildiwan.in/writing/a.png");
  });
  it("keeps absolute URLs", () => {
    expect(resolveImage("https://x.test/i.png", available)).toBe("https://x.test/i.png");
  });
});

describe("buildSitemap", () => {
  const xml = buildSitemap(process.cwd());
  it("lists static routes, projects and posts", () => {
    expect(xml).toContain("<loc>https://sahildiwan.in/</loc>");
    expect(xml).toContain("<loc>https://sahildiwan.in/writing</loc>");
    expect(xml).toContain("<loc>https://sahildiwan.in/privacy</loc>");
    expect(xml).toContain("/projects/incident-resolution-assistant");
    expect(xml).toContain("/writing/2026-10-28-llmops-ac5ab9");
    expect(xml).not.toContain("2026-11-12-llmops");
  });
});
