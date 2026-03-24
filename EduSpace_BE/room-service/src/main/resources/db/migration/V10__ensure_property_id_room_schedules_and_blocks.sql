-- Bản vá cho DB có flyway_schema_history > V4 (vd. version 9): Flyway sẽ không chạy lại V3/V4.
-- Nội dung idempotent giống V4 — chỉ migrate khi thiếu property_id.

-- ─── room_schedules: room_id → property_id ───────────────────────────────────
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = current_schema()
          AND table_name = 'room_schedules'
          AND column_name = 'property_id'
    ) THEN
        ALTER TABLE room_schedules ADD COLUMN property_id INTEGER;

        IF EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = current_schema()
              AND table_name = 'room_schedules'
              AND column_name = 'room_id'
        ) THEN
            UPDATE room_schedules rs
            SET property_id = r.property_id
            FROM rooms r
            WHERE r.id = rs.room_id;

            DELETE FROM room_schedules WHERE property_id IS NULL;

            DELETE FROM room_schedules a
            WHERE EXISTS (
                SELECT 1
                FROM room_schedules b
                WHERE b.property_id = a.property_id
                  AND b.day_of_week = a.day_of_week
                  AND b.id < a.id
            );

            ALTER TABLE room_schedules ALTER COLUMN property_id SET NOT NULL;

            ALTER TABLE room_schedules DROP CONSTRAINT IF EXISTS uq_room_schedules_room_day;
            ALTER TABLE room_schedules DROP CONSTRAINT IF EXISTS room_schedules_room_id_fkey;

            ALTER TABLE room_schedules DROP COLUMN IF EXISTS room_id;

            IF NOT EXISTS (
                SELECT 1 FROM pg_constraint WHERE conname = 'fk_room_schedules_property'
            ) THEN
                ALTER TABLE room_schedules
                    ADD CONSTRAINT fk_room_schedules_property
                        FOREIGN KEY (property_id) REFERENCES properties (id) ON DELETE CASCADE;
            END IF;

            IF NOT EXISTS (
                SELECT 1 FROM pg_constraint WHERE conname = 'uq_room_schedules_property_day'
            ) THEN
                ALTER TABLE room_schedules
                    ADD CONSTRAINT uq_room_schedules_property_day UNIQUE (property_id, day_of_week);
            END IF;
        END IF;
    END IF;
END $$;

-- ─── room_blocks: room_id → property_id ────────────────────────────────────────
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = current_schema()
          AND table_name = 'room_blocks'
          AND column_name = 'property_id'
    ) THEN
        ALTER TABLE room_blocks ADD COLUMN property_id INTEGER;

        IF EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = current_schema()
              AND table_name = 'room_blocks'
              AND column_name = 'room_id'
        ) THEN
            UPDATE room_blocks rb
            SET property_id = r.property_id
            FROM rooms r
            WHERE r.id = rb.room_id;

            DELETE FROM room_blocks WHERE property_id IS NULL;

            ALTER TABLE room_blocks ALTER COLUMN property_id SET NOT NULL;

            ALTER TABLE room_blocks DROP CONSTRAINT IF EXISTS room_blocks_room_id_fkey;

            ALTER TABLE room_blocks DROP COLUMN IF EXISTS room_id;

            IF NOT EXISTS (
                SELECT 1 FROM pg_constraint WHERE conname = 'fk_room_blocks_property'
            ) THEN
                ALTER TABLE room_blocks
                    ADD CONSTRAINT fk_room_blocks_property
                        FOREIGN KEY (property_id) REFERENCES properties (id) ON DELETE CASCADE;
            END IF;
        END IF;
    END IF;
END $$;
