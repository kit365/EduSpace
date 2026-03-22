-- V8: Repair drifted external-id column types (INT -> VARCHAR)
-- Some databases still keep old integer types, while entities now use String.

ALTER TABLE properties
    ALTER COLUMN owner_id TYPE VARCHAR(255) USING owner_id::TEXT,
    ALTER COLUMN approved_by TYPE VARCHAR(255) USING approved_by::TEXT;

ALTER TABLE reviews
    ALTER COLUMN author_id TYPE VARCHAR(255) USING author_id::TEXT;

ALTER TABLE room_ads
    ALTER COLUMN owner_id TYPE VARCHAR(255) USING owner_id::TEXT,
    ALTER COLUMN transaction_id TYPE VARCHAR(255) USING transaction_id::TEXT;

ALTER TABLE system_calendar_rules
    ALTER COLUMN created_by TYPE VARCHAR(255) USING created_by::TEXT;

ALTER TABLE room_blocks
    ALTER COLUMN created_by TYPE VARCHAR(255) USING created_by::TEXT;
