# Alankara

Luxury e-commerce platform for handcrafted jewellery and adornments. A pnpm + Turborepo monorepo with Next.js 15 frontend and FastAPI backend.

## Repository structure

```
Alankara/
├── apps/
│   ├── web/          # Next.js 15 — customer storefront
│   └── api/          # FastAPI — REST API + AI layer (Phase 7+)
├── packages/
│   └── shared/       # Shared TypeScript types
├── docker-compose.yml
├── turbo.json
└── alankara-logo.pdf # Source logo asset
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

Default values work for local development. Add API keys to `apps/api/.env` when AI features are enabled (Phase 7).

### 4. Install Python API dependencies

```bash
cd apps/api
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
pip install pytest httpx ruff
cd ../..
```

### 5. Database migrations & seed (Phase 4+)

With Docker Postgres running:

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

## Design system

Brand tokens are defined in `apps/web/tailwind.config.ts` and `apps/web/app/globals.css`:

| Token | Value | Usage |
|-------|-------|-------|
| Cream | `#f3e4cd`, `#f8ecd9` | Backgrounds |
| Gold | `#b98a4a`, `#c9932f` | Accents, dividers |
| Maroon | `#6f2317`, `#7a2e1c` | Headings, primary actions |
| Charcoal | `#2c2420` | Body text |

**Typography:** Playfair Display (headings), Cormorant Garamond Italic (tagline), Source Sans 3 (body).

**Logo:** `apps/web/public/brand/logo.svg` — extracted from `alankara-logo.pdf`. `<AnimatedLogo />` spins 360° on mount; respects `prefers-reduced-motion`.

## Cloud staging (Vercel + Railway)

Connect dashboards after the first push to `main`. No deploy secrets in git.

### Vercel (frontend)

1. Import [github.com/swarang-gorhe/alankara](https://github.com/swarang-gorhe/alankara) at [vercel.com/new](https://vercel.com/new)
2. Set **Root Directory** to `apps/web`
3. Framework: Next.js (auto-detected)
4. Environment variables:
   - `NEXT_PUBLIC_API_URL` → your Railway API URL (e.g. `https://alankara-api.up.railway.app`)

`apps/web/vercel.json` configures monorepo install/build commands.

### Railway (API)

1. New project → Deploy from GitHub repo
2. Set **Root Directory** to `apps/api`
3. Railway uses `railway.toml` + `Dockerfile` for build/deploy
4. Add **Postgres** and **Redis** plugins (or use external URLs)
5. Environment variables:

| Variable | Example |
|----------|---------|
| `DATABASE_URL` | From Railway Postgres plugin |
| `REDIS_URL` | From Railway Redis plugin |
| `CORS_ORIGINS` | `http://localhost:3000,https://your-app.vercel.app` |
| `ENVIRONMENT` | `staging` |
| `JWT_SECRET` | Random secret |

Health check: `GET /health` → `{"status":"ok",...}`

### CORS checklist

After deploying, ensure `CORS_ORIGINS` on Railway includes **both**:
- `http://localhost:3000`
- Your Vercel staging URL

And `NEXT_PUBLIC_API_URL` on Vercel points to the Railway API URL.

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start web + API in parallel |
| `pnpm build` | Build all packages |
| `pnpm lint` | Lint web + API |
| `pnpm typecheck` | TypeScript checks |
| `pnpm test` | Run API pytest |
| `pnpm --filter @alankara/api db:migrate` | Run Alembic migrations |
| `pnpm --filter @alankara/api db:seed` | Seed DB from web fixtures |

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
| **3** | ✅ Complete | Shop, PDP, editorial pages (fixtures) |
| **4** | ✅ Complete | Backend schema, product APIs, frontend wiring |
| 5 | Planned | Cart + checkout |
| 6 | Planned | Admin panel |
| 7 | Planned | LangChain AI layer |
| 8 | Planned | Supabase production migration |

## License

Private — all rights reserved.
