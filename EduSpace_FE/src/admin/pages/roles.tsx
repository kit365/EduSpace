import { AdminLayout } from '../layouts/AdminLayout';
import { RoleManagementView } from '../features/user-management';

export default function RolesPage() {
    return (
        <AdminLayout title="Roles & Permissions">
            <RoleManagementView />
        </AdminLayout>
    );
}
