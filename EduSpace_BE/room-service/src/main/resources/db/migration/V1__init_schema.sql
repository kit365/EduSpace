-- =============================================
-- V1: Consolidated Init Schema with i18n & Ordering
-- Includes localized fields (_vi, _en) and position columns.
-- =============================================

-- 1. room_categories
CREATE TABLE room_categories (
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
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    CONSTRAINT uc_room_categories_slug UNIQUE (slug)
);

-- 2. properties
CREATE TABLE properties (
    id SERIAL PRIMARY KEY,
    owner_id VARCHAR(36),
    name_vi VARCHAR(255),
    name_en VARCHAR(255),
    property_type VARCHAR(100),
    contact_phone VARCHAR(50),
    contact_email VARCHAR(255),
    province_code VARCHAR(20),
    district_code VARCHAR(20),
    ward_code VARCHAR(20),
    address_detail_vi VARCHAR(500),
    address_detail_en VARCHAR(500),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    logo TEXT,
    logo_alt_vi VARCHAR(255),
    logo_alt_en VARCHAR(255),
    description_vi TEXT,
    description_en TEXT,
    status VARCHAR(50),
    rejection_note TEXT,
    submitted_at TIMESTAMP,
    approved_by VARCHAR(36),
    approved_at TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_properties_owner_id ON properties (owner_id);
CREATE INDEX idx_properties_status ON properties (status);
CREATE INDEX idx_properties_deleted ON properties (deleted);

-- 3. rooms
CREATE TABLE rooms (
    id SERIAL PRIMARY KEY,
    property_id INT NOT NULL,
    category_id INT,
    room_type VARCHAR(255),
    booking_type VARCHAR(255),
    name_vi VARCHAR(255),
    name_en VARCHAR(255),
    location_vi VARCHAR(500),
    location_en VARCHAR(500),
    slug VARCHAR(220) UNIQUE,
    capacity INTEGER,
    area DECIMAL(10, 2),
    room_number VARCHAR(50),
    floor_number VARCHAR(50),
    is_24_7 BOOLEAN NOT NULL DEFAULT FALSE,
    price_per_hour DECIMAL(15, 2),
    price_per_day DECIMAL(15, 2),
    min_booking_hours INTEGER NOT NULL DEFAULT 1,
    images TEXT,
    images_alt_vi TEXT,
    images_alt_en TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    description_vi TEXT,
    description_en TEXT,
    status VARCHAR(255),
    approval_status VARCHAR(255),
    rejection_note TEXT,
    pending_edit_payload TEXT,
    pending_edit_status VARCHAR(30),
    pending_edit_rejection_note TEXT,
    avg_rating DECIMAL(3, 2) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    deleted_at TIMESTAMP WITHOUT TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    approved_by VARCHAR(36),
    approved_at TIMESTAMP,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_rooms_property FOREIGN KEY (property_id) REFERENCES properties (id) ON DELETE CASCADE,
    CONSTRAINT fk_rooms_category FOREIGN KEY (category_id) REFERENCES room_categories (id)
);

CREATE INDEX idx_rooms_property_id ON rooms (property_id);
CREATE INDEX idx_rooms_category_id ON rooms (category_id);
CREATE INDEX idx_rooms_approval_status ON rooms (approval_status);

-- 4. room_schedules
CREATE TABLE room_schedules (
    id BIGSERIAL PRIMARY KEY,
    room_id INTEGER NOT NULL REFERENCES rooms (id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 2 AND day_of_week <= 8),
    is_open BOOLEAN NOT NULL DEFAULT TRUE,
    open_time TIME WITHOUT TIME ZONE,
    close_time TIME WITHOUT TIME ZONE,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    CONSTRAINT uq_room_schedules_room_day UNIQUE (room_id, day_of_week)
);

-- 5. room_policies
CREATE TABLE room_policies (
    id SERIAL PRIMARY KEY,
    room_id INTEGER NOT NULL REFERENCES rooms (id) ON DELETE CASCADE,
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

-- 6. amenities
CREATE TABLE amenities (
    id SERIAL PRIMARY KEY,
    name_vi VARCHAR(255),
    name_en VARCHAR(255),
    icon VARCHAR(255),
    type VARCHAR(255),
    position INTEGER DEFAULT 0,
    price BIGINT NOT NULL DEFAULT 0,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- 7. room_amenities
CREATE TABLE room_amenities (
    room_id INTEGER NOT NULL REFERENCES rooms (id) ON DELETE CASCADE,
    amenity_id INTEGER NOT NULL REFERENCES amenities (id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1,
    notes TEXT,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    CONSTRAINT pk_room_amenities PRIMARY KEY (room_id, amenity_id)
);

-- 8. reviews
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    room_id INTEGER NOT NULL REFERENCES rooms (id) ON DELETE CASCADE,
    author_id VARCHAR(255),
    booking_id INTEGER,
    rating SMALLINT,
    comment TEXT,
    status VARCHAR(255),
    reply TEXT,
    reply_at TIMESTAMP WITHOUT TIME ZONE,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- 9. ads_packages
CREATE TABLE ads_packages (
    id SERIAL PRIMARY KEY,
    name_vi VARCHAR(255),
    name_en VARCHAR(255),
    description_vi TEXT,
    description_en TEXT,
    duration_days INTEGER,
    price BIGINT,
    status VARCHAR(255),
    position INTEGER DEFAULT 0,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- 10. room_ads
CREATE TABLE room_ads (
    id SERIAL PRIMARY KEY,
    room_id INTEGER NOT NULL REFERENCES rooms (id) ON DELETE CASCADE,
    ads_package_id INTEGER REFERENCES ads_packages (id),
    owner_id VARCHAR(255),
    transaction_id VARCHAR(255),
    start_date DATE,
    end_date DATE,
    paid_amount BIGINT,
    status VARCHAR(255),
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- 11. room_blocks
CREATE TABLE room_blocks (
    id SERIAL PRIMARY KEY,
    room_id INTEGER NOT NULL REFERENCES rooms (id) ON DELETE CASCADE,
    start_datetime TIMESTAMP WITHOUT TIME ZONE,
    end_datetime TIMESTAMP WITHOUT TIME ZONE,
    reason TEXT,
    block_type VARCHAR(255),
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- 12. room_custom_prices
CREATE TABLE room_custom_prices (
    id SERIAL PRIMARY KEY,
    room_id INTEGER NOT NULL REFERENCES rooms (id) ON DELETE CASCADE,
    day_of_week VARCHAR(20),
    specific_date DATE,
    price_modifier DECIMAL(8, 4) NOT NULL,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- 13. system_calendar_rules
CREATE TABLE system_calendar_rules (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    start_date DATE,
    end_date DATE,
    commission_rate DECIMAL(5, 4),
    price_modifier_rate DECIMAL(5, 4),
    block_type VARCHAR(255),
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- 14. extra_services
CREATE TABLE extra_services (
    id SERIAL PRIMARY KEY,
    property_id INTEGER NOT NULL REFERENCES properties (id) ON DELETE CASCADE,
    name_vi VARCHAR(255),
    name_en VARCHAR(255),
    description_vi TEXT,
    description_en TEXT,
    price BIGINT,
    price_unit VARCHAR(30) NOT NULL,
    status VARCHAR(255),
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    CONSTRAINT ck_extra_services_price_unit CHECK (price_unit IN ('PER_HOUR', 'PER_BOOKING', 'PER_PERSON', 'PER_ITEM'))
);
