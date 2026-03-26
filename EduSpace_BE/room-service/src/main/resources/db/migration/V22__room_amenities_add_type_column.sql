-- Add grouping type to room_amenities.
-- We treat amenities with amenities.type='POLICY' as room policies,
-- and all other amenities as room utilities ("tiện ích & trang thiết bị").

ALTER TABLE room_amenities
    ADD COLUMN IF NOT EXISTS type VARCHAR(50);

UPDATE room_amenities ra
SET type = CASE
    WHEN a.type = 'POLICY' THEN 'POLICY'
    ELSE 'AMENITY'
END
FROM amenities a
WHERE ra.amenity_id = a.id
  AND (ra.type IS NULL OR ra.type = '');

