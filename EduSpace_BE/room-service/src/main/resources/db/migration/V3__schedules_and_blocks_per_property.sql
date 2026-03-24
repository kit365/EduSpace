-- Giờ hoạt động (room_schedules) và lịch chặn (room_blocks) gắn với cơ sở (property), không còn theo từng phòng.

-- ─── 1. room_schedules: room_id → property_id ───────────────────────────────
ALTER TABLE room_schedules ADD COLUMN IF NOT EXISTS property_id INTEGER;

UPDATE room_schedules rs
SET property_id = r.property_id
FROM rooms r
WHERE r.id = rs.room_id;

DELETE FROM room_schedules WHERE property_id IS NULL;

-- Gộp trùng (cùng property + ngày trong tuần): giữ bản ghi id nhỏ nhất
DELETE FROM room_schedules a
WHERE EXISTS (
    SELECT 1
    FROM room_schedules b
    WHERE b.property_id = a.property_id
      AND b.day_of_week = a.day_of_week
      AND b.id < a.id
);

ALTER TABLE room_schedules DROP CONSTRAINT IF EXISTS uq_room_schedules_room_day;
ALTER TABLE room_schedules DROP CONSTRAINT IF EXISTS room_schedules_room_id_fkey;

ALTER TABLE room_schedules DROP COLUMN IF EXISTS room_id;

ALTER TABLE room_schedules ALTER COLUMN property_id SET NOT NULL;

ALTER TABLE room_schedules
    ADD CONSTRAINT fk_room_schedules_property
        FOREIGN KEY (property_id) REFERENCES properties (id) ON DELETE CASCADE;

ALTER TABLE room_schedules
    ADD CONSTRAINT uq_room_schedules_property_day UNIQUE (property_id, day_of_week);

-- ─── 2. room_blocks: room_id → property_id ───────────────────────────────────
ALTER TABLE room_blocks ADD COLUMN IF NOT EXISTS property_id INTEGER;

UPDATE room_blocks rb
SET property_id = r.property_id
FROM rooms r
WHERE r.id = rb.room_id;

DELETE FROM room_blocks WHERE property_id IS NULL;

ALTER TABLE room_blocks ALTER COLUMN property_id SET NOT NULL;

ALTER TABLE room_blocks DROP CONSTRAINT IF EXISTS room_blocks_room_id_fkey;

ALTER TABLE room_blocks DROP COLUMN IF EXISTS room_id;

ALTER TABLE room_blocks
    ADD CONSTRAINT fk_room_blocks_property
        FOREIGN KEY (property_id) REFERENCES properties (id) ON DELETE CASCADE;
