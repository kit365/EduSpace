-- Migrate category_distribution to JSONB and add missing columns
ALTER TABLE dashboard_stats 
ALTER COLUMN category_distribution TYPE JSONB USING category_distribution::JSONB;

ALTER TABLE dashboard_stats
ADD COLUMN IF NOT EXISTS pending_listings JSONB,
ADD COLUMN IF NOT EXISTS top_hosts JSONB;
