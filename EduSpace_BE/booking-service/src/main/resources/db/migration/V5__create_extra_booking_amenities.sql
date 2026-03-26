-- Extra amenities chosen at booking time (catalog amenity id + quantity per booking).
CREATE TABLE IF NOT EXISTS extra_booking_amenities (
    id BIGSERIAL PRIMARY KEY,
    booking_id BIGINT NOT NULL REFERENCES bookings (id) ON DELETE CASCADE,
    amenity_id BIGINT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity >= 1),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_extra_booking_amenities_booking_amenity UNIQUE (booking_id, amenity_id)
);

CREATE INDEX IF NOT EXISTS idx_extra_booking_amenities_booking_id ON extra_booking_amenities (booking_id);
CREATE INDEX IF NOT EXISTS idx_extra_booking_amenities_amenity_id ON extra_booking_amenities (amenity_id);
