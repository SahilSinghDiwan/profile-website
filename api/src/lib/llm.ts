// Single seam for the LLM provider: Cloudflare Workers AI via the `AI` binding.
// It runs inside Cloudflare, so there is no API key and no region block (Google's API
// answered 400 "User location is not supported" from some edge locations).
// Embeddings and chat are separate models; the bundled corpus is built with EMBED_MODEL
// (api/scripts/build-embeddings.ts) and query vectors MUST come from the same model.
export const DEFAULT_CHAT_MODEL = "@cf/meta/llama-3.3-70b-instruct-fp8-fast";
export const DEFAULT_EMBED_MODEL = "@cf/baai/bge-base-en-v1.5";

export interface AiBinding {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  run(model: string, input: Record<string, unknown>): Promise<any>;
}

export interface LlmEnv {
  AI?: AiBinding;
  LLM_CHAT_MODEL?: string;
  LLM_EMBED_MODEL?: string;
}

export function llmConfig(env: LlmEnv) {
  return {
    chatModel: env.LLM_CHAT_MODEL || DEFAULT_CHAT_MODEL,
    embedModel: env.LLM_EMBED_MODEL || DEFAULT_EMBED_MODEL,
  };
}

/** Embed one string; retries once on a transient failure. Null when unavailable. */
export async function embedText(env: LlmEnv, text: string): Promise<number[] | null> {
  if (!env.AI) return null;
  const { embedModel } = llmConfig(env);
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const out = await env.AI.run(embedModel, { text: [text] });
      const vec = out?.data?.[0] as number[] | undefined;
      if (vec?.length) return vec;
    } catch (err) {
      console.warn(`embed failed attempt=${attempt}: ${String(err).slice(0, 200)}`);
    }
  }
  return null;
}

/** Pull the text delta out of one parsed SSE payload (native or OpenAI-style chunk). */
export function deltaText(parsed: unknown): string {
  const p = parsed as {
    response?: string;
    choices?: Array<{ delta?: { content?: string | null } }>;
  };
  return p.response ?? p.choices?.[0]?.delta?.content ?? "";
}
