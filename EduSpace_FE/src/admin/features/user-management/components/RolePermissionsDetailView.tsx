import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Key, Loader2, Save, Users } from 'lucide-react';
import { Permission, PermissionTemplate, Role } from '@/types';
import { useTranslation } from 'react-i18next';
import { useUsers } from '../hooks/useUsers';
import { roleNameToFilterValue } from '../services/userService';
import { roleService } from '../services/roleService';
import { showToast } from '@/utils/toast';
import { partnerPortalPermissionKeysAll } from '../utils/hostConsolePermissionKeys';
import { guestPortalPermissionKeysAll } from '../utils/guestPortalPermissionKeys';
import {
    getPermissionDisplayDescription,
    getPermissionDisplayName,
    getPermissionGroupDisplayName,
} from '../utils/permissionDisplayI18n';

interface RolePermissionsDetailViewProps {
    role: Role;
    onBack: () => void;
    onRoleUpdated?: (role: Role) => void;
}

type Tab = 'permissions' | 'members';
type ActionFilter = 'all' | 'view' | 'create' | 'edit' | 'delete';

function groupPermissions(perms: Permission[]): Record<string, Permission[]> {
    return perms.reduce(
        (acc, perm) => {
            const group = perm.groupName ?? 'Other';
            if (!acc[group]) acc[group] = [];
            acc[group].push(perm);
            return acc;
        },
        {} as Record<string, Permission[]>
    );
}

export function RolePermissionsDetailView({ role, onBack, onRoleUpdated }: RolePermissionsDetailViewProps) {
    const { i18n } = useTranslation();
    const isVi = i18n.language?.toLowerCase().startsWith('vi');
    const [tab, setTab] = useState<Tab>('permissions');
    const [editing, setEditing] = useState(false);
    const [catalog, setCatalog] = useState<Permission[]>([]);
    const [catalogLoading, setCatalogLoading] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(() => new Set(role.permissions.map((p) => p.id)));
    const [saving, setSaving] = useState(false);
    const [templates, setTemplates] = useState<PermissionTemplate[]>([]);
    const [actionFilter, setActionFilter] = useState<ActionFilter>('all');

    const filterValue = roleNameToFilterValue(role.name);
    const { users, loading, pagination, setParams } = useUsers({ page: 0, size: 20, role: filterValue });

    const roleNumericId = Number(role.id);
    const isSuperAdmin = (role.name ?? '').toUpperCase() === 'ADMIN';

    const BOOKING_VIEW_CANONICAL = 'branch.booking.view';
    const BOOKING_MANAGE_CANONICAL = 'branch.booking.manage';
    const BOOKING_VIEW_LEGACY_KEYS = new Set(['view_bookings', 'view-bookings']);
    const BOOKING_MANAGE_LEGACY_KEYS = new Set(['manage_bookings', 'manage-bookings']);
    // Hide legacy keys that are not used as direct Host UI gates.
    const HIDDEN_LEGACY_PERMISSION_KEYS = new Set([
        'manage_ads',
        'manage_kyc',
        'view_revenue',
        'view_transactions',
        'manage_reports',
        'edit_rooms',
        'view_rooms',
        'branch.staff.manage',
        // Legacy booking keys — Host dùng branch.booking.*; ẩn hẳn khỏi UI HOST/MANAGER.
        'view_bookings',
        'view-bookings',
        'manage_bookings',
        'manage-bookings',
    ]);

    const isHostConsoleRole = useMemo(() => {
        const n = (role.name ?? '').toUpperCase();
        return n === 'HOST' || n === 'MANAGER';
    }, [role.name]);

    const isGuestRole = useMemo(() => (role.name ?? '').toUpperCase() === 'GUEST', [role.name]);

    const defaultTemplate = useMemo(() => {
        const n = (role.name ?? '').toUpperCase();
        if (n === 'HOST') {
            return templates.find((t) => (t.name ?? '').toUpperCase() === 'HOST_DEFAULT') ?? null;
        }
        if (n === 'GUEST') {
            return templates.find((t) => (t.name ?? '').toUpperCase() === 'GUEST_DEFAULT') ?? null;
        }
        return null;
    }, [role.name, templates]);

    const permissionGroups = useMemo(() => {
        let filteredCatalog = catalog;
        if (editing && isHostConsoleRole) {
            filteredCatalog = catalog.filter((p) => partnerPortalPermissionKeysAll.has(p.name?.trim().toLowerCase()));
        } else if (editing && isGuestRole) {
            filteredCatalog = catalog.filter((p) => guestPortalPermissionKeysAll.has(p.name?.trim().toLowerCase()));
        }

        const filteredWithoutLegacyDupes =
            editing && isHostConsoleRole
                ? filteredCatalog.filter((p) => {
                      const pn = (p.name ?? '').trim().toLowerCase();
                      if (HIDDEN_LEGACY_PERMISSION_KEYS.has(pn)) return false;
                      return true;
                  })
                : filteredCatalog;

        const sorted = [...filteredWithoutLegacyDupes].sort(
            (a, b) => a.groupName.localeCompare(b.groupName) || a.name.localeCompare(b.name)
        );
        const rawGroups = groupPermissions(sorted);
        // Gộp các group có cùng nhãn hiển thị để tránh việc UI bị “rải” nhiều header giống nhau.
        const merged: Record<string, Permission[]> = {};
        for (const [groupName, perms] of Object.entries(rawGroups)) {
            const label = getPermissionGroupDisplayName(groupName, i18n.language);
            if (!merged[label]) merged[label] = [];
            merged[label].push(...perms);
        }
        return merged;
    }, [catalog, editing, isHostConsoleRole, isGuestRole, i18n.language]);

    const loadCatalog = useCallback(async () => {
        setCatalogLoading(true);
        try {
            const [permsRes, tplsRes] = await Promise.allSettled([
                roleService.getPermissionCatalog(),
                roleService.getPermissionTemplates(),
            ]);
            if (permsRes.status === 'fulfilled') {
                setCatalog(permsRes.value);
            } else {
                console.error(permsRes.reason);
                showToast.error('Lỗi', 'Không tải được danh mục quyền.');
            }
            if (tplsRes.status === 'fulfilled') {
                setTemplates(tplsRes.value);
            } else {
                console.error(tplsRes.reason);
                showToast.error('Lỗi', 'Không tải được danh sách bộ quyền.');
            }
        } catch (e) {
            console.error(e);
            showToast.error('Lỗi', 'Không tải được dữ liệu.');
        } finally {
            setCatalogLoading(false);
        }
    }, []);

    const computeSelectedIdsFromRole = useCallback((): Set<number> => {
        const perms = role.permissions ?? [];
        const next = new Set(perms.map((p) => p.id));
        const roleHasCanonicalBookingView = perms.some(
            (p) => (p.name ?? '').trim().toLowerCase() === BOOKING_VIEW_CANONICAL
        );
        const roleHasCanonicalBookingManage = perms.some(
            (p) => (p.name ?? '').trim().toLowerCase() === BOOKING_MANAGE_CANONICAL
        );
        const viewLegacyIds = perms
            .filter((p) => BOOKING_VIEW_LEGACY_KEYS.has((p.name ?? '').trim().toLowerCase()))
            .map((p) => p.id);
        const manageLegacyIds = perms
            .filter((p) => BOOKING_MANAGE_LEGACY_KEYS.has((p.name ?? '').trim().toLowerCase()))
            .map((p) => p.id);
        if (roleHasCanonicalBookingView) viewLegacyIds.forEach((lid) => next.delete(lid));
        if (roleHasCanonicalBookingManage) manageLegacyIds.forEach((lid) => next.delete(lid));
        if (isHostConsoleRole) {
            for (const p of perms) {
                const pn = (p.name ?? '').trim().toLowerCase();
                if (HIDDEN_LEGACY_PERMISSION_KEYS.has(pn)) next.delete(p.id);
            }
        }
        if (isGuestRole) {
            for (const p of perms) {
                const pn = (p.name ?? '').trim().toLowerCase();
                if (!guestPortalPermissionKeysAll.has(pn)) next.delete(p.id);
            }
        }
        return next;
    }, [role, isHostConsoleRole, isGuestRole]);

    useEffect(() => {
        setSelectedIds(computeSelectedIdsFromRole());
    }, [computeSelectedIdsFromRole]);

    useEffect(() => {
        if (editing) void loadCatalog();
    }, [editing, loadCatalog]);

    const permissionNameById = useMemo(() => {
        const m = new Map<number, string>();
        for (const p of role.permissions ?? []) m.set(p.id, p.name);
        for (const p of catalog ?? []) m.set(p.id, p.name);
        return m;
    }, [role.permissions, catalog]);

    const bookingLegacyViewIds = useMemo(() => {
        return (role.permissions ?? [])
            .filter((p) => BOOKING_VIEW_LEGACY_KEYS.has((p.name ?? '').trim().toLowerCase()))
            .map((p) => p.id);
    }, [role.permissions]);

    const bookingLegacyManageIds = useMemo(() => {
        return (role.permissions ?? [])
            .filter((p) => BOOKING_MANAGE_LEGACY_KEYS.has((p.name ?? '').trim().toLowerCase()))
            .map((p) => p.id);
    }, [role.permissions]);

    const togglePerm = (id: number) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);

            const permName = (permissionNameById.get(id) ?? '').trim().toLowerCase();
            const isCanonicalView = permName === BOOKING_VIEW_CANONICAL;
            const isCanonicalManage = permName === BOOKING_MANAGE_CANONICAL;
            const legacyIdsToSync =
                isCanonicalView ? bookingLegacyViewIds : isCanonicalManage ? bookingLegacyManageIds : [];

            // Merge semantics:
            // - toggle canonical ON/OFF => always remove legacy ids
            if (next.has(id)) {
                next.delete(id);
                legacyIdsToSync.forEach((lid) => next.delete(lid));
            } else {
                legacyIdsToSync.forEach((lid) => next.delete(lid));
                next.add(id);
            }
            return next;
        });
    };

    const toggleGroup = (permIds: number[], checked: boolean) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            // If group includes canonical booking actions, remove legacy ids to avoid duplicates on save.
            const includesCanonicalView = permIds.some((id) => (permissionNameById.get(id) ?? '').trim().toLowerCase() === BOOKING_VIEW_CANONICAL);
            const includesCanonicalManage = permIds.some(
                (id) => (permissionNameById.get(id) ?? '').trim().toLowerCase() === BOOKING_MANAGE_CANONICAL
            );
            if (includesCanonicalView) bookingLegacyViewIds.forEach((lid) => next.delete(lid));
            if (includesCanonicalManage) bookingLegacyManageIds.forEach((lid) => next.delete(lid));

            for (const id of permIds) {
                if (checked) next.add(id);
                else next.delete(id);
            }
            return next;
        });
    };

    const handleSave = async () => {
        if (isSuperAdmin) {
            showToast.error('Lỗi', 'Quyền tối cao không thể chỉnh sửa');
            return;
        }
        if (Number.isNaN(roleNumericId)) {
            showToast.error('Lỗi', 'ID vai trò không hợp lệ.');
            return;
        }
        setSaving(true);
        try {
            const idsPayload = isHostConsoleRole
                ? Array.from(selectedIds).filter((id) => {
                      const n = (permissionNameById.get(id) ?? '').trim().toLowerCase();
                      return !HIDDEN_LEGACY_PERMISSION_KEYS.has(n);
                  })
                : isGuestRole
                  ? Array.from(selectedIds).filter((id) => {
                        const n = (permissionNameById.get(id) ?? '').trim().toLowerCase();
                        return guestPortalPermissionKeysAll.has(n);
                    })
                  : Array.from(selectedIds);
            const updated = await roleService.updateRolePermissions(roleNumericId, idsPayload);
            onRoleUpdated?.(updated);
            showToast.success('Đã lưu quyền cho vai trò');
            setEditing(false);
        } catch (e) {
            console.error(e);
            showToast.error('Lỗi', 'Không lưu được (vai trò có thể bị cấm chỉnh sửa).');
        } finally {
            setSaving(false);
        }
    };

    const handleSetDefaultPermissions = () => {
        if (!defaultTemplate) return;
        setSelectedIds(new Set(defaultTemplate.permissions.map((p) => p.id)));
    };

    const readOnlyPermissions = useMemo(() => {
        const perms = role.permissions ?? [];
        if (isHostConsoleRole) {
            return perms.filter((p) => {
                const pn = (p.name ?? '').trim().toLowerCase();
                if (HIDDEN_LEGACY_PERMISSION_KEYS.has(pn)) return false;
                return partnerPortalPermissionKeysAll.has(pn);
            });
        }
        if (isGuestRole) {
            return perms.filter((p) => guestPortalPermissionKeysAll.has((p.name ?? '').trim().toLowerCase()));
        }
        return perms;
    }, [role.permissions, isHostConsoleRole, isGuestRole]);

    const hiddenReadOnlyCount = useMemo(() => {
        if (isHostConsoleRole) {
            const total = (role.permissions ?? []).length;
            return Math.max(0, total - readOnlyPermissions.length);
        }
        if (isGuestRole) {
            const total = (role.permissions ?? []).length;
            return Math.max(0, total - readOnlyPermissions.length);
        }
        return 0;
    }, [role.permissions, readOnlyPermissions.length, isHostConsoleRole, isGuestRole]);

    const rawDisplayGroups = readOnlyPermissions.length > 0
        ? groupPermissions(readOnlyPermissions)
        : ({} as Record<string, Permission[]>);
    const matchesActionFilter = (permissionName: string): boolean => {
        if (actionFilter === 'all') return true;
        const n = (permissionName ?? '').trim();
        // Canonical keys: `branch.room.view`, `rbac.template.manage`, ...
        if (n.endsWith(`.${actionFilter}`)) return true;
        // Legacy keys (underscore): `view_dashboard`, `manage_messages`, `view_bookings`, ...
        // Make VIEW filter show `view_*`, CREATE shows `create_*`, etc.
        return n.startsWith(`${actionFilter}_`);
    };
    // Gộp các group có cùng nhãn hiển thị để tránh rải rác nhiều header.
    const groupsReadOnly = (() => {
        const merged: Record<string, Permission[]> = {};
        for (const [groupName, permissions] of Object.entries(rawDisplayGroups)) {
            const filtered = permissions.filter((p) => matchesActionFilter(p.name));
            if (filtered.length === 0) continue;
            const label = getPermissionGroupDisplayName(groupName, i18n.language);
            if (!merged[label]) merged[label] = [];
            merged[label].push(...filtered);
        }
        return Object.entries(merged);
    })();

    return (
        <div className="space-y-6">
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
                        {(role.permissions ?? []).length} quyền · {role.userCount ?? 0} thành viên
                    </p>
                </div>
                {tab === 'permissions' && (
                    <button
                        type="button"
                        disabled={isSuperAdmin}
                        title={isSuperAdmin ? (isVi ? 'Quyền tối cao không thể chỉnh sửa' : 'Super admin permissions cannot be modified') : undefined}
                        onClick={() => {
                            if (isSuperAdmin) return;
                            if (editing) {
                                setSelectedIds(computeSelectedIdsFromRole());
                            }
                            setEditing(!editing);
                        }}
                        className="px-4 py-2 rounded-xl text-sm font-bold border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {editing ? (isVi ? 'Huỷ chỉnh sửa' : 'Cancel editing') : isVi ? 'Chỉnh sửa quyền' : 'Edit permissions'}
                    </button>
                )}
            </div>

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
                    {isVi ? 'Quyền' : 'Permissions'}
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
                    {isVi ? 'Thành viên' : 'Members'}
                </button>
            </div>

            {tab === 'permissions' && (
                <div className="space-y-4">
                    {editing && (
                        <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col lg:flex-row lg:items-end gap-3">
                            <div className="flex-1 min-w-0">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                                    {i18n.language?.toLowerCase().startsWith('vi') ? 'Quyền mặc định' : 'Default permissions'}
                                </label>
                                <button
                                    type="button"
                                    disabled={saving || catalogLoading || !defaultTemplate}
                                    onClick={() => {
                                        if (!defaultTemplate) return;
                                        handleSetDefaultPermissions();
                                    }}
                                    title={
                                        !defaultTemplate
                                            ? isVi
                                                ? 'Chưa có bộ quyền mặc định (HOST_DEFAULT / GUEST_DEFAULT) trên server. Chạy migration account-service rồi tải lại.'
                                                : 'No default bundle (HOST_DEFAULT / GUEST_DEFAULT). Run account-service migrations and reload.'
                                            : undefined
                                    }
                                    className="w-full px-4 py-2.5 rounded-xl text-sm font-bold bg-gray-900 text-white hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {i18n.language?.toLowerCase().startsWith('vi') ? 'Mặc định' : 'Default'}
                                </button>
                            </div>
                        </div>
                    )}
                    <div className="flex flex-wrap gap-2">
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
                                          : key === 'delete'
                                            ? isVi
                                                ? 'Xóa'
                                                : 'DELETE'
                                            : String(key)}
                            </button>
                        ))}
                    </div>

                    {editing && catalogLoading ? (
                        <div className="flex items-center justify-center gap-2 py-12 text-gray-500">
                            <Loader2 className="w-6 h-6 animate-spin" />
                            {isVi ? 'Đang tải danh mục quyền...' : 'Loading permission catalog...'}
                        </div>
                    ) : editing ? (
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                            <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                                <span className="text-sm font-bold text-gray-700">
                                    {isVi ? 'Chọn quyền cho vai trò' : 'Select permissions for the role'}
                                </span>
                                <button
                                    type="button"
                                    disabled={saving}
                                    onClick={() => void handleSave()}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-900 text-white text-sm font-bold hover:bg-red-600 disabled:opacity-50"
                                >
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    {isVi ? 'Lưu' : 'Save'}
                                </button>
                            </div>
                            <div className="p-4 max-h-[60vh] overflow-y-auto space-y-6">
                                {Object.entries(permissionGroups).map(([groupName, permissions]) => {
                                    const filteredByAction = permissions.filter((p) => matchesActionFilter(p.name));
                                    if (filteredByAction.length === 0) return null;
                                    const ids = filteredByAction.map((p) => p.id);
                                    const allOn = ids.every((id) => selectedIds.has(id));
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
                                                    {getPermissionGroupDisplayName(groupName, i18n.language)}
                                                </span>
                                            </label>
                                            <ul className="ml-6 space-y-1.5">
                                                {filteredByAction.map((p) => {
                                                    const descLine = getPermissionDisplayDescription(
                                                        p.name,
                                                        p.description,
                                                        i18n.language,
                                                    );
                                                    return (
                                                    <li key={p.id}>
                                                        <label className="flex items-start gap-2 cursor-pointer text-sm">
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedIds.has(p.id)}
                                                                onChange={() => togglePerm(p.id)}
                                                                className="mt-0.5 rounded border-gray-300"
                                                            />
                                                            <span>
                                                                <span className="text-sm text-gray-800 font-medium">
                                                                    {getPermissionDisplayName(p.name, i18n.language)}
                                                                </span>
                                                                {descLine ? (
                                                                    <span className="block text-xs text-gray-500">
                                                                        {descLine}
                                                                    </span>
                                                                ) : null}
                                                            </span>
                                                        </label>
                                                    </li>
                                                    );
                                                })}
                                            </ul>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                            {groupsReadOnly.length === 0 ? (
                                <div className="p-8 text-center text-gray-500 text-sm">
                                    {isVi ? 'Chưa có quyền nào được gán cho role này.' : 'No permissions assigned to this role.'}
                                </div>
                            ) : (
                                groupsReadOnly.map(([groupName, permissions]) => (
                                    <div key={groupName} className="border-b border-gray-100 last:border-b-0">
                                        <div className="px-4 py-3 bg-gray-50/80">
                                            <h3 className="text-sm font-medium text-gray-700">
                                                {getPermissionGroupDisplayName(groupName, i18n.language)}
                                            </h3>
                                        </div>
                                        <ul className="divide-y divide-gray-100">
                                            {permissions.map((perm) => {
                                                const descLine = getPermissionDisplayDescription(
                                                    perm.name,
                                                    perm.description,
                                                    i18n.language,
                                                );
                                                return (
                                                <li
                                                    key={perm.id}
                                                    className="flex items-center gap-3 px-4 py-3 text-sm"
                                                >
                                                    <Key className="w-4 h-4 text-gray-400 shrink-0" />
                                                    <div className="min-w-0">
                                                        <span className="font-medium text-gray-900">
                                                            {getPermissionDisplayName(perm.name, i18n.language)}
                                                        </span>
                                                        {descLine ? (
                                                            <p className="text-gray-500 text-xs mt-0.5 truncate">
                                                                {descLine}
                                                            </p>
                                                        ) : null}
                                                    </div>
                                                </li>
                                                );
                                            })}
                                        </ul>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            )}

            {tab === 'members' && (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    {loading ? (
                        <div className="p-8 text-center text-gray-500 text-sm">
                            {isVi ? 'Đang tải...' : 'Loading...'}
                        </div>
                    ) : users.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 text-sm">
                            {isVi ? 'Chưa có thành viên nào.' : 'No members found.'}
                        </div>
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
            )}
        </div>
    );
}
