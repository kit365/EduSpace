import { useCallback, useEffect, useMemo, useState } from 'react';
import { AdminLayout } from '../../../layouts/AdminLayout';
import { userService } from '../../user-management/services/userService';
import {
    hostPartnerApplicationService,
    type HostPartnerApplicationAdminItem,
} from '@/client/features/host/services/hostPartnerApplicationService';
import { getApiErrorMessage } from '@/utils/apiError';
import { showToast } from '@/utils/toast';
import { CheckCircle2, Loader2, RefreshCw, Search, ShieldAlert, User2, XCircle } from 'lucide-react';
import type { User } from '@/types';
import { branchService } from '@/client/features/host/services/branchService';
import { useAuthStore } from '@/stores/authStore';

function parsePropertyId(raw?: string | null): number | null {
    if (!raw) return null;
    const parts = raw.split('|').map((p) => p.trim());
    const item = parts.find((p) => p.startsWith('propertyId='));
    if (!item) return null;
    const n = Number(item.slice('propertyId='.length));
    return Number.isFinite(n) ? n : null;
}

function parseAction(raw?: string | null): string | null {
    if (!raw) return null;
    const parts = raw.split('|').map((p) => p.trim());
    const item = parts.find((p) => p.startsWith('action='));
    if (!item) return null;
    return item.slice('action='.length).trim().toUpperCase() || null;
}

function getJwtSub(token: string | null): string | null {
    if (!token) return null;
    try {
        const parts = token.split('.');
        if (parts.length < 2) return null;
        const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
        const payload = JSON.parse(atob(padded)) as { sub?: string };
        return typeof payload.sub === 'string' && payload.sub.trim() ? payload.sub.trim() : null;
    } catch {
        return null;
    }
}

export function HostManagementPage() {
    const [loadingHosts, setLoadingHosts] = useState(false);
    const [loadingPending, setLoadingPending] = useState(false);
    const [actingId, setActingId] = useState<string | null>(null);
    const [hosts, setHosts] = useState<User[]>([]);
    const [pendingApps, setPendingApps] = useState<HostPartnerApplicationAdminItem[]>([]);
    const [search, setSearch] = useState('');
    const [rejectNote, setRejectNote] = useState<Record<string, string>>({});

    const loadHosts = useCallback(async () => {
        setLoadingHosts(true);
        try {
            // Keep API call simple and server-side filtered by Host role.
            const res = await userService.getUsers({
                page: 0,
                size: 200,
                role: 'Host',
            });
            setHosts(res.items);
        } catch (e) {
            showToast.error(getApiErrorMessage(e, 'Không tải được danh sách host'));
            setHosts([]);
        } finally {
            setLoadingHosts(false);
        }
    }, []);

    const loadPendingApps = useCallback(async () => {
        setLoadingPending(true);
        try {
            const list = await hostPartnerApplicationService.adminListPending();
            setPendingApps(list);
        } catch (e) {
            showToast.error(getApiErrorMessage(e, 'Không tải được đơn chờ duyệt'));
            setPendingApps([]);
        } finally {
            setLoadingPending(false);
        }
    }, []);

    const reloadAll = useCallback(async () => {
        await Promise.all([loadHosts(), loadPendingApps()]);
    }, [loadHosts, loadPendingApps]);

    useEffect(() => {
        void reloadAll();
    }, [reloadAll]);

    const approve = async (app: HostPartnerApplicationAdminItem) => {
        setActingId(app.id);
        try {
            await hostPartnerApplicationService.adminApprove(app.id);
            if (app.applicantType === 'BRANCH') {
                try {
                    const propertyId = parsePropertyId(app.message);
                    const action = parseAction(app.message);
                    const adminSub = getJwtSub(useAuthStore.getState().accessToken);
                    const result = propertyId
                        ? { branch: await branchService.approve(propertyId, { approvedBy: adminSub ?? undefined }), created: false }
                        : await branchService.createIfNotExists({
                              ownerId: app.userId,
                              name: app.fullName,
                              propertyType: 'INDEPENDENT_SPACE',
                              address: app.address ?? '',
                              phone: app.phone ?? '',
                              email: app.email,
                              manager: app.fullName,
                          });
                    if (!propertyId) {
                        await branchService.approve(result.branch.id, { approvedBy: adminSub ?? undefined });
                    }
                    showToast.success(
                        result.created
                            ? 'Đã duyệt đơn và tạo cơ sở cho host.'
                            : 'Đã duyệt đơn và cập nhật trạng thái cơ sở.'
                    );
                } catch (branchError) {
                    showToast.error(
                        getApiErrorMessage(
                            branchError,
                            'Đã duyệt đơn BRANCH nhưng chưa tự tạo được cơ sở. Vui lòng tạo thủ công.'
                        )
                    );
                }
            } else {
                showToast.success('Đã duyệt host thành công');
            }
            await reloadAll();
        } catch (e) {
            showToast.error(getApiErrorMessage(e, 'Duyệt host thất bại'));
        } finally {
            setActingId(null);
        }
    };

    const reject = async (id: string) => {
        setActingId(id);
        try {
            const app = pendingApps.find((x) => x.id === id);
            await hostPartnerApplicationService.adminReject(id, rejectNote[id] || undefined);
            if (app?.applicantType === 'BRANCH') {
                const propertyId = parsePropertyId(app.message);
                const action = parseAction(app.message);
                if (propertyId && action !== 'UPDATE') {
                    await branchService.reject(propertyId, { rejectionNote: rejectNote[id] || '' });
                }
            }
            showToast.success('Đã từ chối đơn host');
            setRejectNote((prev) => ({ ...prev, [id]: '' }));
            await reloadAll();
        } catch (e) {
            showToast.error(getApiErrorMessage(e, 'Từ chối đơn thất bại'));
        } finally {
            setActingId(null);
        }
    };

    const filteredHosts = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return hosts;
        return hosts.filter((h) => {
            const name = (h.name ?? '').toLowerCase();
            const email = (h.email ?? '').toLowerCase();
            const phone = (h.phone ?? '').toLowerCase();
            return name.includes(q) || email.includes(q) || phone.includes(q);
        });
    }, [hosts, search]);

    return (
        <AdminLayout title="Host Management">
            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-gray-100 bg-white p-5">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Tổng host</p>
                    <p className="mt-2 text-3xl font-black text-gray-900">{hosts.length}</p>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-white p-5">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Đơn chờ duyệt</p>
                    <p className="mt-2 text-3xl font-black text-amber-600">{pendingApps.length}</p>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-white p-5">
                    <button
                        type="button"
                        onClick={() => void reloadAll()}
                        disabled={loadingHosts || loadingPending}
                        className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50"
                    >
                        <RefreshCw className={`h-4 w-4 ${(loadingHosts || loadingPending) ? 'animate-spin' : ''}`} />
                        Làm mới dữ liệu thật
                    </button>
                </div>
            </div>

            <div className="mb-8 rounded-2xl border border-gray-100 bg-white p-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Tìm host theo tên, email, số điện thoại..."
                        className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-4 text-sm"
                    />
                </div>
            </div>

            <div className="mb-10 rounded-2xl border border-gray-100 bg-white shadow-sm">
                <div className="border-b border-gray-100 px-6 py-4">
                    <h3 className="text-lg font-black text-gray-900">Danh sách host đang hoạt động</h3>
                </div>
                {loadingHosts ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                    </div>
                ) : filteredHosts.length === 0 ? (
                    <div className="py-12 text-center text-gray-500">Không có host nào</div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {filteredHosts.map((host) => (
                            <div key={host.id} className="flex items-center justify-between px-6 py-4">
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-bold text-gray-900">{host.name || '-'}</p>
                                    <p className="truncate text-sm text-gray-500">{host.email || '-'}</p>
                                    <p className="text-xs text-gray-400">{host.phone || 'Chưa có số điện thoại'}</p>
                                </div>
                                <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
                                    Host
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
                <div className="border-b border-gray-100 px-6 py-4">
                    <h3 className="text-lg font-black text-gray-900">Đơn đăng ký host / chi nhánh chờ duyệt</h3>
                </div>
                {loadingPending ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                    </div>
                ) : pendingApps.length === 0 ? (
                    <div className="flex items-center justify-center gap-2 py-12 text-gray-500">
                        <ShieldAlert className="h-5 w-5" />
                        Không có đơn pending
                    </div>
                ) : (
                    <div className="space-y-4 p-4">
                        {pendingApps.map((app) => (
                            <div key={app.id} className="rounded-xl border border-gray-200 p-4">
                                <div className="mb-3 flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-sm font-black text-gray-900">{app.fullName}</p>
                                        <p className="text-sm text-gray-600">{app.email}</p>
                                        <p className="text-xs text-gray-500">
                                            <User2 className="mr-1 inline h-3 w-3" />
                                            {app.applicantType === 'BRANCH' ? 'Đăng ký chi nhánh' : app.applicantType}{' '}
                                            {app.phone ? `· ${app.phone}` : ''}
                                        </p>
                                        {app.address ? <p className="mt-1 text-sm text-gray-600">{app.address}</p> : null}
                                    </div>
                                    <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                                        {app.status}
                                    </span>
                                </div>
                                <div className="flex flex-col gap-2 md:flex-row">
                                    <input
                                        type="text"
                                        value={rejectNote[app.id] ?? ''}
                                        onChange={(e) =>
                                            setRejectNote((prev) => ({ ...prev, [app.id]: e.target.value }))
                                        }
                                        placeholder="Lý do từ chối (tuỳ chọn)"
                                        className="flex-1 rounded-xl border border-gray-200 px-4 py-2 text-sm"
                                    />
                                    <button
                                        type="button"
                                        disabled={actingId === app.id}
                                        onClick={() => void approve(app)}
                                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-sm font-bold text-white hover:bg-green-600 disabled:opacity-50"
                                    >
                                        {actingId === app.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                                        Duyệt
                                    </button>
                                    <button
                                        type="button"
                                        disabled={actingId === app.id}
                                        onClick={() => void reject(app.id)}
                                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-bold text-gray-700 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                                    >
                                        <XCircle className="h-4 w-4" />
                                        Từ chối
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
