# Portfolio v2 — Conversation History & Resume Pointer

> **This is a chronicle, not a current-state doc.** For the deployed shape — architecture, content, conventions — read `docs/website-overview.md`. The notes below are a session-by-session execution log of how the v2 build came together; some sub-sections (especially "next planned work" and "outstanding") were accurate at the time of writing and have since been resolved.

The authoritative implementation plan is **`docs/Portfolio v2 implementation plan.md`** (Phase 0, Wave 1–4, dispatch guide). This doc is the running execution log against that plan.

---

## 1. Repo layout (sibling, not monorepo)

```
profile-website/
├── src/                          # Vite + React 19 + TS frontend
│   ├── pages/                    # Index, Projects, ProjectDetail, NotFound
│   ├── components/               # AnimatedSection, CardSkeleton, ChatSkeleton,
│   │                             #   CommandPalette, DemoEmbed, GitHubProjects,
│   │                             #   PinnedProjects, ProjectCarousel, ResumeDownload
│   │   └── ui/                   # shadcn primitives (existing) + Skeleton (new)
│   ├── data/                     # projects/skills/experience/education/credentials/
│   │                             #   contacts/profile (extracted from Index.tsx)
│   ├── hooks/                    # useCmdK
│   ├── lib/                      # api.ts, motion.ts, meta.tsx (Seo), utils.ts
│   ├── test/                     # setup.ts (jsdom + MSW + matchMedia), test-utils.tsx
│   ├── __tests__/                # smoke + regression/r1..r10 + components/* + routes
│   ├── types.ts                  # Project / Experience / Profile / etc.
│   ├── App.tsx                   # BrowserRouter + global CommandPalette
│   ├── index.css                 # Tailwind v4 (@import + @theme inline + @custom-variant dark)
│   └── typography.css
│
├── api/                          # Cloudflare Worker (sibling to src/)
│   ├── src/
│   │   ├── index.ts              # router: /healthz, /api/github/repos, /api/chat,
│   │   │                         #   /api/projects/:slug/summary, CORS, 404
│   │   ├── lib/                  # cache.ts (KV+SHA-256), ratelimit.ts (KV fixed-window),
│   │   │                         #   turnstile.ts, projects.ts (slug/title duplicate of
│   │   │                         #   src/data/projects.ts for server use)
│   │   └── routes/               # github.ts, chat.ts, project-summary.ts
│   ├── data/
│   │   └── corpus.json           # placeholder RAG chunks; build-embeddings.ts will
│   │                             #   regenerate from ../data/resume.md when run
│   ├── scripts/build-embeddings.ts
│   ├── test/                     # cache, github, ratelimit, turnstile, chat,
│   │                             #   project-summary, index — uses
│   │                             #   @cloudflare/vitest-pool-workers (cloudflare:test)
│   ├── wrangler.toml             # NOTE: KV ids are placeholders — replace before deploy
│   ├── tsconfig.json
│   ├── package.json
│   └── vitest.config.ts          # defineWorkersConfig
│
├── data/                         # Resume PDF + resume.md (RAG corpus source)
│   ├── Sahil Resume May 26.pdf
│   └── resume.md
│
├── docs/
│   ├── Portfolio v2 implementation plan.md   # the canonical plan
│   └── conversations-history.md              # THIS FILE
│
├── docker-compose.yml            # web (Vite, 5173) + api (Wrangler, 8787)
├── Dockerfile.web                # node:20-alpine, npm install --legacy-peer-deps
├── Dockerfile.api                # node:20-slim + libc6 (workerd needs glibc)
├── .dockerignore
├── .env                          # OPENAI_API_KEY, TURNSTILE_SITE_KEY, TURNSTILE_SECRET_KEY
├── vercel.json                   # SPA rewrite for BrowserRouter
├── vite.config.ts                # @tailwindcss/vite + host:0.0.0.0 + watch.usePolling
├── vitest.config.ts              # jsdom, exclude api/**
├── package.json                  # scripts: dev/build/lint/test{,:watch,:cov}
├── DEV.md                        # docker workflow
└── STATUS.md / README.md
```

**Constraint that's been re-stated multiple times:** *No `npm install` or build tooling on the host.* Everything goes through `docker compose`. Bind mounts give HMR. `Dockerfile.web` and `Dockerfile.api` were edited by the user and **must not be reverted** — they use `--legacy-peer-deps` (React 19 peer conflicts) and the api uses `node:20-slim + libc6` because `workerd` needs glibc.

---

## 2. Status by plan phase

### Phase 0 — Foundation ✅
- **F0.1 Tailwind v4**: `vite.config.ts` wired `@tailwindcss/vite`. `index.css` rewritten as `@import "tailwindcss"` + `@theme inline { --color-* → hsl(var(--*)) }` + `@custom-variant dark (&:where(.dark, .dark *))`. Shim block deleted from `typography.css`.
- **F0.2 BrowserRouter**: `App.tsx` swapped, `vercel.json` SPA rewrite added.
- **F0.3 Data extraction**: All inline arrays in `Index.tsx` moved to `src/data/*.ts`. Added `slug` (kebab-case, unique) + `pinned` flag on three projects (Incident Resolution Assistant, Real-Time Log Pipeline, RAG Chatbot).
- **F0.4 Test infra**: `vitest.config.ts` (jsdom, exclude `api/**`), `src/test/setup.ts` (MSW server + matchMedia + scrollIntoView mocks), `src/test/test-utils.tsx` (`renderWithProviders` — MemoryRouter only; HelmetProvider was REMOVED — see §4).

### Wave 1 ✅
- **A1** Worker scaffold (`/healthz`, 404, CORS) + tests.
- **B1** `src/lib/api.ts` — `chat()` async iterator, `listRepos()`, `projectSummary()`, typed `ApiError`/`RateLimitError`. (Parameter-property syntax was rewritten to explicit fields — TS `erasableSyntaxOnly` config rejects param-properties.)
- **B3** `src/lib/motion.ts` (fadeUp/fadeIn/staggerChildren + `prefersReducedMotion`), `AnimatedSection.tsx`.
- **B4** `Skeleton`, `CardSkeleton`, `ChatSkeleton`.
- **B5** `NotFound.tsx` rewritten — branded 404 with "Take me home" / "Browse projects".
- **R1–R10** regression tests under `src/__tests__/regression/`.

### Wave 2 ✅
- **A2** `api/src/lib/ratelimit.ts` — KV fixed-window (key `rl:<bucket>:<ip>:<windowStart>`), `Retry-After` header, `clientIp()` helper. 10/60s for chat.
- **A3** `api/src/lib/turnstile.ts` — POSTs to `https://challenges.cloudflare.com/turnstile/v0/siteverify`, throws on missing secret.
- **A4** `api/src/lib/cache.ts` — `cacheKey(question, version)` SHA-256, `createKvCache<T>(kv)`. `CORPUS_VERSION = "v1"`.
- **A6** `api/src/routes/github.ts` — filters forks + portfolio repo, normalizes, KV cache 10m + stale 7d, `X-Cache-Status: hit|miss|stale`. **Hardened**: try/catch around fetch + JSON parse, `Array.isArray` check; non-200 / non-array / network error all fall back to stale cache or return clean `502 {"error":"upstream_error"}` (was throwing 500 with stack trace before — fixed by background agent).
- **B2** `pages/Projects.tsx` + `pages/ProjectDetail.tsx`. App routes: `/`, `/projects`, `/projects/:slug`, `*`.
- **B6** OG meta. **First implementation used `react-helmet-async` 2.0.5 — that broke React 19 entirely (blank page).** Now uses **React 19 native `<title>`/`<meta>` hoisting** in `src/lib/meta.tsx` — zero-dep, just a fragment of head tags returned from any component. **Don't add HelmetProvider back.**
- **C2** `ResumeDownload.tsx` (mounted in nav). NB: `public/Sahil_Diwan_Resume.pdf` is **not yet placed** — link 404s until copied from `data/`.
- **C5** `PinnedProjects.tsx` — Featured ribbon, primary border, returns null when zero pinned.
- **C7** `DemoEmbed.tsx` — sandboxed iframe with `loading="lazy"`, accessible title, returns null without `demoUrl`.

### Wave 3 ✅ (with one outstanding model question)
- **A5** `api/src/routes/chat.ts` — Turnstile verify (dev bypass via `?dev=1` when `env.ENV === "dev"`) → ratelimit → cache → embed via OpenAI `text-embedding-3-small` → cosine-sim top 4 chunks from `corpus.json` → stream completion (model: see §3) with strict system prompt → 400-token cap → cache final response. `api/data/corpus.json` has 2 placeholder chunks; `scripts/build-embeddings.ts` regenerates from `../data/resume.md` when an OpenAI key is present.
- **A7** `api/src/routes/project-summary.ts` — `GET /api/projects/:slug/summary` → 30-day KV cache (`summary:<slug>:<CORPUS_VERSION>`), 404 on unknown slug. Server-side project list duplicated in `api/src/lib/projects.ts`.
- **C3** `GitHubProjects.tsx` + `ProjectCarousel.tsx` (embla-carousel-react, grid `md+`, scroll-snap mobile, skeleton loading, retry on error). Mounted on `/projects` under "More from GitHub".
- **C8** `CommandPalette.tsx` + `useCmdK.ts` — global mount inside `BrowserRouter` (above `Routes`). Cmd/Ctrl+K toggles, Esc closes. Commands: navigate /, /projects; scroll-to about/skills/experience/education/contact (auto-navigates to / first if elsewhere); toggle theme; download resume; copy email.

### Wave 4 ⏳ Not started
- **C1** Resume RAG chatbot widget (floating bubble + panel + streaming + Turnstile mount on first message).
- **C4** Tech stack filter (URL-synced `?tech=...`, multi-chip).
- **C6** Per-project AI summary card on `/projects/:slug` with "regenerate" button (1/hour cooldown).

---

## 3. Open issue at session end — model name + chat smoke

User reported `curl -X POST http://localhost:8787/api/chat?dev=1` returned 400 `{"error":"invalid_json"}`. Their multi-line curl had a shell-escaping problem so the body never reached the server (the API correctly responded to an empty body). User asked to **swap the chat model to `gpt-5-nano`** ("gpt-5.4-nano" in their message — interpreted as `gpt-5-nano`).

Background agent dispatched (id `a3f0f7c96f5dee69c`, model haiku) to:
1. Centralize model name in `api/src/routes/chat.ts` as `const CHAT_MODEL = "gpt-5-nano"`. Keep `text-embedding-3-small` for embeddings.
2. Harden body parsing (text → JSON.parse in try/catch, `missing_question` → 400).
3. Live smoke from inside the api container (`docker compose exec -T api curl ...`).
4. Run API tests, update any test that hardcoded the old model.
5. If `gpt-5-nano` 404s upstream, fall back to `gpt-4o-mini` and document.

**Status when this doc was written:** agent still running. Check completion before resuming.

---

## 4. Bugs already fixed (so we don't re-introduce them)

| Bug | Cause | Fix | Don't redo |
|---|---|---|---|
| Blank frontend after Wave 3 | `react-helmet-async` 2.0.5 incompatible with React 19 — `HelmetProvider` threw at render | Removed library, use React 19 native `<title>`/`<meta>` hoisting in `src/lib/meta.tsx` (returns a fragment) | **Don't reintroduce `HelmetProvider`** |
| TS `erasableSyntaxOnly` errors | `class ApiError { constructor(message, public status) }` parameter-property syntax | Explicit field decls + assigns in body | Don't use param-properties |
| `Repo` imported as a value | TS interface, esbuild fine but project config strict | `import { type Repo } from "../lib/api"` | Use type-only imports |
| `/api/github/repos` 500 stack trace | Worker had no try/catch around fetch + JSON parse, GitHub returned non-array under rate limit, TLS failures from inside the api container | try/catch + `Array.isArray` + stale-cache fallback + clean 502 | Always validate upstream shape |
| API tests not loading | Root vitest used jsdom and tried to load Cloudflare-pool tests | `vitest.config.ts` excludes `api/**`; api has its own `vitest.config.ts` with `defineWorkersConfig` | Don't merge them |
| `@cloudflare/vitest-pool-workers ^0.5` vs `wrangler ^4` | Version mismatch | Bumped pool-workers to `^0.8.0` | Keep them aligned |
| `@testing-library/dom` missing | Was a transitive peer of `@testing-library/react`, not auto-installed | Explicit `^10.4.0` in devDeps | Keep explicit |
| React 19 peer warnings cascading | next-themes, sonner, react-helmet-async, etc., declare React 18 peers | Dockerfile uses `npm install --legacy-peer-deps` | Don't drop the flag |
| `workerd` failing to start in alpine | Needs glibc | `node:20-slim` + `apt-get install libc6` | Keep slim, not alpine, for api |

---

## 5. Test status

Last successful run:
- **Frontend**: `docker compose run --rm web npm test` → **28 passed / 9 skipped** (15+ files). Skipped: GitHubProjects integration (4) and CommandPalette keyboard (5) — need real browser, not jsdom. Tagged with TODOs.
- **API**: `docker compose run --rm api npm test` → **27 passed** (cache, github, ratelimit, turnstile, chat, project-summary, index).

Type-check: `docker compose exec -T web sh -c "cd /app && npx tsc --noEmit"` → clean.

---

## 6. Environment

`.env` at repo root (gitignored — confirmed present in user's setup):
```
OPENAI_API_KEY=...
TURNSTILE_SITE_KEY=...
TURNSTILE_SECRET_KEY=...
```

`docker-compose.yml` passes these into both containers as env. Frontend reads `VITE_API_BASE_URL` (default `http://localhost:8787`) and `VITE_TURNSTILE_SITE_KEY`. API reads `OPENAI_API_KEY`, `TURNSTILE_SECRET_KEY`, `PORTFOLIO_ORIGIN`, `ENV` from worker env.

For production: `wrangler secret put OPENAI_API_KEY`, `wrangler secret put TURNSTILE_SECRET_KEY`, and replace KV namespace placeholder ids in `api/wrangler.toml` after `wrangler kv:namespace create CACHE` and `wrangler kv:namespace create RATE_LIMIT`.

---

## 7. Known limitations / pre-deploy TODO

1. **`public/Sahil_Diwan_Resume.pdf`** — copy from `data/Sahil Resume May 26.pdf` so Resume button + Cmd+K → Download Resume don't 404.
2. **`public/og-default.png`** (1200×630) — not generated yet; OG previews will be blank without it.
3. **`api/wrangler.toml`** has placeholder `id`/`preview_id` for both KV namespaces — replace before deploy.
4. **GitHub api reachability inside api container** — TLS/DNS to `api.github.com` fails from inside Docker on the user's setup, so locally `/api/github/repos` returns clean `502 upstream_error`. Works fine on real Cloudflare. Don't rabbit-hole this in dev.
5. **Build embeddings** — `corpus.json` is a 2-chunk placeholder. Run `cd api && npm run build:embeddings` (inside the container) once the OpenAI key is set to regenerate from `data/resume.md`.

---

## 8. How to resume

If you're a fresh Claude:

1. Read `docs/Portfolio v2 implementation plan.md` (the canonical plan) and this file.
2. `docker compose up` — frontend at http://localhost:5173, api at http://localhost:8787.
3. Check status of the chat-fix background agent (id `a3f0f7c96f5dee69c`). If it's done, verify with:
   ```
   docker compose exec -T api sh -c 'curl -sS -i -X POST "http://localhost:8787/api/chat?dev=1" \
     -H "Content-Type: application/json" \
     -d "{\"question\":\"What is your name?\",\"turnstileToken\":\"x\"}"'
   ```
4. Next planned work: **Wave 4** — C1 (chat bubble UI consuming `/api/chat`), C4 (tech filter on `/projects` with URL sync), C6 (per-project AI summary card on `/projects/:slug` calling `/api/projects/:slug/summary`).
5. Workflow: dispatch Haiku agents in parallel for independent tasks, run tests inside docker, never install on host. The user prefers minimal orchestration overhead — let agents work, summarize when there are visible changes for manual testing.

---

## 9. User preferences captured along the way

- Wants Docker-only workflow with hot reload (bind mounts + `CHOKIDAR_USEPOLLING=true`).
- Doesn't want host installs of node/npm.
- Prefers Haiku agents for execution; Sonnet/Opus only orchestrates.
- Prefers concise responses with what changed and what's manually testable.
- Wants the work staged (Phase 0 → Wave 1 → 2 → 3 → 4) with a manual-test checkpoint between waves.
- Says "go wave N" to advance.

---

## 10. Session log — 2026-05-05 (dev environment + chat hardening)

### Goals achieved

1. **Dev deployment environment** stood up end-to-end, separate from `main` → production.
   - GitHub `dev` branch created.
   - Vercel preview deploys from `dev` at `https://profile-website-git-dev-sahils-projects-22d5c9eb.vercel.app`.
   - Cloudflare Worker `profile-api-dev` deployed to `https://profile-api-dev.diwan-sahilsingh.workers.dev` with its own KV namespaces (CACHE `a5b1cffbd20a4099a9868ef9ee053f0a`, RATE_LIMIT `d12f22be19c443128be8096623ce5cee`).
   - `api/wrangler.toml` has `[env.dev]` block with these IDs and a comma-separated `PORTFOLIO_ORIGIN` allowlist.
2. **Cloudflare Turnstile** wired up end-to-end:
   - Lazy-loaded widget in `ResumeChat.tsx` (script + `window.turnstile.render` in explicit mode, removed on close).
   - All three send paths (button, Enter key, suggested-question chip) gated by `turnstileMissing`.
   - Diagnostic banner if `VITE_TURNSTILE_SITE_KEY` is empty at build time.
3. **Real RAG corpus** generated via OpenAI embeddings:
   - `api/scripts/build-embeddings.ts` reads `data/resume.md`, splits by `## ` headers (≤1500 chars/chunk), POSTs to `text-embedding-3-small`, writes `api/data/corpus.json`.
   - 7 chunks × 1536-dim embeddings (~308 KB).
   - Run via `docker compose run --rm -e OPENAI_API_KEY -v "$(pwd)/data:/repo-data:ro" --no-deps api npx tsx scripts/build-embeddings.ts`.
   - `api/src/lib/cache.ts` bumped `CORPUS_VERSION` to `"v2"` so old cache misses.
4. **Chat backend hardened** (`api/src/routes/chat.ts`):
   - Replaced placeholder `mockEmbedding` with a real OpenAI embedding call.
   - Imports bundled `corpus.json` directly (no GitHub fetch fallback).
   - `RELEVANCE_THRESHOLD` lowered to `0.15` (the placeholder threshold was rejecting on-topic questions).
   - GPT-5 reasoning-model parameters: `max_completion_tokens: 800` (not `max_tokens`) and `reasoning_effort: "minimal"` so a small budget actually emits content.
   - **SSE chunk-boundary buffering fix** — the prior parser split each chunk by `\n` without buffering incomplete `data: {...}` lines, dropping leading characters of tokens whose JSON straddled a TCP chunk boundary. New parser keeps a `buffer` string, only processes complete lines (`indexOf("\n")`), and carries the partial trailing line to the next read.

### Bugs hit + fixes (this session)

| Bug | Cause | Fix |
|---|---|---|
| `api/core` blocked git add | 12 MB workerd crash dump owned by root | `sudo -n rm -f api/core` + `**/core` and `*.core` added to `.gitignore` |
| Vercel build failed (peer conflict) | `react-helmet-async` 2.0.5 incompatible with React 19 | Removed package + added `.npmrc` with `legacy-peer-deps=true`; **don't reintroduce HelmetProvider** (already in §4) |
| `net::ERR_NAME_NOT_RESOLVED` with `%20%20` in URL | Env var pasted into Vercel dashboard had trailing whitespace | `.trim()` defense in `src/lib/api.ts`: `(import.meta.env.VITE_API_BASE_URL ?? "...").trim().replace(/\/$/, "")` |
| CORS blocked from preview | Vercel preview URL has team scope (`profile-website-git-dev-sahils-projects-22d5c9eb.vercel.app`), not the bare form I guessed | `pickAllowedOrigin()` in `api/src/index.ts` parses comma-separated `PORTFOLIO_ORIGIN` and matches request `Origin` |
| Cloudflare deploy auth error 10000 | API token lacked Workers Scripts:Edit | User added permission |
| Worker missing workers.dev subdomain | Account had never registered one | User registered `diwan-sahilsingh.workers.dev` |
| `missing_turnstile_token` from chat | Widget never rendered (no `getTurnstileToken` prop on `<ResumeChat />`); also Enter key + suggested chips bypassed gate | Lazy-loaded widget integration + gate applied to all three send paths |
| Turnstile error 400020 (domain not allowed) | Sitekey in `.env` had a stray trailing `w` (24 chars vs. real 23) | Fixed `.env` and the Vercel preview env var via the Vercel API |
| Cloudflare token verify 401 | Account-Owned tokens (`cfat_` prefix) use `/accounts/{id}/tokens/verify` not `/user/tokens/verify` | Use the account-scoped endpoint |
| `openai_error` from chat | gpt-5-nano rejects `max_tokens` | Use `max_completion_tokens` |
| Empty chat response | gpt-5-nano consumed entire budget on internal reasoning | Add `reasoning_effort: "minimal"` and bump to 800 tokens |
| Garbled chat output (leading chars dropped) | SSE parser split each chunk by `\n` without buffering partial lines across chunk boundaries | Buffered parser (see above) |

### Important env / API notes captured

- `.env` (root, gitignored) now also holds `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `VERCEL_TOKEN`, and `DEV_API_URL=https://profile-api-dev.diwan-sahilsingh.workers.dev`.
- Vercel deployments redeploy via `POST /v13/deployments` with `forceNew=1` and `deploymentId`. Env vars are PATCHed via `/v10/projects/{id}/env/{envId}`. "Sensitive" env var type is write-only (you can't read the value back).
- Cloudflare Turnstile widgets are managed under `/accounts/{id}/challenges/widgets`. Allowed-hostname mismatches always read as error 400020 client-side.
- Vercel preview URLs may sit behind Deployment Protection (SSO gate) — turn it off for the preview environment when smoke-testing with curl, or use a bypass token.
- Workerd OOMs on Raspberry Pi 32-bit kernels (it needs 48-bit virtual address space). All `wrangler` commands therefore go through Docker on this host: `docker compose run --rm --no-deps -e CLOUDFLARE_API_TOKEN -e CLOUDFLARE_ACCOUNT_ID api npx wrangler deploy --env dev`.

### Files added / modified (uncommitted at session end)

- `api/scripts/build-embeddings.ts` (new)
- `api/data/corpus.json` (regenerated, real embeddings)
- `api/src/lib/cache.ts` (`CORPUS_VERSION = "v2"`)
- `api/src/routes/chat.ts` (real embeddings + GPT-5 params + SSE buffering)
- `api/src/index.ts` (multi-origin CORS, earlier in session)
- `api/wrangler.toml` (`[env.dev]` block, earlier in session)
- `src/lib/api.ts` (trim defense, earlier in session)
- `src/components/ResumeChat.tsx` (Turnstile integration, earlier in session)
- `.npmrc` (`legacy-peer-deps=true`, earlier in session)
- `.gitignore` (added `**/core`, `*.core`, `.env`, `api/.wrangler/`, etc.)

### How to resume after this session

1. Verify chat against the dev worker (cache TTL is 7 days, so questions you asked before the SSE fix may still return garbled cached responses — try a fresh question or clear KV):
   ```
   curl --max-time 30 -X POST "https://profile-api-dev.diwan-sahilsingh.workers.dev/api/chat?dev=1" \
     -H "Content-Type: application/json" \
     -d '{"question":"<fresh question>","turnstileToken":"x"}'
   ```
2. Smoke from the actual preview UI: open the Vercel preview URL, complete the Turnstile, ask a question.
3. **Outstanding:** still need to commit + push the uncommitted dev-environment work (build-embeddings script, chat.ts SSE fix, cache.ts version bump, corpus.json).
4. Wave 4 work (C4 tech filter, C6 per-project AI summary card) is still untouched — see §2.
