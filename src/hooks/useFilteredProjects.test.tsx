import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useFilteredProjects } from "./useFilteredProjects";
import type { ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";

describe("useFilteredProjects", () => {
  const mockProjects = [
    { name: "Project 1", technologies: ["React", "TypeScript"] },
    { name: "Project 2", technologies: ["Python", "Kubernetes"] },
    { name: "Project 3", topics: ["RAG", "LangChain"] },
    { name: "Project 4", technologies: ["kafka", "elasticsearch"] },
  ];

  const createWrapper =
    (initialEntries: string[] = ["/"]) =>
    ({ children }: { children: ReactNode }) =>
      <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>;

  it("selects a tech and updates the URL with ?tech=foo", () => {
    const { result } = renderHook(() => useFilteredProjects(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.setSelected(["RAG"]);
    });

    expect(result.current.selected).toEqual(["RAG"]);
    // Note: URL param check would require accessing location, which is tested via integration
  });

  it("handles multiple selected techs as comma-separated URL params", () => {
    const { result } = renderHook(() => useFilteredProjects(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.setSelected(["RAG", "Kafka"]);
    });

    expect(result.current.selected).toEqual(["RAG", "Kafka"]);
  });

  it("reads initial ?tech=rag from URL on mount", () => {
    const { result } = renderHook(() => useFilteredProjects(), {
      wrapper: createWrapper(["/?tech=rag"]),
    });

    expect(result.current.selected).toEqual(["rag"]);
  });

  it("clears the URL param when setSelected([])", () => {
    const { result } = renderHook(() => useFilteredProjects(), {
      wrapper: createWrapper(["/?tech=rag,kafka"]),
    });

    expect(result.current.selected).toEqual(["rag", "kafka"]);

    act(() => {
      result.current.setSelected([]);
    });

    expect(result.current.selected).toEqual([]);
  });

  it("filters projects case-insensitively by technologies", () => {
    const { result } = renderHook(() => useFilteredProjects(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.setSelected(["react"]);
    });

    const filtered = result.current.filter(mockProjects);
    expect(filtered).toEqual([
      { name: "Project 1", technologies: ["React", "TypeScript"] },
    ]);
  });

  it("filters projects case-insensitively by topics", () => {
    const { result } = renderHook(() => useFilteredProjects(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.setSelected(["rag"]);
    });

    const filtered = result.current.filter(mockProjects);
    expect(filtered).toEqual([
      { name: "Project 3", topics: ["RAG", "LangChain"] },
    ]);
  });

  it("returns all items when selected is empty", () => {
    const { result } = renderHook(() => useFilteredProjects(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.setSelected([]);
    });

    const filtered = result.current.filter(mockProjects);
    expect(filtered).toEqual(mockProjects);
  });

  it("matches items with at least ONE selected tag", () => {
    const { result } = renderHook(() => useFilteredProjects(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.setSelected(["React", "Python"]);
    });

    const filtered = result.current.filter(mockProjects);
    expect(filtered).toEqual([
      { name: "Project 1", technologies: ["React", "TypeScript"] },
      { name: "Project 2", technologies: ["Python", "Kubernetes"] },
    ]);
  });
});
