-- V9: Repair missing loyalty tables (safe/idempotent)
-- Motivation: In some dev databases, tables from V2 may be missing even though Flyway history marks V2 as applied.

-- 1) Point Earning Rules
CREATE TABLE IF NOT EXISTS point_earning_rules (
    rule_id         BIGSERIAL       PRIMARY KEY,
    action_name     VARCHAR(255)    NOT NULL UNIQUE,
    points_earned   INTEGER         NOT NULL,
    description     TEXT,
    is_active       BOOLEAN         DEFAULT TRUE,
    created_at      TIMESTAMP       DEFAULT NOW(),
    updated_at      TIMESTAMP       DEFAULT NOW()
);

-- 2) Reward Catalog
CREATE TABLE IF NOT EXISTS reward_catalog (
    reward_id       BIGSERIAL       PRIMARY KEY,
    name            VARCHAR(255)    NOT NULL,
    description     TEXT,
    points_required INTEGER         NOT NULL,
    stock           INTEGER         DEFAULT -1, -- -1: unlimited
    is_active       BOOLEAN         DEFAULT TRUE,
    image_url       VARCHAR(1000),
    version         BIGINT          DEFAULT 0,
    created_at      TIMESTAMP       DEFAULT NOW(),
    updated_at      TIMESTAMP       DEFAULT NOW()
);

-- 3) Point Transactions
CREATE TABLE IF NOT EXISTS point_transactions (
    point_transaction_id    BIGSERIAL       PRIMARY KEY,
    user_id                 VARCHAR(36)     NOT NULL,
    booking_id              VARCHAR(255),
    points                  INTEGER         NOT NULL,
    transaction_type        VARCHAR(50)     NOT NULL,
    reason                  TEXT,
    created_at              TIMESTAMP       DEFAULT NOW()
);

-- FK (added only if missing)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'fk_point_transactions_user'
    ) THEN
        ALTER TABLE point_transactions
            ADD CONSTRAINT fk_point_transactions_user
                FOREIGN KEY (user_id)
                REFERENCES users (user_id)
                ON DELETE CASCADE;
    END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_point_transactions_user_id ON point_transactions (user_id);
CREATE INDEX IF NOT EXISTS idx_reward_catalog_is_active ON reward_catalog (is_active);
CREATE INDEX IF NOT EXISTS idx_point_earning_rules_action ON point_earning_rules (action_name);

