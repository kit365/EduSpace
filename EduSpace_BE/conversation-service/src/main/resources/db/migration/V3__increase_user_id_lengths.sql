-- =============================================
-- V3: Increase User ID column lengths to support Guest IDs (GUEST-uuid)
-- Guest IDs are currently 42 characters, but were limited to 36.
-- =============================================

-- Conversations table
ALTER TABLE conversations ALTER COLUMN user1_id TYPE VARCHAR(100);
ALTER TABLE conversations ALTER COLUMN user2_id TYPE VARCHAR(100);

-- Chat Messages table
ALTER TABLE chat_messages ALTER COLUMN sender_id TYPE VARCHAR(100);

-- Video Calls table
ALTER TABLE video_calls ALTER COLUMN caller_id TYPE VARCHAR(100);
ALTER TABLE video_calls ALTER COLUMN receiver_id TYPE VARCHAR(100);
