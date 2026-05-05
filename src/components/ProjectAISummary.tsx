import { useEffect, useState } from "react";
import { projectSummary, ApiError } from "../lib/api";
import { Card, CardContent, CardHeader } from "./ui/card";
import { CardSkeleton } from "./CardSkeleton";

interface ProjectAISummaryProps {
  slug: string;
}

type State = "loading" | "success" | "error";

interface SuccessData {
  summary: string;
  generatedAt: string;
}

export function ProjectAISummary({ slug }: ProjectAISummaryProps) {
  const [state, setState] = useState<State>("loading");
  const [data, setData] = useState<SuccessData | null>(null);
  const [lastRegenTime, setLastRegenTime] = useState<number | null>(null);
  const [cooldownRemaining, setCooldownRemaining] = useState<number | null>(
    null
  );

  const storageKey = `project-summary-regen:${slug}`;

  // Load cooldown from localStorage on mount
  useEffect(() => {
    const storedTime = localStorage.getItem(storageKey);
    if (storedTime) {
      setLastRegenTime(Number(storedTime));
    }
  }, [storageKey]);

  // Update cooldown when localStorage changes (for sync across tabs)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === storageKey && e.newValue) {
        setLastRegenTime(Number(e.newValue));
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [storageKey]);

  useEffect(() => {
    fetchSummary();
  }, [slug]);

  useEffect(() => {
    if (!lastRegenTime) {
      setCooldownRemaining(null);
      return;
    }

    const updateCooldown = () => {
      const now = Date.now();
      const elapsed = now - lastRegenTime;
      const oneHourMs = 60 * 60 * 1000;

      if (elapsed >= oneHourMs) {
        setCooldownRemaining(null);
      } else {
        const remaining = Math.ceil((oneHourMs - elapsed) / 1000 / 60);
        setCooldownRemaining(remaining);
      }
    };

    updateCooldown();
    const interval = setInterval(updateCooldown, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [lastRegenTime]);

  async function fetchSummary() {
    setState("loading");
    try {
      const result = await projectSummary(slug);
      setData(result);
      setState("success");
    } catch (error) {
      if (error instanceof ApiError) {
        setState("error");
      } else {
        setState("error");
      }
    }
  }

  async function handleRegenerate() {
    const now = Date.now();
    setLastRegenTime(now);
    localStorage.setItem(storageKey, now.toString());
    await fetchSummary();
  }

  function handleRetry() {
    fetchSummary();
  }

  const isCooldownActive = cooldownRemaining !== null && cooldownRemaining > 0;

  if (state === "loading") {
    return <CardSkeleton />;
  }

  if (state === "error" || !data) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader>
          <h3 className="text-lg font-semibold">AI Summary</h3>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-between">
          <p className="text-muted-foreground">Summary unavailable</p>
          <button
            onClick={handleRetry}
            className="mt-4 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 font-medium w-fit"
          >
            Retry
          </button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <h3 className="text-lg font-semibold">AI Summary</h3>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between">
        <p className="text-sm leading-relaxed mb-6">{data.summary}</p>
        <button
          onClick={handleRegenerate}
          disabled={isCooldownActive}
          title={
            isCooldownActive
              ? `Cooldown: ${cooldownRemaining} minute${cooldownRemaining !== 1 ? "s" : ""} remaining`
              : ""
          }
          className="px-4 py-2 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/90 font-medium w-fit disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Regenerate
        </button>
      </CardContent>
    </Card>
  );
}
