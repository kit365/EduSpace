import { NavLink } from 'react-router-dom';
import { Users, Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function UserRoleTabs() {
    const { i18n } = useTranslation();
    const isVi = i18n.language?.toLowerCase().startsWith('vi');
    return (
        <div className="flex gap-2 mb-8 border-b border-gray-200">
            <NavLink
                to="/admin/users"
                className={({ isActive }) =>
                    `flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-colors -mb-px ${
                        isActive
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`
                }
            >
                <Users className="w-4 h-4" />
                {isVi ? 'Người dùng' : 'Users'}
            </NavLink>
            <NavLink
                to="/admin/roles"
                className={({ isActive }) =>
                    `flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-colors -mb-px ${
                        isActive
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`
                }
            >
                <Shield className="w-4 h-4" />
                {isVi ? 'Vai trò & quyền' : 'Roles & Permissions'}
            </NavLink>
        </div>
    );
}
