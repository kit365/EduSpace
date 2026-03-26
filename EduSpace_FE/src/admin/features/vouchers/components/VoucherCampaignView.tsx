import { useState } from 'react';
import { useVoucherCampaigns } from '../hooks/useVoucherCampaigns';
import type { VoucherCampaign } from '../services/types';
import { Layers, Plus, Trash2, Power, PowerOff, Eye } from 'lucide-react';
import { CampaignModal } from './CampaignModal';
import { CampaignDetailDrawer } from './CampaignDetailDrawer';

export function VoucherCampaignView() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [detailCampaign, setDetailCampaign] = useState<VoucherCampaign | null>(null);
    const [editCampaign, setEditCampaign] = useState<VoucherCampaign | null>(null);
    const { campaigns, loading, toggleActive, deleteCampaign, refresh } = useVoucherCampaigns();

    return (
        <>
        <div className="bg-white text-black rounded-3xl border border-gray-100 shadow-sm p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">Chiến dịch Voucher</h2>
                    <p className="text-xs text-gray-400 font-bold mt-1 uppercase tracking-wider">Quản lý tên và nhóm đợt khuyến mãi · Click dòng để xem chi tiết</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                >
                    <Plus className="w-4 h-4" /> Thêm Chiến dịch
                </button>
            </div>

            <div className="overflow-hidden rounded-2xl border border-gray-100">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Tên chiến dịch</th>
                            <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Thời gian</th>
                            <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Trạng thái</th>
                            <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr><td colSpan={4} className="p-8 text-center text-gray-400 font-medium">Đang tải...</td></tr>
                        ) : campaigns.length === 0 ? (
                            <tr><td colSpan={4} className="p-12 text-center text-gray-400 font-medium">Chưa có chiến dịch nào.</td></tr>
                        ) : (
                            campaigns.map((c: VoucherCampaign) => (
                                <tr
                                    key={c.id}
                                    onClick={() => setDetailCampaign(c)}
                                    className="hover:bg-cyan-50/40 transition-colors cursor-pointer group"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-500 text-white flex items-center justify-center">
                                                <Layers className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900 text-sm">{c.name}</div>
                                                <div className="text-xs text-gray-400 font-medium truncate max-w-[200px]">{c.description || '-'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-xs font-bold text-gray-700">{new Date(c.startDate).toLocaleDateString('vi-VN')}</div>
                                        <div className="text-[10px] text-red-400">→ {new Date(c.endDate).toLocaleDateString('vi-VN')}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                                            c.isActive ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'
                                        }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${c.isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                                            {c.isActive ? 'Hoạt động' : 'Tạm dừng'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                            <button
                                                onClick={() => setDetailCampaign(c)}
                                                className="p-2 rounded-xl bg-cyan-50 text-cyan-500 hover:bg-cyan-100 transition-colors opacity-0 group-hover:opacity-100"
                                                title="Chi tiết"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => toggleActive(c.id)}
                                                className={`p-2 rounded-xl transition-colors ${c.isActive ? 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                                                title={c.isActive ? 'Tạm dừng' : 'Kích hoạt'}
                                            >
                                                {c.isActive ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                                            </button>
                                            <button
                                                onClick={() => { if (window.confirm('Bạn có chắc xoá chiến dịch này?')) deleteCampaign(c.id); }}
                                                className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-colors"
                                                title="Xoá chiến dịch"
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

            <CampaignModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setEditCampaign(null); }}
                onSuccess={refresh}
                editCampaign={editCampaign}
            />
        </div>

        <CampaignDetailDrawer
            campaign={detailCampaign}
            onClose={() => setDetailCampaign(null)}
            onEdit={(c: VoucherCampaign) => { setEditCampaign(c); setIsModalOpen(true); setDetailCampaign(null); }}
            onToggleActive={(id: number) => { toggleActive(id); setDetailCampaign(null); }}
            onDelete={(id: number) => { deleteCampaign(id); setDetailCampaign(null); }}
        />
        </>
    );
}
