import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Users, Shield } from 'lucide-react';

export function UserRoleTabs() {
    const { t } = useTranslation();
    return (
        <div className="flex gap-2 mb-8 border-b border-gray-100">
            <NavLink
                to="/admin/users"
                className={({ isActive }) =>
                    `flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all -mb-px ${
                        isActive
                            ? 'border-slate-900 text-slate-900'
                            : 'border-transparent text-gray-400 hover:text-gray-900'
                    }`
                }
            >
                <Users className="w-4 h-4" />
                {t('admin_management.users') || 'Người dùng'}
            </NavLink>
            <NavLink
                to="/admin/roles"
                className={({ isActive }) =>
                    `flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all -mb-px ${
                        isActive
                            ? 'border-slate-900 text-slate-900'
                            : 'border-transparent text-gray-400 hover:text-gray-900'
                    }`
                }
            >
                <Shield className="w-4 h-4" />
                {t('admin_management.roles_and_permissions') || 'Vai trò & quyền'}
            </NavLink>
        </div>
    );
}
