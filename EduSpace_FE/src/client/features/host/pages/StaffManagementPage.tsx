import { useCallback, useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { UserPlus, Shield, Trash2, Loader2, Save } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { RentalLayout } from '../../../layouts/RentalLayout';
import { useAuthStore } from '@/stores/authStore';
import { hasHostPermission } from '@/utils/keycloakTokenRoles';
import { hostPermissions } from '../permissions/hostPermissions';
import { StaffPermissionGrid } from '../components/StaffPermissionGrid';
import { ManagerPermissionsEditorModal } from '../components/ManagerPermissionsEditorModal';
import {
    fetchHostStaffList,
    inviteBranchManager,
    type InviteBranchManagerResult,
    removeHostStaff,
    replaceStaffPermissions,
    type HostStaffMember,
} from '../services/hostStaffService';
import { profileService } from '@/client/features/customer/profile/services/profileService';
import { branchService, type HostBranch } from '../services/branchService';
import { showToast } from '@/utils/toast';
import { getApiErrorMessage } from '@/utils/apiError';
import { hostManagerRoleService } from '../services/hostManagerRoleService';

function permSetsEqual(a: string[] | undefined, b: string[] | undefined): boolean {
    const sa = [...(a ?? [])].sort().join('|');
    const sb = [...(b ?? [])].sort().join('|');
    return sa === sb;
}

function isStaffRole(m: HostStaffMember): boolean {
    return (m.memberRole ?? '').toUpperCase() === 'STAFF';
}

export function StaffManagementPage() {
    const { i18n } = useTranslation();
    const isVi = i18n.language?.toLowerCase().startsWith('vi');
    const queryClient = useQueryClient();
    const accessToken = useAuthStore((s) => s.accessToken);
    const hostPermissionsFromAccount = useAuthStore((s) => s.hostPermissionsFromAccount);

    const canViewStaff = hasHostPermission(accessToken, hostPermissions.staff.view, hostPermissionsFromAccount);
    const canCreateStaff = hasHostPermission(accessToken, hostPermissions.staff.create, hostPermissionsFromAccount);
    const canEditStaff = hasHostPermission(accessToken, hostPermissions.staff.edit, hostPermissionsFromAccount);
    const canDeleteStaff = hasHostPermission(accessToken, hostPermissions.staff.delete, hostPermissionsFromAccount);

    const [showForm, setShowForm] = useState(false);
    const [inviteForm, setInviteForm] = useState<{
        email: string;
        branchPropertyId: number | '';
        fullName: string;
        temporaryPassword: string;
    }>({
        email: '',
        branchPropertyId: '',
        fullName: '',
        temporaryPassword: '',
    });

    const [draftPermissions, setDraftPermissions] = useState<Record<string, string[]>>({});
    const [editingManager, setEditingManager] = useState<HostStaffMember | null>(null);

    const { data: profile } = useQuery({
        queryKey: ['account-profile'],
        queryFn: () => profileService.getProfile(),
        enabled: canViewStaff,
    });
    const ownerId = profile?.id;

    const { data: permissionCatalog = [], isLoading: permissionCatalogLoading } = useQuery({
        queryKey: ['host-permission-catalog'],
        queryFn: () => hostManagerRoleService.getPermissionCatalog(),
        enabled: canViewStaff,
    });

    const { data: branches = [], isLoading: branchesLoading } = useQuery({
        queryKey: ['host-branches-owner', ownerId],
        queryFn: () => branchService.listByOwner(ownerId!),
        enabled: !!ownerId && canViewStaff,
    });

    const {
        data: staffList = [],
        isLoading,
        isError,
    } = useQuery({
        queryKey: ['host-staff'],
        queryFn: fetchHostStaffList,
        enabled: canViewStaff,
    });

    useEffect(() => {
        if (!staffList.length) {
            setDraftPermissions({});
            return;
        }
        const next: Record<string, string[]> = {};
        staffList.forEach((s) => {
            if (isStaffRole(s)) {
                next[s.id] = [...(s.permissionNames ?? [])];
            }
        });
        setDraftPermissions(next);
    }, [staffList]);

    const saveMutation = useMutation({
        mutationFn: ({ staffId, permissionNames }: { staffId: string; permissionNames: string[] }) =>
            replaceStaffPermissions(staffId, permissionNames),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['host-staff'] });
            showToast.success(isVi ? 'Đã lưu quyền nhân viên.' : 'Staff permissions saved.');
        },
        onError: (e: unknown) => {
            showToast.error(getApiErrorMessage(e, isVi ? 'Không lưu được quyền.' : 'Could not save permissions.'));
        },
    });

    const inviteMutation = useMutation({
        mutationFn: inviteBranchManager,
        onSuccess: (result: InviteBranchManagerResult) => {
            queryClient.invalidateQueries({ queryKey: ['host-staff'] });
            setInviteForm({ email: '', branchPropertyId: '', fullName: '', temporaryPassword: '' });
            setShowForm(false);
            showToast.success(result.created
                ? (isVi
                    ? 'Đã tạo tài khoản và gửi email mời quản lý thành công.'
                    : 'Manager account created and invitation email sent.')
                : (isVi
                    ? 'Đã cấp quyền quản lý chi nhánh thành công.'
                    : 'Branch manager access granted successfully.'));
        },
        onError: (e: unknown) => {
            showToast.error(getApiErrorMessage(e, isVi ? 'Không thêm được quản lý.' : 'Could not add manager.'));
        },
    });

    const removeMutation = useMutation({
        mutationFn: removeHostStaff,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['host-staff'] });
            showToast.success(isVi ? 'Đã gỡ người dùng (trả về tài khoản Guest).' : 'User removed; reverted to Guest.');
        },
        onError: (e: unknown) => {
            showToast.error(getApiErrorMessage(e, isVi ? 'Không gỡ được.' : 'Could not remove.'));
        },
    });

    const updateManagerPermissionsMutation = useMutation({
        mutationFn: ({ staffUserId, permissionIds }: { staffUserId: string; permissionIds: number[] }) =>
            hostManagerRoleService.updateManagerPermissions(staffUserId, permissionIds),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['host-staff'] });
            setEditingManager(null);
            showToast.success(isVi ? 'Đã cập nhật quyền Manager.' : 'Manager permissions updated.');
        },
        onError: (e: unknown) => {
            showToast.error(
                getApiErrorMessage(e, isVi ? 'Không cập nhật được quyền Manager.' : 'Could not update manager permissions.'),
            );
        },
    });

    const toggleDraftPermission = useCallback((staffId: string, key: string, checked: boolean) => {
        setDraftPermissions((prev) => {
            const list = new Set(prev[staffId] ?? []);
            if (checked) {
                list.add(key);
            } else {
                list.delete(key);
            }
            return { ...prev, [staffId]: Array.from(list) };
        });
    }, []);

    const handleSavePermissions = (staff: HostStaffMember) => {
        const names = draftPermissions[staff.id] ?? [];
        saveMutation.mutate({ staffId: staff.id, permissionNames: names });
    };

    const handleInvite = () => {
        if (!canCreateStaff) return;
        if (
            !inviteForm.email.trim() ||
            !inviteForm.fullName.trim() ||
            !inviteForm.temporaryPassword.trim() ||
            inviteForm.branchPropertyId === ''
        ) {
            showToast.error(
                isVi
                    ? 'Nhập email, họ tên, mật khẩu và chọn chi nhánh.'
                    : 'Enter email, full name, password, and select a branch.',
            );
            return;
        }
        inviteMutation.mutate({
            email: inviteForm.email.trim(),
            branchPropertyId: Number(inviteForm.branchPropertyId),
            fullName: inviteForm.fullName.trim(),
            temporaryPassword: inviteForm.temporaryPassword.trim(),
        });
    };

    const handleRemove = (id: string) => {
        if (!canDeleteStaff) return;
        if (
            window.confirm(
                isVi
                    ? 'Gỡ người này? Tài khoản sẽ trở lại Guest (nếu là Manager).'
                    : 'Remove this user? Manager accounts revert to Guest.',
            )
        ) {
            removeMutation.mutate(id);
        }
    };

    const dirtyByStaff = useMemo(() => {
        const m: Record<string, boolean> = {};
        staffList.forEach((s) => {
            if (!isStaffRole(s)) {
                m[s.id] = false;
                return;
            }
            m[s.id] = !permSetsEqual(draftPermissions[s.id], s.permissionNames);
        });
        return m;
    }, [staffList, draftPermissions]);

    const branchNameById = useCallback(
        (id: number | null | undefined) => {
            if (id == null) return '';
            return branches.find((b: HostBranch) => b.id === id)?.name ?? '';
        },
        [branches],
    );

    if (!canViewStaff) {
        return (
            <RentalLayout title="Quản lý nhân viên">
                <div className="mx-auto max-w-lg p-8 text-center text-gray-600">
                    Bạn không có quyền xem danh sách nhân viên.
                </div>
            </RentalLayout>
        );
    }

    return (
        <RentalLayout title="Quản lý nhân viên">
            <div className="p-8">
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Quản lý Staff</h1>
                        <p className="text-gray-500 font-medium max-w-2xl">
                            Người quản lý cần có tài khoản Guest trên hệ thống. Thêm họ bằng email và chọn chi nhánh — họ
                            được gán vai trò Manager (quyền mặc định), không cần phân quyền thủ công.
                        </p>
                    </div>
                    <button
                        onClick={() => canCreateStaff && setShowForm(true)}
                        disabled={!canCreateStaff}
                        title={canCreateStaff ? undefined : 'Bạn không có quyền thêm quản lý'}
                        className="flex items-center gap-3 bg-red-500 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-red-200 hover:bg-red-600 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-red-500"
                    >
                        <UserPlus className="w-5 h-5" /> Thêm nhân viên
                    </button>
                </div>

                {showForm && canCreateStaff && (
                    <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-lg mb-8 animate-in slide-in-from-top duration-500">
                        <h3 className="text-lg font-black text-gray-900 mb-2">Thêm quản lý chi nhánh (Manager)</h3>
                        <p className="text-sm text-gray-500 mb-6">
                            Nhập thông tin tài khoản (email, họ tên, mật khẩu tạm) và chọn chi nhánh. Hệ thống cấp quyền
                            Manager cho tài khoản đó.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    value={inviteForm.email}
                                    onChange={(e) => setInviteForm((p) => ({ ...p, email: e.target.value }))}
                                    placeholder="ten@email.com"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                                    Họ và tên *
                                </label>
                                <input
                                    type="text"
                                    value={inviteForm.fullName}
                                    onChange={(e) => setInviteForm((p) => ({ ...p, fullName: e.target.value }))}
                                    placeholder="Nguyễn Văn A"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                                    Mật khẩu tạm *
                                </label>
                                <input
                                    type="password"
                                    value={inviteForm.temporaryPassword}
                                    onChange={(e) =>
                                        setInviteForm((p) => ({ ...p, temporaryPassword: e.target.value }))
                                    }
                                    placeholder="••••••••••"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition-all"
                                />
                            </div>
                            <div className="md:col-span-3">
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                                    Chi nhánh *
                                </label>
                                <select
                                    value={inviteForm.branchPropertyId === '' ? '' : String(inviteForm.branchPropertyId)}
                                    onChange={(e) =>
                                        setInviteForm((p) => ({
                                            ...p,
                                            branchPropertyId: e.target.value === '' ? '' : Number(e.target.value),
                                        }))
                                    }
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition-all"
                                    disabled={branchesLoading || !branches.length}
                                >
                                    <option value="">
                                        {branchesLoading
                                            ? 'Đang tải chi nhánh...'
                                            : branches.length
                                              ? '— Chọn chi nhánh —'
                                              : 'Chưa có chi nhánh'}
                                    </option>
                                    {branches.map((b) => (
                                        <option key={b.id} value={b.id}>
                                            {b.name}
                                            {b.rawStatus !== 'VERIFIED' ? ` (${b.rawStatus})` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="px-6 py-3 rounded-xl font-bold text-gray-500 border border-gray-200 hover:bg-gray-50 transition-all"
                            >
                                Huỷ
                            </button>
                            <button
                                type="button"
                                onClick={handleInvite}
                                disabled={inviteMutation.isPending}
                                className="px-8 py-3 rounded-xl font-black bg-gray-900 text-white hover:bg-red-500 shadow-lg transition-all active:scale-95 disabled:opacity-60 flex items-center gap-2"
                            >
                                {inviteMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                                Thêm quản lý
                            </button>
                        </div>
                    </div>
                )}

                {isLoading && (
                    <div className="flex justify-center py-16 text-gray-400">
                        <Loader2 className="w-10 h-10 animate-spin" />
                    </div>
                )}
                {isError && (
                    <div className="rounded-2xl border border-red-100 bg-red-50 px-6 py-4 text-red-700 font-medium">
                        {isVi ? 'Không tải được danh sách nhân viên.' : 'Could not load staff list.'}
                    </div>
                )}

                {!isLoading && !isError && (
                    <div className="space-y-4">
                        {staffList.map((staff) => {
                            const isStaff = isStaffRole(staff);
                            const selected = new Set(draftPermissions[staff.id] ?? []);
                            const dirty = dirtyByStaff[staff.id];
                            const saving = saveMutation.isPending && saveMutation.variables?.staffId === staff.id;
                            const isManager = (staff.memberRole ?? '').toUpperCase() === 'MANAGER';
                            const branchLabel = branchNameById(staff.branchPropertyId ?? undefined);

                            return (
                                <div
                                    key={staff.id}
                                    className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all group"
                                >
                                    <div className="flex items-start gap-6">
                                        <div className="relative shrink-0">
                                            <div className="w-14 h-14 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-md">
                                                {staff.fullName
                                                    .split(' ')
                                                    .map((n) => n[0])
                                                    .join('')
                                                    .slice(0, 2)}
                                            </div>
                                            <div
                                                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                                                    staff.isActive ? 'bg-green-500' : 'bg-gray-300'
                                                }`}
                                            />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center gap-3 mb-1">
                                                <h4 className="font-black text-gray-900 text-lg">{staff.fullName}</h4>
                                                <span
                                                    className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${
                                                        staff.isActive
                                                            ? 'text-green-600 bg-green-50'
                                                            : 'text-gray-400 bg-gray-50'
                                                    }`}
                                                >
                                                    {staff.isActive ? 'Đang hoạt động' : 'Tạm ngưng'}
                                                </span>
                                                {isManager && (
                                                    <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg text-blue-700 bg-blue-50">
                                                        Manager
                                                    </span>
                                                )}
                                                {isStaff && (
                                                    <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg text-amber-700 bg-amber-50">
                                                        Staff (vận hành)
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-500 font-medium">
                                                {staff.email}
                                                {staff.phoneNumber ? ` · ${staff.phoneNumber}` : ''}
                                            </p>

                                            {isManager && (
                                                <p className="mt-2 text-sm text-gray-700">
                                                    <span className="font-bold text-gray-900">Chi nhánh: </span>
                                                    {branchLabel ||
                                                        (staff.branchPropertyId != null
                                                            ? `#${staff.branchPropertyId}`
                                                            : '—')}
                                                </p>
                                            )}

                                            <div className="flex items-center gap-2 mt-2 text-gray-400">
                                                <Shield className="w-3 h-3 shrink-0" />
                                                <span className="text-[10px] font-bold uppercase tracking-wider">
                                                    {isManager
                                                        ? 'Quyền theo vai trò Manager (mặc định)'
                                                        : 'Phân quyền vận hành (Staff)'}
                                                </span>
                                            </div>

                                            {isManager ? (
                                                <>
                                                    <div className="mt-3">
                                                        <button
                                                            type="button"
                                                            onClick={() => setEditingManager(staff)}
                                                            className="px-4 py-2 rounded-xl text-sm font-bold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all"
                                                        >
                                                            {isVi ? 'Chi tiết quyền' : 'Permission details'}
                                                        </button>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <StaffPermissionGrid
                                                        isVi={isVi}
                                                        selectedKeys={selected}
                                                        disabled={!canEditStaff}
                                                        onToggle={(key, checked) =>
                                                            toggleDraftPermission(staff.id, key, checked)
                                                        }
                                                    />

                                                    {canEditStaff && (
                                                        <div className="mt-4 flex flex-wrap items-center gap-3">
                                                            <button
                                                                type="button"
                                                                disabled={!dirty || saving}
                                                                onClick={() => handleSavePermissions(staff)}
                                                                className="inline-flex items-center gap-2 rounded-xl bg-red-500 px-5 py-2.5 text-sm font-black text-white shadow-md transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                                                            >
                                                                {saving ? (
                                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                                ) : (
                                                                    <Save className="h-4 w-4" />
                                                                )}
                                                                Lưu thay đổi
                                                            </button>
                                                            {!dirty && (
                                                                <span className="text-xs text-gray-400">
                                                                    Không có thay đổi chưa lưu
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>

                                        {canDeleteStaff && (
                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemove(staff.id)}
                                                    disabled={removeMutation.isPending}
                                                    className="p-3 rounded-xl hover:bg-red-50 text-red-500 transition-all disabled:opacity-50"
                                                    title="Gỡ"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                        {staffList.length === 0 && (
                            <div className="bg-white rounded-3xl border-2 border-dashed border-gray-100 p-16 text-center">
                                <UserPlus className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                                <h3 className="text-xl font-black text-gray-900 mb-2">Chưa có nhân viên</h3>
                                <p className="text-gray-400 font-medium">
                                    Thêm quản lý bằng email (tài khoản Guest) và chi nhánh.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
            <ManagerPermissionsEditorModal
                isVi={isVi}
                open={!!editingManager}
                managerName={editingManager?.fullName ?? ''}
                permissionCatalog={permissionCatalog}
                initialPermissionNames={editingManager?.permissionNames ?? []}
                saving={updateManagerPermissionsMutation.isPending || permissionCatalogLoading}
                onClose={() => setEditingManager(null)}
                onSave={(permissionIds) => {
                    if (!editingManager) return;
                    updateManagerPermissionsMutation.mutate({ staffUserId: editingManager.id, permissionIds });
                }}
            />
        </RentalLayout>
    );
}
