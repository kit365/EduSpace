-- Migration to add active_chat_count column for load-balanced staff assignment
ALTER TABLE users ADD COLUMN IF NOT EXISTS active_chat_count INT DEFAULT 0;
