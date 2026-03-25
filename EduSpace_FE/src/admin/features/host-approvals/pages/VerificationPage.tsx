import { AdminLayout } from '../../../layouts/AdminLayout';
import {
    CheckCircle2,
    XCircle,
    RefreshCw,
    ArrowRight,
    ArrowUpDown,
    ExternalLink,
    Search as SearchIcon,
    Filter,
    Users,
    Download,
    Upload,
    Building2,
    ImageIcon,
    Loader2,
    FileCheck,
    Globe
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAdminApprovals, type PendingRoomItem } from '@/admin/hooks/useAdminApprovals';
import { AdminDetailOverlay } from '@/admin/components/AdminDetailOverlay';
import { showToast } from '@/utils/toast';
import type { HostPartnerApplicationAdminItem } from '@/client/features/host/services/hostPartnerApplicationService';
import type { User } from '@/types';

export function VerificationPage() {
    const {
        partners, rooms, kycUsers, loading, actingId,
        fetchPartners, fetchRooms, fetchKyc,
        approvePartner, rejectPartner,
        approveRoom, rejectRoom,
        approveKyc, rejectKyc
    } = useAdminApprovals();

    const [tab, setTab] = useState<'partners' | 'rooms' | 'users'>('partners');
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    
    // Detail Overlays
    const [selectedPartner, setSelectedPartner] = useState<HostPartnerApplicationAdminItem | null>(null);
    const [selectedRoomItem, setSelectedRoomItem] = useState<PendingRoomItem | null>(null);
    const [selectedKycUser, setSelectedKycUser] = useState<User | null>(null);

    useEffect(() => {
        if (tab === 'partners') void fetchPartners();
        if (tab === 'rooms') void fetchRooms();
        if (tab === 'users') void fetchKyc();
    }, [tab, fetchPartners, fetchRooms, fetchKyc]);

    const refresh = () => {
        if (tab === 'partners') void fetchPartners();
        if (tab === 'rooms') void fetchRooms();
        if (tab === 'users') void fetchKyc();
    };

    const renderRegistrationInfo = (message: string) => {
        if (!message) return (
            <div className="flex flex-col items-center justify-center p-12 rounded-[32px] border border-gray-100 bg-gray-50/30">
                <Globe className="w-8 h-8 text-gray-200 mb-2" />
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Không có thông tin đính kèm</p>
            </div>
        );
        
        // Check if it's the pipe-separated format
        if (message.includes('|') && message.includes('=')) {
            const pairs = message.split('|').map(p => p.trim());
            const data: Record<string, string> = {};
            pairs.forEach(p => {
                const [key, val] = p.split('=');
                if (key && val) data[key] = val;
            });

            const labelMap: Record<string, string> = {
                propertyType: 'Loại hình hồ sơ',
                logo: 'Hình ảnh đại diện',
            };

            const valueMap: Record<string, string> = {
                INDEPENDENT_SPACE: 'Không gian độc lập',
                SHARED_SPACE: 'Không gian chia sẻ'
            };
            const excludedKeys = ['provinceCode', 'districtCode', 'wardCode', 'propertyId'];

            return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.entries(data)
                        .filter(([key]) => !excludedKeys.includes(key))
                        .map(([key, val]) => {
                        const label = labelMap[key] || key;
                        const displayVal = valueMap[val] || val;
                        
                        return (
                            <div key={key} className="space-y-1.5">
                                <label className="block text-[13px] font-semibold text-[#374151] ml-1">{label}</label>
                                <div className="min-h-[48px] flex items-center px-4 rounded-[12px] border border-[#d1d5db] bg-white transition-all hover:border-slate-400">
                                    {key === 'logo' && val.startsWith('http') ? (
                                        <div className="py-1.5 w-full flex items-center justify-center">
                                            <img src={val} className="max-h-16 object-contain drop-shadow-sm" alt="Logo" />
                                        </div>
                                    ) : (
                                        <p className="text-sm font-bold text-gray-900 leading-tight">{displayVal}</p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            );
        }

        return (
            <div className="p-6 rounded-[24px] border border-gray-100 bg-white shadow-sm">
                <p className="text-sm text-gray-700 leading-relaxed font-semibold italic text-center">"{message}"</p>
            </div>
        );
    };

    const renderRoomComparison = (item: PendingRoomItem) => {
        if (!item.room.pendingEditPayload) return null;
        try {
            const pending = JSON.parse(item.room.pendingEditPayload);
            const fields = [
                { key: 'name', label: 'Tên phòng' },
                { key: 'description', label: 'Mô tả' },
                { key: 'pricePerHour', label: 'Giá mỗi giờ' },
                { key: 'minCapacity', label: 'Sức chứa tối thiểu' },
                { key: 'maxCapacity', label: 'Sức chứa tối đa' },
            ];

            return (
                <div className="space-y-6">
                    <div className="rounded-xl bg-amber-50 p-4 border border-amber-100 flex items-start gap-3">
                        <div className="p-2 bg-white rounded-lg shadow-sm text-amber-600">
                             <RefreshCw className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-sm font-black text-amber-900">Yêu cầu chỉnh sửa nội dung</p>
                            <p className="text-xs font-medium text-amber-700">Dưới đây là các thay đổi được đề xuất bởi chủ phòng.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {fields.map(field => {
                            const oldVal = (item.room as any)[field.key];
                            const newVal = pending[field.key];
                            if (oldVal === newVal) return null;

                            return (
                                <div key={field.key} className="space-y-1.5">
                                    <label className="block text-[13px] font-semibold text-[#374151] ml-1">{field.label}</label>
                                    <div className="flex items-stretch gap-3">
                                        <div className="flex-1 min-h-[48px] flex items-center px-4 rounded-[12px] border border-red-100 bg-red-50/30 text-red-700 text-sm line-through opacity-60">
                                            {String(oldVal || 'Trống')}
                                        </div>
                                        <div className="flex items-center justify-center">
                                            <ArrowRight className="h-4 w-4 text-gray-300" />
                                        </div>
                                        <div className="flex-1 min-h-[48px] flex items-center px-4 rounded-[12px] border border-green-100 bg-green-50/30 text-green-700 text-sm font-bold">
                                            {String(newVal || 'Trống')}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            );
        } catch { return <p className="text-red-500">Lỗi parse dữ liệu chỉnh sửa.</p>; }
    };

    return (
        <AdminLayout title="Hộp thư Phê duyệt">
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-gray-900">Hộp thư Phê duyệt</h1>
                    <p className="font-medium text-gray-500">
                        Thẩm định hồ sơ đối tác, phòng đăng mới và xác minh danh tính người dùng.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <button
                        type="button"
                        className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-3.5 text-sm font-semibold text-gray-700"
                    >
                        <Download className="h-4 w-4" />
                        Export
                    </button>
                    <button
                        type="button"
                        onClick={refresh}
                        disabled={loading[tab]}
                        className="inline-flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-gray-900 px-4 text-sm font-bold text-white shadow-lg transition hover:bg-gray-800 active:scale-95 disabled:opacity-50"
                    >
                        <RefreshCw className={`h-4 w-4 ${loading[tab] ? 'animate-spin' : ''}`} />
                        Làm mới
                    </button>
                </div>
            </div>

            {/* Toolbar */}
            <div className="mb-8 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                    {/* Tabs - Centered or Left aligned but balanced */}
                    <div className="flex flex-wrap items-center gap-2 lg:flex-1">
                        {(
                            [
                                { value: 'partners', label: 'Đơn đối tác' },
                                { value: 'rooms', label: 'Phê duyệt phòng' },
                                { value: 'users', label: 'KYC Người dùng' },
                            ] as { value: 'partners' | 'rooms' | 'users'; label: string }[]
                        ).map((t) => (
                            <button
                                key={t.value}
                                type="button"
                                onClick={() => setTab(t.value)}
                                className={`inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl border-2 px-4 text-sm font-bold transition-all ${
                                    tab === t.value
                                        ? 'border-gray-900 bg-gray-900 text-white'
                                        : 'border-gray-50 bg-white text-gray-500 hover:border-gray-200 hover:text-gray-900'
                                }`}
                            >
                                <span>{t.label}</span>
                                <span className={`ml-1.5 rounded-lg px-2 py-0.5 text-[10px] font-black ${tab === t.value ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                    {t.value === 'partners' ? partners.length : t.value === 'rooms' ? rooms.length : kycUsers.length}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Search & Action Group - Centered visually in mobile/tablet */}
                    <div className="flex items-center justify-center gap-2 sm:justify-start lg:justify-end">
                        <div className="relative flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setIsSearchOpen((prev) => !prev)}
                                className={`inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border-2 transition-all ${
                                    isSearchOpen || searchTerm
                                        ? 'border-blue-100 bg-blue-50 text-blue-600'
                                        : 'border-gray-100 bg-white text-gray-400 hover:border-gray-200 hover:text-gray-600'
                                }`}
                                title="Tìm kiếm"
                            >
                                <SearchIcon className="h-5 w-5" />
                            </button>

                            {isSearchOpen && (
                                <div className="absolute right-full mr-2 top-0 w-64 sm:w-80">
                                    <input
                                        autoFocus
                                        type="text"
                                        placeholder="Tìm theo tên, email, nội dung..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="h-10 w-full rounded-xl border-2 border-gray-100 bg-white px-4 text-sm font-bold text-gray-700 outline-none focus:border-blue-200 transition-all"
                                    />
                                </div>
                            )}
                        </div>

                        <button
                            type="button"
                            className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border-2 border-gray-100 bg-white text-gray-400 transition hover:border-gray-200 hover:text-gray-600"
                            title="Sắp xếp"
                        >
                            <ArrowUpDown className="h-5 w-5" />
                        </button>

                        <button
                            type="button"
                            className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border-2 border-gray-100 bg-white text-gray-400 transition hover:border-gray-200 hover:text-gray-600"
                            title="Thanh lọc"
                        >
                            <Filter className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* List Data */}
            {loading[tab] ? (
                <div className="flex flex-col items-center justify-center py-32 space-y-4">
                    <Loader2 className="h-12 w-12 animate-spin text-gray-900" />
                    <p className="text-sm font-bold text-gray-400">Đang tải dữ liệu hồ sơ...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Render logic based on tab */}
                    {tab === 'partners' && partners.map(app => (
                        <div 
                            key={app.id}
                            className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-xl hover:border-red-100 transition-all group cursor-pointer"
                            onClick={() => setSelectedPartner(app)}
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-red-50 text-red-500 rounded-2xl group-hover:scale-110 transition-transform">
                                    <Building2 className="h-6 w-6" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-black text-gray-900 truncate">{app.fullName}</h4>
                                    <p className="text-xs font-bold text-amber-600 uppercase tracking-widest">{app.applicantType === 'BRANCH' ? 'Đăng ký chi nhánh' : 'Cá nhân (Tutor)'}</p>
                                </div>
                            </div>
                            <div className="space-y-2 mb-6">
                                <p className="text-sm text-gray-500 font-medium truncate">{app.email}</p>
                                <p className="text-sm text-gray-500 font-medium">{app.phone || 'Chưa có SĐT'}</p>
                            </div>
                            <button className="w-full py-3 bg-gray-50 rounded-2xl text-xs font-black text-gray-700 hover:bg-gray-900 hover:text-white transition-all">
                                XEM CHI TIẾT & DUYỆT
                            </button>
                        </div>
                    ))}

                    {tab === 'rooms' && rooms.map(item => (
                        <div 
                            key={item.room.id}
                            className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all group cursor-pointer"
                            onClick={() => setSelectedRoomItem(item)}
                        >
                            <div className="h-40 overflow-hidden relative">
                                <img 
                                    src={item.room.images?.split(',')[0].trim() || 'https://placehold.co/800x450?text=Room'} 
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                                    alt=""
                                />
                                <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-black uppercase text-white shadow-lg ${item.room.pendingEditStatus === 'PENDING' ? 'bg-sky-600' : 'bg-amber-500'}`}>
                                    {item.room.pendingEditStatus === 'PENDING' ? 'Sửa đổi' : 'Mới'}
                                </div>
                            </div>
                            <div className="p-6">
                                <h4 className="font-black text-gray-900 mb-1 truncate">{item.room.name}</h4>
                                <p className="text-xs font-medium text-gray-400 mb-4">{item.property?.name || 'Cơ sở chưa xác định'}</p>
                                <button className="w-full py-3 bg-gray-50 rounded-2xl text-xs font-black text-gray-700 hover:bg-gray-900 hover:text-white transition-all uppercase tracking-widest">
                                    Thẩm định phòng
                                </button>
                            </div>
                        </div>
                    ))}

                    {tab === 'users' && kycUsers.map(user => (
                        <div 
                            key={user.id}
                            className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-xl transition-all group cursor-pointer"
                            onClick={() => setSelectedKycUser(user)}
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div className="h-14 w-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-xl font-black shadow-lg shadow-slate-200 overflow-hidden">
                                    {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : user.name?.charAt(0)}
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-black text-gray-900">{user.name}</h4>
                                    <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">Xác minh định danh</p>
                                </div>
                            </div>
                            <p className="text-sm text-gray-500 font-medium mb-6">{user.email}</p>
                            <button className="w-full py-3 bg-gray-50 rounded-2xl text-xs font-black text-gray-700 hover:bg-gray-900 hover:text-white transition-all uppercase tracking-widest">
                                Xem hồ sơ KYC
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!loading[tab] && (tab === 'partners' ? partners : tab === 'rooms' ? rooms : kycUsers).length === 0 && (
                <div className="flex flex-col items-center justify-center py-32 space-y-4 rounded-3xl border-2 border-dashed border-gray-100 bg-gray-50/50">
                    <div className="p-4 bg-white rounded-full shadow-sm text-gray-300">
                        <FileCheck className="h-12 w-12" />
                    </div>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Không có hồ sơ nào đang chờ duyệt</p>
                </div>
            )}

            {/* Overlays */}
            <AdminDetailOverlay
                isOpen={!!selectedPartner}
                onClose={() => setSelectedPartner(null)}
                title="Chi tiết đơn đối tác"
                subtitle="Xem xét hồ sơ đăng ký Host / Chi nhánh"
                actions={{
                    onApprove: () => selectedPartner && approvePartner(selectedPartner).then(() => setSelectedPartner(null)),
                    onReject: (note) => selectedPartner && rejectPartner(selectedPartner.id, note).then(() => setSelectedPartner(null)),
                    isActing: actingId === selectedPartner?.id,
                    approveLabel: 'Duyệt & Cấp Role',
                }}
            >
                {selectedPartner && (
                    <div className="space-y-8">
                         <section className="space-y-4">
                              <h5 className="text-[11px] font-black uppercase text-slate-900 tracking-widest pl-1 opacity-40">Thông tin cá nhân</h5>
                              <div className="grid grid-cols-6 gap-4">
                                 <div className="space-y-1.5 col-span-2">
                                     <label className="block text-[13px] font-semibold text-[#374151] ml-1">Họ và tên</label>
                                     <div className="h-[48px] flex items-center px-4 rounded-[12px] border border-[#d1d5db] bg-white text-sm font-bold text-gray-900">
                                         {selectedPartner.fullName}
                                     </div>
                                 </div>
                                 <div className="space-y-1.5 col-span-2">
                                     <label className="block text-[13px] font-semibold text-[#374151] ml-1">Số điện thoại</label>
                                     <div className="h-[48px] flex items-center px-4 rounded-[12px] border border-[#d1d5db] bg-white text-sm font-bold text-gray-900">
                                         {selectedPartner.phone || '-'}
                                     </div>
                                 </div>
                                 <div className="space-y-1.5 col-span-2">
                                     <label className="block text-[13px] font-semibold text-[#374151] ml-1">Email liên hệ</label>
                                     <div className="h-[48px] flex items-center px-4 rounded-[12px] border border-[#d1d5db] bg-white text-sm font-bold text-gray-900 truncate">
                                         {selectedPartner.email}
                                     </div>
                                 </div>
                                 <div className="space-y-1.5 col-span-6">
                                     <label className="block text-[13px] font-semibold text-[#374151] ml-1">Địa chỉ hoạt động</label>
                                     <div className="h-auto min-h-[48px] flex items-center px-4 py-2.5 rounded-[12px] border border-[#d1d5db] bg-white text-sm font-bold text-gray-900 leading-tight">
                                         {selectedPartner.address || '-'}
                                     </div>
                                 </div>
                              </div>
                         </section>

                        <section className="space-y-4">
                             <h5 className="text-[11px] font-black uppercase text-slate-900 tracking-widest pl-1 opacity-40">Thông tin đăng ký</h5>
                             {renderRegistrationInfo(selectedPartner.message || '')}
                        </section>
                    </div>
                )}
            </AdminDetailOverlay>

            <AdminDetailOverlay
                isOpen={!!selectedRoomItem}
                onClose={() => setSelectedRoomItem(null)}
                title="Hồ sơ phê duyệt phòng"
                subtitle={selectedRoomItem?.room.pendingEditStatus === 'PENDING' ? 'Kiểm tra các nội dung chỉnh sửa mới' : 'Thẩm định phòng mới đăng đăng'}
                actions={{
                    onApprove: () => selectedRoomItem && approveRoom(selectedRoomItem.room).then(() => setSelectedRoomItem(null)),
                    onReject: (note) => selectedRoomItem && rejectRoom(selectedRoomItem.room, note).then(() => setSelectedRoomItem(null)),
                    isActing: actingId === selectedRoomItem?.room.id,
                    approveLabel: 'Phê duyệt dữ liệu',
                }}
            >
                {selectedRoomItem && (
                    <div className="space-y-8">
                        {selectedRoomItem.room.pendingEditStatus === 'PENDING' ? renderRoomComparison(selectedRoomItem) : (
                            <div className="space-y-6">
                                <section className="space-y-4">
                                     <h5 className="text-[11px] font-black uppercase text-slate-900 tracking-widest pl-1 opacity-40">Thông tin cơ bản</h5>
                                     <div className="space-y-1.5">
                                         <label className="block text-[13px] font-semibold text-[#374151] ml-1">Tên phòng & Địa chỉ</label>
                                         <div className="h-auto min-h-[48px] flex flex-col justify-center px-4 py-2.5 rounded-[12px] border border-[#d1d5db] bg-white">
                                             <p className="text-sm font-black text-gray-900">{selectedRoomItem.room.name}</p>
                                             <p className="text-xs text-gray-500">{selectedRoomItem.property?.name} • {selectedRoomItem.property?.addressDetail}</p>
                                         </div>
                                     </div>
                                </section>
                                <section className="space-y-4">
                                     <h5 className="text-xs font-black uppercase text-gray-400 tracking-widest">Hình ảnh phòng</h5>
                                     <div className="grid grid-cols-2 gap-2">
                                         {(selectedRoomItem.room.images || '').split(',').map((img, idx) => (
                                             <img key={idx} src={img.trim()} className="w-full h-32 object-cover rounded-xl" alt="" />
                                         ))}
                                     </div>
                                 </section>
                                <section className="space-y-4">
                                     <h5 className="text-[11px] font-black uppercase text-slate-900 tracking-widest pl-1 opacity-40">Mô tả</h5>
                                     <div className="space-y-1.5">
                                         <label className="block text-[13px] font-semibold text-[#374151] ml-1">Nội dung mô tả</label>
                                         <div className="text-sm text-gray-700 leading-relaxed bg-white border border-[#d1d5db] p-4 rounded-[12px]">
                                             {selectedRoomItem.room.description}
                                         </div>
                                     </div>
                                </section>
                            </div>
                        )}
                    </div>
                )}
            </AdminDetailOverlay>

            <AdminDetailOverlay
                isOpen={!!selectedKycUser}
                onClose={() => setSelectedKycUser(null)}
                title="Xác minh KYC"
                subtitle="Thẩm định danh tính người dùng"
                actions={{
                    onApprove: () => selectedKycUser && approveKyc(selectedKycUser.id).then(() => setSelectedKycUser(null)),
                    onReject: (reason) => selectedKycUser && rejectKyc(selectedKycUser.id, reason).then(() => setSelectedKycUser(null)),
                    isActing: actingId === selectedKycUser?.id,
                    approveLabel: 'Duyệt định danh',
                }}
            >
                {selectedKycUser && (
                    <div className="space-y-8">
                        <div className="flex items-center gap-4 p-5 rounded-[20px] bg-slate-900 text-white shadow-xl shadow-slate-200">
                             <div className="h-16 w-16 rounded-[12px] overflow-hidden border-2 border-white/20">
                                 <img src={selectedKycUser.avatar || ''} className="w-full h-full object-cover" />
                             </div>
                             <div>
                                 <h5 className="text-lg font-black">{selectedKycUser.name}</h5>
                                 <p className="text-xs font-medium text-slate-400">{selectedKycUser.email}</p>
                             </div>
                         </div>

                        <section className="space-y-4">
                             <h5 className="text-[11px] font-black uppercase text-slate-900 tracking-widest pl-1 opacity-40">Tài liệu nộp lên</h5>
                             <div className="space-y-4">
                                 {selectedKycUser.verificationDocs?.map((doc, idx) => (
                                     <div key={idx} className="group relative rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
                                         <img src={doc} className="w-full h-auto max-h-[500px] object-contain bg-gray-900" alt="KYC Doc" />
                                         <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                             <a href={doc} target="_blank" rel="noreferrer" className="p-3 bg-white rounded-2xl text-gray-900 font-bold flex items-center gap-2 hover:scale-110 transition-transform">
                                                <ExternalLink className="h-5 w-5" /> Mở ảnh gốc
                                             </a>
                                         </div>
                                     </div>
                                 ))}
                                 {(!selectedKycUser.verificationDocs || selectedKycUser.verificationDocs.length === 0) && (
                                     <div className="p-12 text-center rounded-3xl border-2 border-dashed border-gray-100 text-gray-400">
                                         Người dùng chưa nộp tài liệu xác minh.
                                     </div>
                                 )}
                             </div>
                        </section>
                    </div>
                )}
            </AdminDetailOverlay>
        </AdminLayout>
    );
}
