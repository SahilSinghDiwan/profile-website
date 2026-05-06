import { useSearchParams } from "react-router-dom";
import { useCallback } from "react";

export interface Filterable {
  technologies?: string[];
  topics?: string[];
}

export interface UseFilteredProjectsReturn {
  selected: string[];
  setSelected: (next: string[]) => void;
  filter: <T extends Filterable>(items: T[]) => T[];
}

export function useFilteredProjects(): UseFilteredProjectsReturn {
  const [searchParams, setSearchParams] = useSearchParams();

  const selected = searchParams.get("tech")
    ? searchParams.get("tech")!.split(",")
    : [];

  const setSelected = useCallback(
    (next: string[]) => {
      if (next.length === 0) {
        searchParams.delete("tech");
      } else {
        searchParams.set("tech", next.join(","));
      }
      setSearchParams(searchParams);
    },
    [searchParams, setSearchParams]
  );

  const filter = useCallback(
    <T extends Filterable>(items: T[]): T[] => {
      if (selected.length === 0) {
        return items;
      }

      const selectedLower = selected.map((s) => s.toLowerCase());

      return items.filter((item) => {
        const technologies = (item.technologies || []).map((t) =>
          t.toLowerCase()
        );
        const topics = (item.topics || []).map((t) => t.toLowerCase());

        return selectedLower.some(
          (tag) => technologies.includes(tag) || topics.includes(tag)
        );
      });
    },
    [selected]
  );

  return {
    selected,
    setSelected,
    filter,
  };
}
