DROP INDEX IF EXISTS idx_room_price_rule_priority;

ALTER TABLE room_price_rule
    DROP COLUMN IF EXISTS priority;
