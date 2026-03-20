-- Slug duy nhất cho URL client (/spaces/{slug})
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS slug VARCHAR(220);

UPDATE rooms SET slug = 'room-' || id::text WHERE slug IS NULL OR TRIM(slug) = '';

CREATE UNIQUE INDEX IF NOT EXISTS uq_rooms_slug ON rooms (slug);
