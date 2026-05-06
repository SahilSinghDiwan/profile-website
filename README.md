# Sahil Singh Diwan — Portfolio

Personal portfolio site at `nostalkers.shop`. Multi-page React app on Vercel + a Cloudflare Worker that serves a RAG-backed chat assistant trained on the resume corpus.

## Surfaces

| | URL |
|---|---|
| Production frontend | `https://nostalkers.shop` (Vercel, deploys from `main`) |
| Dev preview frontend | `https://profile-website-git-dev-sahils-projects-22d5c9eb.vercel.app` (Vercel, deploys from `dev`) |
| Production API | `https://profile-api.diwan-sahilsingh.workers.dev` |
| Dev API | `https://profile-api-dev.diwan-sahilsingh.workers.dev` |

## Stack

- **Frontend**: Vite 7 + React 19 + TypeScript 5.8 + Tailwind v4, BrowserRouter (`/`, `/projects`, `/projects/:slug`), shadcn-style primitives, Framer Motion, Embla, react-markdown, lucide-react.
- **Worker** (`api/`): Cloudflare Worker with KV (cache + rate limit), Turnstile bot protection, real-time RAG over a bundled embeddings corpus, GPT-5-nano streaming completions.
- **Tooling**: Docker-first dev, Vitest + Playwright for tests, Wrangler for the Worker.

## Local development

All build tools run inside containers — nothing is installed on the host.

```bash
# .env at repo root must contain:
#   OPENAI_API_KEY, TURNSTILE_SITE_KEY, TURNSTILE_SECRET_KEY,
#   CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID, VERCEL_TOKEN

docker compose up web    # http://localhost:5173
```

The api container will fail to start on hosts without 48-bit virtual address space (e.g. Raspberry Pi 32-bit kernels) because `workerd` OOMs. To work around, point the local frontend at the deployed dev worker:

```bash
VITE_API_BASE_URL=https://profile-api-dev.diwan-sahilsingh.workers.dev \
  docker compose up web
```

See `DEV.md` for the full Docker workflow.

## Deploy

- **Frontend**: push to `dev` for a preview, merge to `main` for production. Vercel handles the rest.
- **Worker**: from inside the api container so wrangler runs in a supported environment:
  ```bash
  docker compose run --rm --no-deps \
    -e CLOUDFLARE_API_TOKEN -e CLOUDFLARE_ACCOUNT_ID \
    api npx wrangler deploy --env dev   # or omit --env for prod
  ```

## Documentation

- `docs/website-overview.md` — current architecture, content, conventions, operational notes.
- `docs/Portfolio v2 implementation plan.md` — the original TDD plan that drove the v2 rebuild (kept for historical reference).
- `docs/content-management-plan.md` — proposal for moving content out of code so non-developers can edit projects/skills/etc.
- `docs/conversations-history.md` — running execution log of the v2 build sessions.
