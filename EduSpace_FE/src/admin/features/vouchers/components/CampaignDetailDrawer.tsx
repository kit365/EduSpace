import { X, Layers, Calendar, Clock, Power, PowerOff, Trash2, CheckCircle2, AlertCircle, Timer, Edit2 } from 'lucide-react';
import type { VoucherCampaign } from '../services/types';

interface CampaignDetailDrawerProps {
    campaign: VoucherCampaign | null;
    onClose: () => void;
    onEdit: (campaign: VoucherCampaign) => void;
    onToggleActive: (id: number) => void;
    onDelete: (id: number) => void;
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="flex items-start justify-between py-3 border-b border-gray-50 last:border-0 gap-4">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest shrink-0">{label}</span>
            <span className="text-sm font-bold text-gray-900 text-right">{value}</span>
        </div>
    );
}

function getDuration(start: string, end: string): string {
    const ms = new Date(end).getTime() - new Date(start).getTime();
    const days = Math.round(ms / (1000 * 60 * 60 * 24));
    if (days < 7) return `${days} ngày`;
    if (days < 30) return `${Math.round(days / 7)} tuần`;
    if (days < 365) return `${Math.round(days / 30)} tháng`;
    return `${Math.round(days / 365)} năm`;
}

function getPhase(campaign: VoucherCampaign): {
    label: string;
    color: string;
    dotCls: string;
    icon: React.ReactNode;
    progressPct: number;
} {
    const now = Date.now();
    const start = new Date(campaign.startDate).getTime();
    const end = new Date(campaign.endDate).getTime();

    if (!campaign.isActive)
        return { label: 'Tạm dừng', color: 'bg-gray-100 text-gray-500', dotCls: 'bg-gray-400', icon: <PowerOff className="w-4 h-4" />, progressPct: 0 };
    if (now < start)
        return { label: 'Chưa bắt đầu', color: 'bg-yellow-50 text-yellow-600', dotCls: 'bg-yellow-400', icon: <Timer className="w-4 h-4" />, progressPct: 0 };
    if (now > end)
        return { label: 'Đã kết thúc', color: 'bg-red-50 text-red-500', dotCls: 'bg-red-400', icon: <AlertCircle className="w-4 h-4" />, progressPct: 100 };

    const pct = Math.round(((now - start) / (end - start)) * 100);
    return { label: 'Đang chạy', color: 'bg-green-50 text-green-600', dotCls: 'bg-green-500 animate-pulse', icon: <CheckCircle2 className="w-4 h-4" />, progressPct: pct };
}

export function CampaignDetailDrawer({ campaign, onClose, onEdit, onToggleActive, onDelete }: CampaignDetailDrawerProps) {
    if (!campaign) return null;

    const phase = getPhase(campaign);
    const duration = getDuration(campaign.startDate, campaign.endDate);
    const daysLeft = Math.max(0, Math.round((new Date(campaign.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

    const handleDelete = () => {
        if (window.confirm(`Xoá chiến dịch "${campaign.name}"? Hành động này không thể hoàn tác.`)) {
            onDelete(campaign.id);
            onClose();
        }
    };

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-40" onClick={onClose} />

            {/* Drawer */}
            <div className="fixed top-0 right-0 h-full w-full max-w-md z-50 flex flex-col bg-white shadow-2xl animate-in slide-in-from-right-8 duration-300">
                {/* Header */}
                <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-500 text-white flex items-center justify-center">
                            <Layers className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Chi tiết Chiến dịch</h3>
                            <span className={`inline-flex items-center gap-1.5 text-[10px] font-black px-2 py-0.5 rounded-full ${phase.color}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${phase.dotCls}`} />
                                {phase.label}
                            </span>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all">
                        <X className="w-4 h-4 text-gray-500" />
                    </button>
                </div>

                {/* Scroll content */}
                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                    {/* Hero card */}
                    <div className="bg-gradient-to-br from-cyan-50 to-blue-50 border border-blue-100 rounded-3xl p-6 space-y-2">
                        <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Tên chiến dịch</div>
                        <h2 className="text-xl font-black text-gray-900 leading-snug">{campaign.name}</h2>
                        {campaign.description && (
                            <p className="text-sm font-medium text-gray-500 leading-relaxed">{campaign.description}</p>
                        )}
                    </div>

                    {/* Stats grid */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-gray-50 rounded-2xl p-4 flex flex-col gap-1 items-center text-center">
                            <Calendar className="w-5 h-5 text-blue-400" />
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-wide">Thời lượng</span>
                            <span className="text-base font-black text-gray-900">{duration}</span>
                        </div>
                        <div className={`rounded-2xl p-4 flex flex-col gap-1 items-center text-center ${daysLeft <= 7 && phase.label === 'Đang chạy' ? 'bg-red-50' : 'bg-gray-50'}`}>
                            <Clock className={`w-5 h-5 ${daysLeft <= 7 && phase.label === 'Đang chạy' ? 'text-red-400' : 'text-purple-400'}`} />
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-wide">Còn lại</span>
                            <span className={`text-base font-black ${daysLeft <= 7 && phase.label === 'Đang chạy' ? 'text-red-500' : 'text-gray-900'}`}>
                                {phase.label === 'Đang chạy' ? `${daysLeft} ngày` : '—'}
                            </span>
                        </div>
                        <div className="bg-gray-50 rounded-2xl p-4 flex flex-col gap-1 items-center text-center">
                            <div className="w-5 h-5 flex items-center justify-center">{phase.icon}</div>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-wide">Giai đoạn</span>
                            <span className="text-[11px] font-black text-gray-900 text-center">{phase.label}</span>
                        </div>
                    </div>

                    {/* Timeline progress bar */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            <span>Bắt đầu</span>
                            <span>{phase.progressPct}% đã qua</span>
                            <span>Kết thúc</span>
                        </div>
                        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-700 ${
                                    phase.label === 'Đã kết thúc' ? 'bg-red-300' :
                                    phase.label === 'Đang chạy' ? 'bg-gradient-to-r from-cyan-400 to-blue-500' :
                                    'bg-gray-200'
                                }`}
                                style={{ width: `${phase.progressPct}%` }}
                            />
                        </div>
                        <div className="flex justify-between text-[9px] text-gray-300 font-bold">
                            <span>{new Date(campaign.startDate).toLocaleDateString('vi-VN')}</span>
                            <span>{new Date(campaign.endDate).toLocaleDateString('vi-VN')}</span>
                        </div>
                    </div>

                    {/* Info rows */}
                    <div className="bg-gray-50/50 rounded-2xl px-4 divide-y divide-gray-100">
                        <InfoRow
                            label="Ngày bắt đầu"
                            value={new Date(campaign.startDate).toLocaleString('vi-VN')}
                        />
                        <InfoRow
                            label="Ngày kết thúc"
                            value={
                                <span className={new Date(campaign.endDate) < new Date() ? 'text-red-500' : ''}>
                                    {new Date(campaign.endDate).toLocaleString('vi-VN')}
                                </span>
                            }
                        />
                        <InfoRow
                            label="Trạng thái"
                            value={
                                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-black text-[11px] ${phase.color}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${phase.dotCls}`} />
                                    {phase.label}
                                </span>
                            }
                        />
                        <InfoRow
                            label="Tạo lúc"
                            value={new Date(campaign.createdAt).toLocaleString('vi-VN')}
                        />
                        <InfoRow
                            label="Cập nhật"
                            value={new Date(campaign.updatedAt).toLocaleString('vi-VN')}
                        />
                        <InfoRow label="ID" value={<span className="font-mono text-gray-500">#{campaign.id}</span>} />
                    </div>
                </div>

                {/* Action buttons */}
                <div className="px-6 py-5 border-t border-gray-100 shrink-0 flex gap-3">
                    <button
                        onClick={() => onEdit(campaign)}
                        className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-sm bg-cyan-50 text-cyan-600 hover:bg-cyan-100 border border-cyan-200 transition-all active:scale-95"
                    >
                        <Edit2 className="w-4 h-4" />
                        Chỉnh sửa
                    </button>
                    <button
                        onClick={() => onToggleActive(campaign.id)}
                        className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-sm transition-all active:scale-95 ${
                            campaign.isActive
                                ? 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100 border border-yellow-200'
                                : 'bg-green-50 text-green-600 hover:bg-green-100 border border-green-200'
                        }`}
                    >
                        {campaign.isActive ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                        {campaign.isActive ? 'Tạm dừng' : 'Kích hoạt'}
                    </button>
                    <button
                        onClick={handleDelete}
                        className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-sm bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 transition-all active:scale-95"
                    >
                        <Trash2 className="w-4 h-4" />
                        Xoá
                    </button>
                </div>
            </div>
        </>
    );
}
