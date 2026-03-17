import { useState } from 'react';
import { ArrowLeft, Key, Users } from 'lucide-react';
import { Role } from '@/types';
import { useUsers } from '../hooks/useUsers';
import { roleNameToFilterValue } from '../services/userService';

interface RolePermissionsDetailViewProps {
    role: Role;
    onBack: () => void;
}

type Tab = 'permissions' | 'members';

export function RolePermissionsDetailView({ role, onBack }: RolePermissionsDetailViewProps) {
    const [tab, setTab] = useState<Tab>('permissions');
    const perms = role.permissions ?? [];
    const permissionGroups = perms.reduce((acc, perm) => {
        const group = perm.groupName ?? 'Other';
        if (!acc[group]) acc[group] = [];
        acc[group].push(perm);
        return acc;
    }, {} as Record<string, typeof perms>);
    const groups = Object.entries(permissionGroups);

    const filterValue = roleNameToFilterValue(role.name);
    const { users, loading, pagination, setParams } = useUsers({ page: 0, size: 20, role: filterValue });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    type="button"
                    onClick={onBack}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-900"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-semibold text-gray-900">{role.name}</h2>
                    <p className="text-sm text-gray-500 mt-0.5">
                        {perms.length} quyền · {role.userCount ?? 0} thành viên
                    </p>
                </div>
            </div>

            {/* Tabs: Quyền | Thành viên */}
            <div className="flex gap-2 border-b border-gray-200">
                <button
                    type="button"
                    onClick={() => setTab('permissions')}
                    className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors -mb-px ${
                        tab === 'permissions'
                            ? 'border-gray-900 text-gray-900'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <Key className="w-4 h-4 inline-block mr-2 align-middle" />
                    Quyền
                </button>
                <button
                    type="button"
                    onClick={() => setTab('members')}
                    className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors -mb-px ${
                        tab === 'members'
                            ? 'border-gray-900 text-gray-900'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <Users className="w-4 h-4 inline-block mr-2 align-middle" />
                    Thành viên
                </button>
            </div>

            {tab === 'permissions' && (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    {groups.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 text-sm">
                            Chưa có quyền nào được gán cho role này.
                        </div>
                    ) : (
                        groups.map(([groupName, permissions]) => (
                            <div key={groupName} className="border-b border-gray-100 last:border-b-0">
                                <div className="px-4 py-3 bg-gray-50/80">
                                    <h3 className="text-sm font-medium text-gray-700">{groupName}</h3>
                                </div>
                                <ul className="divide-y divide-gray-100">
                                    {permissions.map((perm) => (
                                        <li
                                            key={perm.id}
                                            className="flex items-center gap-3 px-4 py-3 text-sm"
                                        >
                                            <Key className="w-4 h-4 text-gray-400 shrink-0" />
                                            <div className="min-w-0">
                                                <span className="font-medium text-gray-900">{perm.name}</span>
                                                {perm.description && (
                                                    <p className="text-gray-500 text-xs mt-0.5 truncate">
                                                        {perm.description}
                                                    </p>
                                                )}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))
                    )}
                </div>
            )}

            {tab === 'members' && (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    {loading ? (
                        <div className="p-8 text-center text-gray-500 text-sm">Đang tải...</div>
                    ) : users.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 text-sm">Chưa có thành viên nào.</div>
                    ) : (
                        <ul className="divide-y divide-gray-100">
                            {users.map((u) => (
                                <li key={u.id} className="flex items-center gap-3 px-4 py-3">
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
                    {pagination && pagination.totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 p-4 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={() => setParams((p) => ({ ...p, page: (p.page ?? 0) - 1 }))}
                                disabled={pagination.page === 0}
                                className="px-3 py-1 rounded-lg border border-gray-200 text-sm font-medium disabled:opacity-50"
                            >
                                Trước
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
                                Sau
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
