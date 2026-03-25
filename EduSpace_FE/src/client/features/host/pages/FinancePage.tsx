import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Wallet, CircleDollarSign, ArrowUpRight, Clock, Download } from 'lucide-react';
import { RentalLayout } from '../../../layouts/RentalLayout';
import { HOST_FINANCE, BOOKING_REQUESTS } from '../data/mockData';
import { formatCurrency } from '../../../../utils';
import { useAuthStore } from '@/stores/authStore';
import { hasHostPermission } from '@/utils/keycloakTokenRoles';
import { hostPermissions } from '../permissions/hostPermissions';
import { refreshHostPermissionsFromAccount } from '@/utils/refreshHostPermissionsFromAccount';

export function FinancePage() {
    const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');
    const accessToken = useAuthStore((s) => s.accessToken);
    const hostPermissionsFromAccount = useAuthStore((s) => s.hostPermissionsFromAccount);

    useEffect(() => {
        void refreshHostPermissionsFromAccount();
    }, [accessToken]);
    const finance = HOST_FINANCE;
    const canViewFinance = hasHostPermission(accessToken, hostPermissions.finance.view, hostPermissionsFromAccount);
    const canExportFinance = hasHostPermission(accessToken, hostPermissions.finance.export, hostPermissionsFromAccount);
    const canCreatePayout = hasHostPermission(accessToken, hostPermissions.finance.payoutCreate, hostPermissionsFromAccount);

    const revenueChange = ((finance.thisMonthRevenue - finance.lastMonthRevenue) / finance.lastMonthRevenue * 100).toFixed(1);
    const isUp = finance.thisMonthRevenue >= finance.lastMonthRevenue;

    // Mock recent payouts
    const recentPayouts = [
        { id: 1, amount: 5_200_000, date: '2024-12-12', status: 'completed' as const },
        { id: 2, amount: 3_800_000, date: '2024-12-08', status: 'completed' as const },
        { id: 3, amount: 8_500_000, date: '2024-12-15', status: 'pending' as const },
    ];

    if (!canViewFinance) {
        return (
            <RentalLayout title="Tài chính">
                <div className="mx-auto max-w-lg p-8 text-center text-gray-600">
                    Bạn không có quyền xem module tài chính.
                </div>
            </RentalLayout>
        );
    }

    return (
        <RentalLayout title="Tài chính">
            <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Tài chính & Doanh thu</h1>
                        <p className="text-gray-500 font-medium">Theo dõi thu nhập, hoa hồng và yêu cầu rút tiền.</p>
                    </div>
                    <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-1">
                        {(['week', 'month', 'year'] as const).map(p => (
                            <button key={p} onClick={() => setPeriod(p)} className={`px-5 py-2.5 rounded-lg font-bold text-sm transition-all ${period === p ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                                {p === 'week' ? 'Tuần' : p === 'month' ? 'Tháng' : 'Năm'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 text-white shadow-xl">
                        <div className="flex items-center justify-between mb-4">
                            <Wallet className="w-8 h-8 text-gray-400" />
                            <span className={`flex items-center gap-1 text-sm font-black ${isUp ? 'text-green-400' : 'text-red-400'}`}>
                                {isUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                {revenueChange}%
                            </span>
                        </div>
                        <div className="text-sm font-bold text-gray-400 mb-1">Tổng doanh thu</div>
                        <div className="text-2xl font-black">{formatCurrency(finance.totalEarnings)}</div>
                    </div>

                    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <CircleDollarSign className="w-8 h-8 text-blue-400" />
                            <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-lg uppercase tracking-widest">Tháng này</span>
                        </div>
                        <div className="text-sm font-bold text-gray-400 mb-1">Doanh thu tháng</div>
                        <div className="text-2xl font-black text-gray-900">{formatCurrency(finance.thisMonthRevenue)}</div>
                    </div>

                    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <ArrowUpRight className="w-8 h-8 text-amber-400" />
                            <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-1 rounded-lg uppercase tracking-widest">Chờ rút</span>
                        </div>
                        <div className="text-sm font-bold text-gray-400 mb-1">Đang chờ rút</div>
                        <div className="text-2xl font-black text-gray-900">{formatCurrency(finance.pendingPayouts)}</div>
                    </div>

                    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-8 h-8 bg-red-50 rounded-xl flex items-center justify-center text-red-400 text-xs font-black">{finance.commissionRate}%</div>
                            <span className="text-[10px] font-black text-red-500 bg-red-50 px-2 py-1 rounded-lg uppercase tracking-widest">Hoa hồng</span>
                        </div>
                        <div className="text-sm font-bold text-gray-400 mb-1">Đã trả hoa hồng</div>
                        <div className="text-2xl font-black text-gray-900">{formatCurrency(finance.commissionPaid)}</div>
                    </div>
                </div>

                {/* Trên mobile: đưa “Lịch sử rút tiền” lên trước để dễ thấy (cột 2 order-1, cột 1 order-2) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Recent Bookings Revenue */}
                    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm order-2 lg:order-1">
                        <h3 className="font-black text-gray-900 mb-6">Doanh thu theo đơn gần đây</h3>
                        <div className="space-y-3">
                            {BOOKING_REQUESTS.filter(b => b.revenueAmount).map(b => (
                                <div key={b.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all">
                                    <div className="flex items-center gap-3">
                                        <img src={b.guestAvatar} alt="" className="w-10 h-10 rounded-xl object-cover" />
                                        <div>
                                            <p className="font-bold text-gray-900 text-sm">{b.guestName}</p>
                                            <p className="text-xs text-gray-400 font-medium">{b.spaceName} · {b.date}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-black text-gray-900">{b.revenue} ₫</div>
                                        <div className={`text-[10px] font-black uppercase tracking-widest ${b.paymentStatus === 'fully_paid' ? 'text-green-500' : b.paymentStatus === 'escrow' ? 'text-amber-500' : 'text-gray-400'}`}>
                                            {b.paymentStatus === 'fully_paid' ? 'Đã nhận' : b.paymentStatus === 'escrow' ? 'Giữ tiền' : b.paymentStatus}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Payout History */}
                    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm order-1 lg:order-2">
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                            <h3 className="font-black text-gray-900">Lịch sử rút tiền</h3>
                            {canExportFinance ? (
                                <button
                                    type="button"
                                    className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-bold text-gray-800 shadow-sm hover:bg-white hover:border-gray-300 transition-all"
                                >
                                    <Download className="w-4 h-4 shrink-0" /> Xuất CSV
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    disabled
                                    title="Chưa có quyền xuất. Trong Admin Portal, bật « Tài chính: Xuất » cho vai trò HOST, lưu, rồi tải lại trang này."
                                    className="flex items-center gap-2 rounded-xl border border-dashed border-gray-200 px-4 py-2 text-sm font-bold text-gray-400 cursor-not-allowed"
                                >
                                    <Download className="w-4 h-4 shrink-0 opacity-60" /> Xuất CSV
                                </button>
                            )}
                        </div>
                        <div className="space-y-3">
                            {recentPayouts.map(p => (
                                <div key={p.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${p.status === 'completed' ? 'bg-green-50 text-green-500' : 'bg-amber-50 text-amber-500'}`}>
                                            {p.status === 'completed' ? <ArrowUpRight className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 text-sm">{formatCurrency(p.amount)}</p>
                                            <p className="text-xs text-gray-400 font-medium">{new Date(p.date).toLocaleDateString('vi-VN')}</p>
                                        </div>
                                    </div>
                                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${p.status === 'completed' ? 'text-green-600 bg-green-50' : 'text-amber-600 bg-amber-50'}`}>
                                        {p.status === 'completed' ? 'Đã chuyển' : 'Đang xử lý'}
                                    </span>
                                </div>
                            ))}
                        </div>
                        {canCreatePayout && (
                            <button className="w-full mt-6 bg-gradient-to-r from-gray-900 to-gray-800 text-white py-4 rounded-2xl font-black shadow-lg hover:shadow-xl transition-all active:scale-95">
                                💰 Yêu cầu rút tiền
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </RentalLayout>
    );
}
