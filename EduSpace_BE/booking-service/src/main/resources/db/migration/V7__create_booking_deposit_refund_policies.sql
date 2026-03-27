-- Policies for deposit % and refund windows (host-managed; used at booking/checkout).
CREATE TABLE IF NOT EXISTS booking_deposit_refund_policies (
    id BIGSERIAL PRIMARY KEY,
    policy_name VARCHAR(100) NOT NULL,
    description TEXT,
    policy_type VARCHAR(20) NOT NULL,
    deposit_percentage NUMERIC(5, 2) NOT NULL DEFAULT 25.00,
    start_hour INTEGER,
    end_hour INTEGER,
    full_refund_hours INTEGER,
    full_refund_percentage NUMERIC(5, 2),
    partial_refund_hours INTEGER,
    partial_refund_percentage NUMERIC(5, 2),
    no_refund_hours INTEGER,
    no_refund_percentage NUMERIC(5, 2),
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    highlight_text VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Legacy DBs: table may already exist without newer columns (CREATE TABLE IF NOT EXISTS is a no-op).
ALTER TABLE booking_deposit_refund_policies ADD COLUMN IF NOT EXISTS policy_name VARCHAR(100);
ALTER TABLE booking_deposit_refund_policies ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE booking_deposit_refund_policies ADD COLUMN IF NOT EXISTS policy_type VARCHAR(20);
ALTER TABLE booking_deposit_refund_policies ADD COLUMN IF NOT EXISTS deposit_percentage NUMERIC(5, 2);
ALTER TABLE booking_deposit_refund_policies ADD COLUMN IF NOT EXISTS start_hour INTEGER;
ALTER TABLE booking_deposit_refund_policies ADD COLUMN IF NOT EXISTS end_hour INTEGER;
ALTER TABLE booking_deposit_refund_policies ADD COLUMN IF NOT EXISTS full_refund_hours INTEGER;
ALTER TABLE booking_deposit_refund_policies ADD COLUMN IF NOT EXISTS full_refund_percentage NUMERIC(5, 2);
ALTER TABLE booking_deposit_refund_policies ADD COLUMN IF NOT EXISTS partial_refund_hours INTEGER;
ALTER TABLE booking_deposit_refund_policies ADD COLUMN IF NOT EXISTS partial_refund_percentage NUMERIC(5, 2);
ALTER TABLE booking_deposit_refund_policies ADD COLUMN IF NOT EXISTS no_refund_hours INTEGER;
ALTER TABLE booking_deposit_refund_policies ADD COLUMN IF NOT EXISTS no_refund_percentage NUMERIC(5, 2);
ALTER TABLE booking_deposit_refund_policies ADD COLUMN IF NOT EXISTS is_default BOOLEAN;
ALTER TABLE booking_deposit_refund_policies ADD COLUMN IF NOT EXISTS highlight_text VARCHAR(255);
ALTER TABLE booking_deposit_refund_policies ADD COLUMN IF NOT EXISTS is_active BOOLEAN;
ALTER TABLE booking_deposit_refund_policies ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN;
ALTER TABLE booking_deposit_refund_policies ADD COLUMN IF NOT EXISTS created_at TIMESTAMP;
ALTER TABLE booking_deposit_refund_policies ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP;

UPDATE booking_deposit_refund_policies SET policy_name = COALESCE(NULLIF(TRIM(policy_name), ''), 'Policy') WHERE policy_name IS NULL;
UPDATE booking_deposit_refund_policies SET policy_type = 'DEPOSIT' WHERE policy_type IS NULL;
UPDATE booking_deposit_refund_policies SET deposit_percentage = 25.00 WHERE deposit_percentage IS NULL;
UPDATE booking_deposit_refund_policies SET is_default = FALSE WHERE is_default IS NULL;
UPDATE booking_deposit_refund_policies SET is_active = TRUE WHERE is_active IS NULL;
UPDATE booking_deposit_refund_policies SET is_deleted = FALSE WHERE is_deleted IS NULL;
UPDATE booking_deposit_refund_policies SET created_at = CURRENT_TIMESTAMP WHERE created_at IS NULL;
UPDATE booking_deposit_refund_policies SET updated_at = CURRENT_TIMESTAMP WHERE updated_at IS NULL;

ALTER TABLE booking_deposit_refund_policies ALTER COLUMN policy_name SET NOT NULL;
ALTER TABLE booking_deposit_refund_policies ALTER COLUMN policy_type SET NOT NULL;
ALTER TABLE booking_deposit_refund_policies ALTER COLUMN deposit_percentage SET NOT NULL;
ALTER TABLE booking_deposit_refund_policies ALTER COLUMN deposit_percentage SET DEFAULT 25.00;
ALTER TABLE booking_deposit_refund_policies ALTER COLUMN is_default SET NOT NULL;
ALTER TABLE booking_deposit_refund_policies ALTER COLUMN is_default SET DEFAULT FALSE;
ALTER TABLE booking_deposit_refund_policies ALTER COLUMN is_active SET NOT NULL;
ALTER TABLE booking_deposit_refund_policies ALTER COLUMN is_active SET DEFAULT TRUE;
ALTER TABLE booking_deposit_refund_policies ALTER COLUMN is_deleted SET NOT NULL;
ALTER TABLE booking_deposit_refund_policies ALTER COLUMN is_deleted SET DEFAULT FALSE;
ALTER TABLE booking_deposit_refund_policies ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE booking_deposit_refund_policies ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE booking_deposit_refund_policies ALTER COLUMN updated_at SET NOT NULL;
ALTER TABLE booking_deposit_refund_policies ALTER COLUMN updated_at SET DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_booking_deposit_refund_policies_type
    ON booking_deposit_refund_policies (policy_type)
    WHERE is_deleted = FALSE;
