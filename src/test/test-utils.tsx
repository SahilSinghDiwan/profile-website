import { type ReactElement } from "react";
import { render, type RenderOptions } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

interface ProvidersOptions {
  initialEntries?: string[];
}

export function renderWithProviders(ui: ReactElement, opts: ProvidersOptions & Omit<RenderOptions, "wrapper"> = {}) {
  const { initialEntries = ["/"], ...rest } = opts;
  return render(ui, {
    wrapper: ({ children }) => (
      <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
    ),
    ...rest,
  });
}
