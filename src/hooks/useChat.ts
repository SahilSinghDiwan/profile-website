import { useState, useCallback, useRef } from "react";
import { chat, RateLimitError, ApiError } from "../lib/api";

interface UseChatOptions {
  getTurnstileToken?: () => string;
  onSettled?: () => void;
}

export interface UseChatReturn {
  message: string;
  error: string;
  isLoading: boolean;
  retryAfter: number;
  sendMessage: (question: string) => Promise<void>;
  reset: () => void;
}

export function useChat({ getTurnstileToken = () => "", onSettled }: UseChatOptions = {}): UseChatReturn {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [retryAfter, setRetryAfter] = useState(0);
  const sendingRef = useRef(false);

  const reset = useCallback(() => {
    setMessage("");
    setError("");
    setRetryAfter(0);
  }, []);

  const sendMessage = useCallback(
    async (question: string) => {
      if (sendingRef.current) return;
      sendingRef.current = true;
      setIsLoading(true);
      setError("");
      setMessage("");
      setRetryAfter(0);

      try {
        const token = getTurnstileToken();
        const generator = chat({ question, turnstileToken: token });

        let accumulated = "";
        for await (const chunk of generator) {
          accumulated += chunk;
          setMessage(accumulated);
        }
      } catch (err: unknown) {
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
        onSettled?.();
      }
    },
    [getTurnstileToken, onSettled]
  );

  return {
    message,
    error,
    isLoading,
    retryAfter,
    sendMessage,
    reset,
  };
}
