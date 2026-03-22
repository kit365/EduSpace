-- =============================================
-- V1: Initialize Conversation Service Schema
-- =============================================

-- Needed for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE conversations (
    conversation_id         VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    saga_id                 VARCHAR(36),
    user1_id                VARCHAR(36) NOT NULL,
    user2_id                VARCHAR(36) NOT NULL,
    conversation_name       VARCHAR(255),
    is_active               BOOLEAN     DEFAULT TRUE,
    is_admin_conversation   BOOLEAN     DEFAULT FALSE,
    video_call_enabled      BOOLEAN     DEFAULT TRUE,
    total_message_count     INTEGER     DEFAULT 0,
    call_history_count      INTEGER     DEFAULT 0,
    created_at              TIMESTAMP   DEFAULT NOW(),
    last_activity           TIMESTAMP   DEFAULT NOW(),
    blocked_by_user1        BOOLEAN     DEFAULT FALSE,
    blocked_by_user2        BOOLEAN     DEFAULT FALSE
);

CREATE INDEX idx_conversations_user1_id ON conversations(user1_id);
CREATE INDEX idx_conversations_user2_id ON conversations(user2_id);
CREATE INDEX idx_conversations_last_activity ON conversations(last_activity);

CREATE TABLE chat_messages (
    message_id              VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    conversation_id         VARCHAR(36) NOT NULL,
    sender_id               VARCHAR(36) NOT NULL,
    content                 TEXT,
    message_type            VARCHAR(30) NOT NULL,
    sent_at                 TIMESTAMP   DEFAULT NOW(),

    -- media
    media_url               TEXT,
    media_type              VARCHAR(50),
    media_size              BIGINT,

    -- status
    is_read                 BOOLEAN     DEFAULT FALSE,
    read_at                 TIMESTAMP,
    edited_at               TIMESTAMP,
    is_deleted              BOOLEAN     DEFAULT FALSE,
    deleted_at              TIMESTAMP,

    reactions               TEXT,
    reply_to_message_id     VARCHAR(36),

    CONSTRAINT fk_chat_messages_conversation
        FOREIGN KEY (conversation_id)
            REFERENCES conversations(conversation_id)
            ON DELETE CASCADE
);

CREATE INDEX idx_chat_messages_conversation_sent_at ON chat_messages(conversation_id, sent_at DESC);
CREATE INDEX idx_chat_messages_sender_id ON chat_messages(sender_id);
CREATE INDEX idx_chat_messages_reply_to ON chat_messages(reply_to_message_id);

CREATE TABLE video_calls (
    call_id                 VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    call_session_id         VARCHAR(60) NOT NULL UNIQUE,
    conversation_id         VARCHAR(36) NOT NULL,
    caller_id               VARCHAR(36) NOT NULL,
    receiver_id             VARCHAR(36) NOT NULL,
    call_status             VARCHAR(30) NOT NULL,
    started_at              TIMESTAMP   DEFAULT NOW(),
    ended_at                TIMESTAMP,
    duration_minutes        INTEGER,
    end_reason              VARCHAR(255),
    is_successful           BOOLEAN     DEFAULT FALSE,

    CONSTRAINT fk_video_calls_conversation
        FOREIGN KEY (conversation_id)
            REFERENCES conversations(conversation_id)
            ON DELETE CASCADE
);

CREATE INDEX idx_video_calls_conversation ON video_calls(conversation_id);
CREATE INDEX idx_video_calls_caller ON video_calls(caller_id);
CREATE INDEX idx_video_calls_receiver ON video_calls(receiver_id);

-- Transactional Outbox for Saga/Event publishing
CREATE TABLE outbox_events (
    outbox_id               BIGSERIAL PRIMARY KEY,
    aggregate_type          VARCHAR(100) NOT NULL,
    aggregate_id            VARCHAR(60)  NOT NULL,
    event_type              VARCHAR(120) NOT NULL,
    payload                 TEXT         NOT NULL,
    status                  VARCHAR(20)  NOT NULL DEFAULT 'PENDING',
    created_at              TIMESTAMP    NOT NULL DEFAULT NOW(),
    available_at            TIMESTAMP    NOT NULL DEFAULT NOW(),
    sent_at                 TIMESTAMP,
    attempts                INTEGER      NOT NULL DEFAULT 0,
    last_error              TEXT
);

CREATE INDEX idx_outbox_status_available ON outbox_events(status, available_at);

-- Saga instance tracking
CREATE TABLE saga_instances (
    saga_id                 VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    saga_type               VARCHAR(120) NOT NULL,
    status                  VARCHAR(20)  NOT NULL,
    current_step            VARCHAR(120),
    payload                 TEXT,
    started_at              TIMESTAMP    NOT NULL DEFAULT NOW(),
    completed_at            TIMESTAMP
);

