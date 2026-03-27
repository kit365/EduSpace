import { useCallback, useEffect, useMemo, useState } from 'react';
import { KeyRound, Pencil, Plus, Trash2, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Permission } from '@/types';
import { roleService } from '../services/roleService';
import { showToast } from '@/utils/toast';
import {
    getPermissionDisplayDescription,
    getPermissionDisplayName,
    getPermissionGroupDisplayName,
} from '../utils/permissionDisplayI18n';

function groupBy<T>(items: T[], key: (item: T) => string): Record<string, T[]> {
    return items.reduce(
        (acc, item) => {
            const k = key(item);
            if (!acc[k]) acc[k] = [];
            acc[k].push(item);
            return acc;
        },
        {} as Record<string, T[]>
    );
}

export function PermissionCatalogView() {
    const { i18n } = useTranslation();
    const isVi = i18n.language?.toLowerCase().startsWith('vi');
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [name, setName] = useState('');
    const [groupName, setGroupName] = useState('');
    const [description, setDescription] = useState('');

    const grouped = useMemo(() => {
        const sorted = [...permissions].sort(
            (a, b) => a.groupName.localeCompare(b.groupName) || a.name.localeCompare(b.name)
        );
        return groupBy(sorted, (p) => p.groupName || 'Other');
    }, [permissions]);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            setPermissions(await roleService.getPermissionCatalog());
        } catch (error) {
            console.error(error);
            const vi = i18n.language?.toLowerCase().startsWith('vi');
            showToast.error(
                vi ? 'Lỗi' : 'Error',
                vi ? 'Không tải được danh mục quyền.' : 'Could not load permission catalog.',
            );
        } finally {
            setLoading(false);
        }
    }, [i18n.language]);

    useEffect(() => {
        void load();
    }, [load]);

    const openCreate = () => {
        setEditingId(null);
        setName('');
        setGroupName('');
        setDescription('');
        setModalOpen(true);
    };

    const openEdit = (permission: Permission) => {
        setEditingId(permission.id);
        setName(permission.name);
        setGroupName(permission.groupName);
        setDescription(permission.description ?? '');
        setModalOpen(true);
    };

    const handleSave = async () => {
        if (!name.trim() || !groupName.trim()) {
            showToast.error(
                isVi ? 'Thiếu dữ liệu' : 'Missing data',
                isVi ? 'Tên quyền và nhóm quyền là bắt buộc.' : 'Permission name and group are required.',
            );
            return;
        }
        setSaving(true);
        try {
            const payload = {
                name: name.trim(),
                groupName: groupName.trim(),
                description: description.trim() || undefined,
            };
            if (editingId == null) {
                await roleService.createPermission(payload);
                showToast.success(isVi ? 'Đã tạo quyền' : 'Permission created');
            } else {
                await roleService.updatePermission(editingId, payload);
                showToast.success(isVi ? 'Đã cập nhật quyền' : 'Permission updated');
            }
            setModalOpen(false);
            await load();
        } catch (error) {
            console.error(error);
            showToast.error(
                isVi ? 'Lỗi' : 'Error',
                isVi
                    ? 'Không lưu được quyền. Kiểm tra dữ liệu hoặc tên bị trùng.'
                    : 'Could not save permission. Check data or duplicate name.',
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (permission: Permission) => {
        const msg = isVi
            ? `Xóa quyền "${permission.name}"?`
            : `Delete permission "${permission.name}"?`;
        if (!window.confirm(msg)) return;
        try {
            await roleService.deletePermission(permission.id);
            showToast.success(isVi ? 'Đã xóa quyền' : 'Permission deleted');
            await load();
        } catch (error) {
            console.error(error);
            showToast.error(
                isVi ? 'Lỗi' : 'Error',
                isVi ? 'Không xóa được quyền. Có thể quyền đang được sử dụng.' : 'Could not delete permission. It may be in use.',
            );
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <h2 className="text-xl font-black text-gray-900 tracking-tight">
                        {isVi ? 'Danh mục quyền' : 'Permission catalog'}
                    </h2>
                    <p className="text-xs text-gray-500 font-bold mt-1 uppercase tracking-wider">
                        {isVi
                            ? 'Tạo quyền đơn lẻ theo nhóm trước khi tạo bộ quyền hoặc gán cho role.'
                            : 'Create individual permissions by group before building templates or assigning to roles.'}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={openCreate}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gray-900 text-white font-bold text-sm hover:bg-red-600 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    {isVi ? 'Tạo quyền' : 'Create permission'}
                </button>
            </div>

            {loading ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-500 text-sm">
                    {isVi ? 'Đang tải danh mục quyền...' : 'Loading permission catalog...'}
                </div>
            ) : (
                <div className="space-y-5">
                    {Object.entries(grouped).map(([group, items]) => (
                        <div key={group} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/70">
                                <h3 className="text-sm font-black text-gray-800 uppercase tracking-wider">
                                    {getPermissionGroupDisplayName(group, i18n.language)}
                                </h3>
                            </div>
                            <ul className="divide-y divide-gray-100">
                                {items.map((permission) => {
                                    const localizedDesc = getPermissionDisplayDescription(
                                        permission.name,
                                        permission.description ?? '',
                                        i18n.language,
                                    );
                                    return (
                                    <li key={permission.id} className="px-5 py-4 flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <KeyRound className="w-4 h-4 text-gray-400 shrink-0" />
                                                <p className="text-sm font-semibold text-gray-900 break-all">
                                                    {getPermissionDisplayName(permission.name, i18n.language)}
                                                </p>
                                            </div>
                                            {localizedDesc ? (
                                                <p className="text-xs text-gray-500 mt-1">{localizedDesc}</p>
                                            ) : null}
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <button
                                                type="button"
                                                onClick={() => openEdit(permission)}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50"
                                            >
                                                <Pencil className="w-3.5 h-3.5" />
                                                {isVi ? 'Sửa' : 'Edit'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => void handleDelete(permission)}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-red-100 text-xs font-bold text-red-600 hover:bg-red-50"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                                {isVi ? 'Xóa' : 'Delete'}
                                            </button>
                                        </div>
                                    </li>
                                    );
                                })}
                            </ul>
                        </div>
                    ))}
                    {permissions.length === 0 && (
                        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center text-gray-500 text-sm">
                            {isVi
                                ? 'Chưa có quyền nào. Hãy tạo quyền đầu tiên.'
                                : 'No permissions yet. Create the first one.'}
                        </div>
                    )}
                </div>
            )}

            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50" onClick={() => !saving && setModalOpen(false)} />
                    <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full">
                        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-lg font-black text-gray-900">
                                {editingId == null
                                    ? isVi
                                        ? 'Tạo quyền mới'
                                        : 'Create permission'
                                    : isVi
                                      ? 'Cập nhật quyền'
                                      : 'Update permission'}
                            </h3>
                            <button
                                type="button"
                                disabled={saving}
                                onClick={() => setModalOpen(false)}
                                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-5 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                                    {isVi ? 'Tên quyền' : 'Permission name'}
                                </label>
                                <input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 font-medium"
                                    placeholder="branch.checkin.manage"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                                    {isVi ? 'Nhóm' : 'Group'}
                                </label>
                                <input
                                    value={groupName}
                                    onChange={(e) => setGroupName(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 font-medium"
                                    placeholder="branch.operations"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                                    {isVi ? 'Mô tả' : 'Description'}
                                </label>
                                <textarea
                                    rows={3}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 font-medium resize-none"
                                />
                            </div>
                        </div>
                        <div className="p-5 border-t border-gray-100 flex justify-end gap-2">
                            <button
                                type="button"
                                disabled={saving}
                                onClick={() => setModalOpen(false)}
                                className="px-5 py-2.5 rounded-xl font-bold text-sm border border-gray-200 text-gray-700 hover:bg-gray-50"
                            >
                                {isVi ? 'Hủy' : 'Cancel'}
                            </button>
                            <button
                                type="button"
                                disabled={saving}
                                onClick={() => void handleSave()}
                                className="px-5 py-2.5 rounded-xl font-bold text-sm bg-gray-900 text-white hover:bg-red-600 disabled:opacity-50"
                            >
                                {saving ? (isVi ? 'Đang lưu...' : 'Saving...') : isVi ? 'Lưu' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
