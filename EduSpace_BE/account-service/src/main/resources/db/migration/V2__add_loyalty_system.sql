-- V2: Consolidated Updates (User Fields & Loyalty Point Tables)

-- 1. Updates to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS location VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS short_bio VARCHAR(500);
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_2fa_enabled BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS totp_secret VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS point_balance INTEGER DEFAULT 0;

-- 2. Point Earning Rules
CREATE TABLE IF NOT EXISTS point_earning_rules (
    rule_id         BIGSERIAL       PRIMARY KEY,
    action_name     VARCHAR(255)    NOT NULL UNIQUE,
    points_earned   INTEGER         NOT NULL,
    description     TEXT,
    is_active       BOOLEAN         DEFAULT TRUE,
    created_at      TIMESTAMP       DEFAULT NOW(),
    updated_at      TIMESTAMP       DEFAULT NOW()
);

-- 3. Reward Catalog
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

-- 4. Point Transactions
CREATE TABLE IF NOT EXISTS point_transactions (
    point_transaction_id    BIGSERIAL       PRIMARY KEY,
    user_id                 VARCHAR(36)     NOT NULL,
    booking_id              VARCHAR(255),
    points                  INTEGER         NOT NULL,
    transaction_type        VARCHAR(50)     NOT NULL,
    reason                  TEXT,
    created_at              TIMESTAMP       DEFAULT NOW(),

    CONSTRAINT fk_point_transactions_user
        FOREIGN KEY (user_id)
        REFERENCES users (user_id)
        ON DELETE CASCADE
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_point_transactions_user_id ON point_transactions (user_id);
CREATE INDEX IF NOT EXISTS idx_reward_catalog_is_active ON reward_catalog (is_active);
CREATE INDEX IF NOT EXISTS idx_point_earning_rules_action ON point_earning_rules (action_name);
