-- Đơn đăng ký đối tác cho thuê (host): user gửi → admin duyệt/từ chối
CREATE TABLE IF NOT EXISTS host_partner_applications (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         VARCHAR(36)     NOT NULL REFERENCES users (user_id) ON DELETE CASCADE,
    applicant_type  VARCHAR(32)     NOT NULL,
    full_name       VARCHAR(255)    NOT NULL,
    phone           VARCHAR(50),
    email           VARCHAR(255)    NOT NULL,
    address         TEXT,
    message         TEXT,
    status          VARCHAR(20)     NOT NULL DEFAULT 'PENDING',
    admin_note      TEXT,
    reviewed_at     TIMESTAMP,
    reviewed_by     VARCHAR(255),
    created_at      TIMESTAMP       DEFAULT NOW(),
    updated_at      TIMESTAMP       DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_host_partner_app_user ON host_partner_applications (user_id);
CREATE INDEX IF NOT EXISTS idx_host_partner_app_status ON host_partner_applications (status);

-- Mỗi user chỉ một đơn PENDING
CREATE UNIQUE INDEX IF NOT EXISTS uq_host_partner_app_user_pending
    ON host_partner_applications (user_id)
    WHERE status = 'PENDING';
