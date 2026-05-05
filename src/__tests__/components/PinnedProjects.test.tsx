import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../test/test-utils";
import { PinnedProjects } from "../../components/PinnedProjects";
import { projects } from "../../data/projects";

describe("PinnedProjects", () => {
  it("renders only pinned projects", () => {
    renderWithProviders(<PinnedProjects />);
    const pinned = projects.filter((p) => p.pinned);
    for (const p of pinned) {
      expect(screen.getByRole("link", { name: p.title })).toBeInTheDocument();
    }
  });

  it("links to project detail page", () => {
    renderWithProviders(<PinnedProjects />);
    const pinned = projects.filter((p) => p.pinned);
    if (pinned.length > 0) {
      const link = screen.getByRole("link", { name: pinned[0].title });
      expect(link).toHaveAttribute("href", `/projects/${pinned[0].slug}`);
    }
  });
});
