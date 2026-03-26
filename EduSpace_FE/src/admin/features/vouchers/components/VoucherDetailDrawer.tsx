import { X, Ticket, Tag, Calendar, Users, BarChart2, Globe, Lock, Power, PowerOff, Trash2, Copy, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import type { Voucher, VoucherCampaign } from '../services/types';

interface VoucherDetailDrawerProps {
    voucher: Voucher | null;
    campaign?: VoucherCampaign;
    onClose: () => void;
    onToggleActive: (id: number) => void;
    onDelete: (id: number) => void;
}

function StatCard({ label, value, sub }: { label: string; value: React.ReactNode; sub?: string }) {
    return (
        <div className="bg-gray-50 rounded-2xl p-4 flex flex-col gap-1">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</span>
            <span className="text-xl font-black text-gray-900">{value}</span>
            {sub && <span className="text-[10px] text-gray-400 font-bold">{sub}</span>}
        </div>
    );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
            <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{label}</span>
            <span className="text-sm font-bold text-gray-900 text-right max-w-[60%]">{value}</span>
        </div>
    );
}

export function VoucherDetailDrawer({ voucher, campaign, onClose, onToggleActive, onDelete }: VoucherDetailDrawerProps) {
    const [copied, setCopied] = useState(false);

    if (!voucher) return null;

    const usagePercent = voucher.maxUses ? Math.round((voucher.usedCount / voucher.maxUses) * 100) : 0;
    const isExpired = new Date(voucher.validUntil) < new Date();
    const isNotStarted = new Date(voucher.validFrom) > new Date();

    const statusLabel = !voucher.isActive
        ? { text: 'Tạm dừng', cls: 'bg-gray-100 text-gray-500' }
        : isExpired
        ? { text: 'Hết hạn', cls: 'bg-red-50 text-red-500' }
        : isNotStarted
        ? { text: 'Chưa bắt đầu', cls: 'bg-yellow-50 text-yellow-600' }
        : { text: 'Hoạt động', cls: 'bg-green-50 text-green-600' };

    const handleCopyCode = async () => {
        await navigator.clipboard.writeText(voucher.code);
        setCopied(true);
        toast.success('Đã copy mã voucher!');
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDelete = () => {
        if (window.confirm(`Xoá voucher "${voucher.code}"? Hành động này không thể hoàn tác.`)) {
            onDelete(voucher.id);
            onClose();
        }
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-40"
                onClick={onClose}
            />

            {/* Drawer */}
            <div className="fixed top-0 right-0 h-full w-full max-w-md z-50 flex flex-col bg-white shadow-2xl animate-in slide-in-from-right-8 duration-300">
                {/* Header */}
                <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                            <Ticket className="w-5 h-5 text-orange-500" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Chi tiết Voucher</h3>
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${statusLabel.cls}`}>
                                {statusLabel.text}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all"
                    >
                        <X className="w-4 h-4 text-gray-500" />
                    </button>
                </div>

                {/* Scroll content */}
                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                    {/* Mã voucher + copy */}
                    <div className="relative flex items-center justify-between bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-dashed border-orange-200 rounded-2xl px-6 py-5">
                        <div>
                            <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest block mb-1">Mã voucher</span>
                            <span className="text-2xl font-black text-gray-900 tracking-widest font-mono">{voucher.code}</span>
                        </div>
                        <button
                            onClick={handleCopyCode}
                            className="flex items-center gap-1.5 px-3 py-2 bg-white rounded-xl shadow-sm border border-orange-100 text-orange-500 hover:bg-orange-50 transition-all font-bold text-xs"
                        >
                            {copied ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                            {copied ? 'Đã copy' : 'Copy'}
                        </button>
                        {/* Notched circles giống voucher thật */}
                        <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white border border-gray-100 shadow-inner" />
                        <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white border border-gray-100 shadow-inner" />
                    </div>

                    {/* Stats grid */}
                    <div className="grid grid-cols-2 gap-3">
                        <StatCard
                            label="Mức giảm"
                            value={
                                voucher.discountType === 'PERCENTAGE'
                                    ? `${voucher.discountValue}%`
                                    : `${voucher.discountValue.toLocaleString('vi-VN')}đ`
                            }
                            sub={voucher.discountType === 'PERCENTAGE' ? 'Phần trăm' : 'Cố định'}
                        />
                        <StatCard
                            label="Lượt sử dụng"
                            value={`${voucher.usedCount} / ${voucher.maxUses ?? '∞'}`}
                            sub={voucher.maxUses ? `${usagePercent}% đã dùng` : 'Không giới hạn'}
                        />
                    </div>

                    {/* Usage bar */}
                    {voucher.maxUses && (
                        <div className="space-y-1.5">
                            <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                <span>Tiến độ sử dụng</span>
                                <span>{usagePercent}%</span>
                            </div>
                            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-700 ${
                                        usagePercent >= 80 ? 'bg-red-400' : usagePercent >= 50 ? 'bg-amber-400' : 'bg-green-400'
                                    }`}
                                    style={{ width: `${Math.min(usagePercent, 100)}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Info rows */}
                    <div className="bg-gray-50/50 rounded-2xl px-4 divide-y divide-gray-100">
                        <InfoRow
                            label="Loại giảm"
                            value={
                                <span className={`px-2 py-0.5 rounded-full text-xs font-black ${
                                    voucher.discountType === 'PERCENTAGE' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
                                }`}>
                                    {voucher.discountType === 'PERCENTAGE' ? 'PERCENTAGE' : 'FIXED_AMOUNT'}
                                </span>
                            }
                        />
                        {voucher.discountType === 'PERCENTAGE' && voucher.maxDiscountAmount && (
                            <InfoRow
                                label="Giảm tối đa"
                                value={`${voucher.maxDiscountAmount.toLocaleString('vi-VN')}đ`}
                            />
                        )}
                        <InfoRow
                            label="Đơn tối thiểu"
                            value={voucher.minOrderValue > 0 ? `${voucher.minOrderValue.toLocaleString('vi-VN')}đ` : 'Không yêu cầu'}
                        />
                        <InfoRow
                            label="Lượt / người dùng"
                            value={`${voucher.maxUsesPerUser} lần`}
                        />
                        <InfoRow
                            label="Hiển thị"
                            value={
                                <span className={`flex items-center gap-1.5 font-black text-xs ${voucher.isPublic ? 'text-green-600' : 'text-gray-500'}`}>
                                    {voucher.isPublic ? <Globe className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                                    {voucher.isPublic ? 'Public' : 'Private'}
                                </span>
                            }
                        />
                        <InfoRow
                            label="Hiệu lực từ"
                            value={new Date(voucher.validFrom).toLocaleString('vi-VN')}
                        />
                        <InfoRow
                            label="Hết hạn"
                            value={
                                <span className={isExpired ? 'text-red-500' : ''}>
                                    {new Date(voucher.validUntil).toLocaleString('vi-VN')}
                                </span>
                            }
                        />
                        {campaign && (
                            <InfoRow
                                label="Chiến dịch"
                                value={
                                    <span className="flex items-center gap-1.5">
                                        <Tag className="w-3.5 h-3.5 text-blue-400" />
                                        {campaign.name}
                                    </span>
                                }
                            />
                        )}
                        <InfoRow
                            label="Tạo lúc"
                            value={new Date(voucher.createdAt).toLocaleString('vi-VN')}
                        />
                        <InfoRow
                            label="Cập nhật"
                            value={new Date(voucher.updatedAt).toLocaleString('vi-VN')}
                        />
                    </div>

                    {/* Icons summary row */}
                    <div className="grid grid-cols-3 gap-2">
                        <div className="flex flex-col items-center gap-1.5 bg-gray-50 rounded-2xl p-3">
                            <Tag className="w-5 h-5 text-blue-400" />
                            <span className="text-[10px] font-black text-gray-400 text-center uppercase tracking-wide">Chiến dịch</span>
                            <span className="text-[10px] font-bold text-gray-700 text-center truncate w-full text-center">
                                {campaign?.name ?? '—'}
                            </span>
                        </div>
                        <div className="flex flex-col items-center gap-1.5 bg-gray-50 rounded-2xl p-3">
                            <Users className="w-5 h-5 text-purple-400" />
                            <span className="text-[10px] font-black text-gray-400 text-center uppercase tracking-wide">Per User</span>
                            <span className="text-[10px] font-bold text-gray-700">{voucher.maxUsesPerUser}x</span>
                        </div>
                        <div className="flex flex-col items-center gap-1.5 bg-gray-50 rounded-2xl p-3">
                            <BarChart2 className="w-5 h-5 text-green-400" />
                            <span className="text-[10px] font-black text-gray-400 text-center uppercase tracking-wide">Đã dùng</span>
                            <span className="text-[10px] font-bold text-gray-700">{voucher.usedCount}</span>
                        </div>
                    </div>
                </div>

                {/* Action buttons */}
                <div className="px-6 py-5 border-t border-gray-100 shrink-0 flex gap-3">
                    <button
                        onClick={() => onToggleActive(voucher.id)}
                        className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-sm transition-all active:scale-95 ${
                            voucher.isActive
                                ? 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100 border border-yellow-200'
                                : 'bg-green-50 text-green-600 hover:bg-green-100 border border-green-200'
                        }`}
                    >
                        {voucher.isActive ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                        {voucher.isActive ? 'Tạm dừng' : 'Kích hoạt'}
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
