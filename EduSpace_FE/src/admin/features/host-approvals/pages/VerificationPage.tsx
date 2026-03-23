import { AdminLayout } from '../../../layouts/AdminLayout';
import {
    User as UserIcon,
    CheckCircle2,
    XCircle,
    Search,
    ImageIcon,
    FileCheck,
    Loader2,
    Building2,
    RefreshCw,
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import {
    hostPartnerApplicationService,
    type HostPartnerApplicationAdminItem,
} from '@/client/features/host/services/hostPartnerApplicationService';
import { userService } from '@/admin/features/user-management/services/userService';
import type { User } from '@/types';
import { showToast } from '@/utils/toast';
import { getApiErrorMessage } from '@/utils/apiError';
import { branchService } from '@/client/features/host/services/branchService';
import { useAuthStore } from '@/stores/authStore';
import { roomApiService } from '@/client/features/room/services/roomApiService';
import { propertyApiService } from '@/client/features/room/services/propertyApiService';
import type { PropertyDto, RoomDto } from '@/client/features/room/types';

type BranchMeta = {
    action?: string;
    propertyId?: number;
    propertyType?: string;
    provinceCode?: string;
    districtCode?: string;
    wardCode?: string;
    description?: string;
    logo?: string;
};

function parseBranchMeta(raw?: string | null): { cleanMessage: string; meta: BranchMeta } {
    if (!raw) return { cleanMessage: '', meta: {} };
    const parts = raw.split('|').map((p) => p.trim()).filter(Boolean);
    const meta: BranchMeta = {};
    const remain: string[] = [];

    for (const part of parts) {
        const idx = part.indexOf('=');
        if (idx <= 0) {
            remain.push(part);
            continue;
        }
        const key = part.slice(0, idx).trim();
        const value = part.slice(idx + 1).trim();
        switch (key) {
            case 'propertyType':
                meta.propertyType = value;
                break;
            case 'action':
                meta.action = value.toUpperCase();
                break;
            case 'propertyId':
                meta.propertyId = Number(value);
                break;
            case 'provinceCode':
                meta.provinceCode = value;
                break;
            case 'districtCode':
                meta.districtCode = value;
                break;
            case 'wardCode':
                meta.wardCode = value;
                break;
            case 'personInCharge':
            case 'description':
                meta.description = value;
                break;
            case 'logo':
                meta.logo = value;
                break;
            default:
                remain.push(part);
                break;
        }
    }
    return { cleanMessage: remain.join(' | '), meta };
}

function propertyTypeLabel(v?: string): string | null {
    if (!v) return null;
    if (v === 'COMMERCIAL_BUILDING') return 'Tòa nhà thương mại';
    if (v === 'CENTER_COWORKING') return 'Trung tâm / Không gian chung';
    if (v === 'INDEPENDENT_SPACE') return 'Mặt bằng độc lập';
    return v;
}

function isUsableLogoUrl(v?: string): boolean {
    if (!v) return false;
    const s = v.trim().toLowerCase();
    return (s.startsWith('http://') || s.startsWith('https://')) && !s.includes('mail.google.com');
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

export function VerificationPage() {
    const [tab, setTab] = useState<'partners' | 'rooms' | 'users'>('partners');
    const [partnerApps, setPartnerApps] = useState<HostPartnerApplicationAdminItem[]>([]);
    const [loadingPartners, setLoadingPartners] = useState(false);
    const [loadingUsersKyc, setLoadingUsersKyc] = useState(false);
    const [actingId, setActingId] = useState<string | null>(null);
    const [rejectNote, setRejectNote] = useState<Record<string, string>>({});
    const [usersKyc, setUsersKyc] = useState<User[]>([]);
    const [usersKycSearch, setUsersKycSearch] = useState('');
    const [actingUserKycId, setActingUserKycId] = useState<string | null>(null);
    const [usersKycRejectReason, setUsersKycRejectReason] = useState<Record<string, string>>({});
    const [loadingRooms, setLoadingRooms] = useState(false);
    const [actingRoomId, setActingRoomId] = useState<number | null>(null);
    const [roomRejectNote, setRoomRejectNote] = useState<Record<number, string>>({});
    const [pendingRooms, setPendingRooms] = useState<Array<{ room: RoomDto; property: PropertyDto | null }>>([]);

    const loadPartners = useCallback(async () => {
        setLoadingPartners(true);
        try {
            const list = await hostPartnerApplicationService.adminListPending();
            setPartnerApps(list);
        } catch (e) {
            showToast.error(getApiErrorMessage(e, 'Không tải được danh sách đơn'));
            setPartnerApps([]);
        } finally {
            setLoadingPartners(false);
        }
    }, []);

    useEffect(() => {
        if (tab === 'partners') void loadPartners();
    }, [tab, loadPartners]);

    const loadUsersKyc = useCallback(async () => {
        setLoadingUsersKyc(true);
        try {
            // Backend currently exposes KYC data inside admin users response.
            const res = await userService.getUsers({
                page: 0,
                size: 200,
            });
            setUsersKyc(res.items);
        } catch (e) {
            showToast.error(getApiErrorMessage(e, 'Không tải được danh sách KYC người dùng'));
            setUsersKyc([]);
        } finally {
            setLoadingUsersKyc(false);
        }
    }, []);

    useEffect(() => {
        if (tab === 'users') void loadUsersKyc();
    }, [tab, loadUsersKyc]);

    const loadPendingRooms = useCallback(async () => {
        setLoadingRooms(true);
        try {
            const [rooms, properties] = await Promise.all([
                roomApiService.getAll(),
                propertyApiService.getAll(),
            ]);
            const propertyMap = new Map<number, PropertyDto>(properties.map((p) => [p.id, p]));
            const list = rooms
                .filter((r) => r.approvalStatus === 'PENDING' || r.pendingEditStatus === 'PENDING')
                .map((room) => ({
                    room,
                    property: propertyMap.get(room.propertyId) ?? null,
                }));
            setPendingRooms(list);
        } catch (e) {
            showToast.error(getApiErrorMessage(e, 'Không tải được danh sách phòng chờ duyệt'));
            setPendingRooms([]);
        } finally {
            setLoadingRooms(false);
        }
    }, []);

    useEffect(() => {
        if (tab === 'rooms') void loadPendingRooms();
    }, [tab, loadPendingRooms]);

    const visibleUsersKyc = usersKyc.filter((u) => u.kycStatus === 'pending');

    const approveUserKyc = async (userId: string) => {
        setActingUserKycId(userId);
        try {
            await userService.approveUserKyc(userId);
            showToast.success('Đã duyệt KYC người dùng');
            await loadUsersKyc();
        } catch (e) {
            showToast.error(getApiErrorMessage(e, 'Duyệt KYC thất bại'));
        } finally {
            setActingUserKycId(null);
        }
    };

    const rejectUserKyc = async (userId: string) => {
        setActingUserKycId(userId);
        try {
            await userService.rejectUserKyc(userId, usersKycRejectReason[userId]);
            showToast.success('Đã từ chối KYC người dùng');
            setUsersKycRejectReason((prev) => ({ ...prev, [userId]: '' }));
            await loadUsersKyc();
        } catch (e) {
            showToast.error(getApiErrorMessage(e, 'Từ chối KYC thất bại'));
        } finally {
            setActingUserKycId(null);
        }
    };

    const approve = async (app: HostPartnerApplicationAdminItem) => {
        setActingId(app.id);
        try {
            await hostPartnerApplicationService.adminApprove(app.id);
            if (app.applicantType === 'BRANCH') {
                try {
                    const { meta } = parseBranchMeta(app.message);
                    const adminSub = getJwtSub(useAuthStore.getState().accessToken);
                    let result;
                    if (meta.propertyId) {
                        if (meta.action === 'UPDATE') {
                            await branchService.update(meta.propertyId, {
                                ownerId: app.userId,
                                name: app.fullName,
                                propertyType: meta.propertyType || 'INDEPENDENT_SPACE',
                                address: app.address ?? '',
                                provinceCode: meta.provinceCode || '',
                                districtCode: meta.districtCode || '',
                                wardCode: meta.wardCode || '',
                                phone: app.phone ?? '',
                                email: app.email,
                                manager: meta.description || app.fullName,
                                logo: isUsableLogoUrl(meta.logo) ? meta.logo : '',
                            });
                        }
                        result = { branch: await branchService.approve(meta.propertyId, { approvedBy: adminSub ?? undefined }), created: false };
                    } else {
                        result = await branchService.createIfNotExists({
                            ownerId: app.userId,
                            name: app.fullName,
                            propertyType: meta.propertyType || 'INDEPENDENT_SPACE',
                            address: app.address ?? '',
                            provinceCode: meta.provinceCode || '',
                            districtCode: meta.districtCode || '',
                            wardCode: meta.wardCode || '',
                            phone: app.phone ?? '',
                            email: app.email,
                            manager: meta.description || app.fullName,
                            logo: isUsableLogoUrl(meta.logo) ? meta.logo : '',
                        });
                        await branchService.approve(result.branch.id, { approvedBy: adminSub ?? undefined });
                    }
                    showToast.success(
                        result.created
                            ? 'Đã duyệt đơn BRANCH và tạo cơ sở.'
                            : 'Đã duyệt đơn BRANCH và cập nhật trạng thái cơ sở.'
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
                showToast.success('Đã duyệt — user có role TUTOR (host). Nhắc user đăng nhập lại.');
            }
            await loadPartners();
        } catch (e) {
            showToast.error(getApiErrorMessage(e, 'Duyệt thất bại'));
        } finally {
            setActingId(null);
        }
    };

    const reject = async (id: string) => {
        setActingId(id);
        try {
            const app = partnerApps.find((x) => x.id === id);
            await hostPartnerApplicationService.adminReject(id, rejectNote[id] || undefined);
            if (app?.applicantType === 'BRANCH') {
                const { meta } = parseBranchMeta(app.message);
                if (meta.propertyId && meta.action !== 'UPDATE') {
                    await branchService.reject(meta.propertyId, { rejectionNote: rejectNote[id] || '' });
                }
            }
            showToast.success('Đã từ chối đơn');
            setRejectNote((m) => ({ ...m, [id]: '' }));
            await loadPartners();
        } catch (e) {
            showToast.error(getApiErrorMessage(e, 'Từ chối thất bại'));
        } finally {
            setActingId(null);
        }
    };

    const approveRoom = async (room: RoomDto) => {
        setActingRoomId(room.id);
        try {
            if (room.pendingEditStatus === 'PENDING') {
                await roomApiService.approvePendingEdit(room.id);
                showToast.success('Đã duyệt chỉnh sửa — dữ liệu phòng đã cập nhật');
            } else {
                await roomApiService.update(room.id, {
                    approvalStatus: 'APPROVED',
                    rejectionNote: null,
                });
                showToast.success('Đã duyệt phòng thành công');
            }
            await loadPendingRooms();
        } catch (e) {
            showToast.error(getApiErrorMessage(e, 'Duyệt phòng thất bại'));
        } finally {
            setActingRoomId(null);
        }
    };

    const rejectRoomById = async (room: RoomDto) => {
        setActingRoomId(room.id);
        try {
            if (room.pendingEditStatus === 'PENDING') {
                await roomApiService.rejectPendingEdit(room.id, roomRejectNote[room.id] || '');
                showToast.success('Đã từ chối chỉnh sửa — phòng giữ nguyên dữ liệu cũ');
            } else {
                await roomApiService.update(room.id, {
                    approvalStatus: 'REJECTED',
                    rejectionNote: roomRejectNote[room.id] || '',
                });
                showToast.success('Đã từ chối phòng');
            }
            setRoomRejectNote((prev) => ({ ...prev, [room.id]: '' }));
            await loadPendingRooms();
        } catch (e) {
            showToast.error(getApiErrorMessage(e, 'Từ chối phòng thất bại'));
        } finally {
            setActingRoomId(null);
        }
    };

    const roomImage = (r: RoomDto) => {
        const first = (r.images ?? '').split(',').map((x) => x.trim()).find(Boolean);
        return first || 'https://placehold.co/800x450/e5e7eb/6b7280?text=Room';
    };

    return (
        <AdminLayout title="Xác minh & duyệt">
            <div className="mb-8 flex flex-wrap gap-3">
                <button
                    type="button"
                    onClick={() => setTab('partners')}
                    className={`rounded-xl px-6 py-3 text-sm font-black transition-all duration-300 ${
                        tab === 'partners'
                            ? 'bg-gray-900 text-white shadow-lg shadow-gray-200'
                            : 'bg-white text-gray-500 hover:bg-gray-50'
                    }`}
                >
                    Đơn host / chi nhánh
                </button>
                <button
                    type="button"
                    onClick={() => setTab('rooms')}
                    className={`rounded-xl px-6 py-3 text-sm font-black transition-all duration-300 ${
                        tab === 'rooms'
                            ? 'bg-gray-900 text-white shadow-lg shadow-gray-200'
                            : 'bg-white text-gray-500 hover:bg-gray-50'
                    }`}
                >
                    Phòng chờ duyệt
                </button>
                <button
                    type="button"
                    onClick={() => setTab('users')}
                    className={`rounded-xl px-6 py-3 text-sm font-black transition-all duration-300 ${
                        tab === 'users'
                            ? 'bg-gray-900 text-white shadow-lg shadow-gray-200'
                            : 'bg-white text-gray-500 hover:bg-gray-50'
                    }`}
                >
                    KYC người dùng
                </button>
            </div>

            {tab === 'partners' && (
                <div>
                    <div className="mb-6 flex items-center justify-between">
                        <p className="text-sm font-bold text-gray-500">
                            Đơn từ account-service — Duyệt sẽ gán role <strong>TUTOR</strong> (host trên FE).
                        </p>
                        <button
                            type="button"
                            onClick={() => void loadPartners()}
                            disabled={loadingPartners}
                            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50"
                        >
                            <RefreshCw className={`h-4 w-4 ${loadingPartners ? 'animate-spin' : ''}`} />
                            Làm mới
                        </button>
                    </div>

                    {loadingPartners && partnerApps.length === 0 ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="h-10 w-10 animate-spin text-red-500" />
                        </div>
                    ) : partnerApps.length === 0 ? (
                        <div className="rounded-3xl border border-dashed border-gray-200 bg-white py-16 text-center text-gray-500">
                            Không có đơn chờ duyệt.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {partnerApps.map((app) => (
                            (() => {
                                const { cleanMessage, meta } = parseBranchMeta(app.message);
                                return (
                                <div
                                    key={app.id}
                                    className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
                                >
                                    <div className="flex flex-col gap-4 p-6 md:flex-row md:items-start md:justify-between">
                                        <div className="flex gap-4">
                                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500">
                                                <Building2 className="h-7 w-7" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-black text-gray-900">{app.fullName}</h3>
                                                <p className="text-sm font-medium text-gray-500">{app.email}</p>
                                                <p className="mt-1 text-xs font-bold uppercase tracking-wider text-amber-600">
                                                    {app.applicantType === 'BRANCH' ? 'ĐĂNG KÝ CHI NHÁNH' : app.applicantType} · userId: {app.userId.slice(0, 8)}…
                                                </p>
                                                {app.phone ? (
                                                    <p className="text-sm text-gray-600">ĐT: {app.phone}</p>
                                                ) : null}
                                                {app.address ? (
                                                    <p className="mt-2 text-sm text-gray-600">{app.address}</p>
                                                ) : null}
                                                {(meta.propertyType || meta.description || isUsableLogoUrl(meta.logo) || cleanMessage) ? (
                                                    <div className="mt-2 rounded-lg bg-slate-50 p-3 text-sm text-gray-700 space-y-1">
                                                        {meta.propertyType ? (
                                                            <p>
                                                                <span className="font-bold">Loại cơ sở:</span>{' '}
                                                                {propertyTypeLabel(meta.propertyType)}
                                                            </p>
                                                        ) : null}
                                                        {meta.description ? (
                                                            <p>
                                                                <span className="font-bold">Mô tả:</span>{' '}
                                                                {meta.description}
                                                            </p>
                                                        ) : null}
                                                        {isUsableLogoUrl(meta.logo) ? (
                                                            <p className="truncate">
                                                                <span className="font-bold">Logo:</span>{' '}
                                                                <a
                                                                    href={meta.logo}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="text-blue-600 underline"
                                                                >
                                                                    {meta.logo}
                                                                </a>
                                                            </p>
                                                        ) : null}
                                                        {cleanMessage ? <p>{cleanMessage}</p> : null}
                                                    </div>
                                                ) : null}
                                            </div>
                                        </div>
                                        <div className="flex w-full flex-col gap-3 md:w-72">
                                            <input
                                                type="text"
                                                placeholder="Lý do từ chối (tuỳ chọn)"
                                                value={rejectNote[app.id] ?? ''}
                                                onChange={(e) =>
                                                    setRejectNote((m) => ({ ...m, [app.id]: e.target.value }))
                                                }
                                                className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm"
                                            />
                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    disabled={actingId === app.id}
                                                    onClick={() => void approve(app)}
                                                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gray-900 py-3 text-sm font-bold text-white transition hover:bg-green-600 disabled:opacity-50"
                                                >
                                                    {actingId === app.id ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <CheckCircle2 className="h-4 w-4" />
                                                    )}
                                                    Duyệt
                                                </button>
                                                <button
                                                    type="button"
                                                    disabled={actingId === app.id}
                                                    onClick={() => void reject(app.id)}
                                                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 py-3 text-sm font-bold text-gray-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                                                >
                                                    <XCircle className="h-4 w-4" />
                                                    Từ chối
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                );
                            })()
                            ))}
                        </div>
                    )}
                </div>
            )}

            {tab === 'rooms' && (
                <div>
                    <div className="mb-6 flex items-center justify-between">
                        <p className="text-sm font-bold text-gray-500">Dữ liệu thật từ room-service.</p>
                        <button
                            type="button"
                            onClick={() => void loadPendingRooms()}
                            disabled={loadingRooms}
                            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50"
                        >
                            <RefreshCw className={`h-4 w-4 ${loadingRooms ? 'animate-spin' : ''}`} />
                            Làm mới
                        </button>
                    </div>
                    {loadingRooms && pendingRooms.length === 0 ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="h-10 w-10 animate-spin text-red-500" />
                        </div>
                    ) : pendingRooms.length === 0 ? (
                        <div className="rounded-3xl border border-dashed border-gray-200 bg-white py-16 text-center text-gray-500">
                            Không có phòng chờ duyệt.
                        </div>
                    ) : (
                        <div className="grid animate-in grid-cols-1 gap-6 duration-500 slide-in-from-bottom-4 md:grid-cols-2 lg:grid-cols-3">
                            {pendingRooms.map(({ room, property }) => (
                                <div
                            key={room.id}
                            className="group overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:shadow-xl"
                        >
                            <div className="relative h-48 overflow-hidden bg-gray-200">
                                <img
                                    src={roomImage(room)}
                                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    alt=""
                                />
                                <div
                                    className={`absolute right-4 top-4 rounded-full px-3 py-1 text-xs font-black uppercase tracking-wider text-white shadow-lg ${
                                        room.pendingEditStatus === 'PENDING' ? 'bg-sky-600' : 'bg-orange-500'
                                    }`}
                                >
                                    {room.pendingEditStatus === 'PENDING' ? 'Sửa chờ duyệt' : 'Phòng mới'}
                                </div>
                            </div>
                            <div className="p-6">
                                <h3 className="mb-1 text-xl font-black text-gray-900">{room.name}</h3>
                                <p className="mb-4 flex items-center gap-1 text-sm font-bold text-gray-400">
                                    <UserIcon className="h-4 w-4" /> {property?.name ?? 'Cơ sở chưa xác định'} • {property?.addressDetail ?? 'Chưa có địa chỉ'}
                                </p>
                                <input
                                    type="text"
                                    placeholder="Lý do từ chối (tuỳ chọn)"
                                    value={roomRejectNote[room.id] ?? ''}
                                    onChange={(e) =>
                                        setRoomRejectNote((prev) => ({ ...prev, [room.id]: e.target.value }))
                                    }
                                    className="mb-3 w-full rounded-xl border border-gray-200 px-4 py-2 text-sm"
                                />
                                <div className="mt-6 flex gap-2">
                                    <button
                                        type="button"
                                        disabled={actingRoomId === room.id}
                                        onClick={() => void approveRoom(room)}
                                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gray-900 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-green-600 active:scale-95"
                                    >
                                        {actingRoomId === room.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />} Duyệt
                                    </button>
                                    <button
                                        type="button"
                                        disabled={actingRoomId === room.id}
                                        onClick={() => void rejectRoomById(room)}
                                        className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-3 text-sm font-bold text-gray-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-500 active:scale-95"
                                    >
                                        <XCircle className="h-4 w-4" /> Từ chối
                                    </button>
                                </div>
                            </div>
                        </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {tab === 'users' && (
                <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm animate-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center justify-between border-b border-gray-100 p-8">
                        <h3 className="text-xl font-black text-gray-900">KYC người dùng (dữ liệu thật)</h3>
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                                value={usersKycSearch}
                                onChange={(e) => setUsersKycSearch(e.target.value)}
                                className="w-64 rounded-xl border border-gray-100 bg-gray-50 py-3 pl-12 pr-4 text-sm font-bold"
                                placeholder="Tìm user..."
                            />
                        </div>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {loadingUsersKyc ? (
                            <div className="flex justify-center py-16">
                                <Loader2 className="h-10 w-10 animate-spin text-red-500" />
                            </div>
                        ) : visibleUsersKyc
                            .filter((u) => {
                                const q = usersKycSearch.trim().toLowerCase();
                                if (!q) return true;
                                return (
                                    (u.name ?? '').toLowerCase().includes(q) ||
                                    (u.email ?? '').toLowerCase().includes(q)
                                );
                            })
                            .map((req, i) => (
                            <div
                                key={i}
                                className="flex items-center justify-between p-6 transition-colors hover:bg-gray-50"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-500">
                                        <FileCheck className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">{req.name}</h4>
                                        <p className="text-sm font-medium text-gray-500">{req.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-8">
                                    <div className="text-right">
                                        <p className="mb-1 text-xs font-black uppercase tracking-wider text-gray-400">
                                            Document
                                        </p>
                                        <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-1 text-sm font-bold text-blue-600">
                                            <ImageIcon className="h-4 w-4" />
                                            {req.verificationDocs && req.verificationDocs.length > 0
                                                ? 'Đã nộp tài liệu'
                                                : 'Chưa nộp'}
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <input
                                            type="text"
                                            value={usersKycRejectReason[req.id] ?? ''}
                                            onChange={(e) =>
                                                setUsersKycRejectReason((prev) => ({ ...prev, [req.id]: e.target.value }))
                                            }
                                            placeholder="Lý do từ chối (tuỳ chọn)"
                                            className="w-52 rounded-lg border border-gray-200 px-3 py-1.5 text-xs"
                                        />
                                        <div className="flex gap-2">
                                        <button
                                            type="button"
                                            disabled={actingUserKycId === req.id}
                                            onClick={() => void approveUserKyc(req.id)}
                                            className="rounded-xl bg-green-50 p-3 text-green-600 transition-colors hover:bg-green-500 hover:text-white disabled:opacity-50"
                                        >
                                            {actingUserKycId === req.id ? (
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                            ) : (
                                                <CheckCircle2 className="h-5 w-5" />
                                            )}
                                        </button>
                                        <button
                                            type="button"
                                            disabled={actingUserKycId === req.id}
                                            onClick={() => void rejectUserKyc(req.id)}
                                            className="rounded-xl bg-red-50 p-3 text-red-600 transition-colors hover:bg-red-500 hover:text-white disabled:opacity-50"
                                        >
                                            <XCircle className="h-5 w-5" />
                                        </button>
                                    </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {!loadingUsersKyc && visibleUsersKyc.length === 0 && (
                            <div className="py-16 text-center text-gray-500">Không có đơn KYC chờ duyệt.</div>
                        )}
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
