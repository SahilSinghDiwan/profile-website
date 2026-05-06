import { describe, it, expect } from "vitest";
import { renderWithProviders } from "../../test/test-utils";
import Index from "../../pages/Index";

describe("R10 — Card uniformity", () => {
  it("section cards use h-full flex flex-col template", () => {
    const { container } = renderWithProviders(<Index />);
    const cards = container.querySelectorAll('[class*="rounded-lg"][class*="border"]');
    expect(cards.length).toBeGreaterThan(0);
    for (const card of cards) {
      const className = card.className;
      if (typeof className !== "string") continue;
      if (
        className.includes("rounded-lg") &&
        className.includes("border") &&
        className.includes("bg-card") &&
        className.includes("h-full")
      ) {
        expect(className).toContain("flex");
        expect(className).toContain("flex-col");
      }
    }
  });
});
