import { AdminLayout } from '../../../layouts/AdminLayout';
import { RoleManagementView } from '../components/RoleManagementView';

export function RoleManagementPage() {
    return (
        <AdminLayout title="Roles & Permissions">
            <RoleManagementView />
        </AdminLayout>
    );
}
