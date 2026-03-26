-- Add price for utilities/extra amenities calculation
ALTER TABLE IF EXISTS amenities
    ADD COLUMN IF NOT EXISTS price BIGINT NOT NULL DEFAULT 0;

