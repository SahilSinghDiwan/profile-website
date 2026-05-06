import type { Env } from "../index";
import { createKvCache } from "../lib/cache";
import { checkRateLimit, clientIp, rateLimitHeaders } from "../lib/ratelimit";

const GITHUB_USER = "SahilSinghDiwan";
const PORTFOLIO_REPO = "profile-website";
const CACHE_KEY = "github:repos:v1";
const CACHE_TTL_SEC = 600; // 10 minutes
const RL_CFG = { limit: 30, windowSec: 60 };

interface GhRepo {
  name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  topics?: string[];
  stargazers_count: number;
  updated_at: string;
  homepage: string | null;
  fork: boolean;
}

export interface NormalizedRepo {
  name: string;
  slug: string;
  description: string | null;
  html_url: string;
  language: string | null;
  topics: string[];
  stargazers_count: number;
  updated_at: string;
  homepage: string | null;
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function normalize(repo: GhRepo): NormalizedRepo {
  return {
    name: repo.name,
    slug: slugify(repo.name),
    description: repo.description,
    html_url: repo.html_url,
    language: repo.language,
    topics: repo.topics ?? [],
    stargazers_count: repo.stargazers_count,
    updated_at: repo.updated_at,
    homepage: repo.homepage,
  };
}

export async function handleGithubRepos(request: Request, env: Env): Promise<Response> {
  const ip = clientIp(request);
  const rl = await checkRateLimit(env.RATE_LIMIT, "github", ip, RL_CFG);
  const headers = new Headers({ "Content-Type": "application/json", ...rateLimitHeaders(rl, RL_CFG) });
  if (!rl.ok) {
    return new Response(JSON.stringify({ error: "rate_limited" }), { status: 429, headers });
  }

  const cache = createKvCache<NormalizedRepo[]>(env.CACHE);
  const cached = await cache.get(CACHE_KEY);
  if (cached) {
    headers.set("X-Cache-Status", "hit");
    return new Response(JSON.stringify(cached), { status: 200, headers });
  }

  let upstream: Response;
  try {
    upstream = await fetch(
      `https://api.github.com/users/${GITHUB_USER}/repos?sort=updated&per_page=100`,
      {
        headers: {
          "User-Agent": "profile-api",
          Accept: "application/vnd.github+json",
        },
      },
    );
  } catch (error) {
    // Network error (e.g., TLS, timeout, DNS)
    const stale = await cache.get(CACHE_KEY + ":stale");
    if (stale) {
      headers.set("X-Cache-Status", "stale");
      return new Response(JSON.stringify(stale), { status: 200, headers });
    }
    return new Response(JSON.stringify({ error: "upstream_error" }), {
      status: 502,
      headers,
    });
  }

  if (!upstream.ok) {
    // Try a stale cache fallback
    const stale = await cache.get(CACHE_KEY + ":stale");
    if (stale) {
      headers.set("X-Cache-Status", "stale");
      return new Response(JSON.stringify(stale), { status: 200, headers });
    }
    return new Response(JSON.stringify({ error: "upstream_error" }), {
      status: 502,
      headers,
    });
  }

  let all: GhRepo[];
  try {
    all = (await upstream.json()) as GhRepo[];
  } catch (error) {
    // JSON parse error
    const stale = await cache.get(CACHE_KEY + ":stale");
    if (stale) {
      headers.set("X-Cache-Status", "stale");
      return new Response(JSON.stringify(stale), { status: 200, headers });
    }
    return new Response(JSON.stringify({ error: "upstream_error" }), {
      status: 502,
      headers,
    });
  }

  if (!Array.isArray(all)) {
    // Upstream returned non-array (rate-limit response, error object, etc.)
    const stale = await cache.get(CACHE_KEY + ":stale");
    if (stale) {
      headers.set("X-Cache-Status", "stale");
      return new Response(JSON.stringify(stale), { status: 200, headers });
    }
    return new Response(JSON.stringify({ error: "upstream_error" }), {
      status: 502,
      headers,
    });
  }

  const filtered = all
    .filter((r) => !r.fork && r.name !== PORTFOLIO_REPO)
    .map(normalize);

  await cache.set(CACHE_KEY, filtered, CACHE_TTL_SEC);
  await cache.set(CACHE_KEY + ":stale", filtered, CACHE_TTL_SEC * 24 * 7);

  headers.set("X-Cache-Status", "miss");
  return new Response(JSON.stringify(filtered), { status: 200, headers });
}
