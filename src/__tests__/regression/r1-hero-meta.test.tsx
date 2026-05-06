import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../test/test-utils";
import Index from "../../pages/Index";

describe("R1 — Hero & meta", () => {
  it("H1 contains Sahil Diwan and AI / Gen AI Engineer", () => {
    renderWithProviders(<Index />);
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1.textContent).toMatch(/Sahil Diwan/i);
    expect(h1.textContent).toMatch(/AI \/ Gen AI Engineer/i);
  });

  it("renders View My Work and Get In Touch CTAs", () => {
    renderWithProviders(<Index />);
    expect(screen.getByRole("button", { name: /View My Work/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Get In Touch/i })).toBeInTheDocument();
  });
});
