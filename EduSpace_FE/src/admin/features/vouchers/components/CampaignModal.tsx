import { useState } from 'react';
import { useVoucherCampaigns } from '../hooks/useVoucherCampaigns';
import type { VoucherCampaign } from '../services/types';
import { X } from 'lucide-react';

interface CampaignModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CampaignModal({ isOpen, onClose }: CampaignModalProps) {
    const { createCampaign } = useVoucherCampaigns();
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState<Partial<VoucherCampaign>>({
        name: '',
        description: '',
        startDate: new Date().toISOString().slice(0, 16),
        endDate: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
        isActive: true
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await createCampaign(formData);
            onClose();
        } catch {
            // toast tự xử lý trong hook
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <div>
                        <h2 className="text-xl font-black text-gray-900 tracking-tight">Thêm chiến dịch</h2>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Chiến dịch Marketing</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Tên chiến dịch *</label>
                            <input 
                                required 
                                type="text"
                                className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-4 py-3 text-sm font-bold text-gray-900 focus:border-blue-500 outline-none transition-all"
                                placeholder="VD: Khuyến mãi Hè 2026..."
                                value={formData.name || ''}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Mô tả chi tiết</label>
                            <textarea 
                                rows={3}
                                className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-4 py-3 text-sm font-bold text-gray-900 focus:border-blue-500 outline-none transition-all resize-none"
                                placeholder="..."
                                value={formData.description || ''}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Từ ngày (Bắt đầu) *</label>
                                <input 
                                    required
                                    type="datetime-local"
                                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-4 py-3 text-sm font-bold text-gray-900 focus:border-blue-500 outline-none transition-all"
                                    value={formData.startDate}
                                    onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Đến ngày (Kết thúc) *</label>
                                <input 
                                    required
                                    type="datetime-local"
                                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-4 py-3 text-sm font-bold text-gray-900 focus:border-blue-500 outline-none transition-all"
                                    value={formData.endDate}
                                    onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                    
                    <div className="pt-6 border-t border-gray-100 flex gap-3">
                        <button type="button" onClick={onClose}
                            className="flex-1 px-4 py-3 border-2 border-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-50 transition-colors">
                            Huỷ
                        </button>
                        <button type="submit" disabled={submitting}
                            className="flex-[2] px-4 py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-colors disabled:opacity-50">
                            {submitting ? 'Đang tạo...' : 'Tạo Chiến Dịch'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
