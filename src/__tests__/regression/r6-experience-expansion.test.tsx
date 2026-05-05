import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../test/test-utils";
import Index from "../../pages/Index";

describe("R6 — Experience expansion", () => {
  it("shows 'Show N more highlight(s)' and toggles back", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Index />);
    const showMore = screen.getAllByRole("button", { name: /Show \d+ more highlight/i });
    expect(showMore.length).toBeGreaterThan(0);
    await user.click(showMore[0]);
    expect(screen.getAllByRole("button", { name: /Show less/i }).length).toBeGreaterThan(0);
  });

  it("uses singular 'highlight' when count is 1", () => {
    renderWithProviders(<Index />);
    const buttons = screen.queryAllByRole("button", { name: /Show 1 more highlight$/ });
    for (const b of buttons) {
      expect(b.textContent).toMatch(/highlight$/);
    }
  });
});
