-- =============================================
-- V4: Facility -> Property; user IDs to VARCHAR(36); add is_active on rooms; add extra_services
-- =============================================

-- 1. Rename facilities -> properties
ALTER TABLE facilities RENAME TO properties;

-- 2. Properties: drop columns, add property_type, change owner_id/approved_by to VARCHAR(36)
ALTER TABLE properties DROP COLUMN IF EXISTS identity_code;
ALTER TABLE properties DROP COLUMN IF EXISTS verification_images;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS property_type VARCHAR(100);
ALTER TABLE properties ALTER COLUMN owner_id TYPE VARCHAR(36) USING owner_id::TEXT;
ALTER TABLE properties ALTER COLUMN approved_by TYPE VARCHAR(36) USING approved_by::TEXT;

-- 3. Rooms: facility_id -> property_id, add is_active
ALTER TABLE rooms RENAME COLUMN facility_id TO property_id;
ALTER TABLE rooms RENAME CONSTRAINT fk_rooms_facility TO fk_rooms_property;
DROP INDEX IF EXISTS idx_rooms_facility_id;
CREATE INDEX idx_rooms_property_id ON rooms (property_id);
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- 4. User-reference columns: INT -> VARCHAR(36) (UUID from account-service)
ALTER TABLE reviews ALTER COLUMN author_id TYPE VARCHAR(36) USING author_id::TEXT;
ALTER TABLE room_ads ALTER COLUMN owner_id TYPE VARCHAR(36) USING owner_id::TEXT;
ALTER TABLE system_calendar_rules ALTER COLUMN created_by TYPE VARCHAR(36) USING created_by::TEXT;
ALTER TABLE room_blocks ALTER COLUMN created_by TYPE VARCHAR(36) USING created_by::TEXT;

-- 5. Extra services table (property-level rentable items)
CREATE TABLE extra_services (
    id SERIAL PRIMARY KEY,
    property_id INT NOT NULL,
    name VARCHAR(255),
    description TEXT,
    price BIGINT,
    price_unit VARCHAR(50),
    status VARCHAR(50),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    CONSTRAINT fk_extra_services_property FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
);
CREATE INDEX idx_extra_services_property_id ON extra_services (property_id);
