-- Legacy safety net: some dev DBs still have room_blocks without property_id.
-- Keep idempotent and backfill where room_id data exists.

ALTER TABLE IF EXISTS room_blocks
    ADD COLUMN IF NOT EXISTS property_id INTEGER;

DO $$
BEGIN
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
        WHERE rb.property_id IS NULL
          AND rb.room_id IS NOT NULL
          AND rb.room_id = r.id;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'fk_room_blocks_property'
    ) THEN
        ALTER TABLE room_blocks
            ADD CONSTRAINT fk_room_blocks_property
                FOREIGN KEY (property_id) REFERENCES properties (id) ON DELETE CASCADE;
    END IF;
END $$;
