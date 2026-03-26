import { useState } from 'react';
import { AdminLayout } from '../../../layouts/AdminLayout';
import { RoleManagementView } from '../components/RoleManagementView';
import { RolePermissionsDetailView } from '../components/RolePermissionsDetailView';
import { UserRoleTabs } from '../components/UserRoleTabs';
import { PermissionCatalogView } from '../components/PermissionCatalogView';
import { Role } from '@/types';
import { useTranslation } from 'react-i18next';

export function RoleManagementPage() {
    const { i18n } = useTranslation();
    const isVi = i18n.language?.toLowerCase().startsWith('vi');
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [view, setView] = useState<'roles' | 'permissions'>('roles');

    const title = selectedRole
        ? `${isVi ? 'Chi tiết ·' : 'Details ·'} ${selectedRole.name}`
        : view === 'permissions'
          ? isVi
              ? 'Danh mục quyền'
              : 'Permission catalog'
          : isVi
            ? 'Quản lý tài khoản'
            : 'Account management';

    return (
        <AdminLayout title={title}>
            <UserRoleTabs />
            <div className="flex gap-2 mb-6 border-b border-gray-200">
                <button
                    type="button"
                    onClick={() => setView('roles')}
                    className={`px-5 py-3 text-sm font-bold border-b-2 transition-colors -mb-px ${
                        view === 'roles'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                    {isVi ? 'Vai trò' : 'Roles'}
                </button>
                <button
                    type="button"
                    onClick={() => {
                        setSelectedRole(null);
                        setView('permissions');
                    }}
                    className={`px-5 py-3 text-sm font-bold border-b-2 transition-colors -mb-px ${
                        view === 'permissions'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                    {isVi ? 'Danh mục quyền' : 'Permission catalog'}
                </button>
            </div>

            {view === 'permissions' ? (
                <PermissionCatalogView />
            ) : selectedRole ? (
                <RolePermissionsDetailView
                    role={selectedRole}
                    onBack={() => setSelectedRole(null)}
                    onRoleUpdated={(r) => setSelectedRole(r)}
                />
            ) : (
                <RoleManagementView onViewDetail={(role) => setSelectedRole(role)} />
            )}
        </AdminLayout>
    );
}
