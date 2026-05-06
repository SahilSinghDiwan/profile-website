import { useState, useCallback, useRef } from "react";
import { chat, RateLimitError, ApiError, type ChatTurn } from "../lib/api";

interface UseChatOptions {
  getTurnstileToken?: () => string;
  onSettled?: () => void;
}

export interface UseChatReturn {
  turns: ChatTurn[];
  streaming: string;
  isLoading: boolean;
  isThinking: boolean;
  error: string;
  retryAfter: number;
  sendMessage: (question: string) => Promise<void>;
  reset: () => void;
}

export function useChat({ getTurnstileToken = () => "", onSettled }: UseChatOptions = {}): UseChatReturn {
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [streaming, setStreaming] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [retryAfter, setRetryAfter] = useState(0);
  const sendingRef = useRef(false);
  const turnsRef = useRef<ChatTurn[]>([]);
  turnsRef.current = turns;

  const reset = useCallback(() => {
    setTurns([]);
    setStreaming("");
    setError("");
    setRetryAfter(0);
    setIsThinking(false);
  }, []);

  const sendMessage = useCallback(
    async (question: string) => {
      if (sendingRef.current) return;
      const trimmed = question.trim();
      if (!trimmed) return;

      sendingRef.current = true;
      setIsLoading(true);
      setIsThinking(true);
      setError("");
      setStreaming("");
      setRetryAfter(0);

      const userTurn: ChatTurn = { role: "user", content: trimmed };
      const nextTurns = [...turnsRef.current, userTurn];
      setTurns(nextTurns);

      try {
        const token = getTurnstileToken();
        const generator = chat({ messages: nextTurns, turnstileToken: token });

        let accumulated = "";
        for await (const chunk of generator) {
          if (!chunk) continue;
          if (accumulated === "") setIsThinking(false);
          accumulated += chunk;
          setStreaming(accumulated);
        }

        if (accumulated) {
          setTurns((prev) => [...prev, { role: "assistant", content: accumulated }]);
        }
        setStreaming("");
      } catch (err: unknown) {
        // Roll back the optimistic user turn so the failed question is not
        // persisted as part of the history sent on the next attempt.
        setTurns((prev) => prev.slice(0, -1));

        if (err instanceof RateLimitError) {
          setError(`Rate limited — try again in ${err.retryAfter}s`);
          setRetryAfter(err.retryAfter);
        } else if (err instanceof ApiError) {
          setError(err.message);
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unexpected error occurred");
        }
      } finally {
        sendingRef.current = false;
        setIsLoading(false);
        setIsThinking(false);
        onSettled?.();
      }
    },
    [getTurnstileToken, onSettled]
  );

  return {
    turns,
    streaming,
    isLoading,
    isThinking,
    error,
    retryAfter,
    sendMessage,
    reset,
  };
}
