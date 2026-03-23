-- Align properties table with current PropertyEntity.deleted field.

ALTER TABLE IF EXISTS properties
    ADD COLUMN IF NOT EXISTS deleted BOOLEAN;

UPDATE properties
SET deleted = FALSE
WHERE deleted IS NULL;

ALTER TABLE IF EXISTS properties
    ALTER COLUMN deleted SET DEFAULT FALSE,
    ALTER COLUMN deleted SET NOT NULL;
