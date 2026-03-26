-- Schema cũ có thể dùng INTEGER; RoomAdEntity.transactionId là String (V1: VARCHAR).
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = current_schema()
          AND table_name = 'room_ads'
          AND column_name = 'transaction_id'
          AND udt_name IN ('int2', 'int4', 'int8')
    ) THEN
        ALTER TABLE room_ads
            ALTER COLUMN transaction_id TYPE VARCHAR(255)
            USING transaction_id::text;
    END IF;
END $$;
