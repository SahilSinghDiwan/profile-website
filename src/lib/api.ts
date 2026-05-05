const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8787").replace(/\/$/, "");

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export class RateLimitError extends ApiError {
  retryAfter: number;

  constructor(retryAfter: number) {
    super("Rate limited", 429);
    this.name = "RateLimitError";
    this.retryAfter = retryAfter;
  }
}

interface ChatRequest {
  question: string;
  turnstileToken: string;
}

export interface Repo {
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

export interface ProjectSummary {
  summary: string;
  generatedAt: string;
}

async function checkResponse(res: Response): Promise<void> {
  if (res.ok) return;
  if (res.status === 429) {
    const retryAfter = Number(res.headers.get("Retry-After") ?? "60");
    throw new RateLimitError(Number.isFinite(retryAfter) ? retryAfter : 60);
  }
  let message = `Request failed with status ${res.status}`;
  try {
    const body = await res.json();
    if (body && typeof body.error === "string") message = body.error;
  } catch {
    // ignore parse errors
  }
  throw new ApiError(message, res.status);
}

export async function* chat({ question, turnstileToken }: ChatRequest): AsyncGenerator<string> {
  const res = await fetch(`${API_BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, turnstileToken }),
  });
  await checkResponse(res);
  const reader = res.body?.getReader();
  if (!reader) return;
  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    yield decoder.decode(value, { stream: true });
  }
}

export async function listRepos(): Promise<Repo[]> {
  const res = await fetch(`${API_BASE}/api/github/repos`);
  await checkResponse(res);
  return res.json();
}

export async function projectSummary(slug: string): Promise<ProjectSummary> {
  const res = await fetch(`${API_BASE}/api/projects/${encodeURIComponent(slug)}/summary`);
  await checkResponse(res);
  return res.json();
}

export const api = { chat, listRepos, projectSummary };
