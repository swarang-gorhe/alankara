#!/usr/bin/env bash
# Export local Alembic schema as SQL for diffing against supabase/migrations/.
# Requires: Docker Postgres running, apps/api venv with alembic installed.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
API_DIR="$ROOT/apps/api"
OUTPUT="$ROOT/supabase/migrations/_alembic_export.sql"

echo "→ Running Alembic upgrade head against local Postgres…"
cd "$API_DIR"
source .venv/bin/activate
alembic upgrade head

echo "→ Dumping schema-only to $OUTPUT"
pg_dump \
  --schema-only \
  --no-owner \
  --no-privileges \
  --dbname="${DATABASE_URL:-postgresql://alankara:alankara_dev@localhost:5432/alankara}" \
  > "$OUTPUT"

echo "Done. Diff against supabase/migrations/000001_initial_schema.sql and merge changes."
