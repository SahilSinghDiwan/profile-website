import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../test/test-utils";
import { Routes, Route } from "react-router-dom";
import Projects from "../pages/Projects";
import ProjectDetail from "../pages/ProjectDetail";
import NotFound from "../pages/NotFound";

function TestRoutes() {
  return (
    <Routes>
      <Route path="/projects" element={<Projects />} />
      <Route path="/projects/:slug" element={<ProjectDetail />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

describe("routes", () => {
  it("/projects renders the projects header", () => {
    renderWithProviders(<TestRoutes />, { initialEntries: ["/projects"] });
    expect(screen.getByRole("heading", { level: 1, name: /Projects/i })).toBeInTheDocument();
  });

  it("/projects/incident-resolution-assistant renders project title", () => {
    renderWithProviders(<TestRoutes />, {
      initialEntries: ["/projects/incident-resolution-assistant"],
    });
    expect(
      screen.getByRole("heading", { level: 1, name: /Incident Resolution Assistant/i }),
    ).toBeInTheDocument();
  });

  it("/projects/unknown-slug renders NotFound", () => {
    renderWithProviders(<TestRoutes />, { initialEntries: ["/projects/does-not-exist"] });
    expect(screen.getByText("404")).toBeInTheDocument();
  });
});
