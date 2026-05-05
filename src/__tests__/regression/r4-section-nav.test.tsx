import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../test/test-utils";
import Index from "../../pages/Index";

describe("R4 — Section nav", () => {
  it("clicking each nav button calls scrollIntoView on the matching section", async () => {
    const user = userEvent.setup();
    const scrollSpy = vi.fn();
    Element.prototype.scrollIntoView = scrollSpy;

    renderWithProviders(<Index />);

    for (const name of ["About", "Skills", "Projects", "Experience", "Education", "Contact"]) {
      const buttons = screen.getAllByRole("button", { name: new RegExp(`^${name}$`, "i") });
      await user.click(buttons[0]);
    }

    expect(scrollSpy).toHaveBeenCalled();
  });
});
