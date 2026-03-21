-- Dữ liệu demo để xem giao diện (chỉ chèn khi chưa có property demo)
INSERT INTO properties (
    owner_id, name, property_type, contact_phone, contact_email,
    province_code, district_code, ward_code, address_detail,
    logo, description, status, rejection_note, submitted_at, approved_by, approved_at
)
SELECT
    '00000000-0000-0000-0000-000000000001',
    'EduSpace Demo Campus',
    'CENTER_COWORKING',
    '0901234567',
    'demo@eduspace.local',
    '79',
    '760',
    '26734',
    '123 Duong Demo',
    'https://images.unsplash.com/photo-1562774053-701939374585?w=400',
    'Cơ sở demo — dùng để xem listing và chi tiết phòng trên FE.',
    'VERIFIED',
    NULL,
    NOW(),
    NULL,
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM properties WHERE name = 'EduSpace Demo Campus');

INSERT INTO rooms (
    property_id, room_type, booking_type, name, capacity, area, room_number, floor_number, is_24_7, open_time, close_time, price_per_hour, price_per_day, min_booking_hours,
    images, description, status, approval_status, rejection_note,
    avg_rating, review_count, is_active, slug
)
SELECT p.id,
    'MEETING_ROOM',
    'SLOT_BASED',
    'Phòng họp Alpha',
    30,
    48.5,
    'P.201',
    '2',
    FALSE,
    '08:00:00',
    '18:00:00',
    350000,
    2400000,
    2,
    '["https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200","https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1200"]',
    'Phòng họp hiện đại, máy chiếu 4K, bảng tương tác.',
    'ACTIVE',
    'APPROVED',
    NULL,
    4.8,
    12,
    TRUE,
    'phong-hop-alpha'
FROM properties p
WHERE p.name = 'EduSpace Demo Campus'
  AND NOT EXISTS (SELECT 1 FROM rooms WHERE slug = 'phong-hop-alpha');

INSERT INTO rooms (
    property_id, room_type, booking_type, name, capacity, area, room_number, floor_number, is_24_7, open_time, close_time, price_per_hour, price_per_day, min_booking_hours,
    images, description, status, approval_status, rejection_note,
    avg_rating, review_count, is_active, slug
)
SELECT p.id,
    'STUDIO',
    'FREE_FORM',
    'Studio sáng tạo Beta',
    15,
    35.0,
    'P.105',
    '1',
    FALSE,
    '07:30:00',
    '21:00:00',
    280000,
    1850000,
    2,
    '["https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1200"]',
    'Không gian studio cho workshop, quay chụp nhỏ.',
    'ACTIVE',
    'APPROVED',
    NULL,
    4.6,
    8,
    TRUE,
    'studio-sang-tao-beta'
FROM properties p
WHERE p.name = 'EduSpace Demo Campus'
  AND NOT EXISTS (SELECT 1 FROM rooms WHERE slug = 'studio-sang-tao-beta');

INSERT INTO rooms (
    property_id, room_type, booking_type, name, capacity, area, room_number, floor_number, is_24_7, open_time, close_time, price_per_hour, price_per_day, min_booking_hours,
    images, description, status, approval_status, rejection_note,
    avg_rating, review_count, is_active, slug
)
SELECT p.id,
    'COWORKING',
    'SLOT_BASED',
    'Không gian coworking Gamma',
    50,
    120.0,
    'G.01',
    'G',
    TRUE,
    NULL,
    NULL,
    180000,
    1300000,
    1,
    '["https://images.unsplash.com/photo-1604328698692-f76ea9498e76?w=1200"]',
    'Không gian làm việc chung, Wi-Fi tốc độ cao.',
    'ACTIVE',
    'APPROVED',
    NULL,
    4.5,
    24,
    TRUE,
    'coworking-gamma'
FROM properties p
WHERE p.name = 'EduSpace Demo Campus'
  AND NOT EXISTS (SELECT 1 FROM rooms WHERE slug = 'coworking-gamma');
