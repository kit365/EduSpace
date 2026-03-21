-- DB đã ở Flyway 12 trong khi room_schedules chỉ có trong V11 đã chạy trước đó — cần migration mới.
-- Idempotent: ON CONFLICT, kiểm tra cột legacy qua information_schema.

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
    has_open    BOOLEAN;
    has_close   BOOLEAN;
    has_op_days BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'rooms' AND column_name = 'open_time'
    ) INTO has_open;
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'rooms' AND column_name = 'close_time'
    ) INTO has_close;
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'rooms' AND column_name = 'operating_days'
    ) INTO has_op_days;

    IF has_open AND has_close AND has_op_days THEN
        FOR r IN SELECT id, COALESCE(is_24_7, FALSE) AS is_24_7, open_time, close_time, operating_days FROM rooms
        LOOP
            IF (SELECT COUNT(*) FROM room_schedules WHERE room_id = r.id) >= 7 THEN
                CONTINUE;
            END IF;
            v_is_24_7 := r.is_24_7;
            v_open := COALESCE(r.open_time, TIME '07:00');
            v_close := COALESCE(r.close_time, TIME '22:00');
            normalized := REPLACE(REPLACE(TRIM(COALESCE(r.operating_days, '')), 'CN', '8'), ' ', '');
            IF normalized = '' THEN
                normalized := '2,3,4,5,6,7';
            END IF;
            FOR d IN 2..8
                LOOP
                    IF EXISTS (SELECT 1 FROM room_schedules WHERE room_id = r.id AND day_of_week = d) THEN
                        CONTINUE;
                    END IF;
                    in_set := (',' || normalized || ',') LIKE ('%,' || d::TEXT || ',%');
                    IF v_is_24_7 THEN
                        INSERT INTO room_schedules (room_id, day_of_week, is_open, open_time, close_time)
                        VALUES (r.id, d, TRUE, TIME '00:00', TIME '23:59')
                        ON CONFLICT ON CONSTRAINT uq_room_schedules_room_day DO NOTHING;
                    ELSIF in_set THEN
                        INSERT INTO room_schedules (room_id, day_of_week, is_open, open_time, close_time)
                        VALUES (r.id, d, TRUE, v_open, v_close)
                        ON CONFLICT ON CONSTRAINT uq_room_schedules_room_day DO NOTHING;
                    ELSE
                        INSERT INTO room_schedules (room_id, day_of_week, is_open, open_time, close_time)
                        VALUES (r.id, d, FALSE, NULL, NULL)
                        ON CONFLICT ON CONSTRAINT uq_room_schedules_room_day DO NOTHING;
                    END IF;
                END LOOP;
        END LOOP;
    ELSIF has_open AND has_close THEN
        FOR r IN SELECT id, COALESCE(is_24_7, FALSE) AS is_24_7, open_time, close_time FROM rooms
        LOOP
            IF (SELECT COUNT(*) FROM room_schedules WHERE room_id = r.id) >= 7 THEN
                CONTINUE;
            END IF;
            normalized := '2,3,4,5,6,7';
            v_is_24_7 := r.is_24_7;
            v_open := COALESCE(r.open_time, TIME '07:00');
            v_close := COALESCE(r.close_time, TIME '22:00');
            FOR d IN 2..8
                LOOP
                    IF EXISTS (SELECT 1 FROM room_schedules WHERE room_id = r.id AND day_of_week = d) THEN
                        CONTINUE;
                    END IF;
                    in_set := (',' || normalized || ',') LIKE ('%,' || d::TEXT || ',%');
                    IF v_is_24_7 THEN
                        INSERT INTO room_schedules (room_id, day_of_week, is_open, open_time, close_time)
                        VALUES (r.id, d, TRUE, TIME '00:00', TIME '23:59')
                        ON CONFLICT ON CONSTRAINT uq_room_schedules_room_day DO NOTHING;
                    ELSIF in_set THEN
                        INSERT INTO room_schedules (room_id, day_of_week, is_open, open_time, close_time)
                        VALUES (r.id, d, TRUE, v_open, v_close)
                        ON CONFLICT ON CONSTRAINT uq_room_schedules_room_day DO NOTHING;
                    ELSE
                        INSERT INTO room_schedules (room_id, day_of_week, is_open, open_time, close_time)
                        VALUES (r.id, d, FALSE, NULL, NULL)
                        ON CONFLICT ON CONSTRAINT uq_room_schedules_room_day DO NOTHING;
                    END IF;
                END LOOP;
        END LOOP;
    ELSIF has_open AND has_op_days THEN
        FOR r IN SELECT id, COALESCE(is_24_7, FALSE) AS is_24_7, open_time, operating_days FROM rooms
        LOOP
            IF (SELECT COUNT(*) FROM room_schedules WHERE room_id = r.id) >= 7 THEN
                CONTINUE;
            END IF;
            v_is_24_7 := r.is_24_7;
            v_open := COALESCE(r.open_time, TIME '07:00');
            IF has_close THEN
                SELECT close_time INTO v_close FROM rooms WHERE id = r.id;
            ELSE
                v_close := TIME '22:00';
            END IF;
            normalized := REPLACE(REPLACE(TRIM(COALESCE(r.operating_days, '')), 'CN', '8'), ' ', '');
            IF normalized = '' THEN
                normalized := '2,3,4,5,6,7';
            END IF;
            FOR d IN 2..8
                LOOP
                    IF EXISTS (SELECT 1 FROM room_schedules WHERE room_id = r.id AND day_of_week = d) THEN
                        CONTINUE;
                    END IF;
                    in_set := (',' || normalized || ',') LIKE ('%,' || d::TEXT || ',%');
                    IF v_is_24_7 THEN
                        INSERT INTO room_schedules (room_id, day_of_week, is_open, open_time, close_time)
                        VALUES (r.id, d, TRUE, TIME '00:00', TIME '23:59')
                        ON CONFLICT ON CONSTRAINT uq_room_schedules_room_day DO NOTHING;
                    ELSIF in_set THEN
                        INSERT INTO room_schedules (room_id, day_of_week, is_open, open_time, close_time)
                        VALUES (r.id, d, TRUE, v_open, v_close)
                        ON CONFLICT ON CONSTRAINT uq_room_schedules_room_day DO NOTHING;
                    ELSE
                        INSERT INTO room_schedules (room_id, day_of_week, is_open, open_time, close_time)
                        VALUES (r.id, d, FALSE, NULL, NULL)
                        ON CONFLICT ON CONSTRAINT uq_room_schedules_room_day DO NOTHING;
                    END IF;
                END LOOP;
        END LOOP;
    ELSE
        FOR r IN SELECT id, COALESCE(is_24_7, FALSE) AS is_24_7 FROM rooms
        LOOP
            IF (SELECT COUNT(*) FROM room_schedules WHERE room_id = r.id) >= 7 THEN
                CONTINUE;
            END IF;
            v_is_24_7 := r.is_24_7;
            FOR d IN 2..8
                LOOP
                    IF EXISTS (SELECT 1 FROM room_schedules WHERE room_id = r.id AND day_of_week = d) THEN
                        CONTINUE;
                    END IF;
                    IF v_is_24_7 THEN
                        INSERT INTO room_schedules (room_id, day_of_week, is_open, open_time, close_time)
                        VALUES (r.id, d, TRUE, TIME '00:00', TIME '23:59')
                        ON CONFLICT ON CONSTRAINT uq_room_schedules_room_day DO NOTHING;
                    ELSIF d <= 7 THEN
                        INSERT INTO room_schedules (room_id, day_of_week, is_open, open_time, close_time)
                        VALUES (r.id, d, TRUE, TIME '07:00', TIME '22:00')
                        ON CONFLICT ON CONSTRAINT uq_room_schedules_room_day DO NOTHING;
                    ELSE
                        INSERT INTO room_schedules (room_id, day_of_week, is_open, open_time, close_time)
                        VALUES (r.id, d, FALSE, NULL, NULL)
                        ON CONFLICT ON CONSTRAINT uq_room_schedules_room_day DO NOTHING;
                    END IF;
                END LOOP;
        END LOOP;
    END IF;
END
$$;

ALTER TABLE rooms DROP COLUMN IF EXISTS open_time;
ALTER TABLE rooms DROP COLUMN IF EXISTS close_time;
ALTER TABLE rooms DROP COLUMN IF EXISTS operating_days;
