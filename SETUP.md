# Alankara Setup Guide

## Prerequisites

- Node.js 22+, pnpm 9+
- Python 3.12+
- PostgreSQL 16 with pgvector (or Supabase Postgres)

## Local development

### 1. Web (`apps/web`)

```bash
pnpm install
cp apps/web/.env.example apps/web/.env.local   # if present
```

Required env vars:

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_API_URL` | FastAPI backend URL (e.g. `http://localhost:8000`) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL (production auth) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `NEXT_PUBLIC_AUTH_PROVIDER` | `jwt` (dev) or `supabase` (production) |

Dev auth (no Supabase): use `/login` with any email and password `customer-dev`.

### 2. API (`apps/api`)

```bash
cd apps/api
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
python scripts/seed.py
uvicorn app.main:app --reload
```

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Dev JWT signing secret |
| `SUPABASE_JWT_SECRET` | Supabase JWT secret (Dashboard → Settings → API) |
| `CORS_ORIGINS` | `http://localhost:3000` |

### 3. Admin panel

- URL: **`/admin`**
- Dev login: `admin@alankara.local` / `admin-dev-only`
- Admin role requires `role: admin` in JWT (dev) or `app_metadata.role = "admin"` in Supabase

## Supabase Auth setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Copy **Project URL** and **anon key** to `NEXT_PUBLIC_SUPABASE_*` in web env
3. Copy **JWT Secret** to `SUPABASE_JWT_SECRET` in API env
4. Set `NEXT_PUBLIC_AUTH_PROVIDER=supabase` on web
5. Point `DATABASE_URL` at Supabase Postgres (or keep separate DB)

### Email auth

Dashboard → Authentication → Providers → enable Email.

### Google OAuth

1. [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials
2. Create OAuth 2.0 Client ID (Web application)
3. Authorized redirect URI: `https://<project-ref>.supabase.co/auth/v1/callback`
4. Supabase Dashboard → Authentication → Providers → Google → paste Client ID + Secret
5. Add site redirect: `https://your-domain.com/auth/callback` (and `http://localhost:3000/auth/callback` for dev)

### Designate an admin user

Supabase Dashboard → Authentication → Users → select user → **App Metadata**:

```json
{ "role": "admin" }
```

Optional: add [Custom Access Token Hook](docs/supabase-auth-migration.md) so `role` appears in JWT root claims for RLS.

## Vercel deployment

- **Root Directory:** `apps/web`
- Set all `NEXT_PUBLIC_*` env vars
- Deploy API separately (Railway, Render, or Vercel serverless with `apps/api`)

## Pitch demo script (~5 min)

1. Open **`/admin/login`** — `admin@alankara.local` / `admin-dev-only`
2. **Products** → New product → **upload image** → set variant price/stock → Save
3. Open **`/shop`** in a new tab — product appears immediately
4. Open PDP — gallery, add to cart → checkout (payment stub)
5. Optional: edit seeded **"Demo Piece — Edit Me"** live

Ensure `NEXT_PUBLIC_API_URL` is set on Vercel and API `API_PUBLIC_URL` points to your deployed API for image URLs.

## Pitch demo checklist

1. Intro plays (~3.5s), skip works, return visit is shorter
2. Add product in `/admin` → appears on `/shop`
3. Sign up → browse → cart → checkout → order in `/account`
4. Same order visible in `/admin/orders`
5. Submit review on PDP → appears after moderation in admin
