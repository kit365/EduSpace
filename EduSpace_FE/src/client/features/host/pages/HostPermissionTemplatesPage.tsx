import { useMemo } from 'react';
import { RentalLayout } from '../../../layouts/RentalLayout';
import { PermissionTemplatesView } from '@/admin/features/user-management/components/PermissionTemplatesView';
import { hostRbacService } from '@/admin/features/user-management/services/roleService';
import { useAuthStore } from '@/stores/authStore';
import { hasHostPermission } from '@/utils/keycloakTokenRoles';
import { hostPermissions } from '../permissions/hostPermissions';

/**
 * Bộ quyền (template) — Partner Portal (/rental).
 * Host: tạo/sửa/xóa; Manager: chỉ xem (token realm MANAGER, không có HOST).
 */
export function HostPermissionTemplatesPage() {
    const accessToken = useAuthStore((s) => s.accessToken);
    const hostPermissionsFromAccount = useAuthStore((s) => s.hostPermissionsFromAccount);
    const canManage = useMemo(
        () => hasHostPermission(accessToken, hostPermissions.rbacTemplate.manage, hostPermissionsFromAccount),
        [accessToken, hostPermissionsFromAccount],
    );

    return (
        <RentalLayout title="Bộ quyền">
            <PermissionTemplatesView
                rbac={hostRbacService}
                canManage={canManage}
                leadText="Đặt tên và chọn quyền theo nhóm. Host tạo/sửa; Manager chỉ xem danh sách."
            />
        </RentalLayout>
    );
}
