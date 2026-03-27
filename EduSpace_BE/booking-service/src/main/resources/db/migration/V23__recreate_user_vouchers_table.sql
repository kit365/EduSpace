-- V23: Recreate user_vouchers table if missing (was defined in V14 but dropped)
CREATE TABLE IF NOT EXISTS user_vouchers (
    id          BIGSERIAL    PRIMARY KEY,
    user_id     VARCHAR(100) NOT NULL,
    voucher_id  BIGINT       NOT NULL REFERENCES vouchers(id) ON DELETE CASCADE,
    claimed_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_used     BOOLEAN      NOT NULL DEFAULT FALSE,
    used_at     TIMESTAMP,

    CONSTRAINT uq_user_voucher UNIQUE (user_id, voucher_id)
);

CREATE INDEX IF NOT EXISTS idx_user_vouchers_user_id    ON user_vouchers (user_id);
CREATE INDEX IF NOT EXISTS idx_user_vouchers_voucher_id ON user_vouchers (voucher_id);
