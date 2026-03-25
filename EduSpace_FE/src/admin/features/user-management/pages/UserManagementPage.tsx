import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AdminLayout } from '../../../layouts/AdminLayout';
import { UserManagementView } from '../components/UserManagementView';
import { 
    Search as SearchIcon, 
    RefreshCw, 
    Filter,
    Users,
    Download,
    Upload,
    ChevronDown,
    ArrowUpDown
} from 'lucide-react';

export function UserManagementPage() {
    const { t } = useTranslation();
    const [search, setSearch] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [roleFilter, setRoleFilter] = useState<string | 'all'>('all');
    const [statusFilter, setStatusFilter] = useState<string | 'all'>('all');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isSortOpen, setIsSortOpen] = useState(false);
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({
        key: 'createdAt',
        direction: 'desc'
    });
    const [refreshKey, setRefreshKey] = useState(0);
    const [kycFilter, setKycFilter] = useState<string>('all');
    const [joinedDate, setJoinedDate] = useState<string>('');

    const handleSort = (key: string) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
        setIsSortOpen(false);
    };

    const handleRefresh = () => setRefreshKey(prev => prev + 1);

    const roles = [
        { id: 'all', label: 'Tất cả' },
        { id: 'admin', label: 'Admin' },
        { id: 'staff', label: 'Nhân viên' },
        { id: 'host', label: 'Host' },
        { id: 'student', label: 'Khách hàng' }
    ];

    return (
        <AdminLayout title="Quản lý tài khoản">
                        
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-gray-900">Người dùng</h1>
                    <p className="font-medium text-gray-500">
                        Quản lý danh sách người dùng, phân quyền và trạng thái tài khoản trên hệ thống.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <button
                        onClick={handleRefresh}
                        className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-3.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Làm mới
                    </button>
                    <button
                        type="button"
                        className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-3.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                    >
                        <Download className="h-4 w-4" />
                        Export
                    </button>
                </div>
            </div>

            {/* Premium Toolbar */}
            <div className="mb-6 flex flex-col items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-2 sm:flex-row">
                <div className="flex w-full items-center gap-1 overflow-x-auto pb-1 sm:w-auto sm:pb-0 no-scrollbar">
                    {roles.map((role) => (
                        <button
                            key={role.id}
                            onClick={() => setRoleFilter(role.id)}
                            className={`flex h-10 cursor-pointer items-center gap-2 whitespace-nowrap rounded-lg px-4 text-sm font-bold transition-all ${
                                roleFilter === role.id
                                    ? 'bg-gray-900 text-white shadow-lg shadow-gray-200'
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                        >
                            {role.id === 'all' && <Users className="h-4 w-4" />}
                            {role.label}
                        </button>
                    ))}
                </div>

                <div className="flex w-full items-center justify-end gap-2 sm:w-auto">
                    {/* Status Filter */}
                    <div className="relative group">
                        <select 
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="h-10 cursor-pointer appearance-none rounded-lg border border-gray-200 bg-white pl-4 pr-10 text-sm font-bold text-gray-700 transition-all hover:bg-gray-50 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 shadow-sm"
                        >
                            <option value="all">{t('admin_management.status.all') || 'Tất cả trạng thái'}</option>
                            <option value="Active">Active</option>
                            <option value="Suspended">Suspended</option>
                            <option value="Blocked">Blocked</option>
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 group-hover:text-gray-900 transition-colors" />
                    </div>

                    <div className={`flex items-center transition-all duration-300 ${isSearchOpen ? 'w-full sm:w-64' : 'w-10'}`}>
                        {isSearchOpen ? (
                            <div className="relative w-full">
                                <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="Tìm theo tên hoặc email..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onBlur={() => !search && setIsSearchOpen(false)}
                                    className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm font-medium focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 transition-all"
                                />
                            </div>
                        ) : (
                            <button
                                onClick={() => setIsSearchOpen(true)}
                                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition-all hover:bg-gray-50 hover:text-gray-900 shadow-sm"
                                title="Tìm kiếm"
                            >
                                <SearchIcon className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                    <div className="relative">
                        <button
                            onClick={() => setIsSortOpen(!isSortOpen)}
                            className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border transition-all shadow-sm ${
                                isSortOpen 
                                    ? 'bg-gray-900 border-gray-900 text-white shadow-md' 
                                    : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                            title="Sắp xếp"
                        >
                            <ArrowUpDown className="h-4 w-4" />
                        </button>
                        
                        {isSortOpen && (
                            <div className="absolute right-0 top-12 z-50 w-48 rounded-xl border border-gray-100 bg-white p-2 shadow-xl animate-in fade-in zoom-in-95 duration-200">
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
                                <button 
                                    onClick={() => handleSort('roles')}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-colors flex items-center justify-between group ${sortConfig.key === 'roles' ? 'bg-slate-50 text-slate-900' : 'text-gray-700 hover:bg-gray-50'}`}
                                >
                                    Vai trò <div className={`w-1.5 h-1.5 rounded-full bg-slate-900 ${sortConfig.key === 'roles' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="relative">
                        <button
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border transition-all shadow-sm ${
                                isFilterOpen 
                                    ? 'bg-gray-900 border-gray-900 text-white shadow-md' 
                                    : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                            title="Bộ lọc nâng cao"
                        >
                            <Filter className="h-4 w-4" />
                        </button>

                        {/* Popover Filter Menu */}
                        {isFilterOpen && (
                            <div className="absolute right-0 top-12 z-50 w-72 p-5 bg-white rounded-2xl border border-gray-100 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                                <div className="flex items-center justify-between mb-4 border-b border-gray-50 pb-2">
                                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <Filter className="w-3 h-3 text-slate-900" />
                                        Bộ lọc nâng cao
                                    </h3>
                                    <button 
                                        onClick={() => {
                                            setRoleFilter('all');
                                            setStatusFilter('all');
                                            setSearch('');
                                            setKycFilter('all');
                                            setJoinedDate('');
                                            setIsFilterOpen(false);
                                        }}
                                        className="text-[10px] font-black text-slate-900 hover:text-black uppercase tracking-widest cursor-pointer"
                                    >
                                        Đặt lại
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Ngày đăng ký</label>
                                        <input 
                                            type="date" 
                                            value={joinedDate}
                                            onChange={(e) => setJoinedDate(e.target.value)}
                                            className="w-full h-9 rounded-lg border border-gray-100 bg-gray-50 px-3 text-xs font-bold focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 transition-all uppercase" 
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Xác thực KYC</label>
                                        <select 
                                            value={kycFilter}
                                            onChange={(e) => setKycFilter(e.target.value)}
                                            className="w-full h-9 rounded-lg border border-gray-100 bg-gray-50 px-3 text-xs font-bold focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 appearance-none transition-all"
                                        >
                                            <option value="all">Tất cả</option>
                                            <option value="verified">Đã xác thực</option>
                                            <option value="pending">Chờ xử lý</option>
                                            <option value="not_submitted">Chưa gửi</option>
                                        </select>
                                    </div>
                                    <button 
                                        onClick={() => setIsFilterOpen(false)}
                                        className="h-10 w-full mt-2 bg-gray-900 text-white text-xs font-black rounded-lg hover:bg-black transition-all active:scale-95 shadow-lg shadow-gray-200 cursor-pointer"
                                    >
                                        Áp dụng
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <UserManagementView 
                roleFilter={roleFilter} 
                statusFilter={statusFilter} 
                search={search}
                kycFilter={kycFilter}
                sortConfig={sortConfig}
                onSort={handleSort}
                key={refreshKey}
            />
        </AdminLayout>
    );
}
