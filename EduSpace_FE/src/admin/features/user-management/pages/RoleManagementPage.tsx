import { useState } from 'react';
import { AdminLayout } from '../../../layouts/AdminLayout';
import { RoleManagementView } from '../components/RoleManagementView';
import { RolePermissionsDetailView } from '../components/RolePermissionsDetailView';
import { UserRoleTabs } from '../components/UserRoleTabs';
import { Role } from '@/types';

export function RoleManagementPage() {
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);

    return (
        <AdminLayout title={selectedRole ? `Chi tiết · ${selectedRole.name}` : 'Quản lý tài khoản'}>
            <UserRoleTabs />
            {selectedRole ? (
                <RolePermissionsDetailView 
                    role={selectedRole} 
                    onBack={() => setSelectedRole(null)} 
                />
            ) : (
                <RoleManagementView onViewDetail={(role) => setSelectedRole(role)} />
            )}
        </AdminLayout>
    );
}
