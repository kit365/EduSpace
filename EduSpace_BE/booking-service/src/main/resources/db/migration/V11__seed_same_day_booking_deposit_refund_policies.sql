-- Seed: same-day booking — deposit by duration + refund by gap (booking time → check-in).
-- Chỉ insert nếu chưa có bản ghi cùng policy_name (idempotent).

-- DEPOSIT: 1–2h → 20%, 3–4h → 30%, 5–6h → 40%, 7+h → 50%
INSERT INTO booking_deposit_refund_policies (
    policy_name, description, policy_type, deposit_percentage,
    start_hour, end_hour,
    full_refund_hours, full_refund_percentage,
    partial_refund_hours, partial_refund_percentage,
    no_refund_hours, no_refund_percentage,
    is_default, highlight_text, is_active, is_deleted, created_at, updated_at
)
SELECT
    'Cọc same-day — 1–2 giờ',
    'Đặt trong ngày: rủi ro cao hơn nên cọc cao hơn. Áp dụng khi tổng số giờ đặt từ 1 đến 2 giờ.',
    'DEPOSIT',
    20.00,
    1, 2,
    0, 0, 0, 0, 0, 0,
    TRUE,
    'Cọc 20% (1–2 giờ)',
    TRUE, FALSE,
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM booking_deposit_refund_policies WHERE policy_name = 'Cọc same-day — 1–2 giờ');

INSERT INTO booking_deposit_refund_policies (
    policy_name, description, policy_type, deposit_percentage,
    start_hour, end_hour,
    full_refund_hours, full_refund_percentage,
    partial_refund_hours, partial_refund_percentage,
    no_refund_hours, no_refund_percentage,
    is_default, highlight_text, is_active, is_deleted, created_at, updated_at
)
SELECT
    'Cọc same-day — 3–4 giờ',
    'Đặt trong ngày: tổng số giờ đặt từ 3 đến 4 giờ.',
    'DEPOSIT',
    30.00,
    3, 4,
    0, 0, 0, 0, 0, 0,
    FALSE,
    'Cọc 30% (3–4 giờ)',
    TRUE, FALSE,
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM booking_deposit_refund_policies WHERE policy_name = 'Cọc same-day — 3–4 giờ');

INSERT INTO booking_deposit_refund_policies (
    policy_name, description, policy_type, deposit_percentage,
    start_hour, end_hour,
    full_refund_hours, full_refund_percentage,
    partial_refund_hours, partial_refund_percentage,
    no_refund_hours, no_refund_percentage,
    is_default, highlight_text, is_active, is_deleted, created_at, updated_at
)
SELECT
    'Cọc same-day — 5–6 giờ',
    'Đặt trong ngày: tổng số giờ đặt từ 5 đến 6 giờ.',
    'DEPOSIT',
    40.00,
    5, 6,
    0, 0, 0, 0, 0, 0,
    FALSE,
    'Cọc 40% (5–6 giờ)',
    TRUE, FALSE,
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM booking_deposit_refund_policies WHERE policy_name = 'Cọc same-day — 5–6 giờ');

INSERT INTO booking_deposit_refund_policies (
    policy_name, description, policy_type, deposit_percentage,
    start_hour, end_hour,
    full_refund_hours, full_refund_percentage,
    partial_refund_hours, partial_refund_percentage,
    no_refund_hours, no_refund_percentage,
    is_default, highlight_text, is_active, is_deleted, created_at, updated_at
)
SELECT
    'Cọc same-day — từ 7 giờ trở lên',
    'Đặt trong ngày: tổng số giờ đặt từ 7 giờ trở lên.',
    'DEPOSIT',
    50.00,
    7, NULL,
    0, 0, 0, 0, 0, 0,
    FALSE,
    'Cọc 50% (≥7 giờ)',
    TRUE, FALSE,
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM booking_deposit_refund_policies WHERE policy_name = 'Cọc same-day — từ 7 giờ trở lên');

-- REFUND: khoảng cách đặt → check-in
-- ≥3 giờ: hoàn 50% cọc | 1–3 giờ (không gồm mốc 3): 0% | <1 giờ: 0% (hạn chế hủy)
-- Mapping mốc giờ (theo form admin): full ≥3h → 50%; partial ≥1h (nhánh dưới 3h) → 0%; no <1h → 0%
INSERT INTO booking_deposit_refund_policies (
    policy_name, description, policy_type, deposit_percentage,
    start_hour, end_hour,
    full_refund_hours, full_refund_percentage,
    partial_refund_hours, partial_refund_percentage,
    no_refund_hours, no_refund_percentage,
    is_default, highlight_text, is_active, is_deleted, created_at, updated_at
)
SELECT
    'Hoàn cọc same-day (khoảng cách đặt → check-in)',
    'Khoảng cách từ lúc đặt đến giờ check-in: ≥3 giờ hoàn 50% cọc; 1–3 giờ hoàn 0%; dưới 1 giờ hoàn 0% (không khuyến khích hủy).',
    'REFUND',
    25.00,
    NULL, NULL,
    3, 50.00,
    1, 0.00,
    1, 0.00,
    TRUE,
    '≥3h: 50% cọc | 1–3h: 0% | <1h: 0%',
    TRUE, FALSE,
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (
    SELECT 1 FROM booking_deposit_refund_policies WHERE policy_name = 'Hoàn cọc same-day (khoảng cách đặt → check-in)'
);
