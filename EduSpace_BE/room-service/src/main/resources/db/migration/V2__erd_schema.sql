-- =============================================
-- V2: ERD schema - facilities, rooms, ads, slots, amenities, reviews, blocks
-- Replaces V1 facilities/rooms with INT PK; adds all ERD tables.
-- No FK to users, bookings, transactions (external services).
-- =============================================

-- Drop in reverse dependency order
DROP TABLE IF EXISTS room_blocks CASCADE;
DROP TABLE IF EXISTS room_ads CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS room_amenities CASCADE;
DROP TABLE IF EXISTS room_slots CASCADE;
DROP TABLE IF EXISTS rooms CASCADE;
DROP TABLE IF EXISTS facilities CASCADE;

-- Standalone: ads_packages
CREATE TABLE ads_packages (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    description TEXT,
    duration_days INT,
    price BIGINT,
    status VARCHAR(50)
);

-- facilities (owner_id, approved_by: no FK to users)
CREATE TABLE facilities (
    id SERIAL PRIMARY KEY,
    owner_id INT,
    name VARCHAR(255),
    identity_code VARCHAR(100),
    verification_images VARCHAR(500),
    contact_phone VARCHAR(50),
    contact_email VARCHAR(255),
    address TEXT,
    logo TEXT,
    description TEXT,
    status VARCHAR(50),
    rejection_note TEXT,
    submitted_at TIMESTAMP,
    approved_by INT,
    approved_at TIMESTAMP
);

CREATE INDEX idx_facilities_owner_id ON facilities (owner_id);
CREATE INDEX idx_facilities_status ON facilities (status);

-- rooms
CREATE TABLE rooms (
    id SERIAL PRIMARY KEY,
    facility_id INT NOT NULL,
    room_type VARCHAR(100),
    booking_type VARCHAR(50),
    name VARCHAR(255),
    capacity INT,
    area NUMERIC(10,2),
    location VARCHAR(255),
    images VARCHAR(500),
    description TEXT,
    status VARCHAR(50),
    approval_status VARCHAR(50),
    rejection_note TEXT,
    avg_rating NUMERIC(3,2) DEFAULT 0,
    review_count INT DEFAULT 0,
    deleted_at TIMESTAMP,
    CONSTRAINT fk_rooms_facility FOREIGN KEY (facility_id) REFERENCES facilities(id) ON DELETE CASCADE
);

CREATE INDEX idx_rooms_facility_id ON rooms (facility_id);
CREATE INDEX idx_rooms_approval_status ON rooms (approval_status);

-- room_slots
CREATE TABLE room_slots (
    id SERIAL PRIMARY KEY,
    room_id INT NOT NULL,
    name VARCHAR(255),
    start_time TIME,
    end_time TIME,
    day_of_week VARCHAR(50),
    base_price BIGINT,
    status VARCHAR(50),
    CONSTRAINT fk_room_slots_room FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
);

CREATE INDEX idx_room_slots_room_id ON room_slots (room_id);

-- amenities
CREATE TABLE amenities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    icon VARCHAR(255),
    type VARCHAR(100)
);

-- room_amenities (many-to-many)
CREATE TABLE room_amenities (
    room_id INT NOT NULL,
    amenity_id INT NOT NULL,
    quantity INT DEFAULT 1,
    notes TEXT,
    PRIMARY KEY (room_id, amenity_id),
    CONSTRAINT fk_room_amenities_room FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    CONSTRAINT fk_room_amenities_amenity FOREIGN KEY (amenity_id) REFERENCES amenities(id) ON DELETE CASCADE
);

-- reviews (author_id, booking_id: no FK to users/bookings)
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    room_id INT NOT NULL,
    author_id INT,
    booking_id INT,
    rating SMALLINT,
    comment TEXT,
    status VARCHAR(50),
    reply TEXT,
    reply_at TIMESTAMP,
    CONSTRAINT fk_reviews_room FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
);

CREATE INDEX idx_reviews_room_id ON reviews (room_id);

-- room_ads (owner_id, transaction_id: no FK to users/transactions)
CREATE TABLE room_ads (
    id SERIAL PRIMARY KEY,
    room_id INT NOT NULL,
    ads_package_id INT,
    owner_id INT,
    transaction_id INT,
    start_date DATE,
    end_date DATE,
    paid_amount BIGINT,
    status VARCHAR(50),
    CONSTRAINT fk_room_ads_room FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    CONSTRAINT fk_room_ads_package FOREIGN KEY (ads_package_id) REFERENCES ads_packages(id)
);

CREATE INDEX idx_room_ads_room_id ON room_ads (room_id);

-- system_calendar_rules (created_by: no FK to users)
CREATE TABLE system_calendar_rules (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    start_date DATE,
    end_date DATE,
    commission_rate NUMERIC(5,4),
    price_modifier_rate NUMERIC(5,4),
    block_type VARCHAR(100),
    created_by INT
);

-- room_blocks (created_by: no FK to users)
CREATE TABLE room_blocks (
    id SERIAL PRIMARY KEY,
    room_id INT NOT NULL,
    start_datetime TIMESTAMP,
    end_datetime TIMESTAMP,
    reason TEXT,
    block_type VARCHAR(100),
    created_by INT,
    CONSTRAINT fk_room_blocks_room FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
);

CREATE INDEX idx_room_blocks_room_id ON room_blocks (room_id);
