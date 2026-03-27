-- =============================================
-- V14: Voucher System
-- Tables: voucher_campaigns, vouchers, user_vouchers, voucher_usages
-- =============================================

-- 1. Voucher Campaigns (chiến dịch voucher do admin tạo)
CREATE TABLE IF NOT EXISTS voucher_campaigns (
    id              BIGSERIAL    PRIMARY KEY,
    name            VARCHAR(150) NOT NULL,
    description     TEXT,
    start_date      TIMESTAMP    NOT NULL,
    end_date        TIMESTAMP    NOT NULL,
    is_active       BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_voucher_campaigns_active ON voucher_campaigns (is_active, start_date, end_date);

-- 2. Vouchers (mã giảm giá cụ thể)
CREATE TABLE IF NOT EXISTS vouchers (
    id                  BIGSERIAL       PRIMARY KEY,
    campaign_id         BIGINT          REFERENCES voucher_campaigns(id) ON DELETE SET NULL,
    code                VARCHAR(50)     NOT NULL UNIQUE,
    discount_type       VARCHAR(20)     NOT NULL, -- 'PERCENTAGE' | 'FIXED_AMOUNT'
    discount_value      NUMERIC(12, 2)  NOT NULL, -- % hoặc số tiền VND
    min_order_value     NUMERIC(12, 2)  NOT NULL DEFAULT 0,
    max_discount_amount NUMERIC(12, 2),            -- chỉ dùng khi discount_type = PERCENTAGE
    max_uses            INTEGER,                    -- NULL = không giới hạn
    used_count          INTEGER         NOT NULL DEFAULT 0,
    max_uses_per_user   INTEGER         NOT NULL DEFAULT 1,
    valid_from          TIMESTAMP       NOT NULL,
    valid_until         TIMESTAMP       NOT NULL,
    is_public           BOOLEAN         NOT NULL DEFAULT TRUE,  -- TRUE: hiển thị cho mọi user
    is_active           BOOLEAN         NOT NULL DEFAULT TRUE,
    is_deleted          BOOLEAN         NOT NULL DEFAULT FALSE,
    created_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_voucher_discount_type CHECK (discount_type IN ('PERCENTAGE','FIXED_AMOUNT')),
    CONSTRAINT chk_voucher_discount_value CHECK (discount_value > 0),
    CONSTRAINT chk_voucher_max_uses CHECK (max_uses IS NULL OR max_uses > 0),
    CONSTRAINT chk_voucher_valid_range CHECK (valid_until > valid_from)
);

CREATE INDEX IF NOT EXISTS idx_vouchers_code         ON vouchers (code)       WHERE is_deleted = FALSE;
CREATE INDEX IF NOT EXISTS idx_vouchers_campaign_id  ON vouchers (campaign_id);
CREATE INDEX IF NOT EXISTS idx_vouchers_active       ON vouchers (is_active, valid_from, valid_until) WHERE is_deleted = FALSE;

-- 3. User Vouchers (voucher được gán / claim cho user cụ thể)
CREATE TABLE IF NOT EXISTS user_vouchers (
    id          BIGSERIAL   PRIMARY KEY,
    user_id     VARCHAR(100) NOT NULL,
    voucher_id  BIGINT      NOT NULL REFERENCES vouchers(id) ON DELETE CASCADE,
    claimed_at  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_used     BOOLEAN     NOT NULL DEFAULT FALSE,
    used_at     TIMESTAMP,

    CONSTRAINT uq_user_voucher UNIQUE (user_id, voucher_id)
);

CREATE INDEX IF NOT EXISTS idx_user_vouchers_user_id    ON user_vouchers (user_id);
CREATE INDEX IF NOT EXISTS idx_user_vouchers_voucher_id ON user_vouchers (voucher_id);

-- 4. Voucher Usages (audit trail: mỗi lần áp dụng voucher vào booking)
CREATE TABLE IF NOT EXISTS voucher_usages (
    id              BIGSERIAL       PRIMARY KEY,
    voucher_id      BIGINT          NOT NULL REFERENCES vouchers(id) ON DELETE RESTRICT,
    booking_id      BIGINT          NOT NULL REFERENCES bookings(id) ON DELETE RESTRICT,
    user_id         VARCHAR(100)    NOT NULL,
    original_price  NUMERIC(12, 2)  NOT NULL,
    discount_amount NUMERIC(12, 2)  NOT NULL,
    final_price     NUMERIC(12, 2)  NOT NULL,
    used_at         TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_voucher_booking UNIQUE (voucher_id, booking_id)
);

CREATE INDEX IF NOT EXISTS idx_voucher_usages_voucher_id  ON voucher_usages (voucher_id);
CREATE INDEX IF NOT EXISTS idx_voucher_usages_booking_id  ON voucher_usages (booking_id);
CREATE INDEX IF NOT EXISTS idx_voucher_usages_user_id     ON voucher_usages (user_id);

-- 5. Thêm cột voucher vào bookings
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS voucher_code      VARCHAR(50);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS discount_amount   NUMERIC(12, 2);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS final_price       NUMERIC(12, 2);
