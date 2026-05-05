# Portfolio v2 — Implementation Plan (TDD, Subagent-Ready)

This plan turns the agreed feature list into discrete, test-first tasks that a Claude Code orchestrator can dispatch to **Haiku subagents**. Every task is scoped to be completable by Haiku given the spec + tests in this doc. The orchestrator (Sonnet/Opus) handles architecture, integration, and review.

---

## 0. Architecture Decisions (locked before any code)

| Concern | Choice | Why |
|---|---|---|
| Backend platform | **Cloudflare Workers** | Free 100k req/day, native KV (cache + rate limit), Turnstile integration, edge-fast |
| KV store | **Cloudflare KV** | Same platform; used for response cache, rate-limit counters, embedding cache |
| Vector storage | **Static JSON embeddings** committed to Worker bundle | Resume corpus is tiny (~2KB chunks). No DB needed. Recompute at build time. |
| Embedding model | `text-embedding-3-small` | Cheap (~$0.02/1M tokens), 1536-dim |
| LLM | `gpt-4o-mini` | $0.15/$0.60 per 1M, plenty for resume Q&A |
| Frontend testing | **Vitest + React Testing Library + MSW** | Standard, fast, mocks fetch cleanly |
| Backend testing | **Vitest + `@cloudflare/vitest-pool-workers`** | Runs Workers in Miniflare; same runner as frontend |
| E2E | **Playwright** | Used sparingly — only for command palette + RAG flow |
| Animations | **Framer Motion (`motion`)** | Standard for React 19 |
| Routing migration | `HashRouter` → `BrowserRouter` | Required for OG previews on per-project URLs |
| Tailwind | Wire up `@tailwindcss/vite` plugin properly | Removes shim debt; plan handles this in Phase 0 |
| Demo backends | Hugging Face Spaces (Gradio) or Cloud Run | Frontend in this repo just iframes/links them |

**Repo layout after this work:**

```
profile-website/
├── apps/
│   ├── web/                 # current Vite app (moved here, optional)
│   └── api/                 # NEW — Cloudflare Worker (RAG proxy, GitHub proxy)
├── packages/
│   └── shared/              # NEW — shared TS types (Project, ChatMessage, etc.)
└── ...
```

> If you'd rather not go monorepo, keep `api/` as a sibling folder to `src/` and point Wrangler at it. The plan works either way — just adjust paths.

---

## 1. Phase 0 — Foundation (sequential, you do this first)

These four tasks must complete before any parallel track starts. Do them yourself or have one Sonnet agent do them — they touch too many files for Haiku.

### F0.1 — Wire Tailwind v4 properly, remove shims

**Why:** New features will need utility classes that aren't in the precompiled `index.css`. Shimming each one is unsustainable.

**Steps:**
1. Add to `vite.config.ts`:
   ```ts
   import tailwindcss from '@tailwindcss/vite'
   plugins: [react(), tailwindcss()]
   ```
2. Replace `src/index.css` with a single-line `@import "tailwindcss";` (Tailwind v4 syntax).
3. Move custom CSS (theme tokens, the Inter `:root`) into `src/index.css` under a separate layer.
4. Delete the shim block at the bottom of `src/typography.css` (the `.pt-32 { … }` rules).
5. Verify build passes and visual diff is zero.

**Tests:** Snapshot the rendered DOM of `Index.tsx` before and after; classes should resolve identically.

### F0.2 — Migrate `HashRouter` → `BrowserRouter`

**Why:** Per-project URLs like `/projects/incident-resolution-assistant` need to be real URLs for LinkedIn/X OG previews to work. `#/...` paths break unfurl.

**Steps:**
1. `App.tsx`: swap `HashRouter` for `BrowserRouter`.
2. Add `vercel.json` with SPA fallback:
   ```json
   { "rewrites": [{ "source": "/(.*)", "destination": "/" }] }
   ```
3. Update any in-app `to=` props (none currently exist beyond `/`).
4. Update `scrollToSection` — when on a non-root route, navigate to `/#section` first then scroll.

**Tests:** unit-test that anchor clicks scroll on `/`, and navigate-then-scroll from `/projects/foo`.

### F0.3 — Extract content data out of `Index.tsx`

**Why:** Subagents shouldn't all be editing one giant file. Extract data into modules.

**Steps:**
Create `src/data/`:
```
src/data/projects.ts        # the projects array
src/data/skills.ts
src/data/experience.ts
src/data/education.ts
src/data/credentials.ts
src/data/contacts.ts
src/data/profile.ts         # name, email, phone, links, hero copy
```
Each exports a typed const. Add types in `src/types.ts`:
```ts
export interface Project { title: string; description: string; technologies: string[]; impact: string; category: string; slug: string; pinned?: boolean; demoUrl?: string; githubUrl?: string; }
```
Add `slug` to every project (kebab-case derived from title).

**Tests:**
- Type-check passes.
- Every project has a unique slug.
- All slugs match `^[a-z0-9-]+$`.

### F0.4 — Test infrastructure

**Steps:**
1. Install: `vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom msw`.
2. Create `vitest.config.ts` with jsdom env + path alias `@`.
3. Create `src/test/setup.ts` with `@testing-library/jest-dom` import + MSW server boot.
4. Add npm scripts: `test`, `test:watch`, `test:ui`, `test:cov`.
5. Write **one passing smoke test**: `Index.tsx` renders the H1.

**Done when:** `npm test` runs green with that one test.

---

## 2. Phase 1 — Parallel Tracks (subagent-dispatchable)

Three tracks. Tasks within a track are mostly sequential; tracks run in parallel. Each task lists its **dependencies, files, test cases, and done criteria**. Hand each one to a Haiku subagent verbatim.

### Track A — Backend (Cloudflare Worker API)

#### A1 — Worker scaffold

**Deps:** none.
**Files:** `apps/api/wrangler.toml`, `apps/api/src/index.ts`, `apps/api/package.json`, `apps/api/vitest.config.ts`.

**Tests (write first):**
- `GET /healthz` → 200 `{ "ok": true }`.
- Unknown route → 404 `{ "error": "not_found" }`.
- CORS: `OPTIONS /api/chat` returns `Access-Control-Allow-Origin: <PORTFOLIO_ORIGIN>`.

**Done when:** all three tests pass under `vitest` with the workers pool.

#### A2 — Rate limiter middleware

**Deps:** A1.
**Files:** `apps/api/src/lib/ratelimit.ts`, `apps/api/src/lib/ratelimit.test.ts`.

Sliding window, per-IP, backed by KV.
Config: `10 req / 60s` per IP for `/api/chat`. Use `cf.connectingIp` from the request.

**Tests:**
- 10 calls in a minute pass.
- 11th call returns 429 with `Retry-After` header.
- After 60s window, counter resets.
- Different IPs are isolated.

**Done when:** `vi.useFakeTimers()` test exercising the window passes.

#### A3 — Turnstile verification

**Deps:** A1.
**Files:** `apps/api/src/lib/turnstile.ts`, test file.

Verifies a Turnstile token via `https://challenges.cloudflare.com/turnstile/v0/siteverify`. Returns `{ ok: boolean, errorCodes?: string[] }`.

**Tests (mock fetch with MSW or undici):**
- Valid token → `{ ok: true }`.
- Invalid token → `{ ok: false, errorCodes: ["invalid-input-response"] }`.
- Missing secret env var → throws with helpful message.

#### A4 — Response cache layer

**Deps:** A1.
**Files:** `apps/api/src/lib/cache.ts` + tests.

API: `cache.get(key)`, `cache.set(key, value, ttlSec)`. Key is SHA-256 of `(question + corpus_version)`. Store in KV with 7-day TTL.

**Tests:**
- `set` then `get` returns the value.
- After TTL, `get` returns null.
- Same question → same key (hash determinism).

#### A5 — RAG endpoint `/api/chat`

**Deps:** A2, A3, A4, F0.3 (resume content).
**Files:** `apps/api/src/routes/chat.ts`, `apps/api/scripts/build-embeddings.ts`, `apps/api/data/corpus.json` (committed), tests.

Flow:
1. Verify Turnstile (A3) — bypass in dev mode via `?dev=1` if `ENV === "dev"`.
2. Rate-limit check (A2).
3. Cache check (A4) on `question` text.
4. Embed `question` via OpenAI.
5. Cosine-sim against `corpus.json` (top 4 chunks).
6. Stream completion from `gpt-4o-mini` with system prompt: *"You are a Q&A assistant for Sahil Diwan's portfolio. Answer ONLY using the provided context. If unknown, say so."*
7. Cap output at **400 tokens** (hard limit, server-side).
8. Cache final response.

**Build script (`build-embeddings.ts`):** chunks `data/resume.md` (extracted from PDF) into ~300-token windows, embeds each, writes `corpus.json` with `{ chunks: [{ text, embedding }] }`. Run in CI.

**Tests:**
- `POST /api/chat` without Turnstile token → 401.
- With valid token but empty body → 400.
- With valid request → 200 streaming text/event-stream.
- Same question twice → second response served from cache (assert KV `get` was called and OpenAI was NOT).
- Output length cap honored (mock OpenAI returning 1000 tokens; assert truncation).
- Question outside corpus ("what's your favourite pizza?") → polite refusal.

#### A6 — GitHub proxy `/api/github/repos`

**Deps:** A1, A4.
**Files:** `apps/api/src/routes/github.ts` + tests.

Hits `https://api.github.com/users/SahilSinghDiwan/repos?sort=updated&per_page=100`, filters out forks + the portfolio repo itself, normalises to:
```ts
{ name, slug, description, html_url, language, topics, stargazers_count, updated_at, homepage }
```
Caches in KV for 10 minutes. Per-IP rate limit: 30/min.

**Tests:**
- Returns array of expected shape.
- Forks excluded.
- Cache hit on second call within 10 min (assert no upstream fetch).
- Returns stale cache + warning header if upstream 5xx (`X-Cache-Status: stale`).

#### A7 — Per-project AI summary `/api/projects/:slug/summary`

**Deps:** A1, A4, F0.3.
**Files:** `apps/api/src/routes/project-summary.ts` + tests.

Generates a short (~120 word) AI summary of a project from the project metadata in `data/projects.ts` + any GitHub README (if `githubUrl` set). Aggressively cached (30 days, key = slug + corpus version).

**Tests:**
- Unknown slug → 404.
- Known slug → 200 with `{ summary: string, generatedAt: ISO }`.
- Second call within TTL → served from cache.

---

### Track B — Frontend Plumbing

#### B1 — API client

**Deps:** F0.4.
**Files:** `src/lib/api.ts`, `src/lib/api.test.ts`.

Thin wrapper around `fetch` with `VITE_API_BASE_URL`. Functions: `chat(question, turnstileToken)`, `listRepos()`, `projectSummary(slug)`.

**Tests (with MSW):**
- `chat` posts JSON body with question + token.
- Network error throws typed `ApiError`.
- 429 surfaces as `RateLimitError` with `retryAfter`.
- 200 streaming response yields chunks via async iterator.

#### B2 — Routes restructure

**Deps:** F0.2, F0.3.
**Files:** `src/App.tsx`, `src/pages/Index.tsx`, new `src/pages/ProjectDetail.tsx`, new `src/pages/Projects.tsx`.

Routes:
- `/` — landing page (current Index, minus the projects section data — pull from `data/projects.ts`).
- `/projects` — full grid (auto + pinned + filter + carousel).
- `/projects/:slug` — single project detail with AI summary.
- `*` — `NotFound`.

**Tests:**
- Each route renders without crash.
- `/projects/unknown-slug` shows the 404 page (or a "project not found" component).
- Direct navigation to `/projects/incident-resolution-assistant` renders the project title.

#### B3 — Framer Motion setup + reusable variants

**Deps:** F0.4.
**Files:** `src/lib/motion.ts` (variants library), `src/components/AnimatedSection.tsx` + test.

Variants: `fadeUp`, `fadeIn`, `staggerChildren`. Respect `prefers-reduced-motion`.

**Tests:**
- `<AnimatedSection>` renders children.
- With `prefers-reduced-motion: reduce`, no transform is applied (mock matchMedia).

#### B4 — Loading skeleton primitives

**Deps:** F0.4.
**Files:** `src/components/ui/skeleton.tsx`, `src/components/CardSkeleton.tsx`, `src/components/ChatSkeleton.tsx` + tests.

shadcn-style `Skeleton` (animated bg). `CardSkeleton` matches the unified card template. `ChatSkeleton` is the typing-dots indicator.

**Tests:**
- `Skeleton` renders with `aria-busy="true"`.
- `CardSkeleton` matches dimensions of real Card (snapshot).

#### B5 — Custom 404 page

**Deps:** F0.4.
**Files:** `src/pages/NotFound.tsx` (rewrite), test.

Branded, dark-mode aware, has "Take me home" + "Search" buttons. Uses the same Inter typography as the rest of the site.

**Tests:**
- Renders 404 heading.
- Home button navigates to `/`.
- Logs the bad path to console (preserve current behavior).

#### B6 — OG image + meta tags

**Deps:** F0.2.
**Files:** `index.html`, `public/og-default.png` (1200×630), `src/lib/meta.tsx` (per-route helmet helper).

Use `react-helmet-async` (or React 19's native `<title>` if you want zero deps). Each route sets `og:title`, `og:description`, `og:image`, `twitter:card`.

OG image content: name, role, domain, generated once with a Figma export or via `@vercel/og` at build time.

**Tests:**
- `/` head contains `og:image` pointing at default.
- `/projects/foo` overrides `og:title` with project title.

---

### Track C — Feature Components (depend on A + B)

#### C1 — Resume RAG chatbot widget

**Deps:** A5, B1, B3, B4.
**Files:** `src/components/ResumeChat.tsx` + test, `src/hooks/useChat.ts` + test.

UI: floating bubble bottom-right → expands to 380×520 panel. Suggested-question chips. Streaming response. "Powered by Sahil's resume + GPT-4o-mini" footer.

Turnstile: invisible widget mounted on first user message.

**Tests:**
- Closed by default; click bubble → panel visible.
- Suggested chip click pre-fills + sends.
- Streaming chunks render incrementally.
- 429 from API shows "rate limited" message + countdown.
- Turnstile token included in payload.

#### C2 — Resume download button

**Deps:** none.
**Files:** `src/components/ResumeDownload.tsx`, `public/Sahil_Diwan_Resume.pdf` (placed manually) + test.

Pill button in nav: "Resume ↓". Tracks click via custom event (for future analytics).

**Tests:**
- Renders with correct `href` and `download` attribute.
- Click fires `resume_downloaded` custom event.

#### C3 — GitHub projects grid + carousel

**Deps:** A6, B1, B3, B4.
**Files:** `src/components/GitHubProjects.tsx`, `src/components/ProjectCarousel.tsx` + tests.

`GitHubProjects` fetches via `api.listRepos()`. While loading → `CardSkeleton` × 6. Carousel: horizontal scroll-snap on mobile, grid on `md+`. Use `embla-carousel-react` (small, accessible).

**Tests:**
- Loading state shows skeletons.
- On data, renders one card per repo.
- Error state shows retry button; click refetches.
- Empty topics array → no filter chips on that card.

#### C4 — Tech stack filter

**Deps:** C3.
**Files:** `src/components/TechFilter.tsx`, `src/hooks/useFilteredProjects.ts` + tests.

Multi-select chip row above the grid. URL-synced via `?tech=rag,kafka` so filtered views are shareable.

**Tests:**
- Selecting a chip filters the visible cards.
- URL query param updates.
- Loading state from URL: `?tech=rag` pre-applies on mount.
- "Clear all" resets state and URL.

#### C5 — Pinned projects section

**Deps:** F0.3, B3, B4.
**Files:** `src/components/PinnedProjects.tsx` + test.

Renders `projects.filter(p => p.pinned)` above the GitHub auto-feed on `/projects`. Distinct visual treatment (border accent + "Featured" ribbon).

**Tests:**
- Renders only pinned projects.
- Mark zero pinned → component returns null (don't render an empty section).

#### C6 — Per-project AI summary card

**Deps:** A7, B1, B4.
**Files:** `src/components/ProjectAISummary.tsx` + test.

On `/projects/:slug`, calls `api.projectSummary(slug)`. Shows skeleton, then summary with a "regenerate" button (rate-limited to 1/hour).

**Tests:**
- Loading state shows skeleton.
- Renders returned summary text.
- API error shows fallback "Summary unavailable" + retry.
- Regenerate button disabled within cooldown.

#### C7 — Live demo embed

**Deps:** F0.3.
**Files:** `src/components/DemoEmbed.tsx` + test.

Used inside project detail page. If `project.demoUrl` is set, renders iframe (with sandboxed attrs + `loading="lazy"`) OR an "Open demo" CTA button if iframe isn't safe (cross-origin frame-busting). Fallback link card when neither works.

**Tests:**
- With `demoUrl`, renders iframe with `sandbox="allow-scripts allow-same-origin"`.
- Without `demoUrl`, renders nothing (returns null).
- Iframe has `title` attr (a11y).

#### C8 — Cmd+K command palette

**Deps:** F0.3, B3.
**Files:** `src/components/CommandPalette.tsx`, `src/hooks/useCmdK.ts` + tests.

Use `cmdk` (vercel package). Commands:
- Navigate to section/page (about, projects, contact, etc.)
- Toggle theme
- Download resume
- Open chat
- Copy email

**Tests:**
- `Cmd+K` (or `Ctrl+K`) opens palette.
- `Esc` closes.
- Type "theme" → matches "Toggle theme" action.
- Selecting "Copy email" calls `navigator.clipboard.writeText` with the email.
- Up/Down arrows move focus (use user-event keyboard simulation).

---

## 3. Test Cases for the Existing Site (regression safety net)

Write these **before** Phase 0 starts so the foundation refactor can't silently break behavior. Each is a single Vitest file under `src/__tests__/regression/`.

### R1 — Hero & meta
- H1 contains "Sahil Diwan" and "AI / Gen AI Engineer".
- `<title>` is `"Sahil Singh Diwan — AI / GenAI Engineer"`.
- Two CTA buttons present: "View My Work", "Get In Touch".

### R2 — Theme toggle
- On mount, reads `localStorage.theme`. If `"dark"`, `<html>` has `dark` class.
- Click toggle → class flips and value persists.
- Toggle on mobile menu and desktop both work (two button instances).

### R3 — Mobile menu
- Below `md`, hamburger visible.
- Click → menu items render.
- Click any item → `isMobileMenuOpen` becomes false.

### R4 — Section nav
- For each of `about/skills/projects/experience/education/contact`, clicking the nav button calls `scrollIntoView` on the matching `<section id>`.
- (Mock `scrollIntoView`; assert it's called once per click.)

### R5 — Skill expansion
- Each skill category card with > 8 skills shows "+N more".
- Click → all skills visible + "Show less".
- Click again → collapses.

### R6 — Experience expansion
- Job with > 2 bullets shows "Show N more highlights".
- Toggle behavior identical to R5.
- Singular/plural label correct ("highlight" vs "highlights").

### R7 — Contact links
- Email link is `mailto:diwan.sahilsingh@gmail.com` (with `h`).
- LinkedIn href is `https://www.linkedin.com/in/diwan-sahil`.
- WhatsApp href contains `918007192680`.
- Each anchor has `aria-label` matching `"<label> — <detail>"`.

### R8 — NotFound
- Renders for unknown route.
- Logs the bad pathname to `console.error`.
- Has a link back to `/`.

### R9 — Data integrity
- `projects` array has exactly 6 entries (will change after Phase 0 — update assertion to "≥ 6").
- Every project has all 5 fields (`title, description, technologies, impact, category`).
- No empty strings.
- `experience` has exactly 3 jobs.

### R10 — Card template uniformity
- Every `Card` on the page has class `h-full flex flex-col`.
- Every section card has a `Badge variant="outline"` in its header.

(R10 is a quick sanity check — snapshot all cards' top-level class lists; should match the unified template.)

---

## 4. Subagent Dispatch Guide (for the Sonnet/Opus orchestrator)

### How to give a task to a Haiku agent

Each task in this doc is structured to drop straight into a `Task` tool call. Minimum spec to include:

```
ROLE: Implement task <ID> from portfolio-v2-implementation-plan.md.

CONTEXT:
- Repo root: /home/sahil/projects/profile-website
- Stack: React 19 + Vite + TS + Tailwind v4 + Vitest
- Testing: TDD — write tests first, then implementation, then ensure green.

INPUTS:
- <list the dep tasks already completed>
- <relevant data shapes>

DELIVERABLE:
- Files: <exact paths>
- All tests in this task pass under `npm test -- <path>`
- `npm run lint` passes
- `tsc -b` passes

CONSTRAINTS:
- Do not modify files outside the listed paths.
- Do not introduce new dependencies without asking.
- Keep card visual structure consistent with the Unified Card Template
  in docs/website-overview.md.

TESTS TO PASS (verbatim from plan):
<paste the test list>
```

### Suggested concurrency

- **Wave 1 (after Phase 0):** A1, B1, B3, B4, B5, R1–R10 in parallel.
- **Wave 2:** A2, A3, A4, A6, B2, B6, C2, C5, C7 in parallel.
- **Wave 3:** A5, A7, C3, C8 in parallel.
- **Wave 4:** C1, C4, C6 (these depend on Wave 3 outputs).

Don't dispatch more than ~4 Haiku agents per wave — review fan-in gets messy beyond that.

### Review checklist (orchestrator runs after each task)

1. Tests in spec all pass (`npm test`).
2. No unrelated files touched (`git diff --stat`).
3. Lint + typecheck clean.
4. No new top-level deps in `package.json` not approved in the plan.
5. Visual smoke check on `npm run dev` for any UI task.

---

## 5. Environment & Secrets

Add to `.env.local` (frontend):
```
VITE_API_BASE_URL=http://localhost:8787
VITE_TURNSTILE_SITE_KEY=<from Cloudflare>
```

Add to `apps/api/.dev.vars` (Worker, gitignored):
```
OPENAI_API_KEY=sk-…
TURNSTILE_SECRET_KEY=…
PORTFOLIO_ORIGIN=https://myprofile.nostalkers.shop
```

Production: set these via `wrangler secret put` and Vercel project env vars.

---

## 6. Cost & Quota Sanity Check

Assuming 100 unique visitors/day, average 3 chat turns each, ~500 input tokens + ~400 output tokens per turn:

- OpenAI: 100 × 3 × 900 tokens × $0.000375 average ≈ **$0.10/day** worst case before caching.
- With response cache hit rate ~60% on repeated questions: **~$0.04/day = ~$1.20/month**.
- Cloudflare Workers: well under the 100k req/day free limit.
- Cloudflare KV: under free tier (1k writes/day on free plan — bump to Workers Paid at $5/mo if you outgrow).

Hard caps in code:
- Per-IP: 10 chat req / min (A2).
- Per-response: 400 output tokens (A5).
- Per-project summary: cached 30 days (A7).
- If monthly OpenAI spend > $5, kill switch (manually rotate the key — don't bother building a tracker for v1).

---

## 7. What NOT to do in this iteration

To keep scope honest:

- ❌ Don't add Plausible/analytics yet (not in the agreed list).
- ❌ Don't replace shadcn primitives with a different library.
- ❌ Don't change the unified card template.
- ❌ Don't open-source proprietary projects on the projects page — they stay non-interactive (`pinned: true`, no `githubUrl`, no `demoUrl`). The GitHub auto-feed is for personal/OSS work only.
- ❌ Don't chase 100% test coverage — aim for the spec's tests + R1–R10 + critical paths.

---

## 8. Acceptance Criteria (whole project done when…)

1. All Phase 0 tasks merged.
2. All Track A tasks deployed to `api.nostalkers.shop` (or wherever).
3. All Track B + C tasks merged + deployed to Vercel.
4. Live: typing a question in the floating bubble streams a coherent answer about Sahil's resume.
5. Live: `/projects` shows pinned + auto GitHub feed, filterable by tech.
6. Live: each project page shows AI summary + (where set) demo embed.
7. Live: `Cmd+K` opens palette anywhere on the site.
8. Live: sharing `/projects/incident-resolution-assistant` on LinkedIn renders OG preview correctly.
9. Lighthouse: Performance ≥ 90, Accessibility ≥ 95, SEO ≥ 95 on `/`.
10. `npm test` passes 100% on the main branch.

---

*End of plan. Ship it.*