import { useState } from 'react';
import { useVouchers } from '../hooks/useVouchers';
import { useVoucherCampaigns } from '../hooks/useVoucherCampaigns';
import type { Voucher } from '../services/types';
import { Ticket, Plus, Trash2, PowerOff, Power, Eye } from 'lucide-react';
import { VoucherModal } from './VoucherModal';
import { VoucherDetailDrawer } from './VoucherDetailDrawer';

export function VoucherView() {
    const [selectedCampaignId, setSelectedCampaignId] = useState<number | undefined>(undefined);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [detailVoucher, setDetailVoucher] = useState<Voucher | null>(null);
    const [editVoucher, setEditVoucher] = useState<Voucher | null>(null);

    const { campaigns } = useVoucherCampaigns();
    const { vouchers, loading, toggleActive, deleteVoucher, refresh } = useVouchers(selectedCampaignId);

    const detailCampaign = detailVoucher?.campaignId
        ? campaigns.find((c) => c.id === detailVoucher.campaignId)
        : undefined;

    return (
        <>
        <div className="bg-white text-black rounded-3xl border border-gray-100 shadow-sm p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">Chi tiết Mã giảm giá (Vouchers)</h2>
                    <p className="text-xs text-gray-400 font-bold mt-1 uppercase tracking-wider">Tạo mã riêng lẻ hoặc gắn vào chiến dịch · Click dòng để xem chi tiết</p>
                </div>

                <div className="flex gap-4 w-full md:w-auto">
                    <select
                        className="bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-2 font-bold text-gray-700 outline-none w-full md:w-48 appearance-none focus:border-blue-500 transition-colors"
                        value={selectedCampaignId || ''}
                        onChange={(e) => setSelectedCampaignId(e.target.value ? Number(e.target.value) : undefined)}
                    >
                        <option value="">Tất cả chiến dịch</option>
                        {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 whitespace-nowrap"
                    >
                        <Plus className="w-4 h-4" /> Tạo Voucher
                    </button>
                </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-gray-100">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Mã voucher</th>
                            <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Loại / Mức giảm</th>
                            <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Lượt dùng</th>
                            <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Thời hạn</th>
                            <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Trạng thái</th>
                            <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr><td colSpan={6} className="p-8 text-center text-gray-400 font-medium">Đang tải...</td></tr>
                        ) : vouchers.length === 0 ? (
                            <tr><td colSpan={6} className="p-12 text-center text-gray-400 font-medium">Chưa có mã giảm giá nào.</td></tr>
                        ) : (
                            vouchers.map((v: Voucher) => (
                                <tr
                                    key={v.id}
                                    onClick={() => setDetailVoucher(v)}
                                    className="hover:bg-orange-50/40 transition-colors cursor-pointer group"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                                                <Ticket className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900 font-mono tracking-widest">{v.code}</div>
                                                <div className="text-[10px] text-gray-400 font-bold uppercase">
                                                    {v.isPublic ? '🌐 PUBLIC' : '🔒 PRIVATE'}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-blue-600">
                                            {v.discountType === 'PERCENTAGE' ? `Giảm ${v.discountValue}%` : `Giảm ${v.discountValue.toLocaleString('vi-VN')} VND`}
                                        </div>
                                        <div className="text-[10px] text-gray-400">
                                            Đơn tối thiểu: {v.minOrderValue.toLocaleString('vi-VN')} đ
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-gray-700">{v.usedCount} / {v.maxUses === null ? '∞' : v.maxUses}</div>
                                        <div className="text-[10px] text-gray-400">({v.maxUsesPerUser} lượt / user)</div>
                                    </td>
                                    <td className="px-6 py-4 text-xs">
                                        <div className="font-bold text-gray-700">{new Date(v.validFrom).toLocaleDateString('vi-VN')}</div>
                                        <div className="text-gray-400">→ {new Date(v.validUntil).toLocaleDateString('vi-VN')}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                                            v.isActive ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'
                                        }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${v.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                                            {v.isActive ? 'Hoạt động' : 'Tạm dừng'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                            <button
                                                onClick={() => setDetailVoucher(v)}
                                                className="p-2 rounded-xl bg-orange-50 text-orange-500 hover:bg-orange-100 transition-colors opacity-0 group-hover:opacity-100"
                                                title="Chi tiết"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => toggleActive(v.id)}
                                                className={`p-2 rounded-xl transition-colors ${v.isActive ? 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                                            >
                                                {v.isActive ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                                            </button>
                                            <button
                                                onClick={() => { if (window.confirm('Xoá voucher này?')) deleteVoucher(v.id); }}
                                                className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <VoucherModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setEditVoucher(null); }}
                onSuccess={refresh}
                campaignIdDefault={selectedCampaignId}
                editVoucher={editVoucher}
            />
        </div>

        <VoucherDetailDrawer
            voucher={detailVoucher}
            campaign={detailCampaign}
            onClose={() => setDetailVoucher(null)}
            onEdit={(v: Voucher) => { setEditVoucher(v); setIsModalOpen(true); setDetailVoucher(null); }}
            onToggleActive={(id: number) => { toggleActive(id); setDetailVoucher(null); }}
            onDelete={(id: number) => { deleteVoucher(id); setDetailVoucher(null); }}
        />
        </>
    );
}
