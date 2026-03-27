import { useCallback, useEffect, useMemo, useState } from 'react';
import { AdminLayout } from '../../../layouts/AdminLayout';
import { AdminDetailOverlay } from '../../../components/AdminDetailOverlay';
import { disputeService } from '../services/disputeService';
import { getApiErrorMessage } from '../../../../utils/apiError';
import { showToast } from '../../../../utils/toast';
import { 
    AlertTriangle, 
    ExternalLink, 
    Filter,
    RefreshCw,
    Search as SearchIcon,
    Flag,
    Download,
    Upload,
    Loader2
} from 'lucide-react';
import type { Dispute, Report, DisputeStatus, DisputePriority } from '../../../../types';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

type Tab = 'disputes' | 'reports';

export function DisputesPage() {
    const [activeTab, setActiveTab] = useState<Tab>('disputes');
    const [loading, setLoading] = useState(false);
    const [disputes, setDisputes] = useState<Dispute[]>([]);
    const [reports, setReports] = useState<Report[]>([]);
    const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const [isActing, setIsActing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            if (activeTab === 'disputes') {
                const res = await disputeService.getDisputes({ size: 100 });
                setDisputes(res.items || []);
            } else {
                const res = await disputeService.getReports({ size: 100 });
                setReports(res.items || []);
            }
        } catch (e) {
            showToast.error(getApiErrorMessage(e, `Không tải được danh sách ${activeTab === 'disputes' ? 'tranh chấp' : 'báo cáo'}`));
        } finally {
            setLoading(false);
        }
    }, [activeTab]);

    useEffect(() => {
        void loadData();
    }, [loadData]);

    const handleResolveDispute = async (status: DisputeStatus, resolution: string) => {
        if (!selectedDispute) return;
        setIsActing(true);
        try {
            await disputeService.resolveDispute(selectedDispute.id, {
                status,
                resolution
            });
            showToast.success('Đã cập nhật tranh chấp');
            setSelectedDispute(null);
            void loadData();
        } catch (e) {
            showToast.error(getApiErrorMessage(e, 'Xử lý thất bại'));
        } finally {
            setIsActing(false);
        }
    };

    const handleUpdateReport = async (status: 'reviewed' | 'dismissed') => {
        if (!selectedReport) return;
        setIsActing(true);
        try {
            await disputeService.updateReportStatus(selectedReport.id, status);
            showToast.success('Đã cập nhật báo cáo');
            setSelectedReport(null);
            void loadData();
        } catch (e) {
            showToast.error(getApiErrorMessage(e, 'Cập nhật thất bại'));
        } finally {
            setIsActing(false);
        }
    };

    const getPriorityColor = (p: DisputePriority) => {
        switch (p) {
            case 'critical': return 'text-red-600 bg-red-50 border-red-100';
            case 'high': return 'text-orange-600 bg-orange-50 border-orange-100';
            case 'medium': return 'text-blue-600 bg-blue-50 border-blue-100';
            default: return 'text-gray-600 bg-gray-50 border-gray-100';
        }
    };

    return (
        <AdminLayout title="Resolution Center">
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900">Resolution Center</h1>
                    <p className="text-sm font-medium text-slate-500">
                        Hệ thống xử lý tranh chấp đặt chỗ và báo cáo vi phạm người dùng.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <button
                        type="button"
                        className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all active:scale-95"
                    >
                        <Download className="h-4 w-4" />
                        Xuất báo cáo
                    </button>
                    <button
                        type="button"
                        onClick={() => void loadData()}
                        disabled={loading}
                        className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 text-sm font-bold text-white shadow-lg shadow-slate-200 transition hover:bg-black active:scale-95 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                        Làm mới
                    </button>
                </div>
            </div>

            {/* Toolbar */}
            <div className="mb-8 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                    {/* Tabs */}
                    <div className="flex flex-wrap items-center gap-2">
                        {(
                            [
                                { value: 'disputes', label: 'Tranh chấp Booking' },
                                { value: 'reports', label: 'Báo cáo vi phạm' },
                            ] as { value: Tab; label: string }[]
                        ).map((tab) => (
                            <button
                                key={tab.value}
                                type="button"
                                onClick={() => setActiveTab(tab.value)}
                                className={`inline-flex h-11 cursor-pointer items-center gap-3 rounded-xl border-2 px-5 text-sm font-bold transition-all ${
                                    activeTab === tab.value
                                        ? 'border-slate-900 bg-slate-900 text-white'
                                        : 'border-slate-50 bg-white text-slate-500 hover:border-slate-200 hover:text-slate-900'
                                }`}
                            >
                                <span>{tab.label}</span>
                                <span className={`ml-1 rounded-lg px-2 py-0.5 text-[10px] font-black ${
                                    activeTab === tab.value ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400'
                                }`}>
                                    {tab.value === 'disputes' ? disputes.length : reports.length}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Search Search */}
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="relative flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setIsSearchOpen((prev) => !prev)}
                                className={`inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl border-2 transition-all ${
                                    isSearchOpen || searchQuery
                                        ? 'border-blue-100 bg-blue-50 text-blue-600'
                                        : 'border-slate-100 bg-white text-slate-400 hover:border-slate-200 hover:text-slate-600'
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
                                        placeholder="Tìm theo nội dung, mã số..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="h-11 w-full rounded-xl border-2 border-slate-100 bg-white px-4 text-sm font-bold text-slate-700 outline-none focus:border-blue-200 transition-all"
                                    />
                                </div>
                            )}
                        </div>

                        <button
                            type="button"
                            className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl border-2 border-slate-100 bg-white text-slate-400 transition hover:border-slate-200 hover:text-slate-600"
                            title="Lọc"
                        >
                            <Filter className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            {activeTab === 'disputes' ? (
                <div className="grid grid-cols-1 gap-6">
                    {loading ? (
                        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-slate-200" /></div>
                    ) : disputes.length === 0 ? (
                        <div className="rounded-[32px] border-2 border-dashed border-slate-100 py-20 text-center">
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-[11px]">Không có tranh chấp nào cần xử lý</p>
                        </div>
                    ) : (
                        disputes.map((d) => (
                            <div key={d.id} className="group relative overflow-hidden rounded-[24px] border border-slate-100 bg-white p-7 shadow-sm transition-all hover:shadow-xl hover:border-slate-200">
                                <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                                    d.priority === 'critical' ? 'bg-red-500' : d.priority === 'high' ? 'bg-orange-500' : 'bg-blue-500'
                                }`} />
                                
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                    <div className="flex items-start gap-6 flex-1">
                                        <div className={`shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center ${getPriorityColor(d.priority)}`}>
                                            <AlertTriangle className="h-6 w-6" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="mb-2 flex items-center flex-wrap gap-3">
                                                <h3 className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors truncate">{d.title}</h3>
                                                <span className="rounded-lg bg-slate-50 px-2 py-1 text-[10px] font-black text-slate-400">ID: {d.id.slice(0, 8).toUpperCase()}</span>
                                            </div>
                                            
                                            <div className="mb-4 flex items-center flex-wrap gap-2 text-[11px] font-black uppercase tracking-tight">
                                                <div className="px-2 py-1 rounded-lg bg-blue-50 text-blue-600">
                                                    {d.reporterName} ({d.reporterRole})
                                                </div>
                                                <div className="text-slate-300">đối đầu</div>
                                                <div className="px-2 py-1 rounded-lg bg-amber-50 text-amber-600">
                                                    {d.againstName} ({d.againstRole})
                                                </div>
                                            </div>

                                            <p className="line-clamp-2 text-[13px] font-medium text-slate-500 leading-relaxed max-w-3xl">{d.description}</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-start gap-4 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-50">
                                        <div className="flex flex-col items-end gap-1.5">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest ${
                                                d.status === 'open' ? 'bg-red-50 text-red-600 ring-1 ring-red-100' : 'bg-slate-100 text-slate-500'
                                            }`}>
                                                {d.status.replace(/_/g, ' ')}
                                            </span>
                                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
                                                {format(new Date(d.createdAt), 'HH:mm • dd/MM/yy', { locale: vi })}
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => setSelectedDispute(d)}
                                            className="inline-flex h-11 items-center gap-2 rounded-xl bg-slate-900 px-6 text-sm font-bold text-white transition-all hover:bg-blue-600 active:scale-95 shadow-lg shadow-slate-100"
                                        >
                                            Xem chi tiết
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {loading ? (
                        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-slate-200" /></div>
                    ) : reports.length === 0 ? (
                        <div className="rounded-[32px] border-2 border-dashed border-slate-100 py-20 text-center">
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-[11px]">Không có báo cáo vi phạm nào</p>
                        </div>
                    ) : (
                        reports.map((r) => (
                            <div key={r.id} className="group relative overflow-hidden rounded-[24px] border border-slate-100 bg-white p-7 shadow-sm transition-all hover:shadow-xl hover:border-slate-200">
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                    <div className="flex items-start gap-6 flex-1">
                                        <div className={`shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center ${
                                            r.targetType === 'user' ? 'bg-purple-50 text-purple-600' : 'bg-orange-50 text-orange-600'
                                        }`}>
                                            <Flag className="h-6 w-6" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="mb-2 flex items-center gap-3">
                                                <h3 className="text-xl font-black text-slate-900 truncate">{r.reason}</h3>
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${
                                                    r.targetType === 'user' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'
                                                }`}>
                                                    {r.targetType}
                                                </span>
                                            </div>
                                            <p className="mb-3 text-[13px] font-bold text-slate-500">
                                                Báo cáo bởi <span className="text-slate-900">{r.reporterName}</span>
                                            </p>
                                            <p className="text-[13px] font-medium text-slate-500 leading-relaxed line-clamp-2">{r.description}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-start gap-4 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-50">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest ${
                                            r.status === 'pending' ? 'bg-amber-50 text-amber-600 ring-1 ring-amber-100' : 'bg-slate-100 text-slate-500'
                                        }`}>
                                            {r.status}
                                        </span>
                                        <button 
                                            onClick={() => setSelectedReport(r)}
                                            className="text-sm font-black text-blue-600 hover:text-blue-700 underline underline-offset-8 decoration-2"
                                        >
                                            Xử lý báo cáo
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Dispute Detail Overlay */}
            <AdminDetailOverlay
                isOpen={!!selectedDispute}
                onClose={() => setSelectedDispute(null)}
                title="Chi tiết tranh chấp"
                subtitle={`Mã số: #${selectedDispute?.id.slice(0, 8)}`}
                actions={{
                    onApprove: () => handleResolveDispute('resolved_payout', 'Admin approved payout'),
                    onReject: (reason) => handleResolveDispute('closed', reason),
                    approveLabel: 'Quyết định Payout',
                    rejectLabel: 'Đóng tranh chấp',
                    isActing
                }}
            >
                {selectedDispute && (
                    <div className="space-y-8">
                        {/* Evidence Section */}
                        <section className="space-y-4">
                            <h4 className="text-[11px] font-black uppercase text-slate-900 tracking-widest pl-1 opacity-40">
                                Bằng chứng tài liệu
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                                {selectedDispute.evidence?.map((url, i) => (
                                    <div key={i} className="group relative aspect-video overflow-hidden rounded-[16px] bg-slate-100 border border-slate-100 shadow-sm">
                                        <img src={url} alt="Evidence" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                        <a href={url} target="_blank" rel="noreferrer" className="absolute inset-0 flex items-center justify-center bg-slate-900/40 opacity-0 transition-opacity group-hover:opacity-100">
                                            <ExternalLink className="text-white h-6 w-6" />
                                        </a>
                                    </div>
                                ))}
                                {(!selectedDispute.evidence || selectedDispute.evidence.length === 0) && (
                                    <div className="col-span-2 rounded-[20px] bg-slate-50 p-10 text-center border-2 border-dashed border-slate-100">
                                        <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Không có hình ảnh đính kèm</p>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Description */}
                        <section className="space-y-3">
                            <h4 className="text-[11px] font-black uppercase text-slate-900 tracking-widest pl-1 opacity-40">
                                Nội dung khiếu nại
                            </h4>
                            <div className="rounded-[16px] bg-slate-50 p-6 text-[14px] font-medium text-slate-700 leading-relaxed whitespace-pre-wrap border border-slate-100">
                                {selectedDispute.description}
                            </div>
                        </section>

                        {/* Participant info in Grid */}
                        <section className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="block text-[13px] font-semibold text-[#374151] ml-1">Người khiếu nại</label>
                                <div className="h-[48px] flex items-center px-4 rounded-[12px] border border-[#d1d5db] bg-white text-sm font-bold text-slate-900 truncate">
                                    {selectedDispute.reporterName} ({selectedDispute.reporterRole})
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-[13px] font-semibold text-[#374151] ml-1">Đối tượng bị khiếu nại</label>
                                <div className="h-[48px] flex items-center px-4 rounded-[12px] border border-[#d1d5db] bg-white text-sm font-bold text-slate-900 truncate">
                                    {selectedDispute.againstName} ({selectedDispute.againstRole})
                                </div>
                            </div>
                        </section>

                        {/* Booking Link */}
                        <div className="rounded-[20px] bg-slate-900 p-6 shadow-xl shadow-slate-200">
                            <div className="flex items-center justify-between gap-4">
                                <div className="min-w-0">
                                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Mã đặt chỗ liên quan</p>
                                    <p className="text-lg font-black text-white truncate">#{selectedDispute.bookingId}</p>
                                </div>
                                <button className="shrink-0 h-11 rounded-xl bg-white/10 px-6 text-sm font-bold text-white hover:bg-white/20 transition-all border border-white/10 active:scale-95">
                                    Kiểm tra đặt chỗ
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </AdminDetailOverlay>

            {/* Report Detail Overlay (Simplified use of AdminDetailOverlay) */}
            <AdminDetailOverlay
                isOpen={!!selectedReport}
                onClose={() => setSelectedReport(null)}
                title="Xử lý báo cáo"
                subtitle={`Mục tiêu: ${selectedReport?.targetType} (${selectedReport?.targetId})`}
                actions={{
                    onApprove: () => handleUpdateReport('reviewed'),
                    onReject: () => handleUpdateReport('dismissed'),
                    approveLabel: 'Đã xem xét',
                    rejectLabel: 'Bỏ qua báo cáo',
                    isActing
                }}
            >
                {selectedReport && (
                    <div className="space-y-8">
                        {/* Summary Info */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="block text-[13px] font-semibold text-[#374151] ml-1">Lý do báo cáo</label>
                                <div className="h-[48px] flex items-center px-4 rounded-[12px] border border-[#d1d5db] bg-white text-sm font-bold text-slate-900 truncate">
                                    {selectedReport.reason}
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-[13px] font-semibold text-[#374151] ml-1">Người báo cáo</label>
                                <div className="h-[48px] flex items-center px-4 rounded-[12px] border border-[#d1d5db] bg-white text-sm font-bold text-slate-900 truncate">
                                    {selectedReport.reporterName}
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <section className="space-y-3">
                            <h4 className="text-[11px] font-black uppercase text-slate-900 tracking-widest pl-1 opacity-40">Mô tả chi tiết vi phạm</h4>
                            <div className="rounded-[16px] bg-slate-50 p-6 text-[14px] font-medium text-slate-700 leading-relaxed border border-slate-100 italic">
                                "{selectedReport.description}"
                            </div>
                        </section>

                        {/* Target Info */}
                        <div className="bg-slate-900 rounded-[20px] p-6 text-white shadow-xl shadow-slate-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Đối tượng bị báo cáo</p>
                                    <p className="text-lg font-black uppercase">{selectedReport.targetType}: <span className="text-blue-400">{selectedReport.targetId}</span></p>
                                </div>
                                <button className="h-11 px-6 rounded-xl bg-white/10 hover:bg-white/20 transition-all font-bold text-sm border border-white/10 active:scale-95">
                                    Xem hồ sơ đối tượng
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </AdminDetailOverlay>
        </AdminLayout>
    );
}
