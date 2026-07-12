# Auth migration: JWT dev auth → Supabase Auth

Alankara currently uses **FastAPI-issued JWTs** for admin and customer sessions. Production moves to **Supabase Auth** with RLS-aware tokens.

## Current state (Phases 1–7)

| Layer | Mechanism |
|-------|-----------|
| Admin panel | `POST /auth/login` → JWT stored in `localStorage` (`alankara_admin_token`) |
| API protection | `Authorization: Bearer <jwt>` validated by `app/auth/jwt.py` |
| Customer cart | Session cookie + optional user JWT |

Dev credentials: `admin@alankara.local` / `admin-dev-only` (see `apps/api/.env.example`).

## Target state (production)

| Layer | Mechanism |
|-------|-----------|
| Customer sign-in | Supabase Auth (email, OAuth) via `@supabase/supabase-js` |
| Admin sign-in | Supabase Auth user with `app_metadata.role = "admin"` |
| API | Validates Supabase JWT **or** continues accepting FastAPI JWT during cutover |
| Database RLS | `public.is_admin()` reads `role` from JWT claims |

## Migration steps

### 1. Enable Supabase Auth

1. Supabase Dashboard → Authentication → Providers
2. Enable Email (and OAuth providers as needed)
3. Create admin user; set **app metadata**: `{ "role": "admin" }`

### 2. Custom access token hook (optional)

Add a hook so `role` appears at the JWT root for RLS:

```sql
-- Supabase Dashboard → Authentication → Hooks → Custom Access Token
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  claims jsonb;
  user_role text;
BEGIN
  claims := event->'claims';
  user_role := (event->'user'->'app_metadata'->>'role');
  IF user_role IS NOT NULL THEN
    claims := jsonb_set(claims, '{role}', to_jsonb(user_role));
  END IF;
  event := jsonb_set(event, '{claims}', claims);
  RETURN event;
END;
$$;
```

### 3. Frontend adapter

`apps/web/lib/auth/adapter.ts` switches providers via `NEXT_PUBLIC_AUTH_PROVIDER`:

| Value | Behaviour |
|-------|-----------|
| `jwt` (default) | Current dev flow — `lib/admin/auth.ts` + `/auth/login` |
| `supabase` | `lib/supabase/client.ts` session; admin token from `supabase.auth.getSession()` |

Wire `AdminGuard` to call `getAccessToken()` from the adapter instead of reading `localStorage` directly.

### 4. API validation bridge

Extend `app/auth/deps.py`:

```python
# Pseudocode — implement when Supabase is live
if settings.auth_provider == "supabase":
    payload = verify_supabase_jwt(token)  # JWKS from SUPABASE_URL
else:
    payload = decode_access_token(token)
```

Use `SUPABASE_JWT_SECRET` from the Supabase project settings for server-side verification.

### 5. Cutover checklist

- [ ] Supabase project created; schema + RLS applied (`supabase/migrations/`)
- [ ] `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` on Vercel
- [ ] `SUPABASE_URL` + `SUPABASE_SERVICE_KEY` on Railway (service role — never expose to web)
- [ ] Admin user created with `role: admin` metadata
- [ ] `NEXT_PUBLIC_AUTH_PROVIDER=supabase` on Vercel production
- [ ] Remove dev login credentials from production `ENVIRONMENT`
- [ ] Verify RLS: anon can read products; admin can write catalog

## Files involved

| File | Role |
|------|------|
| `apps/web/lib/supabase/client.ts` | Browser Supabase client |
| `apps/web/lib/supabase/server.ts` | Server Component client (cookies) |
| `apps/web/lib/auth/adapter.ts` | Provider switch + token accessor |
| `apps/api/app/auth/deps.py` | API token validation |
| `supabase/migrations/000002_rls_policies.sql` | RLS using `is_admin()` |
