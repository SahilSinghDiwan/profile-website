import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../test/test-utils";
import Index from "../../pages/Index";

describe("R7 — Contact links", () => {
  it("renders email, LinkedIn, WhatsApp with correct href + aria-label", () => {
    renderWithProviders(<Index />);
    const email = screen.getByRole("link", { name: /Email — diwan.sahilsingh@gmail.com/i });
    expect(email).toHaveAttribute("href", "mailto:diwan.sahilsingh@gmail.com");

    const linkedin = screen.getByRole("link", { name: /LinkedIn — linkedin.com\/in\/diwan-sahil/i });
    expect(linkedin).toHaveAttribute("href", "https://www.linkedin.com/in/diwan-sahil");

    const whatsapp = screen.getByRole("link", { name: /WhatsApp/i });
    expect(whatsapp.getAttribute("href") ?? "").toContain("918007192680");
  });
});
