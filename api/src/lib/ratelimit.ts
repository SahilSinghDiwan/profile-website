export interface RateLimitConfig {
  limit: number;
  windowSec: number;
}

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  resetAt: number;
  retryAfter?: number;
}

/**
 * Fixed-window rate limiter backed by a KV namespace.
 * Key shape: `rl:<bucket>:<ip>:<windowStart>`. TTL = windowSec * 2 so the
 * counter is naturally cleared.
 */
export async function checkRateLimit(
  kv: KVNamespace,
  bucket: string,
  ip: string,
  cfg: RateLimitConfig,
  now: number = Date.now(),
): Promise<RateLimitResult> {
  const windowMs = cfg.windowSec * 1000;
  const windowStart = Math.floor(now / windowMs) * windowMs;
  const key = `rl:${bucket}:${ip}:${windowStart}`;
  const raw = await kv.get(key);
  const count = raw ? Number(raw) : 0;
  const next = count + 1;
  const resetAt = windowStart + windowMs;

  if (next > cfg.limit) {
    return {
      ok: false,
      remaining: 0,
      resetAt,
      retryAfter: Math.ceil((resetAt - now) / 1000),
    };
  }

  await kv.put(key, String(next), { expirationTtl: cfg.windowSec * 2 });
  return { ok: true, remaining: cfg.limit - next, resetAt };
}

export function rateLimitHeaders(result: RateLimitResult, cfg: RateLimitConfig): HeadersInit {
  const headers: Record<string, string> = {
    "X-RateLimit-Limit": String(cfg.limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.floor(result.resetAt / 1000)),
  };
  if (!result.ok && result.retryAfter !== undefined) {
    headers["Retry-After"] = String(result.retryAfter);
  }
  return headers;
}

export function clientIp(request: Request): string {
  return (
    request.headers.get("CF-Connecting-IP") ??
    request.headers.get("X-Forwarded-For")?.split(",")[0]?.trim() ??
    "0.0.0.0"
  );
}
