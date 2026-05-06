import type { Repo } from "../lib/api";
import { ExternalLink, Github } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";

interface ProjectCarouselProps {
  repos: Repo[];
}

export function ProjectCarousel({ repos }: ProjectCarouselProps) {
  const [emblaRef] = useEmblaCarousel({
    align: "start",
    slidesToScroll: 1,
    breakpoints: {
      "(min-width: 768px)": { active: false },
    },
  });

  const isGridLayout = typeof window !== "undefined" && window.innerWidth >= 768;

  if (isGridLayout) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {repos.map((repo) => (
          <RepoCard key={repo.slug} repo={repo} />
        ))}
      </div>
    );
  }

  return (
    <div
      ref={emblaRef}
      className="overflow-hidden"
      style={{
        WebkitOverflowScrolling: "touch",
      }}
    >
      <div className="flex gap-4">
        {repos.map((repo) => (
          <div key={repo.slug} className="min-w-0 flex-[0_0_100%] sm:flex-[0_0_50%]">
            <RepoCard repo={repo} />
          </div>
        ))}
      </div>
    </div>
  );
}

function RepoCard({ repo }: { repo: Repo }) {
  return (
    <div className="flex h-full flex-col rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <h3 className="line-clamp-2 text-lg font-semibold text-gray-900 dark:text-white">
        {repo.name}
      </h3>

      <p className="mt-2 line-clamp-3 flex-1 text-sm text-gray-600 dark:text-gray-300">
        {repo.description || "No description"}
      </p>

      {repo.topics && repo.topics.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {repo.topics.map((topic) => (
            <span
              key={topic}
              className="inline-block rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-900 dark:bg-blue-900 dark:text-blue-100"
            >
              {topic}
            </span>
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-4">
          {repo.language && <span>{repo.language}</span>}
          {repo.stargazers_count > 0 && <span>⭐ {repo.stargazers_count}</span>}
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        {repo.homepage && (
          <a
            href={repo.homepage}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-blue-500 px-3 py-2 text-sm font-medium text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
          >
            <ExternalLink className="h-4 w-4" />
            Demo
          </a>
        )}
        <a
          href={repo.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${
            repo.homepage
              ? "flex-1 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              : "w-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          }`}
        >
          <Github className="h-4 w-4" />
          GitHub
        </a>
      </div>
    </div>
  );
}
