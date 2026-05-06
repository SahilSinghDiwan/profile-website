export const CORPUS_VERSION = "v3";

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function cacheKey(question: string, version: string = CORPUS_VERSION): Promise<string> {
  return `cache:${version}:${await sha256Hex(question)}`;
}

export interface KvCache<T = unknown> {
  get(key: string): Promise<T | null>;
  set(key: string, value: T, ttlSec: number): Promise<void>;
}

export function createKvCache<T = unknown>(kv: KVNamespace): KvCache<T> {
  return {
    async get(key) {
      return (await kv.get(key, "json")) as T | null;
    },
    async set(key, value, ttlSec) {
      await kv.put(key, JSON.stringify(value), { expirationTtl: ttlSec });
    },
  };
}
