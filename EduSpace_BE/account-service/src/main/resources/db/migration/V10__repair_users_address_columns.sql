-- V10: Repair missing address-related columns on users table (safe/idempotent)
-- Motivation: Some dev databases drift from the expected schema while Flyway history marks older migrations as applied.

ALTER TABLE users ADD COLUMN IF NOT EXISTS city_state VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS district VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS ward VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS street_address VARCHAR(500);
ALTER TABLE users ADD COLUMN IF NOT EXISTS postal_code VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS tax_id VARCHAR(50);

