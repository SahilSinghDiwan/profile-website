import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../test/test-utils";
import Index from "../../pages/Index";

describe("R5 — Skill expansion", () => {
  it("shows +N more for skill categories with >8 skills and toggles", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Index />);
    const moreButtons = screen.getAllByRole("button", { name: /\+\d+ more/i });
    expect(moreButtons.length).toBeGreaterThan(0);
    await user.click(moreButtons[0]);
    expect(screen.getByRole("button", { name: /Show less/i })).toBeInTheDocument();
  });
});
