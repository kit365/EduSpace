-- V11: Repair missing loyalty/2FA columns on users table (safe/idempotent)
-- Motivation: Some dev databases drift from the expected schema while Flyway history marks older migrations as applied.

ALTER TABLE users ADD COLUMN IF NOT EXISTS location VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS short_bio VARCHAR(500);
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_2fa_enabled BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS totp_secret VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS point_balance INTEGER DEFAULT 0;

