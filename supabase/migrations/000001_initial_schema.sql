-- Alankara initial schema (mirrors Alembic revisions 001–004)
-- Apply via: supabase db push  OR  psql $DATABASE_URL -f supabase/migrations/000001_initial_schema.sql

CREATE EXTENSION IF NOT EXISTS vector;

-- ─── Catalog ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(64) PRIMARY KEY,
    slug VARCHAR(64) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(512)
);
CREATE INDEX IF NOT EXISTS ix_categories_slug ON categories (slug);

CREATE TABLE IF NOT EXISTS artisans (
    id VARCHAR(64) PRIMARY KEY,
    slug VARCHAR(128) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    bio TEXT NOT NULL,
    specialty JSONB NOT NULL DEFAULT '[]',
    years_experience INTEGER NOT NULL,
    quote TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS ix_artisans_slug ON artisans (slug);

CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(64) PRIMARY KEY,
    slug VARCHAR(128) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    short_description TEXT,
    category_id VARCHAR(64) NOT NULL REFERENCES categories (id),
    primary_material VARCHAR(64) NOT NULL,
    min_price INTEGER NOT NULL,
    materials JSONB,
    care_instructions TEXT,
    featured BOOLEAN NOT NULL DEFAULT FALSE,
    occasion JSONB,
    process JSONB,
    related_slugs JSONB,
    images JSONB
);
CREATE INDEX IF NOT EXISTS ix_products_category_id ON products (category_id);
CREATE INDEX IF NOT EXISTS ix_products_primary_material ON products (primary_material);
CREATE INDEX IF NOT EXISTS ix_products_slug ON products (slug);

CREATE TABLE IF NOT EXISTS product_variants (
    id VARCHAR(64) PRIMARY KEY,
    product_id VARCHAR(64) NOT NULL REFERENCES products (id) ON DELETE CASCADE,
    sku VARCHAR(64) NOT NULL UNIQUE,
    size VARCHAR(64),
    color VARCHAR(64),
    material VARCHAR(128),
    price_amount INTEGER NOT NULL,
    price_currency VARCHAR(8) NOT NULL DEFAULT 'INR',
    stock INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS ix_product_variants_product_id ON product_variants (product_id);

-- ─── Reviews & AI summaries ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS reviews (
    id VARCHAR(64) PRIMARY KEY,
    product_id VARCHAR(64) NOT NULL REFERENCES products (id),
    user_id VARCHAR(64),
    author_name VARCHAR(255) NOT NULL,
    rating INTEGER NOT NULL,
    text TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    approved BOOLEAN NOT NULL DEFAULT TRUE
);
CREATE INDEX IF NOT EXISTS ix_reviews_product_id ON reviews (product_id);

CREATE TABLE IF NOT EXISTS review_summaries (
    id VARCHAR(64) PRIMARY KEY,
    product_id VARCHAR(64) REFERENCES products (id) ON DELETE CASCADE,
    scope VARCHAR(32) NOT NULL,
    generated_summary TEXT NOT NULL,
    generated_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS ix_review_summaries_product_id ON review_summaries (product_id);
CREATE INDEX IF NOT EXISTS ix_review_summaries_scope ON review_summaries (scope);

CREATE TABLE IF NOT EXISTS document_embeddings (
    id VARCHAR(64) PRIMARY KEY,
    source_type VARCHAR(64) NOT NULL,
    source_id VARCHAR(64) NOT NULL,
    content TEXT NOT NULL,
    embedding vector(1536)
);
CREATE INDEX IF NOT EXISTS ix_document_embeddings_source_id ON document_embeddings (source_id);
CREATE INDEX IF NOT EXISTS ix_document_embeddings_source_type ON document_embeddings (source_type);

-- ─── Cart & checkout ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS carts (
    id VARCHAR(64) PRIMARY KEY,
    session_id VARCHAR(64) UNIQUE,
    user_id VARCHAR(64) UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_carts_session_id ON carts (session_id);
CREATE INDEX IF NOT EXISTS ix_carts_user_id ON carts (user_id);

CREATE TABLE IF NOT EXISTS cart_items (
    id VARCHAR(64) PRIMARY KEY,
    cart_id VARCHAR(64) NOT NULL REFERENCES carts (id) ON DELETE CASCADE,
    product_variant_id VARCHAR(64) NOT NULL REFERENCES product_variants (id),
    quantity INTEGER NOT NULL DEFAULT 1,
    UNIQUE (cart_id, product_variant_id)
);
CREATE INDEX IF NOT EXISTS ix_cart_items_cart_id ON cart_items (cart_id);

CREATE TABLE IF NOT EXISTS addresses (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(32),
    line1 VARCHAR(255) NOT NULL,
    line2 VARCHAR(255),
    city VARCHAR(128) NOT NULL,
    state VARCHAR(128) NOT NULL,
    postal_code VARCHAR(32) NOT NULL,
    country VARCHAR(8) NOT NULL DEFAULT 'IN',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_addresses_user_id ON addresses (user_id);

CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64),
    session_id VARCHAR(64),
    status VARCHAR(32) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(32),
    subtotal_amount INTEGER NOT NULL,
    total_amount INTEGER NOT NULL,
    currency VARCHAR(8) NOT NULL DEFAULT 'INR',
    shipping_address JSONB NOT NULL,
    discount_code VARCHAR(64),
    discount_amount INTEGER NOT NULL DEFAULT 0,
    fulfillment_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_orders_status ON orders (status);
CREATE INDEX IF NOT EXISTS ix_orders_user_id ON orders (user_id);

CREATE TABLE IF NOT EXISTS order_items (
    id VARCHAR(64) PRIMARY KEY,
    order_id VARCHAR(64) NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
    product_id VARCHAR(64) NOT NULL,
    variant_id VARCHAR(64) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    variant_label VARCHAR(255),
    sku VARCHAR(64) NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price_amount INTEGER NOT NULL,
    unit_price_currency VARCHAR(8) NOT NULL,
    line_total_amount INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS ix_order_items_order_id ON order_items (order_id);

-- ─── Admin: discounts, FAQ, AI logs ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS discounts (
    id VARCHAR(64) PRIMARY KEY,
    code VARCHAR(64) NOT NULL UNIQUE,
    type VARCHAR(16) NOT NULL,
    value INTEGER NOT NULL,
    conditions JSONB,
    expires_at TIMESTAMPTZ,
    usage_limit INTEGER,
    usage_count INTEGER NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_discounts_code ON discounts (code);

CREATE TABLE IF NOT EXISTS faq_entries (
    id VARCHAR(64) PRIMARY KEY,
    slug VARCHAR(128) NOT NULL UNIQUE,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category VARCHAR(64) NOT NULL DEFAULT 'general',
    sort_order INTEGER NOT NULL DEFAULT 0,
    published BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_faq_entries_category ON faq_entries (category);
CREATE INDEX IF NOT EXISTS ix_faq_entries_slug ON faq_entries (slug);

CREATE TABLE IF NOT EXISTS admin_ai_logs (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    agent_type VARCHAR(64) NOT NULL,
    prompt TEXT NOT NULL,
    tools_called JSONB,
    result TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS ix_admin_ai_logs_agent_type ON admin_ai_logs (agent_type);
CREATE INDEX IF NOT EXISTS ix_admin_ai_logs_user_id ON admin_ai_logs (user_id);
