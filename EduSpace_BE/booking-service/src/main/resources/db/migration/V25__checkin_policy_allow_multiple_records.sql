ALTER TABLE booking_checkin_policies
    DROP CONSTRAINT IF EXISTS booking_checkin_policies_property_id_key;

ALTER TABLE booking_checkin_policies
    DROP CONSTRAINT IF EXISTS uq_booking_checkin_policies_property_id;
