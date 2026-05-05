import { handleGithubRepos } from "./routes/github";
import { handleChat } from "./routes/chat";
import { handleProjectSummary } from "./routes/project-summary";

export interface Env {
  CACHE: KVNamespace;
  RATE_LIMIT: KVNamespace;
  OPENAI_API_KEY: string;
  TURNSTILE_SECRET_KEY: string;
  PORTFOLIO_ORIGIN: string;
  ENV: string;
}

const json = (data: unknown, init: ResponseInit = {}): Response =>
  new Response(JSON.stringify(data), {
    ...init,
    headers: { "Content-Type": "application/json", ...(init.headers ?? {}) },
  });

function corsHeaders(origin: string): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

function withCors(res: Response, env: Env): Response {
  const headers = new Headers(res.headers);
  for (const [k, v] of Object.entries(corsHeaders(env.PORTFOLIO_ORIGIN))) {
    headers.set(k, v);
  }
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(env.PORTFOLIO_ORIGIN) });
    }

    if (url.pathname === "/healthz" && request.method === "GET") {
      return withCors(json({ ok: true }), env);
    }

    if (url.pathname === "/api/github/repos" && request.method === "GET") {
      return withCors(await handleGithubRepos(request, env), env);
    }

    if (url.pathname === "/api/chat" && request.method === "POST") {
      return withCors(await handleChat(request, env), env);
    }

    const projectSummaryMatch = url.pathname.match(/^\/api\/projects\/([^/]+)\/summary$/);
    if (projectSummaryMatch && request.method === "GET") {
      return withCors(await handleProjectSummary(request, env, projectSummaryMatch[1]), env);
    }

    return withCors(json({ error: "not_found" }, { status: 404 }), env);
  },
} satisfies ExportedHandler<Env>;
