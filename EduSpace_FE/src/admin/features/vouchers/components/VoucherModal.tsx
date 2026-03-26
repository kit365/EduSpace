import { useState, useEffect } from 'react';
import { useVouchers } from '../hooks/useVouchers';
import { useVoucherCampaigns } from '../hooks/useVoucherCampaigns';
import type { Voucher } from '../services/types';
import { X, RefreshCcw, Ticket, Edit2 } from 'lucide-react';

interface VoucherModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    campaignIdDefault?: number;
    editVoucher?: Voucher | null; // nếu có → edit mode
}

export function VoucherModal({ isOpen, onClose, onSuccess, campaignIdDefault, editVoucher }: VoucherModalProps) {
    const { createVoucher, updateVoucher } = useVouchers();
    const { campaigns } = useVoucherCampaigns();
    const [submitting, setSubmitting] = useState(false);
    const isEditMode = !!editVoucher;

    const generateCode = () =>
        'VOUCHER' + Math.random().toString(36).substring(2, 6).toUpperCase() + Date.now().toString().slice(-4);

    const defaultForm: Partial<Voucher> = {
        campaignId: campaignIdDefault,
        code: generateCode(),
        discountType: 'PERCENTAGE',
        discountValue: 10,
        minOrderValue: 0,
        maxDiscountAmount: 50000,
        maxUses: null,
        maxUsesPerUser: 1,
        validFrom: new Date().toISOString().slice(0, 16),
        validUntil: new Date(Date.now() + 86400000 * 30).toISOString().slice(0, 16),
        isPublic: true,
        isActive: true,
    };

    const [formData, setFormData] = useState<Partial<Voucher>>(defaultForm);

    // Sync form khi editVoucher thay đổi
    useEffect(() => {
        if (editVoucher) {
            setFormData({
                ...editVoucher,
                validFrom: editVoucher.validFrom?.slice(0, 16),
                validUntil: editVoucher.validUntil?.slice(0, 16),
            });
        } else {
            setFormData({ ...defaultForm, campaignId: campaignIdDefault });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editVoucher, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (isEditMode && editVoucher) {
                await updateVoucher(editVoucher.id, formData);
            } else {
                await createVoucher(formData);
            }
            if (onSuccess) onSuccess();
            onClose();
        } catch {
            // toast xử lý trong hook
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className={`p-6 border-b border-gray-100 flex items-center justify-between ${isEditMode ? 'bg-orange-50/50' : 'bg-gray-50/50'}`}>
                    <div>
                        <div className="flex items-center gap-2">
                            {isEditMode ? <Edit2 className="w-5 h-5 text-orange-500" /> : <Ticket className="w-5 h-5 text-blue-500" />}
                            <h2 className="text-xl font-black text-gray-900 tracking-tight">
                                {isEditMode ? `Sửa: ${editVoucher?.code}` : 'Thêm mã giảm giá'}
                            </h2>
                        </div>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">
                            {isEditMode ? 'Chỉnh sửa thông tin voucher' : 'Tuỳ chỉnh luật áp dụng voucher'}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[60vh] overflow-y-auto px-1">
                        {/* CỘT 1 */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Chiến dịch</label>
                                <select
                                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-4 py-3 text-sm font-bold text-gray-900 focus:border-blue-500 outline-none appearance-none cursor-pointer"
                                    value={formData.campaignId || ''}
                                    onChange={e => setFormData({ ...formData, campaignId: e.target.value ? Number(e.target.value) : undefined })}
                                >
                                    <option value="">-- Độc lập (Không có chiến dịch) --</option>
                                    {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 flex justify-between">
                                    <span>Mã Code *</span>
                                    {!isEditMode && (
                                        <button type="button" onClick={() => setFormData({ ...formData, code: generateCode() })}
                                            className="text-blue-500 flex items-center gap-1 hover:underline text-xs font-bold">
                                            <RefreshCcw className="w-3 h-3" /> Auto
                                        </button>
                                    )}
                                </label>
                                <input required type="text"
                                    className={`w-full border-2 rounded-2xl px-4 py-3 text-sm font-black tracking-widest uppercase focus:outline-none ${
                                        isEditMode
                                            ? 'bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed'
                                            : 'bg-blue-50/50 border-blue-200 text-blue-900 focus:border-blue-500'
                                    }`}
                                    value={formData.code || ''}
                                    onChange={e => !isEditMode && setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    readOnly={isEditMode}
                                />
                                {isEditMode && <p className="text-[10px] text-gray-400 mt-1 px-1">Mã code không thể thay đổi sau khi tạo</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Loại giảm</label>
                                    <select
                                        className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-4 py-3 text-sm font-bold text-gray-900 focus:border-blue-500 outline-none appearance-none cursor-pointer"
                                        value={formData.discountType || 'PERCENTAGE'}
                                        onChange={e => setFormData({ ...formData, discountType: e.target.value as Voucher['discountType'] })}
                                    >
                                        <option value="PERCENTAGE">Theo %</option>
                                        <option value="FIXED_AMOUNT">Tiền mặt VND</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Mức giảm *</label>
                                    <input required type="number" step="0.01" min="0" max={formData.discountType === 'PERCENTAGE' ? 100 : undefined}
                                        className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-4 py-3 text-sm font-bold text-gray-900 focus:border-blue-500 outline-none"
                                        value={formData.discountValue || ''}
                                        onChange={e => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                                    />
                                    <span className="text-[10px] text-gray-400 mt-1 block px-1">
                                        {formData.discountType === 'PERCENTAGE' ? 'VD: 10 = giảm 10%' : 'VD: 50000 = giảm 50k VND'}
                                    </span>
                                </div>
                            </div>

                            {formData.discountType === 'PERCENTAGE' && (
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Giảm tối đa (VND)</label>
                                    <input type="number" step="1000" min="0"
                                        className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-4 py-3 text-sm font-bold text-gray-900 focus:border-blue-500 outline-none"
                                        value={formData.maxDiscountAmount || ''}
                                        onChange={e => setFormData({ ...formData, maxDiscountAmount: e.target.value ? Number(e.target.value) : null })}
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Đơn tối thiểu (VND)</label>
                                <input type="number" step="1000" min="0"
                                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-4 py-3 text-sm font-bold text-gray-900 focus:border-blue-500 outline-none"
                                    value={formData.minOrderValue || ''}
                                    onChange={e => setFormData({ ...formData, minOrderValue: e.target.value ? Number(e.target.value) : 0 })}
                                />
                            </div>
                        </div>

                        {/* CỘT 2 */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Tổng lượt dùng toàn HT</label>
                                <input type="number" min="1"
                                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-4 py-3 text-sm font-bold text-gray-900 focus:border-blue-500 outline-none"
                                    placeholder="Trống = Vô hạn"
                                    value={formData.maxUses || ''}
                                    onChange={e => setFormData({ ...formData, maxUses: e.target.value ? Number(e.target.value) : null })}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Lượt dùng tối đa / user *</label>
                                <input required type="number" min="1"
                                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-4 py-3 text-sm font-bold text-gray-900 focus:border-blue-500 outline-none"
                                    value={formData.maxUsesPerUser || 1}
                                    onChange={e => setFormData({ ...formData, maxUsesPerUser: Number(e.target.value) })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Bắt đầu *</label>
                                    <input required type="datetime-local"
                                        className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-4 py-3 text-sm font-bold text-gray-900 focus:border-blue-500 outline-none"
                                        value={formData.validFrom}
                                        onChange={e => setFormData({ ...formData, validFrom: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Kết thúc *</label>
                                    <input required type="datetime-local"
                                        className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-4 py-3 text-sm font-bold text-gray-900 focus:border-blue-500 outline-none"
                                        value={formData.validUntil}
                                        onChange={e => setFormData({ ...formData, validUntil: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="pt-2 px-2">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input type="checkbox"
                                        className="w-5 h-5 rounded border-2 border-gray-300 text-blue-600 focus:ring-blue-500"
                                        checked={formData.isPublic}
                                        onChange={e => setFormData({ ...formData, isPublic: e.target.checked })}
                                    />
                                    <div>
                                        <div className="font-bold text-sm text-gray-900">Voucher Công Khai (Public)</div>
                                        <div className="text-xs text-gray-500">User tự thấy và Claim được mã này.</div>
                                    </div>
                                </label>
                            </div>

                            {isEditMode && (
                                <div className="pt-2 px-2">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input type="checkbox"
                                            className="w-5 h-5 rounded border-2 border-gray-300 text-green-600 focus:ring-green-500"
                                            checked={formData.isActive}
                                            onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                                        />
                                        <div>
                                            <div className="font-bold text-sm text-gray-900">Kích hoạt</div>
                                            <div className="text-xs text-gray-500">Bỏ chọn để tạm ngừng voucher.</div>
                                        </div>
                                    </label>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-100 flex gap-3">
                        <button type="button" onClick={onClose}
                            className="flex-1 px-4 py-3 border-2 border-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-50 transition-colors">
                            Huỷ
                        </button>
                        <button type="submit" disabled={submitting}
                            className={`flex-[2] px-4 py-3 text-white font-bold rounded-2xl shadow-lg transition-colors disabled:opacity-50 flex justify-center items-center gap-2 ${
                                isEditMode
                                    ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-200'
                                    : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
                            }`}>
                            {submitting
                                ? (isEditMode ? 'Đang lưu...' : 'Đang tạo...')
                                : isEditMode
                                    ? <><Edit2 className="w-4 h-4" /> Lưu thay đổi</>
                                    : <><Ticket className="w-4 h-4" /> Tạo Voucher</>
                            }
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
