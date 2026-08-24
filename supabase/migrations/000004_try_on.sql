-- Try-on: product calibration columns, requests, events
-- Twin of Alembic revision 007_try_on

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS try_on_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS try_on_asset_url TEXT,
  ADD COLUMN IF NOT EXISTS try_on_scale NUMERIC(10, 4) NOT NULL DEFAULT 1.0,
  ADD COLUMN IF NOT EXISTS try_on_left_offset_x NUMERIC(10, 4) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS try_on_left_offset_y NUMERIC(10, 4) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS try_on_right_offset_x NUMERIC(10, 4) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS try_on_right_offset_y NUMERIC(10, 4) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS try_on_rotation NUMERIC(10, 4) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS try_on_vertical_offset NUMERIC(10, 4) NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS try_on_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id VARCHAR(64),
    product_id VARCHAR(64) NOT NULL REFERENCES products (id) ON DELETE CASCADE,
    photo_url TEXT,
    name TEXT,
    phone TEXT,
    email TEXT,
    instagram_handle TEXT,
    message TEXT,
    customization_request JSONB,
    status VARCHAR(64) NOT NULL DEFAULT 'new'
      CHECK (status IN (
        'new',
        'contacted',
        'customization_discussion',
        'confirmed',
        'order_created',
        'cancelled'
      )),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_try_on_requests_customer_id ON try_on_requests (customer_id);
CREATE INDEX IF NOT EXISTS ix_try_on_requests_product_id ON try_on_requests (product_id);
CREATE INDEX IF NOT EXISTS ix_try_on_requests_status ON try_on_requests (status);
CREATE INDEX IF NOT EXISTS ix_try_on_requests_created_at ON try_on_requests (created_at);

CREATE TABLE IF NOT EXISTS try_on_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(128) NOT NULL,
    product_id VARCHAR(64) REFERENCES products (id) ON DELETE SET NULL,
    event_type VARCHAR(64) NOT NULL
      CHECK (event_type IN (
        'open',
        'camera_start',
        'photo_upload',
        'try_on_success',
        'product_change',
        'share',
        'order_click',
        'order_completed'
      )),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_try_on_events_session_id ON try_on_events (session_id);
CREATE INDEX IF NOT EXISTS ix_try_on_events_product_id ON try_on_events (product_id);
CREATE INDEX IF NOT EXISTS ix_try_on_events_event_type ON try_on_events (event_type);
CREATE INDEX IF NOT EXISTS ix_try_on_events_created_at ON try_on_events (created_at);
