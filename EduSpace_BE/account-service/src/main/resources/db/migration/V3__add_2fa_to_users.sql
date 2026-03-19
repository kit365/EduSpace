-- V3: Add 2FA fields to users table
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS is_2fa_enabled BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS totp_secret VARCHAR(255);
