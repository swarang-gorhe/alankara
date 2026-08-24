-- Commerce platform: product status, review moderation fields, payments, events

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS status VARCHAR(32) NOT NULL DEFAULT 'published',
  ADD COLUMN IF NOT EXISTS tags JSONB,
  ADD COLUMN IF NOT EXISTS ai_generated_tags JSONB,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;

UPDATE products SET created_at = NOW() WHERE created_at IS NULL;
UPDATE products SET updated_at = NOW() WHERE updated_at IS NULL;

ALTER TABLE products
  ALTER COLUMN created_at SET NOT NULL,
  ALTER COLUMN updated_at SET NOT NULL;

CREATE INDEX IF NOT EXISTS ix_products_status ON products (status);

ALTER TABLE reviews
  ADD COLUMN IF NOT EXISTS title VARCHAR(255),
  ADD COLUMN IF NOT EXISTS customer_email VARCHAR(255),
  ADD COLUMN IF NOT EXISTS verified_purchase BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS status VARCHAR(32) NOT NULL DEFAULT 'pending';

UPDATE reviews SET status = 'approved' WHERE approved IS TRUE;
CREATE INDEX IF NOT EXISTS ix_reviews_status ON reviews (status);

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS payment_status VARCHAR(32) NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS payment_intent_id VARCHAR(128),
  ADD COLUMN IF NOT EXISTS shipping_amount INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS ix_orders_payment_status ON orders (payment_status);
CREATE INDEX IF NOT EXISTS ix_orders_payment_intent_id ON orders (payment_intent_id);

CREATE TABLE IF NOT EXISTS customer_events (
    id VARCHAR(64) PRIMARY KEY,
    customer_id VARCHAR(64),
    session_id VARCHAR(64),
    product_id VARCHAR(64) NOT NULL REFERENCES products (id) ON DELETE CASCADE,
    event_type VARCHAR(32) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS ix_customer_events_customer_id ON customer_events (customer_id);
CREATE INDEX IF NOT EXISTS ix_customer_events_session_id ON customer_events (session_id);
CREATE INDEX IF NOT EXISTS ix_customer_events_product_id ON customer_events (product_id);
CREATE INDEX IF NOT EXISTS ix_customer_events_event_type ON customer_events (event_type);
CREATE INDEX IF NOT EXISTS ix_customer_events_created_at ON customer_events (created_at);

INSERT INTO settings (key, value, updated_at) VALUES
  ('low_stock_threshold', '5', NOW()),
  ('currency', '"INR"', NOW()),
  ('tax_rate_bps', '0', NOW())
ON CONFLICT (key) DO NOTHING;
