import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../test/test-utils";
import Index from "../pages/Index";

describe("Index smoke", () => {
  it("renders the H1", () => {
    renderWithProviders(<Index />);
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1).toBeInTheDocument();
    expect(h1.textContent).toMatch(/Sahil Diwan/i);
  });
});
