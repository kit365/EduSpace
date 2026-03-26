-- Weekdays applying to a price rule (2 = Monday … 8 = Sunday), aligned with room_schedules.day_of_week.
-- No FK to room_schedules.id: property schedules are fully replaced on save.
CREATE TABLE IF NOT EXISTS room_price_rule_schedule (
    room_price_rule_id INTEGER NOT NULL REFERENCES room_price_rule (id) ON DELETE CASCADE,
    day_of_week          SMALLINT NOT NULL,
    PRIMARY KEY (room_price_rule_id, day_of_week),
    CONSTRAINT ck_room_price_rule_schedule_dow CHECK (day_of_week >= 2 AND day_of_week <= 8)
);

CREATE INDEX IF NOT EXISTS idx_room_price_rule_schedule_rule ON room_price_rule_schedule (room_price_rule_id);
