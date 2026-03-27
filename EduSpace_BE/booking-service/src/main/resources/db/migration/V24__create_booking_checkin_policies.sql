CREATE TABLE IF NOT EXISTS booking_checkin_policies (
    id BIGSERIAL PRIMARY KEY,
    property_id INTEGER NOT NULL UNIQUE,
    grace_minutes INTEGER NOT NULL DEFAULT 15,
    auto_cancel_minutes INTEGER NOT NULL DEFAULT 30,
    allow_early_waiting BOOLEAN NOT NULL DEFAULT TRUE,
    allow_late_within_grace_checkin BOOLEAN NOT NULL DEFAULT TRUE,
    late_within_grace_usage_mode VARCHAR(40) NOT NULL DEFAULT 'DEDUCT_LATE_TIME',
    late_over_grace_refund_mode VARCHAR(40) NOT NULL DEFAULT 'FOLLOW_DEPOSIT_REFUND_POLICY',
    no_show_refund_mode VARCHAR(40) NOT NULL DEFAULT 'ZERO_DEPOSIT_REFUND',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT ck_booking_checkin_policies_grace_non_negative CHECK (grace_minutes >= 0),
    CONSTRAINT ck_booking_checkin_policies_auto_cancel_gt_grace CHECK (auto_cancel_minutes > grace_minutes)
);

CREATE INDEX IF NOT EXISTS idx_booking_checkin_policies_property_id
    ON booking_checkin_policies(property_id);
