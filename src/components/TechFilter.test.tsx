import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TechFilter } from "./TechFilter";
import { render } from "@testing-library/react";

describe("TechFilter", () => {
  const availableTechs = ["React", "TypeScript", "Python", "Kubernetes"];

  it("renders one chip per availableTech", () => {
    const onChange = vi.fn();
    render(
      <TechFilter
        availableTechs={availableTechs}
        selected={[]}
        onChange={onChange}
      />
    );

    availableTechs.forEach((tech) => {
      expect(screen.getByText(tech)).toBeInTheDocument();
    });
  });

  it("calls onChange with [...selected, tech] when unselected chip is clicked", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <TechFilter
        availableTechs={availableTechs}
        selected={["React"]}
        onChange={onChange}
      />
    );

    await user.click(screen.getByText("TypeScript"));
    expect(onChange).toHaveBeenCalledWith(["React", "TypeScript"]);
  });

  it("calls onChange without tech when selected chip is clicked", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <TechFilter
        availableTechs={availableTechs}
        selected={["React", "TypeScript"]}
        onChange={onChange}
      />
    );

    await user.click(screen.getByText("React"));
    expect(onChange).toHaveBeenCalledWith(["TypeScript"]);
  });

  it("renders 'Clear all' button only when selected.length > 0", () => {
    const onChange = vi.fn();

    const { rerender } = render(
      <TechFilter
        availableTechs={availableTechs}
        selected={[]}
        onChange={onChange}
      />
    );

    expect(screen.queryByText("Clear all")).not.toBeInTheDocument();

    rerender(
      <TechFilter
        availableTechs={availableTechs}
        selected={["React"]}
        onChange={onChange}
      />
    );

    expect(screen.getByText("Clear all")).toBeInTheDocument();
  });

  it("calls onChange([]) when 'Clear all' button is clicked", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <TechFilter
        availableTechs={availableTechs}
        selected={["React", "TypeScript"]}
        onChange={onChange}
      />
    );

    await user.click(screen.getByText("Clear all"));
    expect(onChange).toHaveBeenCalledWith([]);
  });
});
