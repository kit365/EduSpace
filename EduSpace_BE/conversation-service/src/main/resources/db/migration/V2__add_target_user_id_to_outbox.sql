-- Add target_user_id column to outbox_events table
ALTER TABLE outbox_events ADD COLUMN target_user_id VARCHAR(60);
