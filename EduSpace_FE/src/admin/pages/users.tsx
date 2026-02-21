import { AdminLayout } from '../layouts/AdminLayout';
import { UserManagementView } from '../features/user-management';

export default function UsersPage() {
    return (
        <AdminLayout title="User Management">
            <UserManagementView />
        </AdminLayout>
    );
}
