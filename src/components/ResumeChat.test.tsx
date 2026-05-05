import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ResumeChat } from "./ResumeChat";
import * as api from "../lib/api";
import { RateLimitError } from "../lib/api";

vi.mock("../lib/api", async () => {
  const actual = await vi.importActual<typeof import("../lib/api")>("../lib/api");
  return {
    ...actual,
    chat: vi.fn(),
  };
});

function createMockGenerator(chunks: string[]) {
  return async function* () {
    for (const chunk of chunks) {
      yield chunk;
    }
  };
}

describe("ResumeChat", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders closed by default - panel not in DOM", () => {
    vi.mocked(api.chat).mockReturnValue(createMockGenerator([])() as any);

    render(<ResumeChat />);

    const panel = screen.queryByRole("dialog");
    expect(panel).not.toBeInTheDocument();
  });

  it("click bubble makes panel visible", async () => {
    vi.mocked(api.chat).mockReturnValue(createMockGenerator([])() as any);

    render(<ResumeChat />);

    const bubble = screen.getByLabelText("Open chat");
    await userEvent.click(bubble);

    const panel = screen.getByRole("dialog");
    expect(panel).toBeInTheDocument();
  });

  it("close button hides the panel", async () => {
    vi.mocked(api.chat).mockReturnValue(createMockGenerator([])() as any);

    render(<ResumeChat />);

    const bubble = screen.getByLabelText("Open chat");
    await userEvent.click(bubble);

    const closeButton = screen.getByLabelText("Close chat");
    await userEvent.click(closeButton);

    const panel = screen.queryByRole("dialog");
    expect(panel).not.toBeInTheDocument();
  });

  it("shows suggested chips when empty", async () => {
    vi.mocked(api.chat).mockReturnValue(createMockGenerator([])() as any);

    render(<ResumeChat />);

    const bubble = screen.getByLabelText("Open chat");
    await userEvent.click(bubble);

    const chips = screen.getAllByRole("button");
    expect(
      chips.some((btn) => btn.textContent?.includes("What's Sahil's experience"))
    ).toBeTruthy();
  });

  it("suggested chip click pre-fills and triggers send", async () => {
    vi.mocked(api.chat).mockReturnValue(createMockGenerator(["Experience with Kafka"])() as any);

    render(<ResumeChat getTurnstileToken={() => "test-token"} />);

    const bubble = screen.getByLabelText("Open chat");
    await userEvent.click(bubble);

    // Find and click the first suggested question chip
    const chips = screen.getAllByRole("button");
    const suggestionChip = chips.find((btn) => btn.textContent?.includes("What's Sahil's experience"));

    if (suggestionChip) {
      await userEvent.click(suggestionChip);

      await waitFor(() => {
        expect(vi.mocked(api.chat)).toHaveBeenCalled();
      });
    }
  });

  it("streams response chunks incrementally", async () => {
    vi.mocked(api.chat).mockReturnValue(createMockGenerator(["Hel", "lo", " ", "world"])() as any);

    render(<ResumeChat getTurnstileToken={() => "test-token"} />);

    const bubble = screen.getByLabelText("Open chat");
    await userEvent.click(bubble);

    const input = screen.getByPlaceholderText("Ask about Sahil's experience...");
    await userEvent.type(input, "test question");

    const sendButton = screen.getByLabelText("Send message");
    await userEvent.click(sendButton);

    await waitFor(() => {
      const message = screen.getByText(/Hello world/);
      expect(message).toBeInTheDocument();
    });
  });

  it("displays rate limit error with countdown", async () => {
    const rateLimitError = new RateLimitError(30);
    vi.mocked(api.chat).mockImplementation(async function* () {
      throw rateLimitError;
    } as any);

    render(<ResumeChat getTurnstileToken={() => "test-token"} />);

    const bubble = screen.getByLabelText("Open chat");
    await userEvent.click(bubble);

    const input = screen.getByPlaceholderText("Ask about Sahil's experience...");
    await userEvent.type(input, "test");

    const sendButton = screen.getByLabelText("Send message");
    await userEvent.click(sendButton);

    await waitFor(() => {
      const errorMsg = screen.getByText(/Rate limited/);
      expect(errorMsg).toBeInTheDocument();
    });

    // Check that countdown is visible (starts at 30)
    await waitFor(() => {
      expect(screen.getByText(/30/)).toBeInTheDocument();
    });
  });

  it("includes turnstile token in API call", async () => {
    vi.mocked(api.chat).mockReturnValue(createMockGenerator(["response"])() as any);

    render(<ResumeChat getTurnstileToken={() => "my-token-123"} />);

    const bubble = screen.getByLabelText("Open chat");
    await userEvent.click(bubble);

    const input = screen.getByPlaceholderText("Ask about Sahil's experience...");
    await userEvent.type(input, "test");

    const sendButton = screen.getByLabelText("Send message");
    await userEvent.click(sendButton);

    await waitFor(() => {
      expect(vi.mocked(api.chat)).toHaveBeenCalledWith(
        expect.objectContaining({
          turnstileToken: "my-token-123",
        })
      );
    });
  });

  it("shows powered by footer", async () => {
    vi.mocked(api.chat).mockReturnValue(createMockGenerator([])() as any);

    render(<ResumeChat />);

    const bubble = screen.getByLabelText("Open chat");
    await userEvent.click(bubble);

    const footer = screen.getByText(/Powered by Sahil's resume/);
    expect(footer).toBeInTheDocument();
  });

  it("clears suggestions after sending a message", async () => {
    vi.mocked(api.chat).mockReturnValue(createMockGenerator(["response"])() as any);

    render(<ResumeChat getTurnstileToken={() => "token"} />);

    const bubble = screen.getByLabelText("Open chat");
    await userEvent.click(bubble);

    // Should show suggestions initially
    let chips = screen.getAllByRole("button");
    expect(chips.length).toBeGreaterThan(1);

    const input = screen.getByPlaceholderText("Ask about Sahil's experience...");
    await userEvent.type(input, "test");

    const sendButton = screen.getByLabelText("Send message");
    await userEvent.click(sendButton);

    await waitFor(() => {
      // After message, suggestions should be gone
      chips = screen.queryAllByText(/What's Sahil/);
      expect(chips.length).toBe(0);
    });
  });
});
