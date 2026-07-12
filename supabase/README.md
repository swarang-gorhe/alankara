# Supabase migration path

Production database for Alankara migrates from local Docker Postgres / Railway Postgres to **Supabase PostgreSQL** with pgvector, Auth, Storage, and RLS.

## Prerequisites

1. Create a [Supabase project](https://supabase.com/dashboard)
2. Enable the **vector** extension: Database → Extensions → `vector`
3. Install the [Supabase CLI](https://supabase.com/docs/guides/cli) (optional, for `db push`)

## Apply schema

### Option A — Supabase CLI

```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

Migrations live in `supabase/migrations/`:

| File | Purpose |
|------|---------|
| `000001_initial_schema.sql` | Tables mirroring Alembic revisions 001–004 |
| `000002_rls_policies.sql` | Row Level Security for direct client access |

### Option B — SQL editor

Run each migration file in order via the Supabase SQL editor.

### Option C — From Alembic (local export)

When schema changes in `apps/api/alembic/versions/`, regenerate the Supabase SQL:

```bash
# Export current Alembic schema to a single SQL file (requires local Docker Postgres)
./scripts/export_alembic_to_supabase.sh
```

This runs `alembic upgrade head` locally, then `pg_dump --schema-only` for diffing. **Hand-merge** changes into `supabase/migrations/` — Supabase migrations are the production source of truth once live.

## Seed data

After schema is applied, seed from the API (uses service-role `DATABASE_URL`):

```bash
cd apps/api
source .venv/bin/activate
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres" \
  alembic upgrade head
python -m scripts.seed
```

## Storage bucket

Create a public bucket for product images:

1. Storage → New bucket → `product-images` (public)
2. Set `STORAGE_BACKEND=supabase` on Railway API
3. Set `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` (service role, never in frontend)

## RLS verification

Test as `anon` role in the SQL editor:

```sql
-- Should return rows
SELECT slug, name FROM products LIMIT 3;

-- Should return only approved reviews
SELECT * FROM reviews WHERE approved = FALSE;  -- expect 0 rows for anon

-- Should fail for anon
INSERT INTO products (id, slug, name, ...) VALUES (...);
```

Admin writes require a JWT with `role: admin` in claims (see `docs/supabase-auth-migration.md`).

## Railway cutover

1. Copy Supabase **connection string** (pooler, port 6543) → Railway `DATABASE_URL`
2. Run migrations + seed (above)
3. Redeploy API + Celery worker
4. Verify `/health` and `/products` on staging
