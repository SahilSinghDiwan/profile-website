import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ProjectAISummary } from "./ProjectAISummary";
import { projectSummary, ApiError } from "../lib/api";

vi.mock("../lib/api", () => {
  return {
    projectSummary: vi.fn(),
    ApiError: class ApiError extends Error {
      status: number;
      constructor(message: string, status: number) {
        super(message);
        this.name = "ApiError";
        this.status = status;
      }
    },
  };
});

const mockProjectSummary = vi.mocked(projectSummary);

describe("ProjectAISummary", () => {
  const testSlug = "test-project";

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  it("should show loading skeleton on mount", () => {
    mockProjectSummary.mockImplementationOnce(
      () =>
        new Promise(() => {
          // Never resolve
        })
    );

    const { container } = render(<ProjectAISummary slug={testSlug} />);

    // Check for aria-busy attribute which CardSkeleton has
    const skeletonCard = container.querySelector('[aria-busy="true"]');
    expect(skeletonCard).toBeInTheDocument();
  });

  it("should render summary text after successful fetch", async () => {
    const testSummary = "This is a test AI summary";
    mockProjectSummary.mockResolvedValueOnce({
      summary: testSummary,
      generatedAt: "2026-04-30T10:00:00Z",
    });

    render(<ProjectAISummary slug={testSlug} />);

    await waitFor(() => {
      expect(screen.getByText(testSummary)).toBeInTheDocument();
    });
  });

  it("should show 'Summary unavailable' and Retry button on API error", async () => {
    mockProjectSummary.mockRejectedValueOnce(
      new ApiError("Network error", 500)
    );

    render(<ProjectAISummary slug={testSlug} />);

    await waitFor(() => {
      expect(screen.getByText(/summary unavailable/i)).toBeInTheDocument();
    });

    const retryButton = screen.getByRole("button", { name: /retry/i });
    expect(retryButton).toBeInTheDocument();
  });

  it("should retry fetch when Retry button is clicked", async () => {
    const testSummary = "Recovered summary";

    mockProjectSummary
      .mockRejectedValueOnce(new ApiError("Network error", 500))
      .mockResolvedValueOnce({
        summary: testSummary,
        generatedAt: "2026-04-30T10:00:00Z",
      });

    render(<ProjectAISummary slug={testSlug} />);

    await waitFor(() => {
      expect(screen.getByText(/summary unavailable/i)).toBeInTheDocument();
    });

    const retryButton = screen.getByRole("button", { name: /retry/i });
    fireEvent.click(retryButton);

    await waitFor(() => {
      expect(screen.getByText(testSummary)).toBeInTheDocument();
    });

    expect(mockProjectSummary).toHaveBeenCalledTimes(2);
  });

  it("should disable Regenerate button when localStorage has recent timestamp", async () => {
    const testSummary = "Test summary";
    mockProjectSummary.mockResolvedValueOnce({
      summary: testSummary,
      generatedAt: "2026-04-30T10:00:00Z",
    });

    const recentTimestamp = Date.now() - 10 * 60 * 1000; // 10 minutes ago
    localStorage.setItem(
      `project-summary-regen:${testSlug}`,
      recentTimestamp.toString()
    );

    render(<ProjectAISummary slug={testSlug} />);

    await waitFor(() => {
      expect(screen.getByText(testSummary)).toBeInTheDocument();
    });

    const regenerateButton = screen.getByRole("button", {
      name: /regenerate/i,
    });
    expect(regenerateButton).toBeDisabled();
    expect(regenerateButton).toHaveAttribute("title");
  });

  it("should enable Regenerate button when no recent timestamp in localStorage", async () => {
    const testSummary = "Test summary";
    mockProjectSummary.mockResolvedValueOnce({
      summary: testSummary,
      generatedAt: "2026-04-30T10:00:00Z",
    });

    render(<ProjectAISummary slug={testSlug} />);

    await waitFor(() => {
      expect(screen.getByText(testSummary)).toBeInTheDocument();
    });

    const regenerateButton = screen.getByRole("button", {
      name: /regenerate/i,
    });
    expect(regenerateButton).not.toBeDisabled();
  });

  it("should update localStorage and disable button when Regenerate is clicked", async () => {
    const testSummary = "Test summary";
    const newSummary = "Regenerated summary";

    mockProjectSummary
      .mockResolvedValueOnce({
        summary: testSummary,
        generatedAt: "2026-04-30T10:00:00Z",
      })
      .mockResolvedValueOnce({
        summary: newSummary,
        generatedAt: "2026-04-30T11:00:00Z",
      });

    render(<ProjectAISummary slug={testSlug} />);

    await waitFor(() => {
      expect(screen.getByText(testSummary)).toBeInTheDocument();
    });

    const regenerateButton = screen.getByRole("button", {
      name: /regenerate/i,
    });
    fireEvent.click(regenerateButton);

    await waitFor(() => {
      expect(screen.getByText(newSummary)).toBeInTheDocument();
    });

    const storedTimestamp = localStorage.getItem(
      `project-summary-regen:${testSlug}`
    );
    expect(storedTimestamp).toBeTruthy();

    // Re-query the button after render completes and check it's disabled
    await waitFor(() => {
      const refreshedButton = screen.getByRole("button", {
        name: /regenerate/i,
      });
      expect(refreshedButton).toHaveAttribute("disabled");
    });
  });

  it("should show remaining cooldown time in button tooltip", async () => {
    const testSummary = "Test summary";
    mockProjectSummary.mockResolvedValueOnce({
      summary: testSummary,
      generatedAt: "2026-04-30T10:00:00Z",
    });

    const recentTimestamp = Date.now() - 30 * 60 * 1000; // 30 minutes ago
    localStorage.setItem(
      `project-summary-regen:${testSlug}`,
      recentTimestamp.toString()
    );

    render(<ProjectAISummary slug={testSlug} />);

    await waitFor(() => {
      expect(screen.getByText(testSummary)).toBeInTheDocument();
    });

    const regenerateButton = screen.getByRole("button", {
      name: /regenerate/i,
    });

    const title = regenerateButton.getAttribute("title");
    expect(title).toMatch(/remaining|minute/i);
  });

  it("should enable Regenerate when cooldown expires", async () => {
    const testSummary = "Test summary";
    mockProjectSummary.mockResolvedValueOnce({
      summary: testSummary,
      generatedAt: "2026-04-30T10:00:00Z",
    });

    const cooldownStart = Date.now() - 60 * 60 * 1000 - 1000; // 1 hour and 1 second ago
    localStorage.setItem(
      `project-summary-regen:${testSlug}`,
      cooldownStart.toString()
    );

    render(<ProjectAISummary slug={testSlug} />);

    await waitFor(() => {
      expect(screen.getByText(testSummary)).toBeInTheDocument();
    });

    const regenerateButton = screen.getByRole("button", {
      name: /regenerate/i,
    });
    expect(regenerateButton).not.toBeDisabled();
  });
});
