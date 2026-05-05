import { describe, it, expect, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../test/test-utils";
import Index from "../../pages/Index";

describe("R2 — Theme toggle", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("dark");
  });

  it("reads dark theme from localStorage on mount", () => {
    localStorage.setItem("theme", "dark");
    renderWithProviders(<Index />);
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("toggle flips dark class and persists value", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Index />);
    const toggles = screen.getAllByRole("button").filter((b) => {
      return b.querySelector("svg") && b.textContent === "";
    });
    expect(toggles.length).toBeGreaterThan(0);
    await user.click(toggles[0]);
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(localStorage.getItem("theme")).toBe("dark");
  });
});
