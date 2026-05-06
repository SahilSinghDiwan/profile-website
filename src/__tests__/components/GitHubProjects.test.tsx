import { describe, it, expect, beforeAll, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { server } from "../../test/setup";
import { http, HttpResponse } from "msw";
import { GitHubProjects } from "../../components/GitHubProjects";

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());

describe("GitHubProjects", () => {
  it.skip("shows loading skeletons initially", () => {
    server.use(
      http.get("http://localhost:8787/api/github/repos", async () => {
        await new Promise((r) => setTimeout(r, 100));
        return HttpResponse.json([]);
      }),
    );

    const { container } = render(<GitHubProjects />);
    const skeletons = container.querySelectorAll("[class*='skeleton']");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it.skip("renders one card per repo", async () => {
    const mockRepos = [
      {
        name: "test-repo-1",
        slug: "test-repo-1",
        description: "Test description 1",
        html_url: "https://github.com/test/repo1",
        language: "TypeScript",
        topics: ["test", "demo"],
        stargazers_count: 10,
        updated_at: "2024-01-01T00:00:00Z",
        homepage: null,
      },
      {
        name: "test-repo-2",
        slug: "test-repo-2",
        description: "Test description 2",
        html_url: "https://github.com/test/repo2",
        language: "Python",
        topics: [],
        stargazers_count: 5,
        updated_at: "2024-01-02T00:00:00Z",
        homepage: "https://example.com",
      },
    ];

    server.use(
      http.get("http://localhost:8787/api/github/repos", () => HttpResponse.json(mockRepos)),
    );

    render(<GitHubProjects />);

    await waitFor(() => {
      expect(screen.getByText("test-repo-1")).toBeInTheDocument();
      expect(screen.getByText("test-repo-2")).toBeInTheDocument();
    });
  });

  it.skip("shows retry button on error", async () => {
    server.use(
      http.get("http://localhost:8787/api/github/repos", () => HttpResponse.error()),
    );

    render(<GitHubProjects />);

    await waitFor(() => {
      expect(screen.getByText("Retry")).toBeInTheDocument();
    });
  });

  it.skip("does not show chips for empty topics", async () => {
    const mockRepos = [
      {
        name: "no-topics",
        slug: "no-topics",
        description: "No topics",
        html_url: "https://github.com/test/notopics",
        language: "Go",
        topics: [],
        stargazers_count: 0,
        updated_at: "2024-01-01T00:00:00Z",
        homepage: null,
      },
    ];

    server.use(
      http.get("http://localhost:8787/api/github/repos", () => HttpResponse.json(mockRepos)),
    );

    render(<GitHubProjects />);

    await waitFor(() => {
      expect(screen.getByText("no-topics")).toBeInTheDocument();
    });

    // Check that no topic chips are rendered
    const chips = screen.queryAllByText(/^[a-z]+$/);
    expect(chips.length).toBe(0);
  });
});
