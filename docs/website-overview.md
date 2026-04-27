# Profile Website — Overview & Reference

A reference for future chats: structure, content, conventions, and decisions made for this site.

## Repo

- **GitHub**: https://github.com/SahilSinghDiwan/profile-website
- **Local path**: `/home/sahil/projects/profile-website`
- **Stack**: Vite 7 + React 19 + TypeScript 5.8 + Tailwind 4 + shadcn-style UI primitives (Radix), TanStack Query, React Router (HashRouter), lucide-react icons.
- **Routing**: `HashRouter` with two routes — `/` → `Index`, `*` → `NotFound`.

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
