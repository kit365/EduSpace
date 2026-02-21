import { AdminLayout } from '../../../layouts/AdminLayout';
import { UserManagementView } from '../components/UserManagementView';

export function UserManagementPage() {
    return (
        <AdminLayout title="User Management">
            <UserManagementView />
        </AdminLayout>
    );
}
