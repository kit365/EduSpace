-- Legacy DB safety net: create reference tables if they are absent.
-- Needed for schemas that drifted before unified V1 baseline.

CREATE TABLE IF NOT EXISTS room_categories (
    id SERIAL PRIMARY KEY,
    name_vi VARCHAR(255) NOT NULL,
    name_en VARCHAR(255),
    slug VARCHAR(255) NOT NULL,
    description_vi TEXT,
    description_en TEXT,
    image VARCHAR(255),
    image_alt_vi VARCHAR(255),
    image_alt_en VARCHAR(255),
    is_featured BOOLEAN DEFAULT FALSE,
    position INTEGER DEFAULT 0,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_room_categories_slug ON room_categories (slug);

CREATE TABLE IF NOT EXISTS room_policies (
    id SERIAL PRIMARY KEY,
    room_id INTEGER NOT NULL,
    name_vi VARCHAR(255) NOT NULL,
    name_en VARCHAR(255),
    description_vi TEXT,
    description_en TEXT,
    logo TEXT,
    logo_alt_vi VARCHAR(255),
    logo_alt_en VARCHAR(255),
    position INTEGER DEFAULT 0,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_room_policies_room'
    ) THEN
        ALTER TABLE room_policies
            ADD CONSTRAINT fk_room_policies_room
                FOREIGN KEY (room_id) REFERENCES rooms (id) ON DELETE CASCADE;
    END IF;
END $$;
