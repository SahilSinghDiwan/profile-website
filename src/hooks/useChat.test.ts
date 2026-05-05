import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useChat } from "./useChat";
import * as api from "../lib/api";
import { RateLimitError, ApiError } from "../lib/api";

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

describe("useChat hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("initializes with empty message and no error", () => {
    const { result } = renderHook(() => useChat());

    expect(result.current.message).toBe("");
    expect(result.current.error).toBe("");
    expect(result.current.isLoading).toBe(false);
  });

  it("sends a message and streams response chunks", async () => {
    vi.mocked(api.chat).mockReturnValue(createMockGenerator(["Hel", "lo", "!"])() as any);

    const { result } = renderHook(() => useChat({ getTurnstileToken: () => "test-token" }));

    await act(async () => {
      await result.current.sendMessage("Hello");
    });

    expect(result.current.message).toBe("Hello!");
    expect(result.current.isLoading).toBe(false);
  });

  it("includes turnstile token in chat request", async () => {
    vi.mocked(api.chat).mockReturnValue(createMockGenerator(["response"])() as any);

    const { result } = renderHook(() => useChat({ getTurnstileToken: () => "test-token-123" }));

    await act(async () => {
      await result.current.sendMessage("test");
    });

    expect(vi.mocked(api.chat)).toHaveBeenCalledWith({
      question: "test",
      turnstileToken: "test-token-123",
    });
  });

  it("handles rate limit error with countdown", async () => {
    const rateLimitError = new RateLimitError(30);
    vi.mocked(api.chat).mockImplementation(() => {
      const gen = (async function* () {
        throw rateLimitError;
      })();
      return gen as any;
    });

    const { result } = renderHook(() => useChat({ getTurnstileToken: () => "token" }));

    await act(async () => {
      await result.current.sendMessage("test");
    });

    expect(result.current.error).toContain("Rate limited");
    expect(result.current.retryAfter).toBe(30);
  });

  it("handles other API errors gracefully", async () => {
    const apiError = new ApiError("Server error", 500);
    vi.mocked(api.chat).mockImplementation(() => {
      const gen = (async function* () {
        throw apiError;
      })();
      return gen as any;
    });

    const { result } = renderHook(() => useChat({ getTurnstileToken: () => "token" }));

    await act(async () => {
      await result.current.sendMessage("test");
    });

    expect(result.current.error).toBe("Server error");
  });

  it("clears message when reset is called", async () => {
    vi.mocked(api.chat).mockReturnValue(createMockGenerator(["hello"])() as any);

    const { result } = renderHook(() => useChat({ getTurnstileToken: () => "token" }));

    await act(async () => {
      await result.current.sendMessage("test");
    });

    expect(result.current.message).toBe("hello");

    act(() => {
      result.current.reset();
    });

    expect(result.current.message).toBe("");
    expect(result.current.error).toBe("");
    expect(result.current.retryAfter).toBe(0);
  });

  it("sets isLoading to false after message is sent", async () => {
    vi.mocked(api.chat).mockReturnValue(createMockGenerator(["response"])() as any);

    const { result } = renderHook(() => useChat({ getTurnstileToken: () => "token" }));

    await act(async () => {
      await result.current.sendMessage("test");
    });

    expect(result.current.isLoading).toBe(false);
  });
});
