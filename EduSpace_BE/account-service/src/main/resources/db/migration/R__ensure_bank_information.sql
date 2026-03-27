-- Safety migration for local/dev databases where V16 history drifted:
-- ensure bank_information exists even when old versioned migration checksum changed.
CREATE TABLE IF NOT EXISTS bank_information (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(36),
    booking_id BIGINT,
    order_id VARCHAR(36),
    user_email VARCHAR(255),
    account_number VARCHAR(50) NOT NULL,
    account_holder_name VARCHAR(255) NOT NULL,
    bank_code VARCHAR(50) NOT NULL,
    bank_name VARCHAR(255) NOT NULL,
    account_type VARCHAR(50) NOT NULL DEFAULT 'CUSTOMER',
    vietqr_image_url TEXT,
    is_verify BOOLEAN NOT NULL DEFAULT FALSE,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    note TEXT,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP(6) NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP(6) NOT NULL DEFAULT NOW(),
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

CREATE INDEX IF NOT EXISTS idx_bank_information_user_id ON bank_information (user_id);
CREATE INDEX IF NOT EXISTS idx_bank_information_booking_id ON bank_information (booking_id);
CREATE INDEX IF NOT EXISTS idx_bank_information_order_id ON bank_information (order_id);
CREATE INDEX IF NOT EXISTS idx_bank_information_user_email ON bank_information (user_email);
CREATE INDEX IF NOT EXISTS idx_bank_information_bank_code ON bank_information (bank_code);
CREATE INDEX IF NOT EXISTS idx_bank_information_account_type ON bank_information (account_type);

CREATE UNIQUE INDEX IF NOT EXISTS uq_bank_information_default_per_user
    ON bank_information (user_id)
    WHERE user_id IS NOT NULL AND is_default = TRUE AND is_deleted = FALSE;

CREATE UNIQUE INDEX IF NOT EXISTS uq_bank_information_system
    ON bank_information (account_type)
    WHERE account_type = 'SYSTEM' AND is_deleted = FALSE;
