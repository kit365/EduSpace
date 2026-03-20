import { AdminLayout } from '../../../layouts/AdminLayout';
import { UserManagementView } from '../components/UserManagementView';
import { UserRoleTabs } from '../components/UserRoleTabs';

export function UserManagementPage() {
    return (
        <AdminLayout title="Quản lý tài khoản">
            <UserRoleTabs />
            <UserManagementView />
        </AdminLayout>
    );
}
