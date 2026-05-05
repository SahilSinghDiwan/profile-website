# Profile Website — Overview & Reference

A reference for future chats: structure, content, conventions, and decisions made for this site.

> **Status**: Portfolio v2 implementation complete (May 2026). The "v1 reference" section below describes the original single-page layout; the "v2 — Live Architecture" section at the end of this file describes the deployed shape (multi-page React app + Cloudflare Worker API + dev preview environment). Read the v2 section first when resuming work.

## Repo

- **GitHub**: https://github.com/SahilSinghDiwan/profile-website
- **Local path**: `/home/sahil/projects/profile-website`
- **Stack**: Vite 7 + React 19 + TypeScript 5.8 + Tailwind 4 + shadcn-style UI primitives (Radix), TanStack Query, React Router (BrowserRouter), lucide-react icons.
- **Routing**: `BrowserRouter` — `/` → `Index`, `/projects` → `Projects`, `/projects/:slug` → `ProjectDetail`, `*` → `NotFound`. (Was `HashRouter` in v1; migrated as part of F0.2 so OG previews unfurl on per-project URLs.)

## File Structure

```
profile-website/
├── docs/
│   ├── analysis.md
│   └── website-overview.md   (this file)
├── public/
├── src/
│   ├── App.tsx               — providers + router
│   ├── main.tsx              — entry
│   ├── index.css             — Tailwind base
│   ├── components/ui/        — Radix-based primitives (Button, Card, Badge, Toaster, Tooltip, Sonner)
│   ├── hooks/use-toast.ts
│   ├── lib/utils.ts          — cn() helper
│   └── pages/
│       ├── Index.tsx         — single-page portfolio (all sections live here)
│       └── NotFound.tsx
├── index.html
├── package.json
├── vite.config.ts
└── tsconfig*.json
```

The entire portfolio is a **single page** (`src/pages/Index.tsx`) with smooth-scroll anchors. There are no separate route pages for each section.

## Page Sections (in order)

All inside `src/pages/Index.tsx`. Each section is a `<section id="...">` and is reachable from the nav via `scrollToSection(sectionId)`.

| Section ID    | Heading                          | Notes                                                                                  |
|---------------|----------------------------------|----------------------------------------------------------------------------------------|
| (hero, no id) | "AI / GenAI Engineer"            | H1 + tagline + 2 CTA buttons (View My Work / Get In Touch).                            |
| `about`       | About Me                         | Two paragraphs + 6-stat grid.                                                          |
| `skills`      | Skills & Technologies            | 9 categorized cards rendered from the `skills` object.                                 |
| `projects`    | Featured Projects                | 6 cards rendered from the `projects` array. **Non-interactive** — no live demo / code links. |
| `experience`  | Work Experience                  | 3 job cards rendered from the `experience` array.                                      |
| `education`   | Education & Certifications       | Two-column: Education (3 entries) + Certifications & Publications (2 entries).         |
| `contact`     | Get In Touch                     | Email card + LinkedIn card + WhatsApp CTA button.                                      |
| (footer)      | © 2026 Sahil Singh Diwan         | GitHub / LinkedIn / Email icon links.                                                  |

## Personal / Contact Info (single source of truth)

| Field      | Value                                         |
|------------|-----------------------------------------------|
| Full name  | Sahil Singh Diwan                             |
| Location   | Bengaluru, India                              |
| Phone      | +91 800-7192-680                              |
| Email      | diwan.sahilsingh@gmail.com                    |
| GitHub     | https://github.com/SahilSinghDiwan            |
| LinkedIn   | https://www.linkedin.com/in/diwan-sahil/      |
| WhatsApp   | https://wa.me/918007192680                    |

## Hero Tagline

- H1: **AI / GenAI Engineer**
- Sub-H1: *Architecting end-to-end AI solutions*
- Lede: *5+ years building RAG pipelines, scalable microservices, and production-grade GenAI systems with vector databases, Kafka, Airflow, and Kubernetes.*

## About — Stats Grid (6 boxes, 2×3)

1. **5+** — Years Experience
2. **10+** — Corporate Projects
3. **99.9%** — Uptime Achieved
4. **40–60%** — MTTR Reduction
5. **200+** — SREs Supported
6. **90%** — RCA Accuracy

## Skills (`skills` object)

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

> Note: the AI / GenAI, Vector Search, Backend, Cloud, Databases, Frontend, and Tools categories include items beyond what's on the resume (e.g., LlamaIndex, DeepSpeed, ONNX, TensorRT, Pinecone, GraphQL, PostgreSQL, Vue.js, Vercel, Supabase, Jest). These are kept on the website by user preference; user will prune later.

## Projects (`projects` array — 6 entries, non-interactive)

Card shape: `{ title, description, technologies[], impact, category }`. **No `github` / `liveDemo` fields.** Cards have no action buttons because all of these are proprietary client deployments. Company / client names are intentionally omitted from titles.

1. **Incident Resolution Assistant** — *GenAI / Microservices*
   - Python microservices platform, ITSM integration, scaled 20-user POC → 200+ SREs.
   - Tech: Python, Microservices, Kubernetes, Helm. Impact: Scaled POC → production for 200+ SREs.
2. **Real-Time Log Analysis Pipeline** — *Performance Optimization*
   - Event-driven log fetching with automated RCA.
   - Tech: Apache Kafka, Elasticsearch, Python. Impact: 90% RCA accuracy, 40–60% MTTR reduction.
3. **Hybrid Retrieval System** — *Advanced Retrieval*
   - Hybrid retrieval to overcome data ambiguity, K8s + Helm full-stack deploy.
   - Tech: FAISS, Elasticsearch, Kubernetes, Helm. Impact: Recall 30% → 80%+.
4. **Cloud-Native Anomaly Detection** — *MLOps*
   - Airflow + K8s pipelines for data-center-scale datasets.
   - Tech: Apache Airflow, Kubernetes, Python. Impact: Data-center-scale processing.
5. **RAG Chatbot with Live Internet Access** — *RAG Architecture*
   - Customized RAG with live internet enrichment, deployed on Microsoft Azure (was internally referred to as Convogene.ai — name omitted on site).
   - Tech: LangChain, RAG, Microsoft Azure, Python. Impact: 50% better response quality, near-zero hallucination.
6. **Multimodal AI Generation** — *Multimodal AI*
   - End-to-end ownership; fine-tuned an instruct-pix2pix model (was the EROS NOW solution — name omitted on site).
   - Tech: PyTorch, instruct-pix2pix, Fine-Tuning. Impact: Successful fine-tune & rollout.

> User has more projects to add later — these will be appended to the `projects` array.

## Experience (`experience` array — 3 entries, real company names kept)

Card shape: `{ role, company, location, period, bullets[] }`.

1. **Software Engineer - AI** @ **Infobell IT Solutions** — Bengaluru, India — *March 2024 - Present* (6 bullets covering all the project work above).
2. **Master Trainer - AI & Python** @ **India STEM Foundation** — Remote & On-site, India — *August 2022 - August 2023* (3 bullets).
3. **Junior Software Developer** @ **Koderoom** — Bengaluru, India — *June 2020 - June 2022* (3 bullets).

## Education (`education` array — 3 entries)

1. **C-DAC** — Post Graduate Training Program (6 Months) — *Sep 2023 - Feb 2024*.
2. **G H Raisoni Academy of Engineering and Technology** — Post Graduate Diploma in Industrial Robotics — Nagpur, India — *2019 - Feb 2022*.
3. **G H Raisoni Academy of Engineering and Technology** — Bachelor of Engineering (B.E.), Mechanical Engineering — Nagpur, India — *2014 - 2018*.

## Certifications & Publications (`certifications` array — 2 entries)

1. **IBM Cloud Advocate Essentials** — Issued December 2025.
2. **IEEE Publication** — Research paper on the design and mechanics of a Hexapod Robot (2019).

## Unified Card Template

**Every** content card on the page (Skills, Projects, Experience, Education, Certifications, Contact) uses the same visual structure — copied from the Featured Projects card:

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

| Section        | top badge       | title           | subtitle              | accent box                        | bottom tags    |
|----------------|-----------------|-----------------|-----------------------|-----------------------------------|----------------|
| Projects       | category        | project title   | description           | "Impact" → impact                 | technologies   |
| Skills         | "{N} skills"    | category name   | (none)                | (none)                            | skill list     |
| Experience     | period          | role            | `${company} · ${location}` | "Highlights" → bullet list   | tech stack     |
| Education      | period          | degree          | institution           | duration → location               | subject tags   |
| Certifications | "Certification" / "Publication" | name | issuer | `detailLabel` → detail | topical tags   |
| Contact        | type            | label (Email…)  | description           | `detailLabel` → detail            | nature tags    |

When adding any new card to the site, follow the table above to fill in each slot.

## Standard Card Size & Truncation

The **Projects card** is the canonical "standard size":
- ~1-line title
- ~3-line description
- 1 accent box (label + ~1-line body)
- 1 row of secondary badges

Cards that would naturally exceed this size are truncated to roughly the standard size, with a click-to-expand toggle inside the card. **Hover does nothing** — toggle is click-only for accessibility (works on touch devices).

| Section    | Default shown                                     | Toggle label                                | State key       |
|------------|---------------------------------------------------|---------------------------------------------|-----------------|
| Experience | First **2** bullets in the Highlights accent box  | `Show {N} more highlights` / `Show less`    | `exp-{index}`   |
| Skills     | First **8** badges                                | `+{N} more` / `Show less`                   | `skill-{category}` |

Constants live at the top of `src/pages/Index.tsx`:
- `EXPERIENCE_BULLET_PREVIEW_COUNT = 2`
- `SKILL_PREVIEW_COUNT = 8`

Toggle state is held by a single hook in `Index`:
```ts
const [expanded, setExpanded] = useState<Record<string, boolean>>({});
const isExpanded = (key: string) => Boolean(expanded[key]);
const toggleExpanded = (key: string) => setExpanded(prev => ({ ...prev, [key]: !prev[key] }));
```

Projects, Education, Certifications, and Contact cards already fit within the standard size and do not need truncation.

## Conventions / Decisions

- **Single source of truth for content**: all data lives as plain JS arrays/objects at the top of `src/pages/Index.tsx` (`projects`, `skills`, `experience`, `education`, `credentials`, `contacts`). Add new entries there.
- **Theme**: light / dark, persisted in `localStorage` under key `theme`. Toggle in nav.
- **Routing**: HashRouter — URLs look like `/#/...`. Section nav uses anchor scrolling, not routes.
- **No analytics, no forms, no backend** — purely static.
- **Project cards are intentionally non-interactive** because all featured projects are proprietary client deployments; do not add Live Demo / Code buttons to existing entries unless the user explicitly opens-sources one.
- **Company names policy**: company names allowed in the **Experience** section; **omitted** from project titles/descriptions.
- **Email**: always `diwan.sahilsingh@gmail.com` (with the `h`). The earlier `diwan.sahilsing@gmail.com` was a typo and has been removed.

## How to Add a New Project Later

Append an object to the `projects` array in `src/pages/Index.tsx`:

```ts
{
  title: "<Project Title — no client name>",
  description: "<2 sentences, no client name>",
  technologies: ["Tech1", "Tech2"],
  impact: "<one quantified line>",
  category: "<short tag, e.g. 'RAG Architecture'>"
}
```

If a future project is open-sourced and should be linkable, add `github` and/or `liveDemo` fields and re-introduce the action buttons in the projects card JSX (currently removed).

## How to Run

```bash
cd /home/sahil/projects/profile-website
npm install
npm run dev      # dev server
npm run build    # production build (tsc -b && vite build)
npm run preview  # preview built bundle
npm run lint     # eslint
```

Preferred dev workflow is **Docker** (a long-running container named `profile-website-dev` is bind-mounted to the repo and runs `npm run dev`). Avoid `docker exec` for one-off type/lint checks if it would kill the dev container — use a separate `docker run` instead.

---

## Conversation Handoff Notes (for resuming with another model)

These are the gotchas and decisions accumulated across earlier sessions. Read this before making changes.

### CRITICAL: `src/index.css` is precompiled Tailwind — NOT a source file

- `src/index.css` (~2533 lines) is precompiled Tailwind v3 output. It contains **only the utilities that were generated when it was built** — many common Tailwind classes are missing.
- `vite.config.ts` does **not** register the Tailwind v4 vite plugin, even though `@tailwindcss/vite` and `tailwindcss` v4 are in `package.json`. So adding new utility classes in JSX will **silently no-op** if those classes aren't already in `index.css`.
- The workaround in use: `src/typography.css` (loaded after `index.css` in `src/main.tsx`) holds the Inter font setup **plus shim CSS rules for any utility class needed by JSX that's missing from `index.css`**.

**Confirmed-missing utilities that have been shimmed into `typography.css`** (do not assume Tailwind classes work — grep `src/index.css` first, and if missing, add a plain CSS rule to `typography.css`):

```
pt-32 pt-40 pt-48 pb-24 pb-32 py-20 py-24
mb-5 mb-10 mt-3 mt-6
tabular-nums w-16 flex-shrink-0 gap-10 gap-14
md:pt-40 md:pt-48 md:pb-24 md:pb-32 md:py-20 md:py-24 md:mb-10 md:mt-6
group-focus-visible:opacity-100
section[id] { scroll-margin-top: 4rem }
```

If you add a class in JSX and the visual change doesn't appear:
1. `Grep` for `\.<classname>` in `src/index.css`. If absent → add to `typography.css`.
2. For `md:` variants, wrap inside `@media (min-width: 768px) { .md\:<class> { ... } }`.

### Header / section overlap

Nav is `fixed`, `h-16` (4rem). To make section tops sit flush against the header bottom on click-scroll, `typography.css` sets `section[id] { scroll-margin-top: 4rem }`. Don't change this to 6rem — the user explicitly wants no visible gap.

### Hero padding

Hero `<section>` uses `pt-40 pb-24 md:pt-48 md:pb-32`. These are shimmed in `typography.css`. If the H1 ever appears under the nav again, check that those shim rules still exist.

### Get In Touch — current design

Replaced earlier 3-column card grid with a centered row of circular icon buttons:

```jsx
<div className="flex flex-wrap justify-center items-center gap-10 sm:gap-14">
  {contacts.map((c) => (
    <a className="group flex flex-col items-center text-center" ...>
      <div className="flex flex-shrink-0 items-center justify-center w-16 h-16 aspect-square rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
        <Icon className="w-7 h-7" />
      </div>
      <div className="mt-3 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-300">
        <div className="text-sm font-medium text-primary">{c.label}</div>
        <div className="text-xs text-muted-foreground break-all">{c.detail}</div>
      </div>
    </a>
  ))}
</div>
```

Label/detail under each icon is **hidden by default** and fades in on hover or keyboard focus. **Don't** revert to cards or to always-visible labels — both have been explicitly rejected.

### Spacing rule the user explicitly enforced

Use `gap-*` for nav and inline groups, **not** `space-x-*` / `space-y-*`. Past attempts with `space-x-6` rendered with no spacing in this precompiled CSS. Current nav uses `gap-6` desktop, `gap-3` mobile column, `gap-2` mobile actions, footer `gap-4`.

### User feedback recorded so far

- Email is `diwan.sahilsingh@gmail.com` — the `h` is mandatory (a missing-`h` typo existed earlier).
- Project cards must be **non-interactive** (no live demo / code links) because all current projects are proprietary client deployments. Company names belong in Experience, **not** in project titles/descriptions.
- All sections use the **same Featured-Projects card template** (see Unified Card Template table above).
- Oversized cards (Experience bullets, Skills) **truncate with click-to-expand**, not hover.
- Browser tab title must be professional — currently `"Sahil Singh Diwan — AI / GenAI Engineer"`.
- Typography must be "professional and homogenous" — Inter font, tightened heading letter-spacing, generous line-height (~1.65 body, ~1.7 paragraphs). Lives in `typography.css`.

### Last commit on `main`

`9d2d27c feat: Refresh website with resume content, typography polish, and contact icons` — pushed to `origin/main`. The repo is otherwise clean.

### Files to read first when resuming

1. `src/pages/Index.tsx` — single page, all sections + content data live here.
2. `src/typography.css` — font + ALL shim utilities. Always check this before touching layout.
3. `src/index.css` — precompiled Tailwind; treat as read-only reference for what classes already exist.
4. `index.html` — title, meta, Inter font preconnect.
5. This file (`docs/website-overview.md`).

---

## Portfolio v2 — Live Architecture (current)

End of v2 phase: marked **complete** May 2026. Everything below describes the deployed shape that supersedes the v1 sections above. The plan (`docs/Portfolio v2 implementation plan.md`) is the canonical spec; this section is the implementation truth.

### Surfaces

| Surface | URL | Notes |
|---|---|---|
| Production frontend | `https://nostalkers.shop` (custom domain on Vercel) | `main` branch deploys here. SSO disabled on the apex domain. |
| Dev preview frontend | `https://profile-website-git-dev-sahils-projects-22d5c9eb.vercel.app` | `dev` branch. Vercel SSO is **on** for previews — disable temporarily via `PATCH /v9/projects/profile-website {ssoProtection: null}` to run automation, then restore. |
| Production API | `https://profile-api.diwan-sahilsingh.workers.dev` (planned `api.nostalkers.shop`) | Worker name `profile-api` (default env). Deploy via `wrangler deploy` from `api/`. |
| Dev API | `https://profile-api-dev.diwan-sahilsingh.workers.dev` | Worker name `profile-api-dev` (`[env.dev]` block in `api/wrangler.toml`). Deploy via `docker compose run --rm --no-deps -e CLOUDFLARE_API_TOKEN -e CLOUDFLARE_ACCOUNT_ID api npx wrangler deploy --env dev`. |

### Repo layout

```
profile-website/
├── src/                     # Vite + React 19 + TS frontend
│   ├── pages/               # Index, Projects, ProjectDetail, NotFound
│   ├── components/          # ResumeChat, GitHubProjects, ProjectCarousel,
│   │                        # PinnedProjects, TechFilter, ProjectAISummary,
│   │                        # CommandPalette, DemoEmbed, ResumeDownload,
│   │                        # AnimatedSection, CardSkeleton, ChatSkeleton
│   │   └── ui/              # shadcn primitives + Skeleton
│   ├── data/                # projects/skills/experience/education/credentials/
│   │                        #   contacts/profile (extracted from Index.tsx)
│   ├── hooks/               # useChat, useCmdK, useFilteredProjects
│   ├── lib/                 # api.ts (chat/listRepos/projectSummary), motion.ts,
│   │                        # meta.tsx (Seo via React 19 native head hoisting),
│   │                        # utils.ts
│   └── __tests__/           # smoke + regression/r1..r10 + components/* + routes
│
├── api/                     # Cloudflare Worker (sibling to src/)
│   ├── src/
│   │   ├── index.ts         # router + multi-origin CORS (comma-separated PORTFOLIO_ORIGIN)
│   │   ├── lib/             # cache.ts (KV+SHA-256+CORPUS_VERSION),
│   │   │                    # ratelimit.ts (KV fixed-window),
│   │   │                    # turnstile.ts, projects.ts (server-side slug list)
│   │   └── routes/          # github.ts, chat.ts, project-summary.ts
│   ├── data/corpus.json     # RAG corpus — real OpenAI embeddings (1536-dim, ~308 KB).
│   │                        # Bundled into the worker upload.
│   ├── scripts/build-embeddings.ts
│   └── wrangler.toml        # default env + [env.dev] block with KV ids and origin allowlist
│
├── e2e/                     # Playwright smoke tests
├── docs/                    # plan + this file + conversations-history
├── docker-compose.yml       # web (Vite, 5173) + api (Wrangler, 8787)
├── Dockerfile.web / .api    # node:20-alpine for web; node:20-slim+libc6 for api
└── .npmrc                   # legacy-peer-deps=true (React 19 peer fixes)
```

### Acceptance criteria status (vs `docs/Portfolio v2 implementation plan.md` §8)

| # | Criterion | Status | Notes |
|---|---|---|---|
| 1 | All Phase 0 tasks merged | ✅ | Tailwind v4, BrowserRouter, data extraction, vitest infra |
| 2 | All Track A deployed | ✅ | `/healthz`, `/api/github/repos`, `/api/chat`, `/api/projects/:slug/summary` live on dev worker |
| 3 | All Track B + C merged + deployed | ✅ | All components present in `src/components/` and wired in `App.tsx`, `Projects.tsx`, `ProjectDetail.tsx` |
| 4 | Live: chat streams a coherent answer | ✅ | Verified via curl: real RAG retrieval + GPT-5-nano + clean SSE buffering |
| 5 | Live: `/projects` shows pinned + auto GitHub feed, filterable by tech | ✅ | `PinnedProjects` + `GitHubProjects` + `TechFilter` (URL-synced via `?tech=...`) |
| 6 | Live: per-project page shows AI summary + (where set) demo embed | ✅ | `ProjectAISummary` calls `/api/projects/:slug/summary`; `DemoEmbed` renders iframe when `demoUrl` set |
| 7 | Live: `Cmd+K` opens palette anywhere | ✅ | `CommandPalette` mounted globally in `App.tsx` |
| 8 | OG previews unfurl on per-project URLs | ⏳ | Code uses React 19 native `<title>`/`<meta>` hoisting per route. **`public/og-default.png` (1200×630) not yet placed** — without it OG previews show no image. |
| 9 | Lighthouse: Perf ≥ 90, A11y ≥ 95, SEO ≥ 95 on `/` | ⏳ | Not measured. Run after `og-default.png` is in place. |
| 10 | `npm test` passes 100% on main | ✅ on web, ⚠️ pi-blocked on api | Frontend tests pass in Docker. API tests use `@cloudflare/vitest-pool-workers`, which OOMs `workerd` on the Pi (32-bit virtual address space limit). They run on real Cloudflare and on x86_64 Linux. |

**Net:** v2 implementation is feature-complete and deployed to dev. Two closing chores remain before v2-on-`main`:
1. Generate / drop in `public/og-default.png` (1200×630).
2. Take a Lighthouse snapshot from a non-Pi host (or use PageSpeed Insights against the dev preview).

### Deployment & secrets cheatsheet

**Frontend (Vercel project `profile-website`, id `prj_DqytaaeHohbvQHe7bRvKsOvUv1uP`):**
- `main` → production at custom domain.
- `dev` → preview at `profile-website-git-dev-sahils-projects-22d5c9eb.vercel.app`.
- Env vars (Preview *and* Production):
  - `VITE_API_BASE_URL` — `https://profile-api-dev.diwan-sahilsingh.workers.dev` for preview, the prod URL for production.
  - `VITE_TURNSTILE_SITE_KEY` — `0x4AAAAAADFhkVYoGHa2wMUp` (the value Cloudflare hands you; **23 chars, no trailing `w`** — a previous typo gave a 24-char value that produced Turnstile error 400020).
- `.npmrc` ships `legacy-peer-deps=true` so Vercel installs succeed under React 19.
- SPA fallback: `vercel.json` rewrites `/(.*)` → `/`.

**Worker (`api/wrangler.toml`):**
- Default env → production worker `profile-api`.
- `[env.dev]` → `profile-api-dev`. Vars: `PORTFOLIO_ORIGIN` is comma-separated allowlist (`http://localhost:5173,https://profile-website-git-dev-sahils-projects-22d5c9eb.vercel.app`); `ENV=dev`.
- KV namespaces (dev): CACHE `a5b1cffbd20a4099a9868ef9ee053f0a`, RATE_LIMIT `d12f22be19c443128be8096623ce5cee`. Production has its own pair — set with `wrangler kv:namespace create CACHE/RATE_LIMIT` and update the default `[[kv_namespaces]]` block before deploying to prod.
- Secrets (set per env via `wrangler secret put <NAME> --env dev` from inside the `api` Docker image):
  - `OPENAI_API_KEY`
  - `TURNSTILE_SECRET_KEY` — must pair with the sitekey above (the matching secret starts with `0x4AAAAAADFhkc…`).

**Cloudflare Turnstile widget:**
- Sitekey `0x4AAAAAADFhkVYoGHa2wMUp`, mode `managed`, allowed domains `nostalkers.shop`, the dev Vercel preview, plus add `localhost` *temporarily* if you want to run automated tests against `http://localhost:5173`.
- Manage via API: `GET/PUT /accounts/{CLOUDFLARE_ACCOUNT_ID}/challenges/widgets[/{sitekey}]`.

**Pi-specific deployment quirks:**
- `wrangler dev` and `vitest` for the worker both crash on this 32-bit-VA Pi (`workerd` tcmalloc OOM at startup). All worker commands therefore use `docker compose run --rm --no-deps api npx wrangler …`. Tests for the worker can only be run on real Cloudflare or on x86_64.
- `docker compose up api` will fail; `docker compose up web` works fine if the frontend points at a deployed worker.

### Chat backend internals (current)

`api/src/routes/chat.ts` flow:
1. Parse JSON body — invalid → 400 `invalid_json`.
2. `turnstileToken` required → 401 `missing_turnstile_token` if absent.
3. Verify Turnstile via `verifyTurnstile()` — bypassed only when `env.ENV === "dev"` *and* request has `?dev=1`.
4. Rate-limit by IP (10/60s for `/api/chat`).
5. SHA-256 cache key on `(question, CORPUS_VERSION)` — current `CORPUS_VERSION = "v2"`. KV cache hit returns 200 `text/event-stream`, `X-Cache-Status: hit`.
6. Embed the question via OpenAI `text-embedding-3-small`.
7. Cosine-rank against bundled `corpus.json` (7 chunks). If top score < `RELEVANCE_THRESHOLD` (0.15), return the canned off-topic refusal and cache it.
8. Otherwise stream a completion from `gpt-5-nano`. Reasoning-model parameters: `max_completion_tokens: 800`, `reasoning_effort: "minimal"`. `max_tokens` is rejected by GPT-5; `reasoning_effort: "minimal"` is required to actually emit content within a small budget.
9. The streaming body is parsed with a chunk-boundary-safe SSE buffer: incomplete `data: {…}` lines are carried across chunks so token characters are not dropped at TCP boundaries. Final response is cached for 7 days.

### Frontend chat widget internals

`src/components/ResumeChat.tsx`:
- Floating bubble (bottom-right) → opens 380×520 panel with suggested chips, streaming message panel, error panel, and a Turnstile widget mounted lazily on first open.
- Turnstile is loaded via `https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit` and rendered with `window.turnstile.render` once per session. Widget is removed and the token cleared on `handleClose`.
- All three send paths (Send button, Enter key, suggested-chip click) gate on `turnstileMissing = turnstileRequired && !turnstileToken`.
- If `VITE_TURNSTILE_SITE_KEY` is empty at build time, an amber banner replaces the input area: *"Chat is unavailable: VITE_TURNSTILE_SITE_KEY is missing from the build environment."*
- `src/lib/api.ts` `API_BASE` value is sanitized with `.trim().replace(/\/$/, "")` because env vars pasted into the Vercel UI sometimes carry trailing whitespace and `%20%20` ends up in URLs (`net::ERR_NAME_NOT_RESOLVED`).

### How to run / deploy

```bash
# Local dev — Docker only (host has no node).
# Both containers come up; the api container OOMs on this Pi (see quirk above).
docker compose up web

# Point local web at the deployed dev worker (avoids the api OOM):
VITE_API_BASE_URL=https://profile-api-dev.diwan-sahilsingh.workers.dev \
  docker compose up web

# Deploy worker (dev or prod):
docker compose run --rm --no-deps \
  -e CLOUDFLARE_API_TOKEN -e CLOUDFLARE_ACCOUNT_ID \
  api npx wrangler deploy --env dev          # or omit --env for prod

# Regenerate the RAG corpus from data/resume.md:
docker compose run --rm \
  -e OPENAI_API_KEY -v "$(pwd)/data:/repo-data:ro" \
  --no-deps api npx tsx scripts/build-embeddings.ts
# then bump CORPUS_VERSION in api/src/lib/cache.ts and redeploy.

# Frontend tests:
docker compose run --rm web npm test
```

### Pointers to other docs

- `docs/Portfolio v2 implementation plan.md` — canonical TDD plan (Phase 0 → Wave 1–4, dispatch guide, acceptance criteria).
- `docs/conversations-history.md` — running execution log of the v2 build, including session-level decisions and bug fixes (read §10 for the dev-environment + chat-hardening session).
