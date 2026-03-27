import { useCallback, useEffect, useMemo, useState } from 'react';
import { Layers, Pencil, Plus, Trash2, X } from 'lucide-react';
import { Permission, PermissionTemplate } from '@/types';
import { hostRbacService, type HostRbacTemplateApi } from '../services/roleService';
import { showToast } from '@/utils/toast';

function groupBy<T>(items: T[], key: (t: T) => string): Record<string, T[]> {
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

export interface PermissionTemplatesViewProps {
    /** Mặc định: API Partner Portal /api/v1/accounts/host/... */
    rbac?: HostRbacTemplateApi;
    /** Host / Admin: tạo & sửa; Manager: chỉ xem danh sách. */
    canManage?: boolean;
    /** Mô tả ngắn dưới tiêu đề */
    leadText?: string;
}

export function PermissionTemplatesView({
    rbac = hostRbacService,
    canManage = true,
    leadText,
}: PermissionTemplatesViewProps) {
    const [templates, setTemplates] = useState<PermissionTemplate[]>([]);
    const [catalog, setCatalog] = useState<Permission[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [saving, setSaving] = useState(false);

    const catalogGroups = useMemo(() => {
        const sorted = [...catalog].sort((a, b) =>
            a.groupName.localeCompare(b.groupName) || a.name.localeCompare(b.name)
        );
        return groupBy(sorted, (p) => p.groupName);
    }, [catalog]);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const [templatesResult, catalogResult] = await Promise.allSettled([
                rbac.getPermissionTemplates(),
                rbac.getPermissionCatalog(),
            ]);
            if (templatesResult.status === 'fulfilled') {
                setTemplates(templatesResult.value);
            } else {
                console.error(templatesResult.reason);
                showToast.error('Lỗi', 'Không tải được danh sách bộ quyền.');
            }
            if (catalogResult.status === 'fulfilled') {
                setCatalog(catalogResult.value);
            } else {
                console.error(catalogResult.reason);
                showToast.error('Lỗi', 'Không tải được danh mục quyền (checkbox theo nhóm).');
            }
        } catch (e: unknown) {
            console.error(e);
            showToast.error('Lỗi', 'Không tải được dữ liệu.');
        } finally {
            setLoading(false);
        }
    }, [rbac]);

    useEffect(() => {
        void load();
    }, [load]);

    const openCreate = () => {
        setEditingId(null);
        setName('');
        setDescription('');
        setSelectedIds(new Set());
        setModalOpen(true);
        if (catalog.length === 0) {
            void rbac.getPermissionCatalog().then(setCatalog).catch(() => {
                showToast.error('Lỗi', 'Không tải được danh mục quyền.');
            });
        }
    };

    const openEdit = (t: PermissionTemplate) => {
        setEditingId(t.id);
        setName(t.name);
        setDescription(t.description ?? '');
        setSelectedIds(new Set(t.permissions.map((p) => p.id)));
        setModalOpen(true);
        if (catalog.length === 0) {
            void rbac.getPermissionCatalog().then(setCatalog).catch(() => {
                showToast.error('Lỗi', 'Không tải được danh mục quyền.');
            });
        }
    };

    const togglePerm = (id: number) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const toggleGroup = (permIds: number[], checked: boolean) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            for (const id of permIds) {
                if (checked) next.add(id);
                else next.delete(id);
            }
            return next;
        });
    };

    const handleSave = async () => {
        if (!canManage) return;
        if (!name.trim()) {
            showToast.error('Thiếu tên', 'Vui lòng nhập tên bộ quyền.');
            return;
        }
        if (selectedIds.size === 0) {
            showToast.error('Chưa chọn quyền', 'Chọn ít nhất một quyền.');
            return;
        }
        setSaving(true);
        try {
            const payload = {
                name: name.trim(),
                description: description.trim() || undefined,
                permissionIds: Array.from(selectedIds),
            };
            if (editingId == null) {
                await rbac.createPermissionTemplate(payload);
                showToast.success('Đã tạo bộ quyền');
            } else {
                await rbac.updatePermissionTemplate(editingId, payload);
                showToast.success('Đã cập nhật bộ quyền');
            }
            setModalOpen(false);
            await load();
        } catch (e: unknown) {
            console.error(e);
            showToast.error('Lỗi', 'Không lưu được. Kiểm tra tên trùng hoặc quyền hạn.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (t: PermissionTemplate) => {
        if (!canManage) return;
        if (!window.confirm(`Xóa bộ quyền "${t.name}"?`)) return;
        try {
            await rbac.deletePermissionTemplate(t.id);
            showToast.success('Đã xóa');
            await load();
        } catch (e: unknown) {
            console.error(e);
            showToast.error('Lỗi', 'Không xóa được.');
        }
    };

    if (loading && templates.length === 0 && catalog.length === 0) {
        return (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-12 text-center text-gray-500 text-sm font-medium">
                Đang tải bộ quyền...
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-black text-gray-900 tracking-tight">Bộ quyền (template)</h2>
                    <p className="text-xs text-gray-500 font-bold mt-1 uppercase tracking-wider">
                        {leadText ??
                            'Đặt tên và chọn quyền theo nhóm; dùng khi cấu hình vai trò (Host có thể tạo/sửa, Manager chỉ xem).'}
                    </p>
                </div>
                {canManage && (
                    <button
                        type="button"
                        onClick={openCreate}
                        className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gray-900 text-white font-bold text-sm hover:bg-red-600 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Tạo bộ quyền
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map((t) => (
                    <div
                        key={t.id}
                        className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-3"
                    >
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                                <span className="p-2 rounded-xl bg-indigo-50 shrink-0">
                                    <Layers className="w-5 h-5 text-indigo-600" />
                                </span>
                                <h3 className="text-lg font-black text-gray-900 truncate">{t.name}</h3>
                            </div>
                        </div>
                        {t.description && (
                            <p className="text-sm text-gray-500 line-clamp-2">{t.description}</p>
                        )}
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                            {t.permissions.length} quyền
                        </p>
                        {canManage && (
                            <div className="flex gap-2 mt-auto pt-2">
                                <button
                                    type="button"
                                    onClick={() => openEdit(t)}
                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm border border-gray-200 text-gray-700 hover:bg-gray-50"
                                >
                                    <Pencil className="w-4 h-4" />
                                    Sửa
                                </button>
                                <button
                                    type="button"
                                    onClick={() => void handleDelete(t)}
                                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm border border-red-100 text-red-600 hover:bg-red-50"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {templates.length === 0 && !loading && (
                <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center text-gray-500 text-sm">
                    {canManage
                        ? 'Chưa có bộ quyền nào. Nhấn "Tạo bộ quyền" để bắt đầu.'
                        : 'Chưa có bộ quyền nào. Chỉ tài khoản Host mới có thể tạo bộ quyền.'}
                </div>
            )}

            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50" onClick={() => !saving && setModalOpen(false)} />
                    <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] flex flex-col">
                        <div className="flex items-center justify-between p-5 border-b border-gray-100 shrink-0">
                            <h3 className="text-lg font-black text-gray-900">
                                {editingId == null ? 'Tạo bộ quyền' : 'Sửa bộ quyền'}
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
                        <div className="p-5 overflow-y-auto flex-1 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                                    Tên
                                </label>
                                <input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    disabled={!canManage}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 font-medium text-gray-900 disabled:bg-gray-50 disabled:text-gray-500"
                                    placeholder="Tên bộ quyền"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                                    Mô tả (tuỳ chọn)
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={2}
                                    disabled={!canManage}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 font-medium text-gray-900 resize-none disabled:bg-gray-50 disabled:text-gray-500"
                                    placeholder="Mô tả ngắn"
                                />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                    Chọn quyền theo nhóm
                                </p>
                                <div className="space-y-4 max-h-[45vh] overflow-y-auto pr-1 border border-gray-100 rounded-xl p-3">
                                    {catalog.length === 0 && (
                                        <p className="text-sm text-gray-500 py-2">
                                            Chưa có danh mục quyền. Kiểm tra kết nối API hoặc đăng nhập lại (Host /
                                            Manager).
                                        </p>
                                    )}
                                    {Object.entries(catalogGroups).map(([groupName, perms]) => {
                                        const ids = perms.map((p) => p.id);
                                        const allOn = ids.every((id) => selectedIds.has(id));
                                        return (
                                            <div key={groupName}>
                                                <label className="flex items-center gap-2 mb-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={allOn}
                                                        disabled={!canManage}
                                                        onChange={() => toggleGroup(ids, !allOn)}
                                                        className="rounded border-gray-300"
                                                    />
                                                    <span className="text-sm font-bold text-gray-800">{groupName}</span>
                                                </label>
                                                <ul className="ml-6 space-y-1.5">
                                                    {perms.map((p) => (
                                                        <li key={p.id}>
                                                            <label className="flex items-start gap-2 cursor-pointer text-sm">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={selectedIds.has(p.id)}
                                                                    disabled={!canManage}
                                                                    onChange={() => togglePerm(p.id)}
                                                                    className="mt-0.5 rounded border-gray-300"
                                                                />
                                                                <span>
                                                                    <span className="font-mono text-xs text-gray-800">
                                                                        {p.name}
                                                                    </span>
                                                                    {p.description && (
                                                                        <span className="block text-xs text-gray-500">
                                                                            {p.description}
                                                                        </span>
                                                                    )}
                                                                </span>
                                                            </label>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                        <div className="p-5 border-t border-gray-100 flex justify-end gap-2 shrink-0">
                            <button
                                type="button"
                                disabled={saving}
                                onClick={() => setModalOpen(false)}
                                className="px-5 py-2.5 rounded-xl font-bold text-sm border border-gray-200 text-gray-700 hover:bg-gray-50"
                            >
                                Huỷ
                            </button>
                            {canManage && (
                                <button
                                    type="button"
                                    disabled={saving}
                                    onClick={() => void handleSave()}
                                    className="px-5 py-2.5 rounded-xl font-bold text-sm bg-gray-900 text-white hover:bg-red-600 disabled:opacity-50"
                                >
                                    {saving ? 'Đang lưu...' : 'Lưu'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
