-- Necklace try-on calibration columns (twin of Alembic 008_necklace_try_on)
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS try_on_type TEXT NOT NULL DEFAULT 'earring',
  ADD COLUMN IF NOT EXISTS try_on_necklace_asset_url TEXT,
  ADD COLUMN IF NOT EXISTS try_on_necklace_length_offset NUMERIC(10, 4) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS try_on_necklace_scale NUMERIC(10, 4) NOT NULL DEFAULT 1.0,
  ADD COLUMN IF NOT EXISTS try_on_necklace_rotation_offset NUMERIC(10, 4) NOT NULL DEFAULT 0;
