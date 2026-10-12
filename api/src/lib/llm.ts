// Single seam for the LLM provider. Any OpenAI-compatible endpoint works
// (Google AI Studio by default; the local Freellmapi gateway for dev).
// Embeddings and chat must stay on the provider the bundled corpus was built with.
export const DEFAULT_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/openai";
export const DEFAULT_CHAT_MODEL = "gemini-3.5-flash";
export const DEFAULT_EMBED_MODEL = "gemini-embedding-001";
export const EMBED_DIMENSIONS = 768; // must match api/scripts/build-embeddings.ts

export interface LlmEnv {
  LLM_API_KEY?: string;
  LLM_BASE_URL?: string;
  LLM_CHAT_MODEL?: string;
  LLM_EMBED_MODEL?: string;
}

export function llmConfig(env: LlmEnv) {
  return {
    apiKey: env.LLM_API_KEY,
    baseUrl: (env.LLM_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/, ""),
    chatModel: env.LLM_CHAT_MODEL || DEFAULT_CHAT_MODEL,
    embedModel: env.LLM_EMBED_MODEL || DEFAULT_EMBED_MODEL,
  };
}
