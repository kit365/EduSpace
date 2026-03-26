-- Bản vá cho DB có flyway_schema_history đi trước schema thực tế (vd. version 9 nhưng thiếu room_schedules).
-- 1) Nếu bảng chưa có: CREATE theo mô hình property-level + cột is_over_day (V13).
-- 2) Nếu bảng có nhưng thiếu property_id: idempotent giống V4.

-- ─── room_schedules ─────────────────────────────────────────────────────────
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = current_schema()
          AND table_name = 'room_schedules'
    ) THEN
        CREATE TABLE room_schedules (
            id BIGSERIAL PRIMARY KEY,
            property_id INTEGER NOT NULL,
            day_of_week INTEGER NOT NULL,
            is_open BOOLEAN NOT NULL DEFAULT TRUE,
            is_over_day BOOLEAN NOT NULL DEFAULT FALSE,
            open_time TIME WITHOUT TIME ZONE,
            close_time TIME WITHOUT TIME ZONE,
            created_by VARCHAR(255),
            updated_by VARCHAR(255),
            created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
            CONSTRAINT ck_room_schedules_dow CHECK (day_of_week >= 2 AND day_of_week <= 8),
            CONSTRAINT fk_room_schedules_property FOREIGN KEY (property_id) REFERENCES properties (id) ON DELETE CASCADE,
            CONSTRAINT uq_room_schedules_property_day UNIQUE (property_id, day_of_week)
        );
    ELSIF NOT EXISTS (
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

-- ─── room_blocks ─────────────────────────────────────────────────────────────
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = current_schema()
          AND table_name = 'room_blocks'
    ) THEN
        CREATE TABLE room_blocks (
            id SERIAL PRIMARY KEY,
            property_id INTEGER NOT NULL,
            start_datetime TIMESTAMP WITHOUT TIME ZONE,
            end_datetime TIMESTAMP WITHOUT TIME ZONE,
            reason TEXT,
            block_type VARCHAR(255),
            room_id INTEGER,
            created_by VARCHAR(255),
            updated_by VARCHAR(255),
            created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
            CONSTRAINT fk_room_blocks_property FOREIGN KEY (property_id) REFERENCES properties (id) ON DELETE CASCADE,
            CONSTRAINT fk_room_blocks_room_id FOREIGN KEY (room_id) REFERENCES rooms (id) ON DELETE CASCADE
        );
    ELSIF NOT EXISTS (
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
