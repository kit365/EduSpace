-- V3: Add 2FA fields to users table

ALTER TABLE users
ADD COLUMN is_2fa_enabled BOOLEAN DEFAULT false,
ADD COLUMN totp_secret VARCHAR(255);
