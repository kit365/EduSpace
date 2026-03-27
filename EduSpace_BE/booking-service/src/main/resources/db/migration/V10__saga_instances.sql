CREATE TABLE IF NOT EXISTS saga_instances (
    saga_id VARCHAR(36) PRIMARY KEY,
    saga_type VARCHAR(120) NOT NULL,
    status VARCHAR(20) NOT NULL,
    current_step VARCHAR(120),
    payload TEXT,
    started_at TIMESTAMP NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_saga_instances_status ON saga_instances (status);
