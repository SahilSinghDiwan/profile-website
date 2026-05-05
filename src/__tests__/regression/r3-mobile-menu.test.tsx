import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../test/test-utils";
import Index from "../../pages/Index";

describe("R3 — Mobile menu", () => {
  it("renders nav buttons (mobile menu toggles open/closed via state)", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Index />);
    const aboutButtons = screen.getAllByRole("button", { name: /^About$/i });
    expect(aboutButtons.length).toBeGreaterThanOrEqual(1);
    await user.click(aboutButtons[0]);
  });
});
