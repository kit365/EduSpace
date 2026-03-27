import { useEffect, useMemo, useState } from 'react';
import { Key, Loader2, Save, X } from 'lucide-react';
import type { Permission } from '@/types';
import {
    getPermissionDisplayDescription,
    getPermissionDisplayName,
    getPermissionGroupDisplayName,
} from '@/admin/features/user-management/utils/permissionDisplayI18n';

type ActionFilter = 'all' | 'view' | 'create' | 'edit' | 'delete';

const MANAGER_ALLOWED_PERMISSION_NAMES = new Set([
    'view_dashboard',
    'branch.branch.view',
    'branch.booking.view',
    'branch.booking.manage',
    'branch.room.view',
    'branch.room.edit',
    'branch.checkin.manage',
    'branch.checkout.manage',
    'branch.room_status.manage',
    'branch.profile.view',
    'view_messages',
    'manage_messages',
    'branch.cleaning.manage',
    'branch.maintenance.manage',
]);

type Props = {
    isVi: boolean;
    open: boolean;
    managerName: string;
    permissionCatalog: Permission[];
    initialPermissionNames: string[];
    saving?: boolean;
    onClose: () => void;
    onSave: (permissionIds: number[]) => void;
};

function groupPermissions(perms: Permission[]): Record<string, Permission[]> {
    return perms.reduce((acc, perm) => {
        const group = perm.groupName ?? 'Other';
        if (!acc[group]) acc[group] = [];
        acc[group].push(perm);
        return acc;
    }, {} as Record<string, Permission[]>);
}

export function ManagerPermissionsEditorModal({
    isVi,
    open,
    managerName,
    permissionCatalog,
    initialPermissionNames,
    saving,
    onClose,
    onSave,
}: Props) {
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [defaultIds, setDefaultIds] = useState<Set<number>>(new Set());
    const [actionFilter, setActionFilter] = useState<ActionFilter>('all');
    const allowedCatalog = useMemo(
        () => (permissionCatalog ?? []).filter((p) => MANAGER_ALLOWED_PERMISSION_NAMES.has((p.name ?? '').trim().toLowerCase())),
        [permissionCatalog],
    );

    useEffect(() => {
        if (!open) return;
        const selectedNames = new Set((initialPermissionNames ?? []).map((n) => (n ?? '').trim().toLowerCase()));
        const next = new Set(
            allowedCatalog
                .filter((p) => selectedNames.has((p.name ?? '').trim().toLowerCase()))
                .map((p) => p.id),
        );
        setSelectedIds(next);
        setDefaultIds(new Set(next));
        setActionFilter('all');
    }, [open, initialPermissionNames, allowedCatalog]);

    const matchesActionFilter = (permissionName: string): boolean => {
        if (actionFilter === 'all') return true;
        const n = (permissionName ?? '').trim();
        if (n.endsWith(`.${actionFilter}`)) return true;
        return n.startsWith(`${actionFilter}_`);
    };

    const grouped = useMemo(() => {
        const filtered = allowedCatalog.filter((p) => matchesActionFilter(p.name));
        return Object.entries(groupPermissions(filtered)).sort(([a], [b]) => a.localeCompare(b));
    }, [allowedCatalog, actionFilter]);

    const togglePerm = (id: number) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const toggleGroup = (ids: number[], checked: boolean) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            ids.forEach((id) => {
                if (checked) next.add(id);
                else next.delete(id);
            });
            return next;
        });
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-5xl max-h-[88vh] flex flex-col">
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">
                            {isVi ? 'Chi tiết quyền · MANAGER' : 'Permission details · MANAGER'}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">{managerName}</p>
                    </div>
                    <button type="button" onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="p-4 border-b border-gray-100 flex flex-wrap gap-2">
                    {(['all', 'view', 'create', 'edit', 'delete'] as ActionFilter[]).map((key) => (
                        <button
                            key={key}
                            type="button"
                            onClick={() => setActionFilter(key)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                                actionFilter === key
                                    ? 'border-gray-900 bg-gray-900 text-white'
                                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            {key === 'all'
                                ? isVi
                                    ? 'Tất cả action'
                                    : 'All actions'
                                : key === 'view'
                                  ? isVi
                                      ? 'Xem'
                                      : 'VIEW'
                                  : key === 'create'
                                    ? isVi
                                        ? 'Tạo'
                                        : 'CREATE'
                                    : key === 'edit'
                                      ? isVi
                                          ? 'Sửa'
                                          : 'EDIT'
                                      : isVi
                                        ? 'Xóa'
                                        : 'DELETE'}
                        </button>
                    ))}
                </div>

                <div className="p-4 overflow-y-auto space-y-6">
                    {grouped.length === 0 ? (
                        <div className="text-sm text-gray-500 py-8 text-center">
                            {isVi ? 'Không có quyền phù hợp bộ lọc.' : 'No permissions match the selected filter.'}
                        </div>
                    ) : (
                        grouped.map(([groupName, permissions]) => {
                            const ids = permissions.map((p) => p.id);
                            const allOn = ids.length > 0 && ids.every((id) => selectedIds.has(id));
                            return (
                                <div key={groupName}>
                                    <label className="flex items-center gap-2 mb-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={allOn}
                                            onChange={() => toggleGroup(ids, !allOn)}
                                            className="rounded border-gray-300"
                                        />
                                        <span className="text-sm font-bold text-gray-800">
                                            {getPermissionGroupDisplayName(groupName, isVi ? 'vi' : 'en')}
                                        </span>
                                    </label>
                                    <ul className="ml-6 space-y-1.5">
                                        {permissions
                                            .slice()
                                            .sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''))
                                            .map((perm) => {
                                                const desc = getPermissionDisplayDescription(
                                                    perm.name,
                                                    perm.description ?? '',
                                                    isVi ? 'vi' : 'en',
                                                );
                                                return (
                                                    <li key={perm.id}>
                                                        <label className="flex items-start gap-2 cursor-pointer text-sm">
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedIds.has(perm.id)}
                                                                onChange={() => togglePerm(perm.id)}
                                                                className="mt-0.5 rounded border-gray-300"
                                                            />
                                                            <span>
                                                                <span className="text-sm text-gray-800 font-medium flex items-center gap-1">
                                                                    <Key className="w-3.5 h-3.5 text-gray-400" />
                                                                    {getPermissionDisplayName(perm.name, isVi ? 'vi' : 'en')}
                                                                </span>
                                                                {desc ? (
                                                                    <span className="block text-xs text-gray-500">{desc}</span>
                                                                ) : null}
                                                            </span>
                                                        </label>
                                                    </li>
                                                );
                                            })}
                                    </ul>
                                </div>
                            );
                        })
                    )}
                </div>

                <div className="p-4 border-t border-gray-100 flex justify-end gap-2">
                    <button
                        type="button"
                        disabled={saving}
                        onClick={() => setSelectedIds(new Set(defaultIds))}
                        className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 text-sm font-bold hover:bg-gray-50 disabled:opacity-60"
                    >
                        {isVi ? 'Mặc định' : 'Reset'}
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 text-sm font-bold"
                    >
                        {isVi ? 'Đóng' : 'Close'}
                    </button>
                    <button
                        type="button"
                        disabled={saving}
                        onClick={() => onSave(Array.from(selectedIds))}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-900 text-white text-sm font-bold hover:bg-red-600 disabled:opacity-60"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {isVi ? 'Lưu' : 'Save'}
                    </button>
                </div>
            </div>
        </div>
    );
}

