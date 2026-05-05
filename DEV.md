# Local development (Docker, hot-reload)

All build tools run inside containers — nothing is installed on the host.

## Prereqs

- Docker Desktop / Docker Engine + Compose v2
- A `.env` at repo root with:
  ```
  OPENAI_API_KEY=...
  TURNSTILE_SITE_KEY=...
  TURNSTILE_SECRET_KEY=...
  ```

## First run

```bash
docker compose up --build
```

- Frontend: http://localhost:5173 (Vite + HMR)
- API:      http://localhost:8787 (Wrangler dev, hot reload)

Source is bind-mounted; edits on host trigger reload inside the container.

## Tests

Frontend:
```bash
docker compose run --rm web npm test
```

API (Cloudflare Worker, Miniflare pool):
```bash
docker compose run --rm api npm test
```

## Adding deps (host has no Node — always go through the container)

```bash
docker compose run --rm web npm install <pkg>
docker compose run --rm api  npm install <pkg>
```

## Layout

```
profile-website/
├── src/                # Vite React app (frontend)
├── api/                # Cloudflare Worker (sibling to src/)
├── data/               # Resume PDF + resume.md (corpus source for RAG)
├── docker-compose.yml
├── Dockerfile.web
└── Dockerfile.api
```
