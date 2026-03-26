-- =============================================
-- V15: Seed fake voucher data for development/testing
-- =============================================

-- 1. Voucher Campaigns
INSERT INTO voucher_campaigns (name, description, start_date, end_date, is_active) VALUES
(
    'Khai Trương EduSpace',
    'Chương trình ưu đãi đặc biệt dịp khai trương — giảm mạnh cho tất cả loại phòng!',
    '2026-01-01 00:00:00',
    '2026-12-31 23:59:59',
    TRUE
),
(
    'Flash Sale Cuối Tuần',
    'Giảm giá nhanh chỉ áp dụng thứ 6, 7, CN — số lượng có hạn!',
    '2026-03-01 00:00:00',
    '2026-06-30 23:59:59',
    TRUE
),
(
    'Ưu Đãi Thành Viên Mới',
    'Dành riêng cho người dùng đăng ký lần đầu — dùng 1 lần duy nhất.',
    '2026-01-01 00:00:00',
    '2026-12-31 23:59:59',
    TRUE
),
(
    'Campaign Đã Kết Thúc',
    'Chiến dịch thử nghiệm — đã tắt.',
    '2025-01-01 00:00:00',
    '2025-12-31 23:59:59',
    FALSE
);

-- 2. Vouchers (gán vào campaigns tương ứng)
INSERT INTO vouchers (
    campaign_id, code, discount_type, discount_value,
    min_order_value, max_discount_amount,
    max_uses, used_count, max_uses_per_user,
    valid_from, valid_until, is_public, is_active
) VALUES
-- Campaign 1: Khai Trương
(1, 'KHAITUONG10',  'PERCENTAGE',   10, 200000, 100000, 500, 42, 1,
    '2026-01-01 00:00:00', '2026-12-31 23:59:59', TRUE,  TRUE),
(1, 'KHAITUONG20',  'PERCENTAGE',   20, 500000, 200000, 200, 18, 1,
    '2026-01-01 00:00:00', '2026-12-31 23:59:59', TRUE,  TRUE),
(1, 'VIPKHAITUONG', 'FIXED_AMOUNT', 150000, 1000000, NULL, 50,  5, 1,
    '2026-01-01 00:00:00', '2026-06-30 23:59:59', FALSE, TRUE),

-- Campaign 2: Flash Sale
(2, 'FLASH15',      'PERCENTAGE',   15, 300000, 150000, 100,  9, 1,
    '2026-03-01 00:00:00', '2026-06-30 23:59:59', TRUE,  TRUE),
(2, 'FLASHWKND50K', 'FIXED_AMOUNT', 50000, 200000, NULL, NULL, 0, 2,
    '2026-03-01 00:00:00', '2026-06-30 23:59:59', TRUE,  TRUE),

-- Campaign 3: Thành Viên Mới
(3, 'NEWUSER30',    'PERCENTAGE',   30, 100000, 200000, NULL, 311, 1,
    '2026-01-01 00:00:00', '2026-12-31 23:59:59', FALSE, TRUE),
(3, 'WELCOME100K',  'FIXED_AMOUNT', 100000, 500000, NULL,  NULL, 87, 1,
    '2026-01-01 00:00:00', '2026-12-31 23:59:59', FALSE, TRUE),

-- Voucher độc lập (không thuộc campaign nào)
(NULL, 'SUMMER2026', 'PERCENTAGE',  25, 400000, 300000, 300, 0, 1,
    '2026-06-01 00:00:00', '2026-08-31 23:59:59', TRUE, TRUE),

-- Campaign 4 (đã tắt)
(4, 'OLDCODE2025',   'FIXED_AMOUNT', 50000, 100000, NULL, 100, 100, 1,
    '2025-01-01 00:00:00', '2025-12-31 23:59:59', TRUE, FALSE);
