-- =============================================
-- V2: Initial Seed Data with i18n & Order
-- =============================================

-- 1. Seed room categories (i18n)
-- Note: is_featured = TRUE only for top 3 to match user request.
INSERT INTO room_categories (name_vi, name_en, slug, description_vi, description_en, image, image_alt_vi, image_alt_en, is_featured, position)
VALUES 
('Phòng họp', 'Meeting Room', 'meeting-room', 'Không gian chuyên nghiệp cho hội họp, thảo luận nhóm.', 'Professional space for meetings and group discussions.', 'https://images.unsplash.com/photo-1431540015161-0bf868a2d407?w=400', 'Hình ảnh phòng họp chuyên nghiệp', 'Professional meeting room image', TRUE, 1),
('Lớp học', 'Classroom', 'classroom', 'Phòng học đầy đủ bảng, máy chiếu cho giảng dạy.', 'Classroom with full board and projector for teaching.', 'https://images.unsplash.com/photo-1523050853064-db709df706ee?w=400', 'Hình ảnh phòng học hiện đại', 'Modern classroom image', TRUE, 2),
('Không gian sự kiện', 'Event Space', 'event-space', 'Sảnh lớn cho hội thảo, workshop quy mô.', 'Large hall for seminars and large-scale workshops.', 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=400', 'Hình ảnh không gian sự kiện rộng rãi', 'Spacious event space image', TRUE, 3),
('Chỗ ngồi làm việc', 'Coworking', 'coworking', 'Chỗ ngồi linh hoạt, yên tĩnh cho freelancer.', 'Flexible and quiet seating for freelancers.', 'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?w=400', 'Hình ảnh khu vực làm việc chung', 'Coworking space image', FALSE, 4)
ON CONFLICT (slug) DO NOTHING;

-- 2. Seed amenities (i18n)
INSERT INTO amenities (name_vi, name_en, icon, type, position)
VALUES 
('Wifi tốc độ cao', 'High-speed Wifi', 'wifi', 'BASIC', 1),
('Máy chiếu / Màn hình', 'Projector / Screen', 'presentation', 'EQUIPMENT', 2),
('Bảng trắng', 'Whiteboard', 'board', 'EQUIPMENT', 3),
('Điều hòa', 'Air Conditioning', 'ac', 'BASIC', 4),
('Nước uống miễn phí', 'Free Water', 'water', 'SERVICE', 5),
('Hỗ trợ kỹ thuật', 'Technical Support', 'support', 'SERVICE', 6),
('Không hút thuốc', 'No Smoking', 'smoking', 'POLICY', 7),
('Hỗ trợ 24/7', '24/7 Support', 'support-247', 'POLICY', 8),
('Bãi đỗ xe', 'Parking', 'parking', 'SERVICE', 9),
('Vệ sinh hàng ngày', 'Daily Cleaning', 'cleaning', 'SERVICE', 10)
ON CONFLICT DO NOTHING;

-- 3. Seed ads packages (i18n)
INSERT INTO ads_packages (name_vi, name_en, description_vi, description_en, duration_days, price, status, position)
VALUES 
('Cơ bản', 'Standard', 'Hiển thị cơ bản trong danh sách tìm kiếm.', 'Basic visibility in search results.', 7, 50000, 'ACTIVE', 1),
('Phổ biến', 'Popular', 'Được đánh dấu nổi bật và ưu tiên hiển thị.', 'Highighted and prioritized in search.', 30, 150000, 'ACTIVE', 2),
('Cao cấp', 'Premium', 'Hiển thị tại trang chủ và vị trí vàng.', 'Banner on homepage and top positions.', 30, 500000, 'ACTIVE', 3)
ON CONFLICT DO NOTHING;

-- 4. Seed Demo Property & Rooms (i18n)
-- This ensures the frontend has immediate data without waiting for user-created content.

INSERT INTO properties (
    owner_id, name_vi, name_en, property_type, contact_phone, contact_email, 
    province_code, district_code, ward_code, address_detail_vi, address_detail_en, 
    latitude, longitude,
    logo, logo_alt_vi, logo_alt_en, description_vi, description_en, status
) VALUES (
    'demo-owner-id', 'EduSpace Demo Campus', 'EduSpace Demo Campus', 'CENTER_COWORKING', '0123456789', 'demo@eduspace.com',
    '79', '760', '26743', 'Số 1 Võ Văn Ngân, Thủ Đức, TP.HCM', '1 Vo Van Ngan, Thu Duc, HCMC',
    10.8506, 106.7721,
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400', 'Logo EduSpace Demo', 'EduSpace Demo Logo',
    'Không gian học tập và làm việc hiện đại cho sinh viên.', 'Modern study and work space for students.', 'VERIFIED'
);

-- Seed Demo Rooms
INSERT INTO rooms (
    property_id, category_id, room_type, booking_type, name_vi, name_en, location_vi, location_en, 
    slug, capacity, area, room_number, floor_number, is_24_7, price_per_hour, price_per_day, 
    images, images_alt_vi, images_alt_en, description_vi, description_en, status, approval_status, is_active
) VALUES 
(
    (SELECT id FROM properties WHERE name_vi = 'EduSpace Demo Campus' LIMIT 1),
    (SELECT id FROM room_categories WHERE slug = 'meeting-room' LIMIT 1),
    'MEETING_ROOM', 'SLOT_BASED', 'Phòng họp Alpha', 'Alpha Meeting Room', 'Tầng 2, Khu A', '2nd Floor, Block A',
    'alpha-meeting-room', 10, 25.5, '201', '2', TRUE, 150000.00, 1000000.00,
    '["https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=600"]', 'Hình ảnh phòng họp Alpha', 'Alpha Meeting Room image',
    'Phòng họp nhỏ, đầy đủ tiện nghi.', 'Small meeting room, fully equipped.', 'ACTIVE', 'APPROVED', TRUE
),
(
    (SELECT id FROM properties WHERE name_vi = 'EduSpace Demo Campus' LIMIT 1),
    (SELECT id FROM room_categories WHERE slug = 'classroom' LIMIT 1),
    'CLASSROOM', 'SLOT_BASED', 'Phòng học 101', 'Classroom 101', 'Tầng 1, Khu B', '1st Floor, Block B',
    'classroom-101', 30, 50.0, '101', '1', FALSE, 100000.00, 800000.00,
    '["https://images.unsplash.com/photo-1523050853064-db709df706ee?w=600"]', 'Hình ảnh phòng học 101', 'Classroom 101 image',
    'Phòng học rộng rãi cho lớp học vừa.', 'Spacious classroom for medium-sized classes.', 'ACTIVE', 'APPROVED', TRUE
);

-- Seed Room Policies for Demo Rooms
INSERT INTO room_policies (room_id, name_vi, name_en, description_vi, description_en, logo, logo_alt_vi, logo_alt_en, position)
VALUES 
(
    (SELECT id FROM rooms WHERE slug = 'alpha-meeting-room' LIMIT 1),
    'Chính sách hủy phòng', 'Cancellation Policy',
    'Miễn phí hủy phòng trong vòng 24h sau khi đặt.', 'Free cancellation within 24 hours after booking.',
    'verified', 'Biểu tượng xác thực', 'Verified icon', 1
),
(
    (SELECT id FROM rooms WHERE slug = 'alpha-meeting-room' LIMIT 1),
    'Thời gian nhận phòng', 'Check-in Rules',
    'Vui lòng có mặt đúng khung giờ đã đặt để được hỗ trợ tốt nhất.', 'Please check in within your selected time slot to guarantee room access.',
    'schedule', 'Biểu tượng lịch trình', 'Schedule icon', 2
);

-- 5. Seed Room Schedules for Demo Rooms (7 days/week)
INSERT INTO room_schedules (room_id, day_of_week, is_open, open_time, close_time)
SELECT r.id, d.day, TRUE, '08:00:00', '21:00:00'
FROM rooms r
CROSS JOIN (SELECT generate_series(2, 8) AS day) d
WHERE r.slug IN ('alpha-meeting-room', 'classroom-101')
ON CONFLICT ON CONSTRAINT uq_room_schedules_room_day DO NOTHING;
