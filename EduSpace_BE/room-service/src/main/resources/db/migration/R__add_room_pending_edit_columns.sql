-- Repeatable: bù cột nếu DB đã ghi V10 từ script cũ (checksum khác) nên chưa có các cột pending_edit.
-- An toàn với DB mới (đã có cột sau V10) nhờ IF NOT EXISTS.
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS pending_edit_payload TEXT;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS pending_edit_status VARCHAR(30);
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS pending_edit_rejection_note TEXT;
