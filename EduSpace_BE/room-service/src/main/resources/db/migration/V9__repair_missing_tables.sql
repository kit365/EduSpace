-- V9: Repair missing tables for drifted local schemas
-- Some environments miss tables introduced/reworked outside linear migrations.

CREATE TABLE IF NOT EXISTS room_custom_prices (
    id SERIAL PRIMARY KEY,
    room_id INT NOT NULL,
    day_of_week VARCHAR(20),
    specific_date DATE,
    price_modifier NUMERIC(8,4) NOT NULL,
    start_time TIME,
    end_time TIME,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_room_custom_prices_room FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_room_custom_prices_room_id ON room_custom_prices (room_id);

CREATE TABLE IF NOT EXISTS room_slots (
    id SERIAL PRIMARY KEY,
    room_id INT NOT NULL,
    name VARCHAR(255),
    start_time TIME,
    end_time TIME,
    day_of_week VARCHAR(20),
    base_price BIGINT,
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_room_slots_room FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_room_slots_room_id ON room_slots (room_id);

-- Repair drifted rooms schema for Hibernate validation
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS property_id INT;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS room_type VARCHAR(100);
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS booking_type VARCHAR(50);
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS name VARCHAR(255);
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS slug VARCHAR(220);
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS capacity INT;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS area NUMERIC(10,2);
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS room_number VARCHAR(50);
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS floor_number VARCHAR(50);
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS is_24_7 BOOLEAN DEFAULT FALSE;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS open_time TIME;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS close_time TIME;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS price_per_hour NUMERIC(15,2);
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS price_per_day NUMERIC(15,2);
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS min_booking_hours INT DEFAULT 1;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS images VARCHAR(500);
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS status VARCHAR(50);
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS approval_status VARCHAR(50);
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS rejection_note TEXT;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS avg_rating NUMERIC(3,2) DEFAULT 0;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS review_count INT DEFAULT 0;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'fk_rooms_property'
    ) THEN
        ALTER TABLE rooms
            ADD CONSTRAINT fk_rooms_property
            FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_rooms_property_id ON rooms (property_id);
CREATE INDEX IF NOT EXISTS idx_rooms_approval_status ON rooms (approval_status);
CREATE UNIQUE INDEX IF NOT EXISTS uq_rooms_slug ON rooms (slug);
