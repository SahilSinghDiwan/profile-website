import { describe, it, expect } from "vitest";
import { projects } from "../../data/projects";
import { experience } from "../../data/experience";

describe("R9 — Data integrity", () => {
  it("projects has at least 6 entries", () => {
    expect(projects.length).toBeGreaterThanOrEqual(6);
  });

  it("every project has all core fields, non-empty", () => {
    for (const p of projects) {
      expect(p.title).toBeTruthy();
      expect(p.description).toBeTruthy();
      expect(p.technologies.length).toBeGreaterThan(0);
      expect(p.impact).toBeTruthy();
      expect(p.category).toBeTruthy();
      expect(p.slug).toMatch(/^[a-z0-9-]+$/);
    }
  });

  it("project slugs are unique", () => {
    const slugs = projects.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("experience has exactly 4 jobs, newest first (AuxoAI, Infobell, ...)", () => {
    expect(experience).toHaveLength(4);
    expect(experience[0].company).toBe("AuxoAI");
    expect(experience[1].company).toBe("Infobell IT Solutions");
    expect(experience[1].period).toBe("March 2024 - October 2026");
  });
});
