-- Simplified architecture: room-level schedule + pricing; remove per-slot room_slots;
-- room_schedules (7 ngày/phòng) + migrate từ cột legacy trên rooms (gộp chung V11, không tách version mới).

-- 1) Rooms: ngày hoạt động trong tuần (CSV: ví dụ 2,3,4,5,6,7)
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS operating_days VARCHAR(64);
UPDATE rooms SET operating_days = '2,3,4,5,6,7,CN' WHERE operating_days IS NULL;

-- 2) room_custom_prices: bỏ phụ thu theo giờ
ALTER TABLE room_custom_prices DROP COLUMN IF EXISTS start_time;
ALTER TABLE room_custom_prices DROP COLUMN IF EXISTS end_time;

-- 3) Xóa bảng slot cũ
DROP TABLE IF EXISTS room_slots CASCADE;

-- 4) Properties: xóa mềm chi nhánh (không tạo version Flyway mới — gộp vào V11)
ALTER TABLE properties ADD COLUMN IF NOT EXISTS deleted BOOLEAN NOT NULL DEFAULT FALSE;
CREATE INDEX IF NOT EXISTS idx_properties_deleted ON properties (deleted);

-- 5) room_schedules (7 dòng/phòng); migrate từ open_time, close_time, operating_days rồi DROP 3 cột rooms
CREATE TABLE IF NOT EXISTS room_schedules (
    id          BIGSERIAL PRIMARY KEY,
    room_id     INTEGER NOT NULL REFERENCES rooms (id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 2 AND day_of_week <= 8),
    is_open     BOOLEAN NOT NULL DEFAULT TRUE,
    open_time   TIME,
    close_time  TIME,
    CONSTRAINT uq_room_schedules_room_day UNIQUE (room_id, day_of_week)
);

CREATE INDEX IF NOT EXISTS idx_room_schedules_room_id ON room_schedules (room_id);

DO $$
DECLARE
    r           RECORD;
    d           INT;
    normalized  TEXT;
    in_set      BOOLEAN;
    v_is_24_7   BOOLEAN;
    v_open      TIME;
    v_close     TIME;
BEGIN
    FOR r IN
        SELECT id,
               COALESCE(is_24_7, FALSE) AS is_24_7,
               open_time,
               close_time,
               operating_days
        FROM rooms
    LOOP
        v_is_24_7 := r.is_24_7;
        v_open := COALESCE(r.open_time, TIME '07:00');
        v_close := COALESCE(r.close_time, TIME '22:00');
        normalized := REPLACE(REPLACE(TRIM(COALESCE(r.operating_days, '')), 'CN', '8'), ' ', '');
        IF normalized = '' THEN
            normalized := '2,3,4,5,6,7';
        END IF;

        FOR d IN 2..8
            LOOP
                in_set := (',' || normalized || ',') LIKE ('%,' || d::TEXT || ',%');

                IF v_is_24_7 THEN
                    INSERT INTO room_schedules (room_id, day_of_week, is_open, open_time, close_time)
                    VALUES (r.id, d, TRUE, TIME '00:00', TIME '23:59');
                ELSIF in_set THEN
                    INSERT INTO room_schedules (room_id, day_of_week, is_open, open_time, close_time)
                    VALUES (r.id, d, TRUE, v_open, v_close);
                ELSE
                    INSERT INTO room_schedules (room_id, day_of_week, is_open, open_time, close_time)
                    VALUES (r.id, d, FALSE, NULL, NULL);
                END IF;
            END LOOP;
    END LOOP;
END
$$;

ALTER TABLE rooms DROP COLUMN IF EXISTS open_time;
ALTER TABLE rooms DROP COLUMN IF EXISTS close_time;
ALTER TABLE rooms DROP COLUMN IF EXISTS operating_days;
