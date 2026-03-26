-- STAFF role: operational users managed by HOST (Level-2 RBAC via user_permissions)
INSERT INTO roles (name) VALUES ('STAFF') ON CONFLICT (name) DO NOTHING;

-- No rows in roles_permissions for STAFF — effective permissions come from user_permissions.

CREATE TABLE IF NOT EXISTS host_staff_links (
    id                  BIGSERIAL       PRIMARY KEY,
    host_user_id        VARCHAR(36)     NOT NULL REFERENCES users (user_id) ON DELETE CASCADE,
    staff_user_id       VARCHAR(36)     NOT NULL UNIQUE REFERENCES users (user_id) ON DELETE CASCADE,
    branch_property_id  BIGINT          NULL,
    created_at          TIMESTAMP       DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_host_staff_links_host ON host_staff_links (host_user_id);

-- Cột chi nhánh (manager được mời theo email): thêm an toàn nếu DB đã từng chạy bản V15 cũ không có cột
ALTER TABLE host_staff_links ADD COLUMN IF NOT EXISTS branch_property_id BIGINT NULL;

CREATE TABLE IF NOT EXISTS user_permissions (
    id              BIGSERIAL       PRIMARY KEY,
    user_id         VARCHAR(36)     NOT NULL REFERENCES users (user_id) ON DELETE CASCADE,
    permission_id   BIGINT          NOT NULL REFERENCES permissions (id) ON DELETE CASCADE,
    UNIQUE (user_id, permission_id)
);

CREATE INDEX IF NOT EXISTS idx_user_permissions_user ON user_permissions (user_id);
