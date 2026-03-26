import { useCallback, useEffect, useMemo, useState } from 'react';
import { AdminLayout } from '../../../layouts/AdminLayout';
import { userService } from '../../user-management/services/userService';
import { getApiErrorMessage } from '@/utils/apiError';
import { showToast } from '@/utils/toast';
import { 
    Loader2, 
    RefreshCw, 
    Search as SearchIcon, 
    User2, 
    ShieldAlert, 
    ShieldCheck, 
    MoreHorizontal,
    Ban,
    CheckCircle2,
    Filter,
    Users,
    ArrowUpDown,
    Download,
    Upload,
    Eye
} from 'lucide-react';
import { UserDetailsModal } from '../../user-management/components/UserDetailsModal';
import type { User, AccountStatus } from '@/types';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { hostPartnerApplicationService, HostPartnerApplicationAdminItem } from '@/client/features/host/services/hostPartnerApplicationService';
import { AdminDetailOverlay } from '@/admin/components/AdminDetailOverlay';
import { Image as ImageIcon, ExternalLink } from 'lucide-react';

export function HostManagementPage() {
    const [loading, setLoading] = useState(false);
    const [hosts, setHosts] = useState<User[]>([]);
    const [search, setSearch] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState<AccountStatus | 'all'>('all');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isSortOpen, setIsSortOpen] = useState(false);
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({
        key: 'createdAt',
        direction: 'desc'
    });
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [actingId, setActingId] = useState<string | null>(null);
    const [kycFilter, setKycFilter] = useState<string>('all');
    const [selectedPartnerApp, setSelectedPartnerApp] = useState<HostPartnerApplicationAdminItem | null>(null);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    const loadHosts = useCallback(async () => {
        setLoading(true);
        try {
            const res = await userService.getUsers({
                page: 0,
                size: 50, 
                role: 'Host',
                status: statusFilter === 'all' ? undefined : statusFilter,
                kyc: kycFilter === 'all' ? undefined : kycFilter,
                search: search.trim() || undefined,
                sort: `${sortConfig.key},${sortConfig.direction}`
            });
            setHosts(res.items);
        } catch (e) {
            showToast.error(getApiErrorMessage(e, 'Không tải được danh sách host'));
        } finally {
            setLoading(false);
        }
    }, [statusFilter, search, sortConfig, kycFilter]);

    useEffect(() => {
        const timer = setTimeout(() => {
            void loadHosts();
        }, 300);
        return () => clearTimeout(timer);
    }, [loadHosts]);

    const handleToggleStatus = async (host: User, active: boolean) => {
        if (!window.confirm(`Bạn có chắc muốn ${active ? 'kích hoạt' : 'tạm đình chỉ'} host ${host.name}?`)) return;
        
        setActingId(host.id);
        try {
            await userService.toggleUserStatus(host.id, active);
            showToast.success(`${active ? 'Kích hoạt' : 'Đình chỉ'} thành công`);
            void loadHosts();
        } catch (e) {
            showToast.error(getApiErrorMessage(e, 'Cập nhật trạng thái thất bại'));
        } finally {
            setActingId(null);
        }
    };

    const handleViewApplication = async (userId: string) => {
        setActingId(userId);
        try {
            const app = await hostPartnerApplicationService.adminGetByUserId(userId);
            setSelectedPartnerApp(app);
        } catch (e) {
            showToast.error(getApiErrorMessage(e, 'Không tìm thấy hồ sơ đăng ký'));
        } finally {
            setActingId(null);
            setOpenMenuId(null);
        }
    };

    const handleDownloadContract = async (id: string) => {
        try {
            const blob = await hostPartnerApplicationService.adminDownloadContract(id);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `contract-${id}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (e) {
            showToast.error("Không thể tải hợp đồng");
        }
    };

    const stats = useMemo(() => {
        return {
            total: hosts.length,
            active: hosts.filter(h => h.accountStatus === 'active').length,
            suspended: hosts.filter(h => h.accountStatus === 'suspended').length
        };
    }, [hosts]);

    const handleSort = (key: string) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
        setIsSortOpen(false);
    };

    return (
        <AdminLayout title="Host CRM">
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-gray-900">Host CRM</h1>
                    <p className="font-medium text-gray-500">
                        Quản lý danh sách đối tác host và trạng thái hoạt động của tài khoản.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <button
                        type="button"
                        onClick={() => void loadHosts()}
                        disabled={loading}
                        className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 text-sm font-bold text-white shadow-lg transition hover:bg-gray-800 active:scale-95 disabled:opacity-50"
                    >
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        Làm mới dữ liệu
                    </button>
                </div>
            </div>

            {/* Toolbar */}
            <div className="mb-8 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                    {/* Status Tabs */}
                    <div className="flex flex-wrap items-center gap-2">
                        {(
                            [
                                { value: 'all', label: 'Tất cả' },
                                { value: 'active', label: 'Hoạt động' },
                                { value: 'suspended', label: 'Bị đình chỉ' },
                            ] as { value: AccountStatus | 'all'; label: string }[]
                        ).map((tab) => (
                            <button
                                key={tab.value}
                                type="button"
                                onClick={() => setStatusFilter(tab.value)}
                                className={`inline-flex h-9 cursor-pointer items-center rounded-lg border px-3 text-sm font-semibold transition ${
                                    statusFilter === tab.value
                                        ? 'border-gray-300 bg-gray-100 text-gray-900'
                                        : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                                <span>{tab.label}</span>
                                <span className="ml-1.5 rounded-md bg-gray-100 px-1.5 py-0.5 text-[11px] font-bold text-gray-600">
                                    {tab.value === 'all' ? stats.total : tab.value === 'active' ? stats.active : stats.suspended}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Search & Utility */}
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="relative flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setIsSearchOpen((prev) => !prev)}
                                className={`inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border-2 transition-all ${
                                    isSearchOpen || search
                                        ? 'border-slate-100 bg-slate-50 text-slate-900'
                                        : 'border-gray-100 bg-white text-gray-400 hover:border-gray-200 hover:text-gray-600'
                                }`}
                                title="Tìm kiếm"
                            >
                                <SearchIcon className="h-5 w-5" />
                            </button>

                            {isSearchOpen && (
                                <div className="w-64 sm:w-80">
                                    <input
                                        autoFocus
                                        type="text"
                                        placeholder="Tìm theo tên, email, SĐT..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="h-10 w-full rounded-xl border-2 border-gray-100 bg-white px-4 text-sm font-bold text-gray-700 outline-none focus:border-slate-300 transition-all placeholder:text-gray-300 shadow-sm"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Sort Dropdown */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setIsSortOpen(!isSortOpen)}
                                className={`inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border-2 transition-all ${
                                    isSortOpen 
                                        ? 'border-blue-100 bg-blue-50 text-blue-600' 
                                        : 'border-gray-100 bg-white text-gray-400 hover:border-gray-200 hover:text-gray-600'
                                }`}
                                title="Sắp xếp"
                            >
                                <ArrowUpDown className="h-5 w-5" />
                            </button>

                            {isSortOpen && (
                                <div className="absolute right-0 top-12 z-50 w-48 rounded-2xl border border-gray-100 bg-white p-2 shadow-xl animate-in fade-in zoom-in-95 duration-200">
                                    <div className="px-3 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 mb-1">Sắp xếp theo</div>
                                    <button 
                                        onClick={() => handleSort('createdAt')}
                                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-colors flex items-center justify-between group ${sortConfig.key === 'createdAt' ? 'bg-slate-50 text-slate-900' : 'text-gray-700 hover:bg-gray-50'}`}
                                    >
                                        Mới nhất <div className={`w-1.5 h-1.5 rounded-full bg-slate-900 ${sortConfig.key === 'createdAt' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
                                    </button>
                                    <button 
                                        onClick={() => handleSort('fullName')}
                                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-colors flex items-center justify-between group ${sortConfig.key === 'fullName' ? 'bg-slate-50 text-slate-900' : 'text-gray-700 hover:bg-gray-50'}`}
                                    >
                                        Tên A-Z <div className={`w-1.5 h-1.5 rounded-full bg-slate-900 ${sortConfig.key === 'fullName' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Advanced Filter Popover */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setIsFilterOpen(!isFilterOpen)}
                                className={`inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border-2 transition-all ${
                                    isFilterOpen || kycFilter !== 'all'
                                        ? 'border-slate-100 bg-slate-900 text-white shadow-lg' 
                                        : 'border-gray-100 bg-white text-gray-400 hover:border-gray-200 hover:text-gray-600'
                                }`}
                                title="Thanh lọc"
                            >
                                <Filter className="h-5 w-5" />
                            </button>

                            {isFilterOpen && (
                                <div className="absolute right-0 top-12 z-50 w-72 rounded-2xl border border-gray-100 bg-white p-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200 ring-1 ring-black/5">
                                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <Filter className="w-3 h-3 text-slate-900" />
                                        Thanh lọc nâng cao
                                    </h3>
                                    
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block pl-1">Ngày tham gia</label>
                                            <select className="w-full h-9 rounded-lg border border-gray-100 bg-gray-50 px-2 text-xs font-bold text-gray-700 outline-none focus:border-slate-300 transition-all">
                                                <option>Tất cả thời gian</option>
                                                <option>7 ngày qua</option>
                                                <option>30 ngày qua</option>
                                                <option>Năm nay</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block pl-1">Xác thực KYC</label>
                                            <div className="flex flex-wrap gap-2">
                                                {[
                                                    { id: 'all', label: 'Tất cả' },
                                                    { id: 'verified', label: 'Đã xác thực' },
                                                    { id: 'not_submitted', label: 'Chưa xác thực' }
                                                ].map(s => (
                                                    <button 
                                                        key={s.id} 
                                                        onClick={() => setKycFilter(s.id)}
                                                        className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold transition-all cursor-pointer ${
                                                            kycFilter === s.id
                                                                ? 'bg-slate-900 border-slate-900 text-white shadow-md'
                                                                : 'border-gray-100 bg-white text-gray-600 hover:bg-gray-50'
                                                        }`}
                                                    >
                                                        {s.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between">
                                        <button 
                                            onClick={() => {
                                                setKycFilter('all');
                                                setStatusFilter('all');
                                                setSearch('');
                                                setIsFilterOpen(false);
                                            }}
                                            className="text-[10px] font-black text-slate-900 uppercase tracking-widest hover:text-black cursor-pointer"
                                        >
                                            Đặt lại
                                        </button>
                                        <button 
                                            onClick={() => setIsFilterOpen(false)}
                                            className="h-9 px-5 rounded-lg bg-gray-900 text-[10px] font-black text-white uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-slate-100 cursor-pointer"
                                        >
                                            Áp dụng
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Table */}
            <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-50 bg-gray-50/50">
                                <th className="px-6 py-4 text-xs">
                                    <button onClick={() => handleSort('fullName')} className="group flex items-center gap-2 font-black text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-colors uppercase cursor-pointer">
                                        Host
                                    </button>
                                </th>
                                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">Liên hệ</th>
                                <th className="px-6 py-4 text-xs">
                                    <button onClick={() => handleSort('isActive')} className="group flex items-center gap-2 font-black text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-colors uppercase cursor-pointer">
                                        Trạng thái
                                    </button>
                                </th>
                                <th className="px-6 py-4 text-xs">
                                    <button onClick={() => handleSort('createdAt')} className="group flex items-center gap-2 font-black text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-colors uppercase cursor-pointer">
                                        Ngày tham gia
                                    </button>
                                </th>
                                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400 text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading && hosts.length === 0 ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={5} className="px-6 py-8">
                                            <div className="h-4 bg-gray-100 rounded-full w-3/4"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : hosts.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="h-16 w-16 rounded-full bg-gray-50 flex items-center justify-center">
                                                <Users className="h-8 w-8 text-gray-300" />
                                            </div>
                                            <p className="text-gray-500 font-medium">Không tìm thấy host nào</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                hosts.map((host) => (
                                    <tr key={host.id} className="group hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 overflow-hidden rounded-xl bg-gray-100 border border-gray-200">
                                                    {host.avatar ? (
                                                        <img src={host.avatar} alt={host.name} className="h-full w-full object-cover" />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center text-gray-400">
                                                            <User2 className="h-5 w-5" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900">{host.name}</p>
                                                    <p className="text-xs text-gray-500">ID: {host.id.slice(0, 8)}...</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <div className="space-y-1">
                                                <p className="text-gray-900">{host.email}</p>
                                                <p className="text-xs text-gray-500">{host.phone || 'Chưa cập nhật'}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black uppercase tracking-wider ${
                                                host.accountStatus === 'active' 
                                                ? 'bg-green-50 text-green-700' 
                                                : 'bg-red-50 text-red-700'
                                            }`}>
                                                <span className={`h-1.5 w-1.5 rounded-full ${host.accountStatus === 'active' ? 'bg-green-600' : 'bg-red-600'}`} />
                                                {host.accountStatus === 'active' ? 'Hoạt động' : 'Tạm dừng'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 font-medium">
                                            {format(new Date(host.joinedAt), 'dd/MM/yyyy', { locale: vi })}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                             <div className="flex items-center justify-end gap-2">
                                                 <div className="relative">
                                                     <button 
                                                         onClick={() => setOpenMenuId(openMenuId === host.id ? null : host.id)}
                                                         className={`p-2 rounded-lg transition-all ${openMenuId === host.id ? 'bg-slate-100 text-slate-900' : 'text-gray-400 hover:bg-slate-100 hover:text-slate-900'}`}
                                                         title="Thao tác"
                                                     >
                                                         <MoreHorizontal className="w-5 h-5" />
                                                     </button>

                                                     {openMenuId === host.id && (
                                                         <>
                                                             <div 
                                                                 className="fixed inset-0 z-30" 
                                                                 onClick={() => setOpenMenuId(null)}
                                                             />
                                                             <div className="absolute right-0 top-10 z-40 w-56 rounded-2xl border border-gray-100 bg-white p-2 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
                                                                 <button
                                                                     onClick={() => {
                                                                         setSelectedUser(host);
                                                                         setOpenMenuId(null);
                                                                     }}
                                                                     className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-bold text-gray-700 transition-colors hover:bg-slate-50"
                                                                 >
                                                                     <Eye className="h-4 w-4 text-gray-400" />
                                                                     Xem thông tin tài khoản
                                                                 </button>
                                                                 <button
                                                                     onClick={() => handleViewApplication(host.id)}
                                                                     className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-bold text-gray-700 transition-colors hover:bg-slate-50"
                                                                 >
                                                                     <ImageIcon className="h-4 w-4 text-gray-400" />
                                                                     Xem hồ sơ đối tác
                                                                 </button>
                                                                 <div className="my-1 h-px bg-gray-50" />
                                                                 {host.accountStatus === 'active' ? (
                                                                     <button
                                                                         onClick={() => void handleToggleStatus(host, false)}
                                                                         disabled={actingId === host.id}
                                                                         className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-bold text-red-600 transition-colors hover:bg-red-50"
                                                                     >
                                                                         {actingId === host.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Ban className="h-4 w-4" />}
                                                                         Đình chỉ tài khoản
                                                                     </button>
                                                                 ) : (
                                                                     <button
                                                                         onClick={() => void handleToggleStatus(host, true)}
                                                                         disabled={actingId === host.id}
                                                                         className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-bold text-green-600 transition-colors hover:bg-green-50"
                                                                     >
                                                                         {actingId === host.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                                                                         Kích hoạt lại
                                                                     </button>
                                                                 )}
                                                             </div>
                                                         </>
                                                     )}
                                                 </div>
                                             </div>
                                         </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <UserDetailsModal 
                user={selectedUser} 
                onClose={() => setSelectedUser(null)} 
            />

            <AdminDetailOverlay
                isOpen={!!selectedPartnerApp}
                onClose={() => setSelectedPartnerApp(null)}
                title="Chi tiết hồ sơ đối tác"
                subtitle="XEM LẠI THÔNG TIN ĐĂNG KÝ VÀ HỢP ĐỒNG ĐIỆN TỬ"
            >
                {selectedPartnerApp && (
                    <div className="space-y-8">
                        <section className="space-y-4">
                            <h5 className="text-[11px] font-black uppercase text-slate-900 tracking-widest pl-1 opacity-40">Thông tin định danh</h5>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                                    <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Họ tên & Email</span>
                                    <p className="text-sm font-bold text-gray-900 truncate">{selectedPartnerApp.fullName}</p>
                                    <p className="text-xs text-gray-500 truncate">{selectedPartnerApp.email}</p>
                                </div>
                                <div className="space-y-1.5 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                                    <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Số điện thoại & MST</span>
                                    <p className="text-sm font-bold text-gray-900">{selectedPartnerApp.phone}</p>
                                    <p className="text-xs text-gray-500 font-bold">{selectedPartnerApp.taxId || 'N/A'}</p>
                                </div>
                            </div>
                            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                                <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Địa chỉ hoạt động</span>
                                <p className="text-xs font-bold text-gray-900 leading-relaxed mt-1">{selectedPartnerApp.address}</p>
                            </div>
                        </section>

                        <section className="space-y-4">
                            <h5 className="text-[11px] font-black uppercase text-slate-900 tracking-widest pl-1 opacity-40">Tài khoản thanh toán</h5>
                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Chủ tài khoản</span>
                                        <p className="text-xs font-bold text-slate-900 mt-0.5">{selectedPartnerApp.bankAccountHolder || '-'}</p>
                                    </div>
                                    <div>
                                        <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Số tài khoản</span>
                                        <p className="text-xs font-bold text-slate-900 mt-0.5">{selectedPartnerApp.bankAccountNumber || '-'}</p>
                                    </div>
                                </div>
                                <div className="mt-3 pt-3 border-t border-slate-200/50">
                                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Ngân hàng thụ hưởng</span>
                                    <p className="text-xs font-bold text-slate-900 mt-0.5">{selectedPartnerApp.bankName || '-'}</p>
                                </div>
                            </div>
                        </section>

                        <section className="space-y-4">
                             <h5 className="text-[11px] font-black uppercase text-slate-900 tracking-widest pl-1 opacity-40">Hợp đồng điện tử & Tài liệu KYC</h5>
                             <div className="grid grid-cols-2 gap-4">
                                 <button 
                                     onClick={() => handleDownloadContract(selectedPartnerApp.id)}
                                     className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-900 text-white group hover:bg-black transition-all text-left cursor-pointer"
                                 >
                                     <div className="flex items-center gap-3">
                                         <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                                             <Download className="w-5 h-5" />
                                         </div>
                                         <div>
                                             <p className="text-[10px] font-black uppercase tracking-widest opacity-60">E-Contract</p>
                                             <p className="font-bold text-sm">TẢI HỢP ĐỒNG PDF</p>
                                         </div>
                                     </div>
                                     <ExternalLink className="w-4 h-4 opacity-40" />
                                 </button>

                                 <div className="grid grid-cols-3 gap-2">
                                     {[
                                         { url: selectedPartnerApp.documentFrontUrl, label: 'CCCD Mặt trước' },
                                         { url: selectedPartnerApp.documentBackUrl, label: 'CCCD Mặt sau' },
                                         { url: selectedPartnerApp.businessLicenseUrl, label: 'GPKD' }
                                     ].map((doc, idx) => (
                                         doc.url && (
                                             <a 
                                               key={idx}
                                               href={doc.url}
                                               target="_blank"
                                               rel="noreferrer"
                                               className="aspect-square flex flex-col items-center justify-center gap-2 rounded-2xl bg-gray-50 border border-gray-100 hover:border-blue-200 hover:bg-white transition-all shadow-sm group"
                                             >
                                                 <ImageIcon className="w-6 h-6 text-gray-300 group-hover:text-blue-500" />
                                                 <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">{doc.label}</span>
                                             </a>
                                         )
                                     ))}
                                 </div>
                             </div>
                        </section>
                    </div>
                )}
            </AdminDetailOverlay>
        </AdminLayout>
    );
}
