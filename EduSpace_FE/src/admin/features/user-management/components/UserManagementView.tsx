import { 
    Shield, 
    Search, 
    Users, 
    Loader2,
    ChevronLeft,
    ChevronRight,
    RefreshCcw,
    Eye,
    MoreVertical
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { User } from '@/types';
import { useUsers } from '../hooks/useUsers';
import { UserDetailsModal } from './UserDetailsModal';

interface UserManagementViewProps {
    roleFilter?: string;
    statusFilter?: string;
    search?: string;
    kycFilter?: string;
    sortConfig: { key: string; direction: 'asc' | 'desc' };
    onSort: (key: string) => void;
}

export function UserManagementView({ 
    roleFilter, 
    statusFilter, 
    search,
    kycFilter,
    sortConfig,
    onSort
}: UserManagementViewProps) {
    const { t } = useTranslation();
    const [currentPage, setCurrentPage] = useState(0);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const { users, loading, pagination, setParams } = useUsers({
        page: currentPage,
        size: 10,
        search: search || undefined,
        role: (roleFilter && roleFilter !== 'all') ? roleFilter : undefined,
        status: (statusFilter && statusFilter !== 'all') ? statusFilter : undefined,
        kyc: (kycFilter && kycFilter !== 'all') ? kycFilter : undefined,
        sort: `${sortConfig.key},${sortConfig.direction}`
    });

    const getSortIcon = (key: string) => {
        if (sortConfig.key !== key) return <RefreshCcw className="w-3 h-3 text-gray-300 opacity-0 group-hover:opacity-100" />;
        return sortConfig.direction === 'asc' 
            ? <ChevronLeft className="w-3 h-3 rotate-90 text-slate-900" /> 
            : <ChevronLeft className="w-3 h-3 -rotate-90 text-slate-900" />;
    };

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
    };

    return (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-2 text-black">
            <div className="overflow-hidden mb-6">
                 <table className="w-full">
                    <thead className="bg-gray-50 border-y border-gray-100 font-bold uppercase tracking-widest text-[10px]">
                        <tr>
                            <th className="px-6 py-4">
                                <button onClick={() => onSort('fullName')} className="group flex items-center gap-2 font-black text-gray-400 hover:text-gray-900 transition-colors cursor-pointer">
                                    Name {getSortIcon('fullName')}
                                </button>
                            </th>
                            <th className="px-6 py-4">
                                <button onClick={() => onSort('roles')} className="group flex items-center gap-2 font-black text-gray-400 hover:text-gray-900 transition-colors cursor-pointer">
                                    Role {getSortIcon('roles')}
                                </button>
                            </th>
                            <th className="px-6 py-4">
                                <button onClick={() => onSort('isActive')} className="group flex items-center gap-2 font-black text-gray-400 hover:text-gray-900 transition-colors cursor-pointer">
                                    Status {getSortIcon('isActive')}
                                </button>
                            </th>
                            <th className="px-6 py-4">
                                <button onClick={() => onSort('createdAt')} className="group flex items-center gap-2 font-black text-gray-400 hover:text-gray-900 transition-colors cursor-pointer">
                                    Joined {getSortIcon('createdAt')}
                                </button>
                            </th>
                            <th className="px-6 py-4 font-black text-gray-400 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="p-8 text-center">
                                    <div className="flex items-center justify-center gap-3 text-gray-400 font-bold">
                                        <RefreshCcw className="w-5 h-5 animate-spin" />
                                        <span>Loading users...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : users.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-12 text-center">
                                    <div className="text-gray-300 mb-2 font-black text-xl">Không tìm thấy người dùng</div>
                                    <div className="text-gray-400 text-sm font-bold">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</div>
                                </td>
                            </tr>
                        ) : (
                            users.map((u: User) => (
                                <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-700 to-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-md">
                                                {(u.name ?? '-').charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900 text-sm">{u.name ?? '-'}</div>
                                                <div className="text-xs text-gray-400 font-medium">{u.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                            u.role === 'super_admin' ? 'bg-indigo-50 text-indigo-600' :
                                            u.role === 'admin' ? 'bg-purple-50 text-purple-600' :
                                            u.role === 'host' ? 'bg-orange-50 text-orange-600' : 
                                            u.role === 'staff' ? 'bg-cyan-50 text-cyan-600' :
                                            'bg-slate-50 text-slate-600'
                                            }`}>
                                            {(u.role === 'admin' || u.role === 'super_admin') && <Shield className="w-3 h-3" />}
                                            {t(`admin_management.roles.${u.role}`)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold ${
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
                                    <td className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase">{u.joinedAt ? new Date(u.joinedAt).toLocaleDateString() : '-'}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button 
                                                onClick={() => setSelectedUser(u)}
                                                className="p-2 rounded-lg text-gray-400 hover:bg-slate-50 hover:text-slate-900 transition-all"
                                                title="Xem chi tiết"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button 
                                                className="p-2 rounded-lg text-gray-400 hover:bg-slate-50 hover:text-slate-900 transition-all"
                                            >
                                                <MoreVertical className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div />
                    <div className="flex items-center gap-2">
                        <button 
                            disabled={currentPage === 0}
                            onClick={() => handlePageChange(currentPage - 1)}
                            className="p-2 rounded-lg border border-gray-100 text-gray-400 hover:bg-gray-50 disabled:opacity-30 transition-all"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <div className="flex items-center gap-1">
                            {Array.from({ length: pagination.totalPages }).map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handlePageChange(idx)}
                                    className={`w-8 h-8 rounded-lg text-[10px] font-black transition-all ${
                                        currentPage === idx 
                                        ? 'bg-gray-900 text-white shadow-md' 
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
                            className="p-2 rounded-lg border border-gray-100 text-gray-400 hover:bg-gray-50 disabled:opacity-30 transition-all"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            <UserDetailsModal 
                user={selectedUser} 
                onClose={() => setSelectedUser(null)} 
            />
        </div>
    );
}
