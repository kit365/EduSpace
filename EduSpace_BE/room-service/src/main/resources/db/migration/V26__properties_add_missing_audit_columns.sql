-- Ensure properties table has all base audit columns required by BaseEntity.
-- Idempotent for mixed legacy/dev schemas.

ALTER TABLE IF EXISTS properties
    ADD COLUMN IF NOT EXISTS created_by VARCHAR(255),
    ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255),
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW();
