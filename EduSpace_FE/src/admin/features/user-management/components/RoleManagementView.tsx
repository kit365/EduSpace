import { useState } from 'react';
import { useRoles } from '../hooks/useRoles';
import { useUsers } from '../hooks/useUsers';
import { roleNameToFilterValue } from '../services/userService';
import { Shield, Key, ChevronDown, ChevronUp, Users, X, Lock } from 'lucide-react';
import { Role } from '@/types';
import { partnerPortalPermissionKeysAll } from '../utils/hostConsolePermissionKeys';
import { useTranslation } from 'react-i18next';
import { getPermissionDisplayName } from '../utils/permissionDisplayI18n';

interface RoleManagementViewProps {
    onViewDetail: (role: Role) => void;
}

export function RoleManagementView({ onViewDetail }: RoleManagementViewProps) {
    const { i18n } = useTranslation();
    const isVi = i18n.language?.toLowerCase().startsWith('vi');
    const { roles, loading } = useRoles();
    const [expandedRoleId, setExpandedRoleId] = useState<string | number | null>(null);
    const [membersRole, setMembersRole] = useState<Role | null>(null);

    const isAdminRole = (role: Role) => (role.name ?? '').toUpperCase() === 'ADMIN';
    const isManagerRole = (role: Role) => (role.name ?? '').toUpperCase() === 'MANAGER';
    const isAdminOrStaffRole = (role: Role) => {
        const key = (role.name ?? '').toUpperCase();
        return key === 'ADMIN' || key === 'STAFF';
    };

    const toggleExpand = (role: Role) => {
        if (isAdminRole(role)) return; // ADMIN là quyền tối cao: không chỉnh sửa được
        const visiblePermissions = (role.permissions ?? []).filter((perm) =>
            partnerPortalPermissionKeysAll.has((perm.name ?? '').trim().toLowerCase()),
        );
        if (visiblePermissions.length === 0) return;

        setExpandedRoleId((prev) => (prev === role.id ? null : role.id));
    };

    const isExpanded = (role: Role) => expandedRoleId === role.id && !isAdminRole(role);

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <p className="text-gray-400 font-medium">Loading roles...</p>
                ) : (
                    (roles ?? [])
                        .filter((role: Role) => !isManagerRole(role)) // MANAGER là tenant-level: Platform Admin không quản lý
                        .filter((role: Role) => !isAdminOrStaffRole(role)) // Ẩn card ADMIN và STAFF khỏi tab Vai trò
                        .map((role: Role) => (
                        <div key={role.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all flex flex-col">
                            <div className="flex items-center justify-between mb-2">
                                <span className="p-3 rounded-xl bg-slate-100">
                                    <Shield className="w-6 h-6 text-slate-600" />
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setMembersRole(role)}
                                    className="text-xs font-bold text-gray-500 bg-gray-50 hover:bg-gray-100 px-2 py-1 rounded-lg uppercase tracking-wider transition-colors"
                                >
                                    {role.userCount ?? 0} Members
                                </button>
                            </div>
                            <h3 className="text-xl font-black text-gray-900 mb-4">{role.name}</h3>

                            {isExpanded(role) && (
                                <div className="space-y-2 mb-4 flex-1 min-h-0">
                                    {(role.permissions ?? [])
                                        .filter((perm) => partnerPortalPermissionKeysAll.has((perm.name ?? '').trim().toLowerCase()))
                                        .map((perm) => (
                                        <div key={perm.id} className="flex items-center gap-2 text-xs font-medium text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
                                            <Key className="w-3 h-3 text-gray-400 shrink-0" />
                                            {getPermissionDisplayName(perm.name, i18n.language)}
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="flex gap-2 mt-auto">
                                <button
                                    type="button"
                                    onClick={() => toggleExpand(role)}
                                    disabled={isAdminRole(role)}
                                    title={isAdminRole(role) ? 'Quyền tối cao không thể chỉnh sửa' : undefined}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isAdminRole(role) && <Lock className="w-4 h-4" />}
                                    {isExpanded(role) ? (
                                        <>
                                            {isVi ? 'Thu gọn' : 'Collapse'} <ChevronUp className="w-4 h-4" />
                                        </>
                                    ) : (
                                        <>
                                            {isVi ? 'Xem quyền' : 'View permissions'} <ChevronDown className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={isAdminRole(role) ? undefined : () => onViewDetail(role)}
                                    disabled={isAdminRole(role)}
                                    title={isAdminRole(role) ? 'Quyền tối cao không thể chỉnh sửa' : undefined}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isAdminRole(role) && <Lock className="w-4 h-4" />}
                                    {isVi ? 'Xem chi tiết' : 'View details'}
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {membersRole && (
                <MembersModal
                    role={membersRole}
                    onClose={() => setMembersRole(null)}
                />
            )}
        </>
    );
}

function MembersModal({ role, onClose }: { role: Role; onClose: () => void }) {
    const filterValue = roleNameToFilterValue(role.name);
    const { users, loading, pagination, setParams } = useUsers({
        page: 0,
        size: 10,
        role: filterValue,
    });
    const { i18n } = useTranslation();
    const isVi = i18n.language?.toLowerCase().startsWith('vi');

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[80vh] flex flex-col">
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-gray-500" />
                        <h3 className="text-lg font-bold text-gray-900">
                            {isVi ? 'Thành viên' : 'Members'} · {role.name}
                        </h3>
                    </div>
                    <button type="button" onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <p className="text-gray-400 text-sm">{isVi ? 'Đang tải...' : 'Loading...'}</p>
                    ) : users.length === 0 ? (
                        <p className="text-gray-500 text-sm">{isVi ? 'Chưa có thành viên nào.' : 'No members found.'}</p>
                    ) : (
                        <ul className="space-y-2">
                            {users.map((u) => (
                                <li key={u.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                                    <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-600">
                                        {(u.name ?? '-').charAt(0)}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="font-medium text-gray-900 truncate">{u.name ?? '-'}</p>
                                        <p className="text-xs text-gray-500 truncate">{u.email}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                {pagination && pagination.totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 p-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={() => setParams((p) => ({ ...p, page: (p.page ?? 0) - 1 }))}
                            disabled={pagination.page === 0}
                            className="px-3 py-1 rounded-lg border border-gray-200 text-sm font-medium disabled:opacity-50"
                        >
                            {isVi ? 'Trước' : 'Previous'}
                        </button>
                        <span className="text-xs text-gray-500">
                            {pagination.page + 1} / {pagination.totalPages}
                        </span>
                        <button
                            type="button"
                            onClick={() => setParams((p) => ({ ...p, page: (p.page ?? 0) + 1 }))}
                            disabled={pagination.page >= pagination.totalPages - 1}
                            className="px-3 py-1 rounded-lg border border-gray-200 text-sm font-medium disabled:opacity-50"
                        >
                            {isVi ? 'Sau' : 'Next'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
