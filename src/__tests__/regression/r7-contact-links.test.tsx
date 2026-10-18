import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../test/test-utils";
import Index from "../../pages/Index";

describe("R7 — Contact links", () => {
  it("renders LinkedIn, YouTube, X with correct href + aria-label", () => {
    renderWithProviders(<Index />);
    const linkedin = screen.getByRole("link", { name: /LinkedIn — linkedin.com\/in\/diwan-sahil/i });
    expect(linkedin).toHaveAttribute("href", "https://www.linkedin.com/in/diwan-sahil");

    const youtube = screen.getByRole("link", { name: /YouTube — youtube.com\/@latentworkshop/i });
    expect(youtube).toHaveAttribute("href", "https://www.youtube.com/@latentworkshop");

    const x = screen.getByRole("link", { name: /X — x.com\/latent_workshop/i });
    expect(x).toHaveAttribute("href", "https://x.com/latent_workshop");
  });

  it("publishes no email or phone (ticket 07: LinkedIn is the only contact route)", () => {
    const { container } = renderWithProviders(<Index />);
    expect(container.querySelector('a[href^="mailto:"]')).toBeNull();
    expect(container.querySelector('a[href*="wa.me"]')).toBeNull();
    expect(container.textContent).not.toMatch(/diwan\.sahilsingh@|800-7192-680/);
  });
});
