import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../test/test-utils";
import NotFound from "../../pages/NotFound";

describe("R8 — NotFound", () => {
  it("renders 404 heading and a way home", () => {
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    renderWithProviders(<NotFound />, { initialEntries: ["/some/bad/path"] });
    expect(screen.getByText("404")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Take me home/i })).toBeInTheDocument();
    expect(errSpy).toHaveBeenCalled();
    errSpy.mockRestore();
  });
});
