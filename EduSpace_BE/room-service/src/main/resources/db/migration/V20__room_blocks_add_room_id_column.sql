-- Add `room_id` back for legacy DBs where Flyway history/schema drift may
-- leave `room_blocks` without room_id. Kept idempotent.

ALTER TABLE room_blocks
    ADD COLUMN IF NOT EXISTS room_id INTEGER;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_room_blocks_room_id'
    ) THEN
        ALTER TABLE room_blocks
            ADD CONSTRAINT fk_room_blocks_room_id
                FOREIGN KEY (room_id) REFERENCES rooms (id) ON DELETE CASCADE;
    END IF;
END $$;

