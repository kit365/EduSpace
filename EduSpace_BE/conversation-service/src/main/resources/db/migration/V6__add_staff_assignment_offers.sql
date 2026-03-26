CREATE TABLE staff_assignment_offers (
    offer_id                 VARCHAR(36) PRIMARY KEY,
    conversation_id          VARCHAR(36) NOT NULL,
    saga_id                  VARCHAR(36) NOT NULL,
    staff_id                 VARCHAR(100) NOT NULL,
    status                   VARCHAR(20) NOT NULL,
    expires_at               TIMESTAMP NOT NULL,
    created_at               TIMESTAMP NOT NULL DEFAULT NOW(),
    accepted_at              TIMESTAMP,
    CONSTRAINT fk_staff_offer_conversation
        FOREIGN KEY (conversation_id)
            REFERENCES conversations(conversation_id)
            ON DELETE CASCADE
);

CREATE INDEX idx_staff_offer_conversation_status
    ON staff_assignment_offers(conversation_id, status);

CREATE INDEX idx_staff_offer_status_expires
    ON staff_assignment_offers(status, expires_at);
