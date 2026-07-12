-- Row Level Security policies for Supabase production
-- FastAPI uses the service-role key (bypasses RLS). These policies protect direct
-- client access via the Supabase JS client (anon / authenticated JWT).

-- ─── Helper: admin role from JWT custom claim ───────────────────────────────
-- Set role via Supabase Auth user metadata or a custom access-token hook:
--   { "role": "admin" }
-- See docs/supabase-auth-migration.md

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(
    (auth.jwt() ->> 'role') = 'admin'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    FALSE
  );
$$;

-- ─── Enable RLS ────────────────────────────────────────────────────────────

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE artisans ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE faq_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE discounts ENABLE ROW LEVEL SECURITY;

-- Catalog tables: carts/orders stay API-only (no anon policies by default).
ALTER TABLE document_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_ai_logs ENABLE ROW LEVEL SECURITY;

-- ─── Public read: catalog & editorial ──────────────────────────────────────

CREATE POLICY "Public read categories"
    ON categories FOR SELECT
    TO anon, authenticated
    USING (TRUE);

CREATE POLICY "Public read artisans"
    ON artisans FOR SELECT
    TO anon, authenticated
    USING (TRUE);

CREATE POLICY "Public read products"
    ON products FOR SELECT
    TO anon, authenticated
    USING (TRUE);

CREATE POLICY "Public read product variants"
    ON product_variants FOR SELECT
    TO anon, authenticated
    USING (TRUE);

-- ─── Public read: reviews & FAQ ──────────────────────────────────────────────

CREATE POLICY "Public read approved reviews"
    ON reviews FOR SELECT
    TO anon, authenticated
    USING (approved = TRUE);

CREATE POLICY "Public read review summaries"
    ON review_summaries FOR SELECT
    TO anon, authenticated
    USING (TRUE);

CREATE POLICY "Public read published FAQ"
    ON faq_entries FOR SELECT
    TO anon, authenticated
    USING (published = TRUE);

-- ─── Admin write: catalog ────────────────────────────────────────────────────

CREATE POLICY "Admin manage categories"
    ON categories FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Admin manage products"
    ON products FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Admin manage product variants"
    ON product_variants FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Admin manage artisans"
    ON artisans FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- ─── Admin write: discounts, FAQ, summaries, reviews moderation ─────────────

CREATE POLICY "Admin manage discounts"
    ON discounts FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Admin manage FAQ"
    ON faq_entries FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Admin manage review summaries"
    ON review_summaries FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Admin manage reviews"
    ON reviews FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- ─── API-only tables (deny direct client access) ───────────────────────────

CREATE POLICY "Deny client access to embeddings"
    ON document_embeddings FOR ALL
    TO anon, authenticated
    USING (FALSE);

CREATE POLICY "Deny client access to AI logs"
    ON admin_ai_logs FOR ALL
    TO anon, authenticated
    USING (FALSE);
