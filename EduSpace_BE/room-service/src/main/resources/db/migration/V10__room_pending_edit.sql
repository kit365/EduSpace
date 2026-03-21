-- Chỉnh sửa phòng: lưu payload JSON chờ admin duyệt; phòng hiển thị vẫn là bản cũ cho đến khi duyệt.
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS pending_edit_payload TEXT;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS pending_edit_status VARCHAR(30);
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS pending_edit_rejection_note TEXT;
