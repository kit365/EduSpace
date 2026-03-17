import { useUsers } from '../hooks/useUsers';
import { User } from '@/types';
import { 
    User as UserIcon, 
    Shield, 
    Search, 
    Users, 
    UserRound, 
    Briefcase, 
    ChevronDown, 
    Filter, 
    Check, 
    X, 
    RefreshCcw,
    ShieldCheck,
    Clock,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

export function UserManagementView() {
    const { t } = useTranslation();
    const [searchQuery, setSearchQuery] = useState('');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    
    // Multi-field filter state (roles: array of selected role values, empty = "Tất cả")
    const [filters, setFilters] = useState<{ roles: string[]; status: string; kyc: string }>({
        roles: [],
        status: 'Tất cả',
        kyc: 'Tất cả'
    });

    const [tempFilters, setTempFilters] = useState({ ...filters });
    const [currentPage, setCurrentPage] = useState(0);
    const lastAppliedSearch = useRef(searchQuery);

    const { users, loading, pagination, setParams, refresh } = useUsers({
        page: currentPage,
        size: 10,
        search: searchQuery,
        role: filters.roles.length > 0 ? filters.roles.join(',') : undefined,
        status: filters.status === 'Tất cả' ? undefined : filters.status,
    });

    // Debounce search — only update params when search actually changed to avoid double fetch
    useEffect(() => {
        const timer = setTimeout(() => {
            if (lastAppliedSearch.current === searchQuery) return;
            lastAppliedSearch.current = searchQuery;
            setParams(prev => ({ ...prev, search: searchQuery, page: 0 }));
            setCurrentPage(0);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery, setParams]);

    const roleOptionsAll = [
        { id: 'super_admin', name: t('admin_management.roles.super_admin'), icon: Shield, value: 'Super Admin' },
        { id: 'admin', name: t('admin_management.roles.admin'), icon: Shield, value: 'Admin' },
        { id: 'staff', name: t('admin_management.roles.staff'), icon: Briefcase, value: 'Nhân viên' },
        { id: 'host', name: t('admin_management.roles.host'), icon: ShieldCheck, value: 'Host' },
        { id: 'renter', name: t('admin_management.roles.renter'), icon: UserRound, value: 'Khách hàng' },
    ];

    const toggleRole = (value: string) => {
        setTempFilters(prev => ({
            ...prev,
            roles: prev.roles.includes(value) ? prev.roles.filter(r => r !== value) : [...prev.roles, value]
        }));
    };

    const statusOptions = [
        { label: t('admin_management.status.all'), value: 'Tất cả' },
        { label: t('admin_management.status.active'), value: 'Active' },
        { label: t('admin_management.status.suspended'), value: 'Suspended' },
        { label: t('admin_management.status.pending'), value: 'Pending' },
        { label: t('admin_management.status.blocked'), value: 'Blocked' },
    ];

    const handleApplyFilters = () => {
        setFilters({ ...tempFilters });
        setParams(prev => ({ 
            ...prev, 
            role: tempFilters.roles.length > 0 ? tempFilters.roles.join(',') : undefined,
            status: tempFilters.status === 'Tất cả' ? undefined : tempFilters.status,
            page: 0 
        }));
        setCurrentPage(0);
        setIsFilterOpen(false);
    };

    const handleResetFilters = () => {
        const reset = { roles: [] as string[], status: 'Tất cả', kyc: 'Tất cả' };
        setTempFilters(reset);
        setFilters(reset);
        setParams(prev => ({ ...prev, role: undefined, status: undefined, page: 0 }));
        setCurrentPage(0);
    };

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
        setParams(prev => ({ ...prev, page: newPage }));
    };

    const activeFilterCount = filters.roles.length + (filters.status !== 'Tất cả' ? 1 : 0) + (filters.kyc !== 'Tất cả' ? 1 : 0);

    return (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 text-black">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">{t('admin_management.title')}</h2>
                    <p className="text-xs text-gray-400 font-bold mt-1 uppercase tracking-wider">{t('admin_management.subtitle')}</p>
                </div>
                
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:flex-none">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-12 pr-4 py-3 bg-white rounded-2xl border-2 border-gray-100 text-sm font-bold w-full md:w-72 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-gray-300 shadow-sm" 
                            placeholder={t('admin_management.searchPlaceholder')} 
                        />
                    </div>

                    <div className="relative">
                        <button 
                            onClick={() => {
                                setTempFilters({ ...filters });
                                setIsFilterOpen(!isFilterOpen);
                            }}
                            className={`flex items-center gap-2 px-5 py-3 rounded-2xl border-2 text-sm font-bold transition-all ${
                                isFilterOpen || activeFilterCount > 0
                                ? 'bg-blue-50 border-blue-200 text-blue-600 shadow-sm' 
                                : 'bg-white border-gray-100 text-gray-600 hover:border-gray-200 hover:bg-gray-50 shadow-sm'
                            }`}
                        >
                            <Filter className="w-4 h-4" />
                            <span>{t('admin_management.filter.title')}</span>
                            {activeFilterCount > 0 && (
                                <span className="bg-blue-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] ml-1">
                                    {activeFilterCount}
                                </span>
                            )}
                            <ChevronDown className={`w-4 h-4 transition-transform ml-1 ${isFilterOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isFilterOpen && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setIsFilterOpen(false)} />
                                <div className="absolute right-0 mt-3 w-80 bg-white rounded-[2rem] border border-gray-100 shadow-2xl z-20 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-200">
                                    <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                                        <div className="flex items-center gap-2">
                                            <Filter className="w-4 h-4 text-blue-600" />
                                            <span className="font-black text-gray-900 uppercase tracking-tight">{t('admin_management.filter.options')}</span>
                                        </div>
                                        <button onClick={() => setIsFilterOpen(false)} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                                            <X className="w-4 h-4 text-gray-400" />
                                        </button>
                                    </div>

                                    <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1 flex items-center gap-2">
                                                <Users className="w-3 h-3" /> {t('admin_management.filter.role')}
                                            </label>
                                            <div className="flex flex-wrap gap-2">
                                                <button
                                                    onClick={() => setTempFilters(prev => ({ ...prev, roles: [] }))}
                                                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-xs font-bold transition-all ${
                                                        tempFilters.roles.length === 0
                                                        ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-200'
                                                        : 'bg-white border-gray-100 text-gray-500 hover:border-gray-200'
                                                    }`}
                                                >
                                                    <Users className="w-3.5 h-3.5" />
                                                    {t('admin_management.roles.all')}
                                                </button>
                                                {roleOptionsAll.map((opt) => (
                                                    <button
                                                        key={opt.id}
                                                        onClick={() => toggleRole(opt.value)}
                                                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-xs font-bold transition-all ${
                                                            tempFilters.roles.includes(opt.value)
                                                            ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-200'
                                                            : 'bg-white border-gray-100 text-gray-500 hover:border-gray-200'
                                                        }`}
                                                    >
                                                        <opt.icon className="w-3.5 h-3.5" />
                                                        {opt.name}
                                                    </button>
                                                ))}
                                            </div>
                                            {tempFilters.roles.length > 0 && (
                                                <p className="text-[10px] text-gray-400 pl-1">
                                                    Đã chọn {tempFilters.roles.length} role
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1 flex items-center gap-2">
                                                <Clock className="w-3 h-3" /> {t('admin_management.filter.status')}
                                            </label>
                                            <select 
                                                value={tempFilters.status}
                                                onChange={(e) => setTempFilters(prev => ({ ...prev, status: e.target.value }))}
                                                className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-2.5 text-xs font-bold text-gray-700 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer"
                                            >
                                                {statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="p-6 bg-gray-50/50 border-t border-gray-100 flex gap-3">
                                        <button 
                                            onClick={handleResetFilters}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-200 text-gray-600 rounded-2xl text-xs font-bold hover:bg-gray-100 transition-all active:scale-95"
                                        >
                                            <RefreshCcw className="w-3.5 h-3.5" />
                                            {t('admin_management.filter.reset')}
                                        </button>
                                        <button 
                                            onClick={handleApplyFilters}
                                            className="flex-[1.5] flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-2xl text-xs font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95"
                                        >
                                            <Check className="w-3.5 h-3.5" />
                                            {t('admin_management.filter.apply')}
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="overflow-hidden mb-6">
                <table className="w-full">
                    <thead className="bg-gray-50 border-y border-gray-100">
                        <tr>
                            <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-left">User</th>
                            <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-left">Role</th>
                            <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-left">Status</th>
                            <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-left">Joined</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr>
                                <td colSpan={4} className="p-8 text-center">
                                    <div className="flex items-center justify-center gap-3 text-gray-400 font-bold">
                                        <RefreshCcw className="w-5 h-5 animate-spin" />
                                        <span>Loading users...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : users.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="p-12 text-center">
                                    <div className="text-gray-300 mb-2 font-black text-xl">Không tìm thấy người dùng</div>
                                    <div className="text-gray-400 text-sm font-bold">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</div>
                                </td>
                            </tr>
                        ) : (
                            users.map((u: User) => (
                                <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 text-white flex items-center justify-center font-bold text-xs shadow-md">
                                                {(u.name ?? '-').charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900 text-sm">{u.name ?? '-'}</div>
                                                <div className="text-xs text-gray-400 font-medium">{u.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                                            u.role === 'super_admin' ? 'bg-indigo-50 text-indigo-600' :
                                            u.role === 'admin' ? 'bg-purple-50 text-purple-600' :
                                            u.role === 'host' ? 'bg-orange-50 text-orange-600' : 
                                            u.role === 'staff' ? 'bg-cyan-50 text-cyan-600' :
                                            'bg-blue-50 text-blue-600'
                                            }`}>
                                            {(u.role === 'admin' || u.role === 'super_admin') && <Shield className="w-3 h-3" />}
                                            {t(`admin_management.roles.${u.role}`)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                                            u.accountStatus === 'active' ? 'bg-green-50 text-green-600' :
                                            u.accountStatus === 'suspended' ? 'bg-yellow-50 text-yellow-600' :
                                            u.accountStatus === 'blocked' || u.accountStatus === 'banned' ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-500'
                                            }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${
                                                u.accountStatus === 'active' ? 'bg-green-500 animate-pulse' : 
                                                u.accountStatus === 'suspended' ? 'bg-yellow-500' :
                                                u.accountStatus === 'blocked' || u.accountStatus === 'banned' ? 'bg-red-500' : 'bg-gray-400'}`}></span>
                                            {t(`admin_management.status.${u.accountStatus}`)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-xs font-bold text-gray-500">{u.joinedAt ? new Date(u.joinedAt).toLocaleDateString() : '-'}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                        Total: <span className="text-gray-900">{pagination.total}</span> users
                    </p>
                    <div className="flex items-center gap-2">
                        <button 
                            disabled={currentPage === 0}
                            onClick={() => handlePageChange(currentPage - 1)}
                            className="p-2 rounded-xl border-2 border-gray-100 text-gray-400 hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <div className="flex items-center gap-1">
                            {Array.from({ length: pagination.totalPages }).map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handlePageChange(idx)}
                                    className={`w-8 h-8 rounded-xl text-xs font-black transition-all ${
                                        currentPage === idx 
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                                        : 'text-gray-400 hover:bg-gray-50'
                                    }`}
                                >
                                    {idx + 1}
                                </button>
                            ))}
                        </div>
                        <button 
                            disabled={currentPage === pagination.totalPages - 1}
                            onClick={() => handlePageChange(currentPage + 1)}
                            className="p-2 rounded-xl border-2 border-gray-100 text-gray-400 hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
