-- V26: Seed Property & Room for Host (vinh1@gmail.com)
-- Note: Replace 'vinh1-host-uuid-0000' with the actual user_id from account-service later if needed, 
-- or ensure that inside account-service, a user with this UUID exists.

INSERT INTO properties (
    owner_id, name_vi, name_en, property_type, contact_phone, contact_email, 
    province_code, district_code, ward_code, address_detail_vi, address_detail_en, 
    latitude, longitude,
    logo, logo_alt_vi, logo_alt_en, description_vi, description_en, status,
    schedule_buffer_minutes, schedule_is_over_day
) VALUES (
    'f8b35871-a63d-4f2d-a980-b67dd461727b', 
    'Cơ sở Vinh 1 - Ngã Tư Sở', 'Vinh 1 Campus - Nga Tu So', 'CENTER_COWORKING', '0987654321', 'vinh1@gmail.com',
    '01', '002', '0005', 'Số 10 Nguyễn Trãi, Thanh Xuân, Hà Nội', '10 Nguyen Trai, Thanh Xuan, Hanoi',
    21.0031, 105.8152,
    'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=800', 'Logo Cơ sở Vinh 1', 'Vinh 1 Campus Logo',
    'Không gian sang trọng, yên tĩnh, phù hợp học tập và hội họp.', 'Elegant, quiet space, perfect for studying and meetings.', 'VERIFIED',
    15, FALSE
);

INSERT INTO rooms (
    property_id, category_id, room_type, booking_type, name_vi, name_en, location_vi, location_en, 
    slug, capacity, area, room_number, floor_number, is_24_7, price_per_hour, price_per_day, 
    images, images_alt_vi, images_alt_en, description_vi, description_en, status, approval_status, is_active
) 
SELECT 
    p.id,
    c.id,
    'MEETING_ROOM', 'SLOT_BASED', 'Phòng họp VIP Vinh', 'Vinh VIP Meeting Room', 'Tầng 3', '3rd Floor',
    'phong-hop-vip-vinh', 15, 30.0, '305', '3', TRUE, 500000.00, 1500000.00,
    '["https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=600"]', 'Hình phòng VIP Vinh', 'Vinh VIP Room image',
    'Phòng họp VIP cao cấp do Vinh quản lý.', 'Super premium VIP meeting room.', 'ACTIVE', 'APPROVED', TRUE
FROM properties p
CROSS JOIN (SELECT id FROM room_categories WHERE slug = 'meeting-room' LIMIT 1) c
WHERE p.contact_email = 'vinh1@gmail.com'
LIMIT 1;

-- Seed Room Policies
INSERT INTO room_policies (room_id, name_vi, name_en, description_vi, description_en, logo, logo_alt_vi, logo_alt_en, position)
SELECT 
    r.id,
    'Chính sách hủy phòng', 'Cancellation Policy',
    'Miễn phí hủy phòng trong vòng 24h sau khi đặt.', 'Free cancellation within 24 hours after booking.',
    'verified', 'Biểu tượng xác thực', 'Verified icon', 1
FROM rooms r
WHERE r.slug = 'phong-hop-vip-vinh';

-- Seed Room Schedules (dùng property_id theo schema hiện tại của DB)
INSERT INTO room_schedules (property_id, day_of_week, is_open, open_time, close_time)
SELECT p.id, d.day, TRUE, '07:00:00', '22:00:00'
FROM properties p
CROSS JOIN (SELECT generate_series(2, 8) AS day) d
WHERE p.contact_email = 'vinh1@gmail.com'
ON CONFLICT ON CONSTRAINT uq_room_schedules_property_day DO NOTHING;
