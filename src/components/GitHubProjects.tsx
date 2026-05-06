import { useEffect, useState } from "react";
import type { Repo } from "../lib/api";
import { api } from "../lib/api";
import { CardSkeleton } from "./CardSkeleton";
import { ProjectCarousel } from "./ProjectCarousel";
import { AlertCircle, RotateCcw } from "lucide-react";

export function GitHubProjects() {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRepos = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.listRepos();
      setRepos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRepos();
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-gray-200 bg-gray-50 p-8 dark:border-gray-700 dark:bg-gray-900">
        <AlertCircle className="h-8 w-8 text-gray-400" />
        <p className="text-center text-gray-600 dark:text-gray-400">{error}</p>
        <button
          onClick={fetchRepos}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
        >
          <RotateCcw className="h-4 w-4" />
          Retry
        </button>
      </div>
    );
  }

  return <ProjectCarousel repos={repos} />;
}
