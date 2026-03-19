import { AdminLayout } from '../../../layouts/AdminLayout';
import {
    User,
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
import { showToast } from '@/utils/toast';
import { getApiErrorMessage } from '@/utils/apiError';

export function VerificationPage() {
    const [tab, setTab] = useState<'partners' | 'rooms' | 'users'>('partners');
    const [partnerApps, setPartnerApps] = useState<HostPartnerApplicationAdminItem[]>([]);
    const [loadingPartners, setLoadingPartners] = useState(false);
    const [actingId, setActingId] = useState<string | null>(null);
    const [rejectNote, setRejectNote] = useState<Record<string, string>>({});

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

    const approve = async (id: string) => {
        setActingId(id);
        try {
            await hostPartnerApplicationService.adminApprove(id);
            showToast.success('Đã duyệt — user có role TUTOR (host). Nhắc user đăng nhập lại.');
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
            await hostPartnerApplicationService.adminReject(id, rejectNote[id] || undefined);
            showToast.success('Đã từ chối đơn');
            setRejectNote((m) => ({ ...m, [id]: '' }));
            await loadPartners();
        } catch (e) {
            showToast.error(getApiErrorMessage(e, 'Từ chối thất bại'));
        } finally {
            setActingId(null);
        }
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
                    Đơn đối tác cho thuê
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
                                                    {app.applicantType} · userId: {app.userId.slice(0, 8)}…
                                                </p>
                                                {app.phone ? (
                                                    <p className="text-sm text-gray-600">ĐT: {app.phone}</p>
                                                ) : null}
                                                {app.address ? (
                                                    <p className="mt-2 text-sm text-gray-600">{app.address}</p>
                                                ) : null}
                                                {app.message ? (
                                                    <p className="mt-2 rounded-lg bg-slate-50 p-3 text-sm text-gray-700">
                                                        {app.message}
                                                    </p>
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
                                                    onClick={() => void approve(app.id)}
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
                            ))}
                        </div>
                    )}
                </div>
            )}

            {tab === 'rooms' && (
                <div className="grid animate-in grid-cols-1 gap-6 duration-500 slide-in-from-bottom-4 md:grid-cols-2 lg:grid-cols-3">
                    {[
                        {
                            id: '1',
                            name: 'Premium Meeting Room A',
                            host: 'Host A',
                            location: 'District 1, HCMC',
                            price: '200,000',
                            img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=400&q=80',
                        },
                        {
                            id: '2',
                            name: 'Creative Studio Space',
                            host: 'Host B',
                            location: 'Thu Duc City',
                            price: '350,000',
                            img: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=400&q=80',
                        },
                    ].map((room) => (
                        <div
                            key={room.id}
                            className="group overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:shadow-xl"
                        >
                            <div className="relative h-48 overflow-hidden bg-gray-200">
                                <img
                                    src={room.img}
                                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    alt=""
                                />
                                <div className="absolute right-4 top-4 rounded-full bg-orange-500 px-3 py-1 text-xs font-black uppercase tracking-wider text-white shadow-lg">
                                    Pending
                                </div>
                            </div>
                            <div className="p-6">
                                <h3 className="mb-1 text-xl font-black text-gray-900">{room.name}</h3>
                                <p className="mb-4 flex items-center gap-1 text-sm font-bold text-gray-400">
                                    <User className="h-4 w-4" /> {room.host} • {room.location}
                                </p>
                                <div className="mt-6 flex gap-2">
                                    <button
                                        type="button"
                                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gray-900 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-green-600 active:scale-95"
                                    >
                                        <CheckCircle2 className="h-4 w-4" /> Duyệt
                                    </button>
                                    <button
                                        type="button"
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

            {tab === 'users' && (
                <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm animate-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center justify-between border-b border-gray-100 p-8">
                        <h3 className="text-xl font-black text-gray-900">KYC (mock)</h3>
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                                className="w-64 rounded-xl border border-gray-100 bg-gray-50 py-3 pl-12 pr-4 text-sm font-bold"
                                placeholder="Tìm user..."
                            />
                        </div>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {[
                            {
                                name: 'Tran Thi B',
                                email: 'hostB@example.com',
                                docType: 'Identity Card',
                                date: '2023-10-25',
                            },
                            {
                                name: 'Le Van C',
                                email: 'hostC@example.com',
                                docType: 'Business License',
                                date: '2023-10-24',
                            },
                        ].map((req, i) => (
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
                                        <div className="flex cursor-pointer items-center gap-2 rounded-lg bg-blue-50 px-3 py-1 text-sm font-bold text-blue-600 transition-colors hover:bg-blue-100">
                                            <ImageIcon className="h-4 w-4" /> {req.docType}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            className="rounded-xl bg-green-50 p-3 text-green-600 transition-colors hover:bg-green-500 hover:text-white"
                                        >
                                            <CheckCircle2 className="h-5 w-5" />
                                        </button>
                                        <button
                                            type="button"
                                            className="rounded-xl bg-red-50 p-3 text-red-600 transition-colors hover:bg-red-500 hover:text-white"
                                        >
                                            <XCircle className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
