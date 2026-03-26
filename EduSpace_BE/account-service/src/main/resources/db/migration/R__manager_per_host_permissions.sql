ALTER TABLE host_staff_links
    ADD COLUMN IF NOT EXISTS manager_permission_names TEXT NULL;

-- Default manager permission bundle (per-host template, least privilege than HOST)
-- Note: CSV format, lowercase permission keys.
DO $$
DECLARE
    v_default TEXT := 'view_dashboard,branch.branch.view,branch.booking.view,branch.booking.manage,branch.room.view,branch.room.edit,branch.checkin.manage,branch.checkout.manage,branch.room_status.manage,branch.profile.view,view_messages,manage_messages';
BEGIN
    UPDATE host_staff_links hsl
    SET manager_permission_names = v_default
    WHERE (hsl.manager_permission_names IS NULL OR btrim(hsl.manager_permission_names) = '')
      AND EXISTS (
          SELECT 1
          FROM users_roles ur
          JOIN roles r ON r.id = ur.role_id
          WHERE ur.user_id = hsl.staff_user_id
            AND upper(r.name) = 'MANAGER'
      );
END $$;

