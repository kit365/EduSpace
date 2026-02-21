import { AdminLayout } from '../../../layouts/AdminLayout';
import { useState } from 'react';
import {
    Search, Filter, Shield, ShieldOff, Star, TrendingUp, Building2, User2,
    MapPin, Mail, Phone, Calendar, Clock, ExternalLink, ChevronRight,
    Lock, Unlock, AlertTriangle, CheckCircle2, XCircle, Eye,
    DollarSign, BarChart3, MessageSquareWarning, FileCheck, ArrowUpRight,
    Percent, Save, X, ChevronDown, Activity
} from 'lucide-react';
import { MOCK_HOST_PROFILES } from '../data/mockHostData';
import type { HostProfile, HostTrustLevel, HostActivityType } from '../../../../types/host';

type FilterTab = 'all' | 'active' | 'pending' | 'suspended';

const TRUST_CONFIG: Record<HostTrustLevel, { label: string; color: string; bg: string }> = {
    new: { label: 'Mới', color: 'text-gray-600', bg: 'bg-gray-100' },
    standard: { label: 'Chuẩn', color: 'text-blue-600', bg: 'bg-blue-50' },
    trusted: { label: 'Tin cậy', color: 'text-green-600', bg: 'bg-green-50' },
    premium: { label: 'Premium', color: 'text-amber-600', bg: 'bg-amber-50' },
};

const ACTIVITY_ICON_MAP: Record<HostActivityType, { icon: typeof Activity; color: string; bg: string }> = {
    space_submitted: { icon: ArrowUpRight, color: 'text-blue-500', bg: 'bg-blue-50' },
    space_approved: { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50' },
    space_rejected: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50' },
    booking_received: { icon: Calendar, color: 'text-purple-500', bg: 'bg-purple-50' },
    booking_completed: { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50' },
    booking_cancelled: { icon: XCircle, color: 'text-orange-500', bg: 'bg-orange-50' },
    payout_requested: { icon: DollarSign, color: 'text-amber-500', bg: 'bg-amber-50' },
    payout_completed: { icon: DollarSign, color: 'text-green-500', bg: 'bg-green-50' },
    kyc_submitted: { icon: FileCheck, color: 'text-blue-500', bg: 'bg-blue-50' },
    kyc_approved: { icon: Shield, color: 'text-green-500', bg: 'bg-green-50' },
    kyc_rejected: { icon: ShieldOff, color: 'text-red-500', bg: 'bg-red-50' },
    dispute_opened: { icon: MessageSquareWarning, color: 'text-red-500', bg: 'bg-red-50' },
    dispute_resolved: { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50' },
    account_suspended: { icon: Lock, color: 'text-red-500', bg: 'bg-red-50' },
    account_reactivated: { icon: Unlock, color: 'text-green-500', bg: 'bg-green-50' },
    commission_changed: { icon: Percent, color: 'text-amber-500', bg: 'bg-amber-50' },
};

function formatCurrency(amount: number): string {
    if (amount >= 1_000_000_000) return `${(amount / 1_000_000_000).toFixed(1)}B`;
    if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(0)}M`;
    if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}K`;
    return amount.toLocaleString('vi-VN');
}

function formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatDateTime(dateStr: string): string {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffH = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffH < 1) return 'Vừa xong';
    if (diffH < 24) return `${diffH} giờ trước`;
    const diffD = Math.floor(diffH / 24);
    if (diffD < 7) return `${diffD} ngày trước`;
    return d.toLocaleDateString('vi-VN');
}

function TrustScoreBar({ score }: { score: number }) {
    const color = score >= 80 ? 'bg-green-500' : score >= 50 ? 'bg-amber-500' : 'bg-red-500';
    return (
        <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${score}%` }} />
            </div>
            <span className="text-sm font-black text-gray-900 w-8 text-right">{score}</span>
        </div>
    );
}

export function HostManagementPage() {
    const [filterTab, setFilterTab] = useState<FilterTab>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedHost, setSelectedHost] = useState<HostProfile | null>(null);
    const [showCommissionModal, setShowCommissionModal] = useState(false);
    const [showLockModal, setShowLockModal] = useState(false);
    const [editCommission, setEditCommission] = useState(10);
    const [lockReason, setLockReason] = useState('');

    const hosts = MOCK_HOST_PROFILES;

    const filteredHosts = hosts.filter(h => {
        const matchesSearch = searchQuery === '' ||
            h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            h.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (h.businessName && h.businessName.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesTab =
            filterTab === 'all' ? true :
                filterTab === 'active' ? h.accountStatus === 'active' :
                    filterTab === 'pending' ? (h.accountStatus === 'pending' || h.kycStatus === 'pending') :
                        filterTab === 'suspended' ? (h.accountStatus === 'suspended' || h.accountStatus === 'banned') :
                            true;

        return matchesSearch && matchesTab;
    });

    const tabCounts = {
        all: hosts.length,
        active: hosts.filter(h => h.accountStatus === 'active').length,
        pending: hosts.filter(h => h.accountStatus === 'pending' || h.kycStatus === 'pending').length,
        suspended: hosts.filter(h => h.accountStatus === 'suspended' || h.accountStatus === 'banned').length,
    };

    const openCommissionModal = (host: HostProfile) => {
        setEditCommission(host.commissionRate);
        setShowCommissionModal(true);
    };

    return (
        <AdminLayout title="Host Management">
            {/* Summary Stats */}
            <div className="grid grid-cols-4 gap-6 mb-8">
                {[
                    { label: 'Tổng Host', value: hosts.length, icon: Building2, color: 'text-blue-500', bg: 'bg-blue-50', badge: `+${hosts.filter(h => h.joinedAt > '2026-01').length} tháng này` },
                    { label: 'Đang hoạt động', value: tabCounts.active, icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50', badge: `${Math.round(tabCounts.active / hosts.length * 100)}%` },
                    { label: 'Chờ duyệt KYC', value: tabCounts.pending, icon: Clock, color: 'text-orange-500', bg: 'bg-orange-50', badge: 'Cần xử lý' },
                    { label: 'Bị khóa', value: tabCounts.suspended, icon: Lock, color: 'text-red-500', bg: 'bg-red-50', badge: `${tabCounts.suspended} tài khoản` },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-xl ${stat.bg} group-hover:scale-110 transition-transform`}>
                                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                            </div>
                            <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-lg uppercase tracking-wider">
                                {stat.badge}
                            </span>
                        </div>
                        <h3 className="text-3xl font-black text-gray-900 mb-1">{stat.value}</h3>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{stat.label}</p>
                    </div>
                ))}
            </div>

            <div className="flex gap-8">
                {/* Left: Host List */}
                <div className={`${selectedHost ? 'w-[420px] shrink-0' : 'flex-1'} transition-all duration-500`}>
                    {/* Search & Filter */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-6 p-4">
                        <div className="relative mb-4">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="Tìm host theo tên, email, doanh nghiệp..."
                            />
                        </div>
                        <div className="flex gap-2">
                            {([
                                { key: 'all', label: 'Tất cả' },
                                { key: 'active', label: 'Hoạt động' },
                                { key: 'pending', label: 'Chờ duyệt' },
                                { key: 'suspended', label: 'Bị khóa' },
                            ] as const).map(tab => (
                                <button
                                    key={tab.key}
                                    onClick={() => setFilterTab(tab.key)}
                                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${filterTab === tab.key
                                            ? 'bg-gray-900 text-white shadow-lg'
                                            : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                                        }`}
                                >
                                    {tab.label} ({tabCounts[tab.key]})
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Host Cards */}
                    <div className="space-y-3">
                        {filteredHosts.map((host) => (
                            <div
                                key={host.id}
                                onClick={() => setSelectedHost(host)}
                                className={`bg-white rounded-2xl border p-5 cursor-pointer transition-all duration-300 group ${selectedHost?.id === host.id
                                        ? 'border-blue-300 shadow-lg shadow-blue-100 ring-2 ring-blue-100'
                                        : 'border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200'
                                    }`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className="relative">
                                        <img src={host.avatar} className="w-12 h-12 rounded-xl object-cover shadow-sm" alt="" />
                                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${host.accountStatus === 'active' ? 'bg-green-500' :
                                                host.accountStatus === 'pending' ? 'bg-orange-500' :
                                                    'bg-red-500'
                                            }`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-bold text-gray-900 text-sm truncate">{host.name}</h3>
                                            {host.kycStatus === 'verified' && (
                                                <Shield className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-400 font-medium truncate">
                                            {host.hostType === 'business' ? host.businessName : 'Cá nhân'}
                                            {host.location && ` • ${host.location}`}
                                        </p>
                                        <div className="flex items-center gap-3 mt-2">
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${TRUST_CONFIG[host.trustLevel].bg} ${TRUST_CONFIG[host.trustLevel].color}`}>
                                                <Star className="w-2.5 h-2.5" />
                                                {TRUST_CONFIG[host.trustLevel].label}
                                            </span>
                                            <span className="text-[10px] font-bold text-gray-400">
                                                {host.activeSpaces} phòng • ⭐ {host.averageRating > 0 ? host.averageRating : 'N/A'}
                                            </span>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors shrink-0 mt-1" />
                                </div>
                            </div>
                        ))}
                        {filteredHosts.length === 0 && (
                            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                                <Search className="w-10 h-10 text-gray-200 mx-auto mb-4" />
                                <p className="text-sm font-bold text-gray-400">Không tìm thấy Host nào</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Host Detail Panel */}
                {selectedHost && (
                    <div className="flex-1 animate-in slide-in-from-right-4 duration-500">
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden sticky top-0">
                            {/* Header */}
                            <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8 text-white">
                                <button
                                    onClick={() => setSelectedHost(null)}
                                    className="absolute top-4 right-4 p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                                <div className="flex items-start gap-5">
                                    <img src={selectedHost.avatar} className="w-16 h-16 rounded-2xl object-cover border-2 border-white/20 shadow-xl" alt="" />
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h2 className="text-xl font-black">{selectedHost.name}</h2>
                                            {selectedHost.kycStatus === 'verified' && (
                                                <div className="bg-blue-500 p-1 rounded-md"><Shield className="w-3 h-3" /></div>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-300 font-medium">
                                            {selectedHost.hostType === 'business' ? `🏢 ${selectedHost.businessName}` : '👤 Cá nhân'}
                                        </p>
                                        <div className="flex items-center gap-3 mt-3">
                                            <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${selectedHost.accountStatus === 'active' ? 'bg-green-500/20 text-green-300' :
                                                    selectedHost.accountStatus === 'pending' ? 'bg-orange-500/20 text-orange-300' :
                                                        'bg-red-500/20 text-red-300'
                                                }`}>
                                                {selectedHost.accountStatus === 'active' ? '● Hoạt động' :
                                                    selectedHost.accountStatus === 'pending' ? '● Chờ duyệt' : '● Bị khóa'}
                                            </span>
                                            <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${TRUST_CONFIG[selectedHost.trustLevel].bg} ${TRUST_CONFIG[selectedHost.trustLevel].color}`}>
                                                ★ {TRUST_CONFIG[selectedHost.trustLevel].label}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="px-8 py-4 border-b border-gray-100 flex gap-3 bg-gray-50/50">
                                {selectedHost.accountStatus === 'active' ? (
                                    <button
                                        onClick={() => { setLockReason(''); setShowLockModal(true); }}
                                        className="flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 rounded-xl text-xs font-bold hover:bg-red-100 transition-all active:scale-95"
                                    >
                                        <Lock className="w-3.5 h-3.5" /> Khóa tài khoản
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => { /* unlock logic */ }}
                                        className="flex items-center gap-2 px-4 py-2.5 bg-green-50 text-green-600 rounded-xl text-xs font-bold hover:bg-green-100 transition-all active:scale-95"
                                    >
                                        <Unlock className="w-3.5 h-3.5" /> Mở khóa
                                    </button>
                                )}
                                <button
                                    onClick={() => openCommissionModal(selectedHost)}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 text-amber-600 rounded-xl text-xs font-bold hover:bg-amber-100 transition-all active:scale-95"
                                >
                                    <Percent className="w-3.5 h-3.5" /> Phí hoa hồng ({selectedHost.commissionRate}%)
                                </button>
                                <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-100 transition-all active:scale-95 ml-auto">
                                    <Eye className="w-3.5 h-3.5" /> Xem profile public
                                </button>
                            </div>

                            <div className="p-8 max-h-[calc(100vh-320px)] overflow-y-auto space-y-8">
                                {/* Contact Info */}
                                <div>
                                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Thông tin liên hệ</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                            <Mail className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm font-medium text-gray-700 truncate">{selectedHost.email}</span>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                            <Phone className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm font-medium text-gray-700">{selectedHost.phone}</span>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl col-span-2">
                                            <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                                            <span className="text-sm font-medium text-gray-700">{selectedHost.address || 'Chưa cập nhật'}</span>
                                        </div>
                                        {selectedHost.hostType === 'business' && selectedHost.taxCode && (
                                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl col-span-2">
                                                <Building2 className="w-4 h-4 text-gray-400 shrink-0" />
                                                <span className="text-sm font-medium text-gray-700">MST: {selectedHost.taxCode}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* KYC Status */}
                                <div>
                                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Xác thực KYC</h3>
                                    <div className="space-y-3">
                                        {selectedHost.kycDocuments.map((doc) => (
                                            <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                                <div className="flex items-center gap-3">
                                                    <FileCheck className="w-4 h-4 text-gray-400" />
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-700">{doc.label}</p>
                                                        <p className="text-[10px] text-gray-400 font-medium">{formatDate(doc.uploadedAt)}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-2 py-0.5 text-[10px] rounded-md font-black uppercase tracking-wider ${doc.status === 'approved' ? 'bg-green-50 text-green-600' :
                                                            doc.status === 'rejected' ? 'bg-red-50 text-red-600' :
                                                                'bg-orange-50 text-orange-600'
                                                        }`}>
                                                        {doc.status === 'approved' ? 'Đã duyệt' : doc.status === 'rejected' ? 'Từ chối' : 'Chờ duyệt'}
                                                    </span>
                                                    <button className="p-1.5 bg-white border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-all">
                                                        <ExternalLink className="w-3 h-3 text-gray-400" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        {selectedHost.kycReviewedBy && (
                                            <p className="text-[10px] text-gray-400 font-medium px-1">
                                                Duyệt bởi {selectedHost.kycReviewedBy} • {formatDate(selectedHost.kycReviewedAt!)}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Performance Metrics */}
                                <div>
                                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Hiệu suất hoạt động</h3>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 text-center">
                                            <p className="text-2xl font-black text-gray-900">{selectedHost.activeSpaces}</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">Phòng Active</p>
                                        </div>
                                        <div className="bg-green-50/50 border border-green-100 rounded-xl p-4 text-center">
                                            <p className="text-2xl font-black text-gray-900">{selectedHost.completedBookings}</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">Đơn hoàn thành</p>
                                        </div>
                                        <div className="bg-purple-50/50 border border-purple-100 rounded-xl p-4 text-center">
                                            <p className="text-2xl font-black text-gray-900">{formatCurrency(selectedHost.totalRevenue)}</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">Doanh thu</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 mt-3">
                                        <div className="bg-gray-50 rounded-xl p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs font-bold text-gray-500">Tỷ lệ phản hồi</span>
                                                <span className="text-sm font-black text-gray-900">{selectedHost.responseRate}%</span>
                                            </div>
                                            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${selectedHost.responseRate}%` }} />
                                            </div>
                                        </div>
                                        <div className="bg-gray-50 rounded-xl p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs font-bold text-gray-500">Thời gian phản hồi</span>
                                                <span className="text-sm font-black text-gray-900">{selectedHost.responseTime}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 mt-1">
                                                <Clock className="w-3.5 h-3.5 text-green-500" />
                                                <span className="text-[10px] font-bold text-green-600 uppercase">Nhanh</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Trust & Rating */}
                                <div>
                                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Độ uy tín & Đánh giá</h3>
                                    <div className="bg-gray-50 rounded-xl p-5 space-y-4">
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs font-bold text-gray-600">Trust Score</span>
                                                <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${TRUST_CONFIG[selectedHost.trustLevel].bg} ${TRUST_CONFIG[selectedHost.trustLevel].color}`}>
                                                    {TRUST_CONFIG[selectedHost.trustLevel].label}
                                                </span>
                                            </div>
                                            <TrustScoreBar score={selectedHost.trustScore} />
                                        </div>
                                        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-gray-200">
                                            <div className="text-center">
                                                <p className="text-lg font-black text-gray-900 flex items-center justify-center gap-1">
                                                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                                                    {selectedHost.averageRating > 0 ? selectedHost.averageRating : 'N/A'}
                                                </p>
                                                <p className="text-[10px] text-gray-400 font-bold">{selectedHost.totalReviews} đánh giá</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-lg font-black text-gray-900">{selectedHost.disputeCount}</p>
                                                <p className="text-[10px] text-gray-400 font-bold">Tranh chấp</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-lg font-black text-gray-900">{selectedHost.cancelledBookings}</p>
                                                <p className="text-[10px] text-gray-400 font-bold">Đơn hủy</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Financial */}
                                <div>
                                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Tài chính</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3">
                                            <div className="p-2 bg-green-100 rounded-lg">
                                                <TrendingUp className="w-4 h-4 text-green-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-gray-900">{formatCurrency(selectedHost.monthlyRevenue)}đ</p>
                                                <p className="text-[10px] text-gray-400 font-bold">Doanh thu tháng này</p>
                                            </div>
                                        </div>
                                        <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3">
                                            <div className="p-2 bg-amber-100 rounded-lg">
                                                <Percent className="w-4 h-4 text-amber-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-gray-900">
                                                    {selectedHost.commissionRate}%
                                                    {selectedHost.isCustomCommission && <span className="text-[9px] text-amber-500 ml-1">CUSTOM</span>}
                                                </p>
                                                <p className="text-[10px] text-gray-400 font-bold">Hoa hồng sàn</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Activity Log */}
                                <div>
                                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Lịch sử hoạt động</h3>
                                    <div className="space-y-2">
                                        {selectedHost.recentActivities.map((activity) => {
                                            const cfg = ACTIVITY_ICON_MAP[activity.type];
                                            const IconComp = cfg.icon;
                                            return (
                                                <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                                    <div className={`p-2 rounded-lg ${cfg.bg} shrink-0 mt-0.5`}>
                                                        <IconComp className={`w-3.5 h-3.5 ${cfg.color}`} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-700 leading-snug">{activity.message}</p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="text-[10px] text-gray-400 font-bold">{formatDateTime(activity.timestamp)}</span>
                                                            {activity.performedBy && (
                                                                <span className="text-[10px] text-gray-400 font-medium">• bởi {activity.performedBy}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Metadata */}
                                <div className="pt-4 border-t border-gray-100">
                                    <div className="flex items-center justify-between text-[10px] text-gray-400 font-medium">
                                        <span>Tham gia: {formatDate(selectedHost.joinedAt)}</span>
                                        <span>Đăng nhập cuối: {selectedHost.lastLoginAt ? formatDateTime(selectedHost.lastLoginAt) : 'N/A'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Commission Modal */}
            {showCommissionModal && selectedHost && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl w-[440px] overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-6 border-b border-gray-100">
                            <h3 className="text-lg font-black text-gray-900">Cập nhật phí hoa hồng</h3>
                            <p className="text-sm text-gray-400 font-medium mt-1">Host: {selectedHost.name}</p>
                        </div>
                        <div className="p-6 space-y-6">
                            <div>
                                <label className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2 block">Tỷ lệ hoa hồng (%)</label>
                                <input
                                    type="number"
                                    value={editCommission}
                                    onChange={(e) => setEditCommission(parseInt(e.target.value) || 0)}
                                    min={0} max={100}
                                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 text-lg focus:ring-2 focus:ring-amber-500 transition-all"
                                />
                                <p className="text-xs text-gray-400 mt-2 font-medium">
                                    Mặc định hệ thống: 10%. Thay đổi sẽ chỉ áp dụng cho Host này.
                                </p>
                            </div>
                            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                                <div className="flex items-start gap-2">
                                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                                    <p className="text-xs text-amber-700 font-medium leading-relaxed">
                                        Thay đổi hoa hồng sẽ áp dụng cho tất cả booking <strong>mới</strong> của host này. Các booking hiện tại không bị ảnh hưởng.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-100 flex gap-3 justify-end">
                            <button
                                onClick={() => setShowCommissionModal(false)}
                                className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-200 transition-all"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={() => setShowCommissionModal(false)}
                                className="px-6 py-3 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-amber-600 transition-all shadow-lg active:scale-95 flex items-center gap-2"
                            >
                                <Save className="w-4 h-4" /> Lưu thay đổi
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Lock Account Modal */}
            {showLockModal && selectedHost && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl w-[440px] overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-6 border-b border-gray-100 bg-red-50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-100 rounded-xl">
                                    <Lock className="w-5 h-5 text-red-500" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-gray-900">Khóa tài khoản Host</h3>
                                    <p className="text-sm text-red-500 font-medium">{selectedHost.name}</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2 block">Lý do khóa tài khoản *</label>
                                <textarea
                                    value={lockReason}
                                    onChange={(e) => setLockReason(e.target.value)}
                                    rows={3}
                                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-900 text-sm focus:ring-2 focus:ring-red-300 transition-all resize-none"
                                    placeholder="Nhập lý do vi phạm chính sách sàn..."
                                />
                            </div>
                            <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                                <div className="flex items-start gap-2">
                                    <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                                    <div className="text-xs text-red-700 font-medium leading-relaxed space-y-1">
                                        <p>Khi bị khóa, host sẽ <strong>không thể</strong>:</p>
                                        <ul className="list-disc ml-4 space-y-0.5">
                                            <li>Nhận đơn đặt phòng mới</li>
                                            <li>Đăng listing mới</li>
                                            <li>Yêu cầu rút tiền</li>
                                        </ul>
                                        <p className="mt-2">Các booking hiện tại vẫn được duy trì.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-100 flex gap-3 justify-end">
                            <button
                                onClick={() => setShowLockModal(false)}
                                className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-200 transition-all"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={() => setShowLockModal(false)}
                                disabled={!lockReason.trim()}
                                className="px-6 py-3 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 transition-all shadow-lg active:scale-95 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Lock className="w-4 h-4" /> Xác nhận khóa
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
