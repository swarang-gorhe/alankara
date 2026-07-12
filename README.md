# Alankara

Luxury e-commerce platform for handcrafted jewellery and adornments. A pnpm + Turborepo monorepo with Next.js 15 frontend, FastAPI backend, and LangChain AI layer.

## Repository structure

```
Alankara/
├── apps/
│   ├── web/                 # Next.js 15 — customer storefront + admin UI
│   └── api/                 # FastAPI — REST API, Celery workers, LangChain AI
├── packages/
│   └── shared/              # Shared TypeScript types
├── supabase/
│   └── migrations/          # Production SQL schema + RLS policies
├── docs/                    # Auth migration, performance notes
├── docker-compose.yml       # Local Postgres + Redis
├── scripts/                 # Alembic → Supabase export helper
└── turbo.json
```

## Prerequisites

- **Node.js** 20+
- **pnpm** 9+ (`corepack enable && corepack prepare pnpm@latest --activate`)
- **Python** 3.11+ (for API)
- **Docker** (Postgres 16 + pgvector, Redis)

## Local setup

### 1. Clone and install

```bash
git clone https://github.com/swarang-gorhe/alankara.git
cd alankara
pnpm install
```

### 2. Start infrastructure

```bash
docker compose up -d
```

This starts:
- **Postgres 16** with pgvector on `localhost:5432` (user/pass/db: `alankara`)
- **Redis 7** on `localhost:6379`

### 3. Configure environment

```bash
cp apps/web/.env.example apps/web/.env.local
cp apps/api/.env.example apps/api/.env
```

Default values work for local development. Add `OPENAI_API_KEY` to `apps/api/.env` for AI features.

### 4. Install Python API dependencies

```bash
cd apps/api
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
pip install pytest httpx ruff
cd ../..
```

### 5. Database migrations & seed

```bash
cd apps/api
source .venv/bin/activate
alembic upgrade head
python -m scripts.seed
cd ../..
```

Re-seed from fixtures: `python -m scripts.seed --force`

### 6. Run development servers

```bash
pnpm dev
```

| Service | URL |
|---------|-----|
| Web (Next.js) | http://localhost:3000 |
| API (FastAPI) | http://localhost:8000 |
| API health | http://localhost:8000/health |
| OpenAPI docs | http://localhost:8000/docs |

Or run individually:

```bash
pnpm --filter @alankara/web dev
pnpm --filter @alankara/api dev   # requires activated venv with uvicorn
```

### Celery worker (AI indexing)

```bash
cd apps/api
source .venv/bin/activate
celery -A app.worker.celery_app worker --loglevel=info
```

## Environment matrix

Same variable names across environments — different values per tier.

| Variable | Local | Staging (Vercel/Railway) | Production (Supabase) |
|----------|-------|--------------------------|------------------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | Railway API URL | Railway API URL |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | Vercel preview URL | Custom domain |
| `NEXT_PUBLIC_SUPABASE_URL` | _(empty)_ | _(optional)_ | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | _(empty)_ | _(optional)_ | Supabase anon key |
| `NEXT_PUBLIC_AUTH_PROVIDER` | `jwt` | `jwt` | `supabase` |
| `DATABASE_URL` | Docker Postgres | Railway Postgres | Supabase pooler URL |
| `REDIS_URL` | Docker Redis | Railway Redis | Railway Redis |
| `STORAGE_BACKEND` | `local` | `local` | `supabase` |
| `SUPABASE_URL` | _(empty)_ | _(empty)_ | Supabase project URL |
| `SUPABASE_SERVICE_KEY` | _(empty)_ | _(empty)_ | Service role key |
| `CORS_ORIGINS` | `http://localhost:3000` | localhost + Vercel URL | + custom domain |
| `ENVIRONMENT` | `local` | `staging` | `production` |
| `OPENAI_API_KEY` | `apps/api/.env` | Railway secret | Railway secret |
| `JWT_SECRET` | dev default | Railway secret | Railway secret |

**Never commit** `.env`, `.env.local`, or API keys. See `apps/web/.env.example` and `apps/api/.env.example`.

## Cloud staging — Vercel (frontend)

1. Import [github.com/swarang-gorhe/alankara](https://github.com/swarang-gorhe/alankara) at [vercel.com/new](https://vercel.com/new)
2. Set **Root Directory** to `apps/web`
3. Framework: Next.js (auto-detected)
4. Environment variables:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | Railway API URL |
| `NEXT_PUBLIC_SITE_URL` | `https://your-app.vercel.app` |

`apps/web/vercel.json` configures monorepo install/build commands.

## Cloud staging — Railway (API)

1. New project → Deploy from GitHub repo
2. Set **Root Directory** to `apps/api`
3. Railway uses `railway.toml` + `Dockerfile` for build/deploy
4. Add **Postgres** and **Redis** plugins
5. Environment variables:

| Variable | Example |
|----------|---------|
| `DATABASE_URL` | From Railway Postgres plugin |
| `REDIS_URL` | From Railway Redis plugin |
| `CORS_ORIGINS` | `http://localhost:3000,https://your-app.vercel.app` |
| `ENVIRONMENT` | `staging` |
| `JWT_SECRET` | Random secret |
| `OPENAI_API_KEY` | Your OpenAI key |

### Migrations on Railway

Run once after first deploy (Railway shell or one-off job):

```bash
alembic upgrade head
python -m scripts.seed
```

### Celery worker service (Railway)

Add a second service from the same repo:

| Setting | Value |
|---------|-------|
| Root Directory | `apps/api` |
| Start Command | `celery -A app.worker.celery_app worker --loglevel=info` |
| Variables | Same as API (`DATABASE_URL`, `REDIS_URL`, `OPENAI_API_KEY`, …) |

Health check: `GET /health` → `{"status":"ok",...}`

## Production — Supabase setup checklist

Full details in [`supabase/README.md`](supabase/README.md).

- [ ] Create Supabase project; enable **vector** extension
- [ ] Apply `supabase/migrations/000001_initial_schema.sql`
- [ ] Apply `supabase/migrations/000002_rls_policies.sql`
- [ ] Create Storage bucket `product-images` (public)
- [ ] Copy pooler `DATABASE_URL` → Railway API `DATABASE_URL`
- [ ] Set `STORAGE_BACKEND=supabase`, `SUPABASE_URL`, `SUPABASE_SERVICE_KEY` on Railway
- [ ] Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` on Vercel
- [ ] Set `NEXT_PUBLIC_AUTH_PROVIDER=supabase` on Vercel production
- [ ] Create admin user with `app_metadata.role = "admin"` (see [`docs/supabase-auth-migration.md`](docs/supabase-auth-migration.md))
- [ ] Run seed: `python -m scripts.seed`
- [ ] Verify RLS: anon reads products; admin writes catalog
- [ ] Point custom domain to Vercel (optional)

## Design system

Brand tokens in `apps/web/tailwind.config.ts` and `apps/web/app/globals.css`:

| Token | Value | Usage |
|-------|-------|-------|
| Cream | `#f3e4cd`, `#f8ecd9` | Backgrounds |
| Gold | `#b98a4a`, `#c9932f` | Accents, dividers |
| Maroon | `#6f2317`, `#7a2e1c` | Headings, primary actions |
| Charcoal | `#2c2420` | Body text |

**Typography:** Playfair Display (headings), Cormorant Garamond Italic (tagline), Source Sans 3 (body).

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start web + API in parallel |
| `pnpm build` | Build all packages |
| `pnpm lint` | Lint web + API |
| `pnpm typecheck` | TypeScript checks |
| `pnpm test` | Run API pytest |
| `pnpm --filter @alankara/api db:migrate` | Run Alembic migrations |
| `pnpm --filter @alankara/api db:seed` | Seed DB from fixtures |

## CI

GitHub Actions (`.github/workflows/ci.yml`) runs on every push/PR to `main`:
- Web: ESLint + TypeScript
- API: Ruff + pytest
- Shared: TypeScript

## Phase roadmap

| Phase | Status | Scope |
|-------|--------|-------|
| **1** | ✅ Complete | Monorepo scaffold, design system, layout shell |
| **2** | ✅ Complete | Cinematic homepage (Three.js, GSAP, Lenis) |
| **3** | ✅ Complete | Shop, PDP, editorial pages |
| **4** | ✅ Complete | Backend schema, product APIs, frontend wiring |
| **5** | ✅ Complete | Cart + checkout |
| **6** | ✅ Complete | Admin panel |
| **7** | ✅ Complete | LangChain AI layer |
| **8** | ✅ Complete | Supabase production prep, SEO, accessibility, docs |

## Performance

See [`docs/performance.md`](docs/performance.md) for Three.js lazy-loading strategy, mobile hero simplification, and Lighthouse targets.

## License

Private — all rights reserved.
