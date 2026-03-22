-- V12: Repair missing columns/indexes on host_partner_applications (safe/idempotent)
-- Motivation: Some dev databases drift while Flyway history marks older migrations as applied.

-- Ensure table exists even if V7 was skipped but marked as applied in history.
CREATE TABLE IF NOT EXISTS host_partner_applications (
    id                  UUID PRIMARY KEY,
    user_id             VARCHAR(36) NOT NULL,
    applicant_type      VARCHAR(32) NOT NULL,
    full_name           VARCHAR(255) NOT NULL,
    phone               VARCHAR(50),
    email               VARCHAR(255) NOT NULL,
    address             TEXT,
    message             TEXT,
    status              VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    admin_note          TEXT,
    reviewed_at         TIMESTAMP,
    reviewed_by         VARCHAR(255),
    created_at          TIMESTAMP DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW(),
    document_front_url  TEXT,
    document_back_url   TEXT,
    business_license_url TEXT
);

-- Ensure core columns exist
ALTER TABLE host_partner_applications ADD COLUMN IF NOT EXISTS user_id VARCHAR(36);
ALTER TABLE host_partner_applications ADD COLUMN IF NOT EXISTS applicant_type VARCHAR(32);
ALTER TABLE host_partner_applications ADD COLUMN IF NOT EXISTS full_name VARCHAR(255);
ALTER TABLE host_partner_applications ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
ALTER TABLE host_partner_applications ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE host_partner_applications ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE host_partner_applications ADD COLUMN IF NOT EXISTS message TEXT;
ALTER TABLE host_partner_applications ADD COLUMN IF NOT EXISTS status VARCHAR(20);
ALTER TABLE host_partner_applications ADD COLUMN IF NOT EXISTS admin_note TEXT;
ALTER TABLE host_partner_applications ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP;
ALTER TABLE host_partner_applications ADD COLUMN IF NOT EXISTS reviewed_by VARCHAR(255);
ALTER TABLE host_partner_applications ADD COLUMN IF NOT EXISTS created_at TIMESTAMP;
ALTER TABLE host_partner_applications ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP;

-- Ensure document columns exist (introduced in V8 but may be missing in drifted DBs)
ALTER TABLE host_partner_applications ADD COLUMN IF NOT EXISTS document_front_url TEXT;
ALTER TABLE host_partner_applications ADD COLUMN IF NOT EXISTS document_back_url TEXT;
ALTER TABLE host_partner_applications ADD COLUMN IF NOT EXISTS business_license_url TEXT;

-- Ensure defaults for status/timestamps on databases that miss them
ALTER TABLE host_partner_applications ALTER COLUMN status SET DEFAULT 'PENDING';
ALTER TABLE host_partner_applications ALTER COLUMN created_at SET DEFAULT NOW();
ALTER TABLE host_partner_applications ALTER COLUMN updated_at SET DEFAULT NOW();

-- Ensure indexes exist
CREATE INDEX IF NOT EXISTS idx_host_partner_app_user ON host_partner_applications (user_id);
CREATE INDEX IF NOT EXISTS idx_host_partner_app_status ON host_partner_applications (status);

-- Replace legacy constraint (one PENDING per user) with non-BRANCH-only constraint.
DROP INDEX IF EXISTS uq_host_partner_app_user_pending;
CREATE UNIQUE INDEX IF NOT EXISTS uq_host_partner_app_user_pending_non_branch
    ON host_partner_applications (user_id)
    WHERE status = 'PENDING'
      AND UPPER(COALESCE(applicant_type, '')) <> 'BRANCH';
