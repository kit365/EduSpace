-- V13: Add organization_name column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS organization_name VARCHAR(255);
