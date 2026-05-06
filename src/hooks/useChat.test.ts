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

  it("initializes with empty turns and no error", () => {
    const { result } = renderHook(() => useChat());

    expect(result.current.turns).toEqual([]);
    expect(result.current.streaming).toBe("");
    expect(result.current.error).toBe("");
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isThinking).toBe(false);
  });

  it("appends a user turn and streams an assistant turn", async () => {
    vi.mocked(api.chat).mockReturnValue(createMockGenerator(["Hel", "lo", "!"])() as any);

    const { result } = renderHook(() => useChat({ getTurnstileToken: () => "test-token" }));

    await act(async () => {
      await result.current.sendMessage("Hello");
    });

    expect(result.current.turns).toEqual([
      { role: "user", content: "Hello" },
      { role: "assistant", content: "Hello!" },
    ]);
    expect(result.current.streaming).toBe("");
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isThinking).toBe(false);
  });

  it("includes turnstile token + full conversation history on follow-ups", async () => {
    vi.mocked(api.chat).mockImplementation(() => createMockGenerator(["A1"])() as any);

    const { result } = renderHook(() => useChat({ getTurnstileToken: () => "tok-123" }));

    await act(async () => {
      await result.current.sendMessage("Q1");
    });

    vi.mocked(api.chat).mockImplementation(() => createMockGenerator(["A2"])() as any);

    await act(async () => {
      await result.current.sendMessage("Q2");
    });

    expect(vi.mocked(api.chat)).toHaveBeenLastCalledWith({
      messages: [
        { role: "user", content: "Q1" },
        { role: "assistant", content: "A1" },
        { role: "user", content: "Q2" },
      ],
      turnstileToken: "tok-123",
    });
  });

  it("handles rate limit error and rolls back the user turn", async () => {
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
    expect(result.current.turns).toEqual([]);
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
    expect(result.current.turns).toEqual([]);
  });

  it("reset clears turns, streaming, and error", async () => {
    vi.mocked(api.chat).mockReturnValue(createMockGenerator(["hello"])() as any);

    const { result } = renderHook(() => useChat({ getTurnstileToken: () => "token" }));

    await act(async () => {
      await result.current.sendMessage("test");
    });

    expect(result.current.turns).toHaveLength(2);

    act(() => {
      result.current.reset();
    });

    expect(result.current.turns).toEqual([]);
    expect(result.current.streaming).toBe("");
    expect(result.current.error).toBe("");
    expect(result.current.retryAfter).toBe(0);
  });

  it("flips isLoading to false after the stream finishes", async () => {
    vi.mocked(api.chat).mockReturnValue(createMockGenerator(["response"])() as any);

    const { result } = renderHook(() => useChat({ getTurnstileToken: () => "token" }));

    await act(async () => {
      await result.current.sendMessage("test");
    });

    expect(result.current.isLoading).toBe(false);
  });
});
