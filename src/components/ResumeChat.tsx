import { useState, useEffect, useRef } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useChat } from "../hooks/useChat";

const SUGGESTED_QUESTIONS = [
  "What's Sahil's experience with Kafka?",
  "Top GenAI projects?",
  "Education background?",
  "Full-stack experience?",
  "What technologies does Sahil specialize in?",
];

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY ?? "";
const TURNSTILE_SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

declare global {
  interface Window {
    turnstile?: {
      render: (
        el: HTMLElement,
        opts: { sitekey: string; callback: (token: string) => void; "error-callback"?: () => void; "expired-callback"?: () => void; theme?: "light" | "dark" | "auto" }
      ) => string;
      remove: (id: string) => void;
      reset: (id?: string) => void;
    };
  }
}

interface ResumeChatProps {
  getTurnstileToken?: () => string;
}

export function ResumeChat({ getTurnstileToken: externalGetToken }: ResumeChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [turnstileToken, setTurnstileToken] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const turnstileContainerRef = useRef<HTMLDivElement>(null);
  const turnstileWidgetIdRef = useRef<string | null>(null);
  const tokenRef = useRef("");
  tokenRef.current = turnstileToken;

  const getToken = externalGetToken ?? (() => tokenRef.current);

  const resetTurnstile = () => {
    if (externalGetToken) return;
    setTurnstileToken("");
    tokenRef.current = "";
    if (turnstileWidgetIdRef.current && window.turnstile) {
      try {
        window.turnstile.reset(turnstileWidgetIdRef.current);
      } catch {
        // widget may be in a transient state; ignore
      }
    }
  };

  const { message, error, isLoading, retryAfter, sendMessage, reset } = useChat({
    getTurnstileToken: getToken,
    onSettled: resetTurnstile,
  });

  // Load Turnstile script + render widget when the chat panel opens
  useEffect(() => {
    if (!isOpen || !TURNSTILE_SITE_KEY || externalGetToken) return;

    const renderWidget = () => {
      if (!window.turnstile || !turnstileContainerRef.current || turnstileWidgetIdRef.current) return;
      turnstileWidgetIdRef.current = window.turnstile.render(turnstileContainerRef.current, {
        sitekey: TURNSTILE_SITE_KEY,
        callback: (token: string) => setTurnstileToken(token),
        "expired-callback": () => setTurnstileToken(""),
        "error-callback": () => setTurnstileToken(""),
        theme: "auto",
      });
    };

    if (window.turnstile) {
      renderWidget();
      return;
    }

    const existing = document.querySelector<HTMLScriptElement>(`script[src="${TURNSTILE_SCRIPT_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", renderWidget, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = TURNSTILE_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.addEventListener("load", renderWidget, { once: true });
    document.head.appendChild(script);
  }, [isOpen, externalGetToken]);

  // Scroll to bottom when message updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [message]);

  // Countdown timer for rate limit
  useEffect(() => {
    if (retryAfter > 0) {
      setCountdown(retryAfter);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [retryAfter]);

  const turnstileRequired = !!TURNSTILE_SITE_KEY && !externalGetToken;
  const turnstileMissing = turnstileRequired && !turnstileToken;

  const handleSendMessage = async (question: string) => {
    if (!question.trim()) return;
    if (turnstileMissing) return;

    setInputValue("");
    await sendMessage(question);
  };

  const handleSuggestedClick = (question: string) => {
    if (turnstileMissing) return;
    setInputValue(question);
    handleSendMessage(question);
  };

  const handleClose = () => {
    setIsOpen(false);
    reset();
    if (turnstileWidgetIdRef.current && window.turnstile) {
      window.turnstile.remove(turnstileWidgetIdRef.current);
      turnstileWidgetIdRef.current = null;
    }
    setTurnstileToken("");
  };

  const showSuggestions = !message && !error;

  return (
    <>
      {/* Floating bubble */}
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-12 w-12 rounded-full shadow-lg"
        size="icon"
        aria-label="Open chat"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>

      {/* Chat panel */}
      {isOpen && (
        <div
          role="dialog"
          className="fixed bottom-24 right-6 w-[380px] h-[520px] flex flex-col rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-950"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-800">
            <h2 className="font-semibold">Resume Chat</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              aria-label="Close chat"
              className="h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-4">
            {showSuggestions && (
              <div className="space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">Suggested questions:</p>
                <div className="space-y-2">
                  {SUGGESTED_QUESTIONS.map((q) => (
                    <Button
                      key={q}
                      variant="outline"
                      className="w-full justify-start text-left h-auto whitespace-normal py-2 px-3"
                      onClick={() => handleSuggestedClick(q)}
                      disabled={turnstileMissing}
                    >
                      {q}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-200">
                {error}
                {countdown > 0 && <span className="ml-1 font-semibold">{countdown}</span>}
              </div>
            )}

            {message && (
              <div className="rounded-lg bg-blue-50 p-3 text-sm dark:bg-blue-950 dark:text-blue-100">
                {message}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input area */}
          <div className="border-t border-gray-200 p-4 dark:border-gray-800">
            {!externalGetToken && !TURNSTILE_SITE_KEY && (
              <div className="mb-2 rounded-md bg-amber-50 p-2 text-xs text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                Chat is unavailable: VITE_TURNSTILE_SITE_KEY is missing from the build environment.
              </div>
            )}
            {turnstileRequired && (
              <div className="mb-2 flex flex-col items-center gap-1">
                <div ref={turnstileContainerRef} />
                {turnstileMissing && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Complete the challenge above to enable chat.
                  </p>
                )}
              </div>
            )}
            <div className="flex gap-2">
              <Input
                placeholder={turnstileMissing ? "Complete the challenge first…" : "Ask about Sahil's experience..."}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(inputValue);
                  }
                }}
                disabled={isLoading || turnstileMissing}
                className="flex-1"
              />
              <Button
                onClick={() => handleSendMessage(inputValue)}
                disabled={isLoading || !inputValue.trim() || turnstileMissing}
                size="icon"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 px-4 py-3 text-center text-xs text-gray-500 dark:border-gray-800 dark:text-gray-400">
            Powered by Sahil's resume + GPT-4o-mini
          </div>
        </div>
      )}
    </>
  );
}
