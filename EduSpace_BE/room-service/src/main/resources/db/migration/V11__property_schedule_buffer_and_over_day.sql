-- Cài đặt lịch cơ sở: khoảng cách giữa các slot (phục vụ dọn phòng) + cờ cho phép sinh slot cả ngày.
ALTER TABLE properties
    ADD COLUMN IF NOT EXISTS schedule_buffer_minutes INTEGER NOT NULL DEFAULT 0;

ALTER TABLE properties
    ADD COLUMN IF NOT EXISTS schedule_is_over_day BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN properties.schedule_buffer_minutes IS 'Phút nghỉ giữa các khung giờ liên tiếp (turnover/cleaning).';
COMMENT ON COLUMN properties.schedule_is_over_day IS 'True: logic tạo slot có thể dùng toàn bộ khung 24h; false: theo open/close từng ngày.';
