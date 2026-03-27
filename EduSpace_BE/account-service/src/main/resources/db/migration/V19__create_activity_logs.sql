CREATE TABLE IF NOT EXISTS activity_logs (
    id BIGSERIAL PRIMARY KEY,
    event_type VARCHAR(64) NOT NULL,
    status VARCHAR(16) NOT NULL,
    actor_user_id VARCHAR(255),
    actor_email VARCHAR(255),
    message VARCHAR(500) NOT NULL,
    ip_address VARCHAR(64),
    user_agent VARCHAR(512),
    metadata TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_event_type ON activity_logs (event_type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_status ON activity_logs (status);
CREATE INDEX IF NOT EXISTS idx_activity_logs_actor_user_id ON activity_logs (actor_user_id);
