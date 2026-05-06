# Content Management Plan

> Status: **planning only** — do not implement yet. Discuss and pick an option before any code change. Decision target: after the v2 polish patches are deployed.

## Why this exists

Today, every piece of "content" on the site (projects, skills, experience, education, credentials, contacts, profile copy) is a typed TypeScript const inside `src/data/*.ts`. Adding or editing a single project means: edit a file → run typecheck/tests → commit → push → wait for Vercel.

That's fine for a developer who lives in the repo, but it's friction whenever the change is *content* and not *code*. The user wants an easier path for adding skills, projects, certifications, etc.

We're picking the right tradeoff between editor friction (how easy is it to add a thing?) and operational complexity (how many moving parts will I have to maintain?).

---

## Constraints we know about

- The site runs on Vercel (frontend) + Cloudflare Worker (API). We already have KV bindings and an OpenAI key.
- No host-installed Node — all tooling runs in Docker.
- The user prefers Docker-only workflows and minimal dependency creep (we already removed `react-helmet-async` for being incompatible with React 19).
- Server-side and client-side both need the project list (the worker has its own copy in `api/src/lib/projects.ts` for the `/api/projects/:slug/summary` endpoint). Whatever solution we pick must keep these in sync without manual duplication.
- The site is non-commercial and content volume is low (~10 projects, ~50 skills).

---

## Options surveyed

### Option A — Markdown frontmatter files + Vite glob import

**Shape:**
```
content/projects/incident-resolution-assistant.md
---
title: Incident Resolution Assistant
slug: incident-resolution-assistant
category: GenAI / Microservices
technologies: [Python, Microservices, Kubernetes, Helm]
impact: Scaled POC → production for 200+ SREs
pinned: true
demoUrl: https://...
githubUrl: https://...
---
Body description in markdown — multi-paragraph if needed.
```

A small loader at build time (`src/data/projects.ts` becomes `import.meta.glob("/content/projects/*.md", { eager: true })`) reads them all, validates with Zod, and exports the same shape the components already consume.

**Pros:**
- Zero new infrastructure. Files in git, free, version-controlled.
- Markdown body is great for the rich `description` we'll want on `/projects/:slug`.
- The same files can feed `data/resume.md` (and therefore the RAG corpus) when reshaped.
- Adding a project = drop a file, push.

**Cons:**
- Still requires a git push and a Vercel build to publish. No live editor.
- Worker side still needs the slug list — solve by having the worker import a generated `slugs.json` from the same source.

**Effort:** ~2 hours. Loader + Zod schema + migrate existing 6 projects.

---

### Option B — JSON files + a CLI scaffold script

**Shape:**
```
content/projects.json
content/skills.json
content/experience.json
```
Plus a `scripts/new-project.ts` that prompts ("title? category? tech?") and appends to the JSON.

**Pros:**
- Even simpler than markdown (no parser).
- Scaffold script eliminates schema-by-memory: it asks for every field.

**Cons:**
- JSON for multi-paragraph descriptions is awful (manual `\n` escapes).
- No live editor. Same git/build round-trip.

**Effort:** ~1 hour. Migrate + write the CLI prompt.

---

### Option C — Headless CMS (Sanity, Contentful, Payload, Strapi)

**Shape:** content lives in an external service with a web editor. Frontend pulls at build time (or runtime) via API.

**Pros:**
- Real editor UI. Can edit from a phone. Roles, drafts, scheduled publish, etc.
- Sanity has a generous free tier and a great editor.

**Cons:**
- Account / login flow / external SaaS dependency.
- Build-time fetches mean we still need a redeploy to publish (mitigated by webhooks → Vercel deploy hooks).
- Schema lives in two places (CMS schema + frontend types) — drift happens.
- Largest blast radius if the service has an outage during a deploy.
- Probably overkill for this volume.

**Effort:** ~6–8 hours setup + ongoing schema management.

---

### Option D — Notion API as the source of truth

**Shape:** projects/skills/etc. as Notion databases. A build-time script (or worker route) pulls them via the Notion API and feeds the frontend.

**Pros:**
- The user likely already uses Notion. Editing experience is excellent.
- No new tool to learn.

**Cons:**
- Notion API rate limits, occasional outages.
- Schema mapping (Notion property types → our types) is tedious.
- Auth token to manage and rotate.
- Editing a project still requires a redeploy to be visible (unless we fetch at runtime, which adds latency and a dependency on Notion uptime for every page load).

**Effort:** ~4 hours.

---

### Option E — Self-hosted admin route on the worker (write to KV/R2)

**Shape:**
- Add `/admin` to the React app, gated by a passkey or magic link.
- New worker routes `/api/admin/content/{type}` that write JSON blobs to R2.
- Frontend fetches the live blobs from R2 on page load (cached aggressively at the edge).

**Pros:**
- Single-deployment, full control, nothing external.
- Can edit from anywhere with a browser.
- Live updates without a Vercel rebuild.

**Cons:**
- Real auth is non-trivial (and getting it wrong means anyone can edit).
- We become responsible for backups, schema migrations, version history.
- More moving parts to maintain than the entire current site.

**Effort:** ~12+ hours.

---

## Recommendation: **Option A (markdown frontmatter) — with a deferred upgrade path to E**

Rationale:
- **Volume is low and editing pace is slow.** A few projects per quarter doesn't warrant a CMS.
- **Markdown frontmatter is the same model the user is already using for `data/resume.md`** (which already feeds the RAG corpus). Aligning on it once means projects, resume, and corpus all flow from the same shape.
- **It keeps the worktree as the source of truth.** `git log` is the version history; PRs are the review surface.
- **Drift between worker and frontend is fixed by codegen:** a single `npm run gen:content` step writes both `src/data/*.ts` and `api/src/lib/projects.ts` from the markdown files.

The path stays open to Option E later — we'd just switch the loader to fetch from R2 instead of reading the local glob. None of the components or Worker routes need to change.

---

## Proposed migration (when we agree to do this)

1. **Schema definition**
   - Define Zod schemas in `src/schemas/content.ts` for `Project`, `Skill`, `ExperienceEntry`, `EducationEntry`, `Credential`, `Contact`, `Profile`. Source of truth for both `src/data/*` and `api/src/lib/projects.ts`.

2. **Layout**
   ```
   content/
     profile.md
     contacts.md
     projects/
       incident-resolution-assistant.md
       real-time-log-analysis-pipeline.md
       …
     skills/
       ai-genai.md
       data-engineering.md
       …
     experience/
       2024-infobell.md
       2022-india-stem.md
       2020-koderoom.md
     education/
       2023-cdac.md
       2019-pgd-robotics.md
       2014-be-mech.md
     credentials/
       ibm-cloud-advocate.md
       ieee-hexapod.md
   ```

3. **Loaders**
   - `src/lib/content.ts` — `import.meta.glob("/content/**/*.md", { eager: true, query: "?raw" })` → parse frontmatter (gray-matter) → validate (Zod) → typed exports. Replaces today's `src/data/*.ts`.
   - `scripts/build-content.ts` — runs the same parse + writes `api/data/projects.json` so the worker can import it at build time, plus `data/resume.md` continues to feed `api/scripts/build-embeddings.ts` unchanged.
   - `npm run gen:content` runs both — wired into `prebuild` so Vercel and the worker see consistent output.

4. **Authoring CLI (optional polish)**
   - `npm run new:project` prompts for slug, title, category, tech, impact, body and scaffolds the markdown file.

5. **Existing data migration**
   - Convert each entry in `src/data/*.ts` to a markdown file. Mechanical; can be done in a single PR.
   - Delete `src/data/*.ts` once parity tests pass (R9 covers project shape).

6. **Risk mitigations**
   - Keep R9 (data integrity) and R10 (card uniformity) tests; they catch any schema drift.
   - Don't ship until both `npm test` and `tsc --noEmit` are green on the new pipeline.

---

## Questions for the user before implementing

1. Are you comfortable with **markdown files in `content/` + git push to publish**, or do you want a real web editor (Option C/D) so non-developers can update?
2. Do you actually want to edit content from a phone? If yes, Option E becomes more attractive.
3. How often do you expect to add/edit content? (Drives whether the friction reduction is worth the migration.)
4. Should the corpus rebuild (RAG embeddings) be a manual step or auto-trigger on content changes? (Manual is cheaper; auto needs a tiny CI job.)
5. Any new content types coming soon — talks, blog posts, demos with embedded video? (Affects schema design.)

Decision: pause here. Once you tell me which option to take, we run the migration in a single PR with the test gates above.
