# Website Overview

Reference for future sessions: architecture, content, conventions, and the gotchas that survived the v2 rebuild. Read this first when resuming work.

> Status: v2 implementation complete (May 2026). Production at `nostalkers.shop`, dev preview from the `dev` branch. The Cloudflare Worker serves a RAG-backed Portfolio Assistant chat over a bundled embeddings corpus.

---

## 1. Architecture

### Surfaces

| | URL | Notes |
|---|---|---|
| Production frontend | `https://nostalkers.shop` | Vercel custom domain, deploys from `main`. Vercel SSO disabled on the apex. |
| Dev preview frontend | `https://profile-website-git-dev-sahils-projects-22d5c9eb.vercel.app` | Vercel preview, deploys from `dev`. SSO is *on* by default — disable temporarily via `PATCH /v9/projects/profile-website {ssoProtection: null}` if you need automation, then restore. |
| Production API | `https://profile-api.diwan-sahilsingh.workers.dev` (planned `api.nostalkers.shop`) | Worker name `profile-api` (default env). |
| Dev API | `https://profile-api-dev.diwan-sahilsingh.workers.dev` | Worker name `profile-api-dev` (`[env.dev]` block in `api/wrangler.toml`). |

### Stack

- **Frontend**: Vite 7 + React 19 + TypeScript 5.8 + Tailwind v4 + shadcn-style primitives (Radix), TanStack Query, BrowserRouter, Framer Motion, Embla, react-markdown, lucide-react.
- **Worker** (`api/`): Cloudflare Worker with KV (cache + rate limit), Cloudflare Turnstile bot protection, real-time RAG via OpenAI `text-embedding-3-small` over a bundled `corpus.json`, GPT-5-nano streaming completions.
- **Tooling**: Docker-only dev (no host Node), Vitest + Playwright for tests, Wrangler for the Worker.

### Repo layout

```
profile-website/
├── src/                     # Vite + React 19 + TS frontend
│   ├── pages/               # Index, Projects, ProjectDetail, NotFound
│   ├── components/          # ResumeChat (Portfolio Assistant), GitHubProjects,
│   │                        # ProjectCarousel, PinnedProjects, TechFilter,
│   │                        # ProjectAISummary, CommandPalette, DemoEmbed,
│   │                        # ResumeDownload, AnimatedSection,
│   │                        # CardSkeleton, ChatSkeleton
│   │   └── ui/              # shadcn primitives + Skeleton
│   ├── data/                # projects/skills/experience/education/credentials/
│   │                        # contacts/profile  (typed const exports)
│   ├── hooks/               # useChat, useCmdK, useFilteredProjects
│   ├── lib/                 # api.ts, motion.ts, meta.tsx, utils.ts
│   └── __tests__/           # smoke + regression/r1..r10 + components/* + routes
│
├── api/                     # Cloudflare Worker
│   ├── src/
│   │   ├── index.ts         # router + multi-origin CORS
│   │   ├── lib/             # cache.ts (KV+SHA-256+CORPUS_VERSION),
│   │   │                    # ratelimit.ts (KV fixed-window),
│   │   │                    # turnstile.ts, projects.ts (server-side slug list)
│   │   └── routes/          # github.ts, chat.ts, project-summary.ts
│   ├── data/corpus.json     # RAG corpus — real OpenAI embeddings (1536-dim)
│   ├── scripts/build-embeddings.ts
│   └── wrangler.toml        # default env + [env.dev] block
│
├── e2e/                     # Playwright smoke tests
├── docs/                    # this file + plan + content-management plan + history
├── data/                    # resume.md (RAG source) + resume PDF
├── docker-compose.yml
├── Dockerfile.web / .api
└── README.md / DEV.md
```

### Routing

| Route | Component | Purpose |
|---|---|---|
| `/` | `pages/Index.tsx` | Landing page (hero, about, skills, projects, experience, education, contact). Section nav scrolls within this page. |
| `/projects` | `pages/Projects.tsx` | Pinned projects + GitHub auto-feed + tech filter. |
| `/projects/:slug` | `pages/ProjectDetail.tsx` | Per-project page with AI summary card and demo embed. |
| `*` | `pages/NotFound.tsx` | Branded 404. |

`BrowserRouter` (not `HashRouter`) so OG previews unfurl on `/projects/:slug`. SPA fallback in `vercel.json`.

---

## 2. Content (single source of truth)

All content lives as typed const exports in `src/data/*.ts`. The worker has its own slug list at `api/src/lib/projects.ts` for the `/api/projects/:slug/summary` endpoint. Adding/editing content today still requires a code change + push — see `docs/content-management-plan.md` for the proposed migration to a more authoring-friendly setup.

### Personal / Contact

| Field      | Value                                         |
|------------|-----------------------------------------------|
| Full name  | Sahil Singh Diwan                             |
| Location   | Bengaluru, India                              |
| Phone      | +91 800-7192-680                              |
| Email      | `diwan.sahilsingh@gmail.com` (the `h` is mandatory) |
| GitHub     | https://github.com/SahilSinghDiwan            |
| LinkedIn   | https://www.linkedin.com/in/diwan-sahil/      |
| WhatsApp   | https://wa.me/918007192680                    |

### Hero

- H1: **AI / GenAI Engineer**
- Sub-H1: *Architecting end-to-end AI solutions*
- Lede: *5+ years building RAG pipelines, scalable microservices, and production-grade GenAI systems with vector databases, Kafka, Airflow, and Kubernetes.*

### About — stats grid (6 boxes, 2×3)

5+ years experience · 10+ corporate projects · 99.9% uptime · 40–60% MTTR reduction · 200+ SREs supported · 90% RCA accuracy.

### Skills

| Category                    | Items |
|-----------------------------|-------|
| Programming & Frameworks    | Python, Flask, FastAPI, Streamlit, Gradio |
| AI / GenAI                  | RAG Pipelines, LLM Integration, Prompt Engineering, Model Fine-Tuning, PyTorch, LangChain, Hugging Face Transformers, Accelerate, Optimum, LlamaIndex, DeepSpeed, ONNX, TensorRT |
| Vector Search & Retrieval   | FAISS, Milvus, ChromaDB, Pinecone, Elasticsearch |
| Data Engineering            | Apache Kafka, Apache Airflow, Pandas, NumPy |
| Backend & Integrations      | Microservices Architecture, Async Python, REST APIs, GraphQL, Jira / ServiceNow Integrations |
| Cloud & DevOps              | Docker, Kubernetes, AWS, GCP, Microsoft Azure, IBM Cloud, GitHub Actions, CI/CD, Model Monitoring, Versioning |
| Databases                   | MongoDB, MySQL, PostgreSQL |
| Frontend (Basic)            | React, TypeScript, JavaScript, Vue.js, Tailwind CSS |
| Tools                       | Git, Vercel, Supabase, Jest |

### Projects

Card shape: `{ title, description, technologies[], impact, category, slug, pinned?, demoUrl?, githubUrl? }`. Three projects are flagged `pinned: true` and surface in `PinnedProjects` on `/projects`.

1. **Incident Resolution Assistant** — *GenAI / Microservices*. Python microservices + ServiceNow integration; scaled 20-user POC → 200+ SREs.
2. **Real-Time Log Analysis Pipeline** — *Performance Optimization*. Apache Kafka + Elasticsearch; 90% RCA accuracy, 40–60% MTTR reduction.
3. **Hybrid Retrieval System** — *Advanced Retrieval*. FAISS + Elasticsearch on Kubernetes; recall 30% → 80%+.
4. **Cloud-Native Anomaly Detection** — *MLOps*. Apache Airflow on Kubernetes for data-center-scale datasets.
5. **RAG Chatbot with Live Internet Access** — *RAG Architecture*. LangChain + RAG on Microsoft Azure; ~50% better response quality, near-zero hallucination. (Internally Convogene.ai — name omitted on site.)
6. **Multimodal AI Generation** — *Multimodal AI*. Fine-tuned instruct-pix2pix; end-to-end ownership. (Internally EROS NOW — name omitted.)

> Project cards on `/` are intentionally non-interactive (no Live Demo / Code links) because the listed projects are proprietary client deployments. The `/projects` page also surfaces a GitHub auto-feed for OSS work.

### Experience

1. **Software Engineer - AI** @ **Infobell IT Solutions** — Bengaluru, India — *March 2024 – Present*.
2. **Master Trainer - AI & Python** @ **India STEM Foundation** — Remote & On-site — *Aug 2022 – Aug 2023*.
3. **Junior Software Developer** @ **Koderoom** — Bengaluru, India — *June 2020 – June 2022*.

### Education

1. **C-DAC** — Post Graduate Training Program (6 mo) — *Sep 2023 – Feb 2024*.
2. **G H Raisoni Academy of Engineering and Technology** — PG Diploma in Industrial Robotics — *2019 – Feb 2022*.
3. **G H Raisoni Academy of Engineering and Technology** — B.E. Mechanical Engineering — *2014 – 2018*.

### Certifications & Publications

1. **IBM Cloud Advocate Essentials** — Issued December 2025.
2. **IEEE Publication** — Hexapod Robot design and mechanics paper (2019).

---

## 3. Design system — Unified Card Template

Every content card on the landing page uses the same shape, copied from the Featured Projects card:

```jsx
<Card className="h-full flex flex-col">
  <CardHeader className="pb-4">
    <div className="flex items-start justify-between mb-2">
      <Badge variant="outline" className="text-xs">{topTag}</Badge>
      {/* optional right-side icon (used only by Contact cards) */}
    </div>
    <CardTitle className="text-lg leading-tight mb-3">{title}</CardTitle>
    <CardDescription className="text-sm leading-relaxed">{subtitle}</CardDescription>
  </CardHeader>
  <CardContent className="flex-1 flex flex-col justify-between">
    <div className="mb-4 p-3 bg-primary/10 rounded-lg">
      <div className="text-sm font-medium text-primary mb-1">{accentLabel}</div>
      <div className="text-sm">{accentBody}</div>
    </div>
    <div className="flex flex-wrap gap-2">
      {tags.map((t) => <Badge variant="secondary" className="text-xs">{t}</Badge>)}
    </div>
  </CardContent>
</Card>
```

| Section        | top badge       | title           | subtitle                    | accent box                        | bottom tags    |
|----------------|-----------------|-----------------|-----------------------------|-----------------------------------|----------------|
| Projects       | category        | project title   | description                 | "Impact" → impact                 | technologies   |
| Skills         | "{N} skills"    | category name   | (none)                      | (none)                            | skill list     |
| Experience     | period          | role            | `${company} · ${location}`  | "Highlights" → bullet list        | tech stack     |
| Education      | period          | degree          | institution                 | duration → location               | subject tags   |
| Certifications | "Certification" / "Publication" | name | issuer | `detailLabel` → detail | topical tags |
| Contact        | type            | label           | description                 | `detailLabel` → detail            | nature tags    |

### Card truncation (oversized cards)

The Projects card is the canonical "standard size". Cards that would otherwise exceed it use **click-to-expand inside the card** — never hover (touch-device accessibility).

| Section    | Default shown                                     | Toggle label                                | State key       |
|------------|---------------------------------------------------|---------------------------------------------|-----------------|
| Experience | First **2** bullets in the Highlights accent box  | `Show {N} more highlights` / `Show less`    | `exp-{index}`   |
| Skills     | First **8** badges                                | `+{N} more` / `Show less`                   | `skill-{category}` |

Constants: `EXPERIENCE_BULLET_PREVIEW_COUNT = 2`, `SKILL_PREVIEW_COUNT = 8` (top of `src/pages/Index.tsx`).

---

## 4. Backend internals

### `/api/chat`

`api/src/routes/chat.ts` flow:

1. Parse JSON body. Accept either `{messages: [{role, content}, …], turnstileToken}` (multi-turn) or `{question, turnstileToken}` (legacy single-turn). Hard-cap at 12 turns × 2000 chars per turn.
2. `turnstileToken` required → 401 `missing_turnstile_token` if absent.
3. Verify Turnstile via `verifyTurnstile()` — bypassed only when `env.ENV === "dev"` *and* request has `?dev=1`.
4. Rate-limit by IP (10/60s).
5. SHA-256 cache key on `JSON.stringify(turns) + CORPUS_VERSION` (currently `v3`). Hit returns 200 `text/event-stream` with `X-Cache-Status: hit`.
6. Embed the **last user turn** via OpenAI `text-embedding-3-small`.
7. Cosine-rank against bundled `corpus.json`. If top score < `RELEVANCE_THRESHOLD` (0.15), return the canned off-topic refusal and cache it.
8. Stream a completion from `gpt-5-nano` with the full turn list (system + context + history). Reasoning-model parameters: `max_completion_tokens: 800`, `reasoning_effort: "minimal"` (the model rejects `max_tokens` and consumes the whole budget on reasoning without the minimal effort).
9. SSE parsing buffers across TCP chunk boundaries to avoid dropping leading characters when JSON straddles a chunk. Final response cached for 7 days.

### Frontend chat widget — Portfolio Assistant

`src/components/ResumeChat.tsx`:

- Floating bot icon → 380×520 panel with suggested chips (only on first message), full transcript with user/assistant bubbles, markdown-rendered assistant replies, three-dot bouncing typing indicator while waiting for the first token, "Ask a follow-up…" placeholder once a conversation starts.
- Turnstile widget loaded lazily and rendered once per session. The wrapper hides via CSS once a token is present (kept in DOM so reset works without remount). After every send, the widget is reset so the next request gets a fresh single-use token; a `sendingRef` guard prevents accidental double-clicks.
- `useChat` hook owns the conversation: `turns: ChatTurn[]`, `streaming: string`, `isThinking`, `isLoading`, `error`. On error the optimistic user turn is rolled back so a failed question doesn't poison the next retry.
- If `VITE_TURNSTILE_SITE_KEY` is empty at build time, an amber banner replaces the input area: *"Chat is unavailable: VITE_TURNSTILE_SITE_KEY is missing from the build environment."*
- `src/lib/api.ts` `API_BASE` is sanitized with `.trim().replace(/\/$/, "")` because Vercel's env UI sometimes carries trailing whitespace and `%20%20` ends up in URLs (`net::ERR_NAME_NOT_RESOLVED`).

---

## 5. Conventions

- **Email**: always `diwan.sahilsingh@gmail.com` (with the `h`). The earlier `diwan.sahilsing@…` typo is fixed and must not return.
- **Project cards on `/` are non-interactive** — the listed projects are proprietary client work. Don't add Live Demo / Code buttons on existing entries unless the user explicitly open-sources one. Open-source work goes in the `/projects` GitHub auto-feed.
- **Company names policy**: company names are allowed in the **Experience** section; **omitted** from project titles and descriptions.
- **All sections share the Unified Card Template** (§3). Don't introduce one-off card layouts.
- **Oversized cards truncate with click-to-expand**, not hover.
- **Spacing**: prefer `gap-*`. Don't use `space-x-*` / `space-y-*` — historical regressions.
- **Browser tab title**: `"Sahil Singh Diwan — AI / GenAI Engineer"`.
- **Theme**: light/dark, persisted in `localStorage` under key `theme`. Toggle in nav.
- **Section nav** on `/` uses smooth-scroll anchors. From other routes, the nav navigates to `/#section` first, then scrolls.

---

## 6. Operational reference

### Vercel project (`profile-website`, id `prj_DqytaaeHohbvQHe7bRvKsOvUv1uP`)

- Branches: `main` → production, `dev` → preview.
- Env vars (set on Preview *and* Production):
  - `VITE_API_BASE_URL` — `https://profile-api-dev.diwan-sahilsingh.workers.dev` for preview, the prod URL for production.
  - `VITE_TURNSTILE_SITE_KEY` — `0x4AAAAAADFhkVYoGHa2wMUp` (23 chars; an extra trailing `w` was a previous typo that produced Turnstile error 400020).
- `.npmrc` ships `legacy-peer-deps=true` so Vercel installs succeed under React 19.
- SPA fallback: `vercel.json` rewrites `/(.*)` → `/`.
- Manage via API: `GET/PATCH /v9/projects/profile-website` (use `VERCEL_TOKEN`).

### Worker (`api/wrangler.toml`)

- Default env → production worker `profile-api`.
- `[env.dev]` → `profile-api-dev`. Vars: `PORTFOLIO_ORIGIN` is comma-separated allowlist; `ENV=dev`.
- KV namespaces (dev): `CACHE` `a5b1cffbd20a4099a9868ef9ee053f0a`, `RATE_LIMIT` `d12f22be19c443128be8096623ce5cee`. Production needs its own pair — create with `wrangler kv:namespace create CACHE/RATE_LIMIT` and update the default `[[kv_namespaces]]` block before deploying to prod.
- Secrets (set per env via `wrangler secret put <NAME> --env dev` from inside the api Docker image):
  - `OPENAI_API_KEY`
  - `TURNSTILE_SECRET_KEY` — must pair with the sitekey above.

### Cloudflare Turnstile widget

- Sitekey `0x4AAAAAADFhkVYoGHa2wMUp`, mode `managed`, allowed domains `nostalkers.shop` + the dev Vercel preview. Add `localhost` *temporarily* if you need to run automated tests against `http://localhost:5173`.
- Manage via API: `GET/PUT /accounts/{CLOUDFLARE_ACCOUNT_ID}/challenges/widgets[/{sitekey}]`.

### Pi-specific quirks

- `wrangler dev` and `vitest` for the Worker both crash on this 32-bit-VA Pi (`workerd` tcmalloc OOM at startup). All Worker commands therefore use `docker compose run --rm --no-deps api npx wrangler …`.
- Worker tests can only run on real Cloudflare or on x86_64 Linux.
- `docker compose up api` will fail. `docker compose up web` works fine when the frontend points at a deployed Worker.

### Common commands

```bash
# Frontend dev pointed at deployed dev worker
VITE_API_BASE_URL=https://profile-api-dev.diwan-sahilsingh.workers.dev \
  docker compose up web

# Deploy worker (dev or prod)
docker compose run --rm --no-deps \
  -e CLOUDFLARE_API_TOKEN -e CLOUDFLARE_ACCOUNT_ID \
  api npx wrangler deploy --env dev      # or omit --env for prod

# Regenerate the RAG corpus from data/resume.md
docker compose run --rm \
  -e OPENAI_API_KEY -v "$(pwd)/data:/repo-data:ro" \
  --no-deps api npx tsx scripts/build-embeddings.ts
# then bump CORPUS_VERSION in api/src/lib/cache.ts and redeploy.

# Frontend tests / build / typecheck
docker compose run --rm web npm test
docker compose run --rm web npm run build
docker compose run --rm web npx tsc --noEmit
```

---

## 7. Pointers

- `docs/Portfolio v2 implementation plan.md` — the original TDD plan that drove the v2 rebuild (kept for historical reference).
- `docs/content-management-plan.md` — proposal for moving content out of code so non-developers can edit projects/skills/etc. Awaiting decision before implementation.
- `docs/conversations-history.md` — running execution log of the v2 build sessions, including bug fixes and the dev-environment hardening.
- `DEV.md` — full Docker workflow.
