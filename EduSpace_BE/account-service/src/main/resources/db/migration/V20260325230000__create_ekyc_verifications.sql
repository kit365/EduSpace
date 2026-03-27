CREATE TABLE IF NOT EXISTS ekyc_verifications (
    id                  VARCHAR(36)     PRIMARY KEY,
    user_id             VARCHAR(36)     NOT NULL,
    status              VARCHAR(32)     NOT NULL,
    id_number_hash      VARCHAR(64),
    face_distance       DOUBLE PRECISION,
    liveness_score      DOUBLE PRECISION,
    face_verified       BOOLEAN,
    liveness_passed     BOOLEAN,
    failure_reason      VARCHAR(500),
    created_at          TIMESTAMP       DEFAULT NOW(),
    updated_at          TIMESTAMP       DEFAULT NOW(),
    created_by          VARCHAR(255),
    updated_by          VARCHAR(255),
    CONSTRAINT fk_ekyc_verifications_user
        FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_ekyc_verifications_user_id ON ekyc_verifications (user_id);
