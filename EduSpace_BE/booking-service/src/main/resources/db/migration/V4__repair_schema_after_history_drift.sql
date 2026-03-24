-- Repair: flyway_schema_history có thể từ nhánh migration cũ (slot/time_slots) trong khi code hiện tại dùng schema PayOS/deposit.
-- Idempotent: bổ sung cột JPA thiếu trên bookings; tạo bảng deposit/refund nếu chưa có; seed chính sách mặc định.

-- === 1) bookings: giữ cột legacy (room_id, slot_id, …), thêm cột theo Booking.java ===

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS space_ref VARCHAR(100);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS customer_email VARCHAR(255);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS paid_amount DECIMAL(12, 2) DEFAULT 0;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS remaining_amount DECIMAL(12, 2) DEFAULT 0;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS is_temporary BOOLEAN DEFAULT TRUE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cancel_requested BOOLEAN DEFAULT FALSE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP(6);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cancelled_by VARCHAR(255);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cancelled_reason TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS refund_amount DECIMAL(12, 2);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS refund_method VARCHAR(50);

CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings (status);

-- === 2) Bảng mới (theo V1 repo hiện tại), IF NOT EXISTS ===

CREATE TABLE IF NOT EXISTS booking_deposit_refund_policies (
    id                              BIGSERIAL PRIMARY KEY,
    policy_name                     VARCHAR(100) NOT NULL,
    description                     TEXT,
    deposit_percentage              DECIMAL(5, 2) NOT NULL DEFAULT 25.00,
    full_refund_hours               INT NOT NULL DEFAULT 48,
    full_refund_percentage          DECIMAL(5, 2) DEFAULT 100.00,
    partial_refund_hours            INT NOT NULL DEFAULT 24,
    partial_refund_percentage       DECIMAL(5, 2) DEFAULT 50.00,
    no_refund_hours                 INT NOT NULL DEFAULT 12,
    no_refund_percentage            DECIMAL(5, 2) DEFAULT 0.00,
    no_show_refund_percentage       DECIMAL(5, 2) DEFAULT 0.00,
    no_show_penalty                 DECIMAL(10, 2) DEFAULT 0,
    allow_force_majeure             BOOLEAN DEFAULT TRUE,
    force_majeure_refund_percentage DECIMAL(5, 2) DEFAULT 100.00,
    force_majeure_requires_evidence BOOLEAN DEFAULT TRUE,
    is_default                      BOOLEAN DEFAULT FALSE,
    display_order                   INT DEFAULT 0,
    highlight_text                  VARCHAR(255),
    is_deleted                      BOOLEAN NOT NULL DEFAULT FALSE,
    is_active                       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at                      TIMESTAMP(6) NOT NULL DEFAULT NOW(),
    updated_at                      TIMESTAMP(6) NOT NULL DEFAULT NOW(),
    created_by                      VARCHAR(255),
    updated_by                      VARCHAR(255)
);

CREATE INDEX IF NOT EXISTS idx_booking_deposit_refund_policies_active
    ON booking_deposit_refund_policies (is_active, is_deleted);
CREATE INDEX IF NOT EXISTS idx_booking_deposit_refund_policies_default
    ON booking_deposit_refund_policies (is_default);

CREATE TABLE IF NOT EXISTS booking_deposits (
    id                   BIGSERIAL PRIMARY KEY,
    booking_id           BIGINT REFERENCES bookings (id),
    booking_code         VARCHAR(50),
    deposit_amount       DECIMAL(10, 2) NOT NULL DEFAULT 0,
    deposit_percentage   DECIMAL(5, 2) DEFAULT 25.00,
    deposit_paid         BOOLEAN DEFAULT FALSE,
    deposit_paid_at      TIMESTAMP(6),
    payment_method       VARCHAR(50),
    payos_order_code     BIGINT,
    checkout_url         VARCHAR(512),
    refunded             BOOLEAN DEFAULT FALSE,
    refund_amount        DECIMAL(10, 2) DEFAULT 0,
    refund_percentage    DECIMAL(5, 2) DEFAULT 0,
    refunded_at          TIMESTAMP(6),
    refund_method        VARCHAR(50),
    refund_reason        TEXT,
    refund_proof         VARCHAR(500),
    due_date             TIMESTAMP(6),
    reminder_sent        BOOLEAN NOT NULL DEFAULT FALSE,
    reminder_sent_at     TIMESTAMP(6),
    notes                TEXT,
    status               VARCHAR(50) DEFAULT 'PENDING',
    confirmed_by         VARCHAR(50),
    refund_processed_by  VARCHAR(50),
    webhook_payload      TEXT,
    expires_at           TIMESTAMP(6) NOT NULL,
    hold_payload         TEXT NOT NULL DEFAULT '{}',
    refund_policy_id     BIGINT REFERENCES booking_deposit_refund_policies (id),
    is_deleted           BOOLEAN NOT NULL DEFAULT FALSE,
    is_active            BOOLEAN NOT NULL DEFAULT TRUE,
    created_at           TIMESTAMP(6) NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMP(6) NOT NULL DEFAULT NOW(),
    created_by           VARCHAR(255),
    updated_by           VARCHAR(255)
);

CREATE INDEX IF NOT EXISTS idx_booking_deposits_booking_id ON booking_deposits (booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_deposits_status_expires ON booking_deposits (status, expires_at);
CREATE UNIQUE INDEX IF NOT EXISTS uq_booking_deposits_payos_order_code ON booking_deposits (payos_order_code)
    WHERE payos_order_code IS NOT NULL;

CREATE TABLE IF NOT EXISTS booking_refunds (
    id                    BIGSERIAL PRIMARY KEY,
    booking_id            BIGINT NOT NULL REFERENCES bookings (id),
    bank_information_id   BIGINT,
    requested_amount      DECIMAL(12, 2) NOT NULL,
    currency              VARCHAR(10) NOT NULL DEFAULT 'VND',
    customer_reason       TEXT NOT NULL,
    evidence_urls         TEXT,
    status                VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    admin_decision_note   TEXT,
    processed_by          VARCHAR(255),
    processed_at          TIMESTAMP(6),
    refund_transaction_id VARCHAR(100),
    refund_method         VARCHAR(50),
    refund_completed_at   TIMESTAMP(6),
    admin_evidence_urls   TEXT,
    created_at            TIMESTAMP(6) NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMP(6) NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_booking_refunds_booking_id ON booking_refunds (booking_id);

-- === 3) Seed chính sách mặc định (V2) ===

INSERT INTO booking_deposit_refund_policies (
    policy_name,
    description,
    deposit_percentage,
    full_refund_hours,
    full_refund_percentage,
    partial_refund_hours,
    partial_refund_percentage,
    no_refund_hours,
    no_refund_percentage,
    no_show_refund_percentage,
    no_show_penalty,
    allow_force_majeure,
    force_majeure_refund_percentage,
    force_majeure_requires_evidence,
    is_default,
    display_order,
    is_deleted,
    is_active,
    created_at,
    updated_at
)
SELECT
    'Chính sách mặc định',
    'Cọc 25%, hoàn theo cửa sổ thời gian trước giờ bắt đầu.',
    25.00,
    48,
    100.00,
    24,
    50.00,
    12,
    0.00,
    0.00,
    0.00,
    TRUE,
    100.00,
    TRUE,
    TRUE,
    0,
    FALSE,
    TRUE,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM booking_deposit_refund_policies WHERE is_default = TRUE AND is_deleted = FALSE
);
