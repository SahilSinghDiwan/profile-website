import { defineWorkersConfig } from "@cloudflare/vitest-pool-workers/config";

export default defineWorkersConfig({
  test: {
    poolOptions: {
      workers: {
        wrangler: { configPath: "./wrangler.toml" },
        miniflare: { bindings: { LLM_API_KEY: "test-key", LLM_BASE_URL: "https://generativelanguage.googleapis.com/v1beta/openai" } },
      },
    },
  },
});
