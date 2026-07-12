# Vercel deployment (frontend)

## Critical: Root Directory must be `apps/web`

The `alankara` Vercel project must use **Root Directory `apps/web`**, not `apps/api`.

| Service | Platform | Root Directory |
|---------|----------|----------------|
| Next.js storefront | **Vercel** | `apps/web` |
| FastAPI + Celery | **Railway** | `apps/api` |

If Root Directory is set to `apps/api`, every request fails with `FUNCTION_INVOCATION_FAILED` because Vercel runs the Python FastAPI entrypoint (`app/main.py`) instead of Next.js.

### Fix in Vercel dashboard (recommended)

1. Open [Project Settings → Build and Deployment](https://vercel.com/swaranggorhe2001-9459s-projects/alankara/settings)
2. Set **Root Directory** to `apps/web`
3. Framework: **Next.js** (auto-detected)
4. Install Command: `cd ../.. && pnpm install` (or use `apps/web/vercel.json`)
5. Build Command: `cd ../.. && pnpm turbo run build --filter=@alankara/web`
6. Redeploy production

### Shim when Root Directory is still `apps/api`

If the dashboard still points at `apps/api`, `apps/api/vercel.json` + `apps/api/package.json` build the
Next.js app from `apps/web` and stage `.next` + `app/` into `apps/api` before deploy. The FastAPI code
is backed up to `_fastapi_app/` during the Vercel build only — Railway deployments are unaffected.

### Environment variables (Vercel)

| Variable | Example |
|----------|---------|
| `NEXT_PUBLIC_API_URL` | Railway API URL |
| `NEXT_PUBLIC_SITE_URL` | `https://alankara-xi.vercel.app` (must include `https://`) |

`NEXT_PUBLIC_SITE_URL` without a protocol (e.g. `alankara-xi.vercel.app`) previously crashed metadata at runtime; `lib/seo/metadata.ts` now normalizes and falls back safely.
