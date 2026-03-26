import { useState, useEffect, useCallback } from 'react';
import { Tag, X, Loader2, CheckCircle2, ChevronRight, Ticket, AlertCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import apiClient from '@/lib/axios';
import { BOOKING_API } from '@/config/api';
import { formatCurrency } from '../../../../../utils';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AppliedVoucher {
    code: string;
    discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
    discountValue: number;
    discountAmount: number;
}

interface VoucherDto {
    id: number;
    code: string;
    discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
    discountValue: number;
    maxDiscountAmount?: number | null;
    minOrderValue: number;
    validFrom: string;
    validUntil: string;
    isActive: boolean;
    isPublic: boolean;
}

interface VoucherInputProps {
    orderTotal: number;
    onApply: (voucher: AppliedVoucher | null) => void;
    appliedVoucher: AppliedVoucher | null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function unwrap<T>(res: unknown): T {
    if (res && typeof res === 'object' && 'data' in res && (res as { data: unknown }).data !== undefined) {
        return (res as { data: T }).data;
    }
    return res as T;
}

function calcDiscount(voucher: VoucherDto, orderTotal: number): number {
    if (voucher.discountType === 'FIXED_AMOUNT') return Math.min(voucher.discountValue, orderTotal);
    const raw = (orderTotal * voucher.discountValue) / 100;
    return voucher.maxDiscountAmount ? Math.min(raw, voucher.maxDiscountAmount) : raw;
}

function isVoucherValid(v: VoucherDto, orderTotal: number): { ok: boolean; reason?: string } {
    if (!v.isActive) return { ok: false, reason: 'Đã vô hiệu hoá' };
    const now = Date.now();
    if (now < new Date(v.validFrom).getTime()) return { ok: false, reason: 'Chưa đến ngày áp dụng' };
    if (now > new Date(v.validUntil).getTime()) return { ok: false, reason: 'Đã hết hạn' };
    if (orderTotal < v.minOrderValue) return { ok: false, reason: `Đơn tối thiểu ${formatCurrency(v.minOrderValue)}` };
    return { ok: true };
}

// ─── VoucherCard ─────────────────────────────────────────────────────────────

function VoucherCard({
    voucher,
    orderTotal,
    selected,
    onSelect,
}: {
    voucher: VoucherDto;
    orderTotal: number;
    selected: boolean;
    onSelect: () => void;
}) {
    const { ok, reason } = isVoucherValid(voucher, orderTotal);
    const discount = Math.round(calcDiscount(voucher, orderTotal));
    const expiry = format(new Date(voucher.validUntil), 'dd/MM/yyyy', { locale: vi });

    return (
        <button
            type="button"
            disabled={!ok}
            onClick={onSelect}
            className={`w-full text-left flex gap-0 rounded-2xl overflow-hidden border-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                selected
                    ? 'border-red-400 shadow-lg shadow-red-100'
                    : ok
                    ? 'border-gray-100 hover:border-red-200 hover:shadow-md'
                    : 'border-gray-100'
            }`}
        >
            {/* Stripe màu bên trái */}
            <div
                className={`w-2 shrink-0 self-stretch ${
                    selected ? 'bg-red-500' : ok ? 'bg-gray-200' : 'bg-gray-100'
                }`}
            />

            {/* Nội dung */}
            <div className="flex-1 p-4 flex gap-4 items-center min-w-0">
                {/* Icon */}
                <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                        selected ? 'bg-red-50' : 'bg-gray-50'
                    }`}
                >
                    <Ticket
                        className={`w-5 h-5 ${selected ? 'text-red-500' : ok ? 'text-gray-400' : 'text-gray-300'}`}
                    />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <span className="font-black text-gray-900 text-sm tracking-widest uppercase">
                            {voucher.code}
                        </span>
                        <span
                            className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                voucher.discountType === 'PERCENTAGE'
                                    ? 'bg-orange-100 text-orange-600'
                                    : 'bg-blue-100 text-blue-600'
                            }`}
                        >
                            {voucher.discountType === 'PERCENTAGE' ? `−${voucher.discountValue}%` : 'Cố định'}
                        </span>
                    </div>

                    {ok ? (
                        <p className="text-xs font-bold text-green-600">
                            Tiết kiệm <span className="font-black">{formatCurrency(discount)}</span>
                        </p>
                    ) : (
                        <p className="text-xs font-bold text-gray-400 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {reason}
                        </p>
                    )}

                    <div className="flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3 text-gray-300" />
                        <span className="text-[10px] text-gray-300 font-bold">HSD: {expiry}</span>
                        {voucher.minOrderValue > 0 && (
                            <span className="text-[10px] text-gray-300 font-bold ml-2">
                                · Min {formatCurrency(voucher.minOrderValue)}
                            </span>
                        )}
                    </div>
                </div>

                {/* Checkbox bên phải */}
                <div
                    className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${
                        selected ? 'bg-red-500 border-red-500' : 'border-gray-200'
                    }`}
                >
                    {selected && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
            </div>
        </button>
    );
}

// ─── VoucherModal ─────────────────────────────────────────────────────────────

function VoucherModal({
    open,
    onClose,
    orderTotal,
    onApply,
    currentCode,
}: {
    open: boolean;
    onClose: () => void;
    orderTotal: number;
    onApply: (voucher: AppliedVoucher) => void;
    currentCode: string | null;
}) {
    const [vouchers, setVouchers] = useState<VoucherDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [manualCode, setManualCode] = useState('');
    const [manualLoading, setManualLoading] = useState(false);

    const fetchVouchers = useCallback(async () => {
        setLoading(true);
        try {
            const res = await apiClient.get(BOOKING_API.VOUCHERS, { params: { isPublic: true } });
            const list = unwrap<VoucherDto[]>(res);
            setVouchers(Array.isArray(list) ? list : []);
        } catch {
            setVouchers([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (open) {
            void fetchVouchers();
            setSelectedId(null);
        }
    }, [open, fetchVouchers]);

    const handleSelectVoucher = (voucher: VoucherDto) => {
        const { ok } = isVoucherValid(voucher, orderTotal);
        if (!ok) return;
        setSelectedId((prev) => (prev === voucher.id ? null : voucher.id));
    };

    const handleConfirmSelected = () => {
        const voucher = vouchers.find((v) => v.id === selectedId);
        if (!voucher) return;
        const discountAmount = Math.round(calcDiscount(voucher, orderTotal));
        onApply({
            code: voucher.code,
            discountType: voucher.discountType,
            discountValue: voucher.discountValue,
            discountAmount,
        });
        onClose();
    };

    const handleApplyManual = async () => {
        const trimmed = manualCode.trim().toUpperCase();
        if (!trimmed) { toast.error('Nhập mã voucher trước'); return; }
        setManualLoading(true);
        try {
            const res = await apiClient.get(`${BOOKING_API.VOUCHERS}/validate`, { params: { code: trimmed } });
            const voucher = unwrap<VoucherDto>(res);
            const { ok, reason } = isVoucherValid(voucher, orderTotal);
            if (!ok) { toast.error(reason); return; }
            const discountAmount = Math.round(calcDiscount(voucher, orderTotal));
            onApply({ code: voucher.code, discountType: voucher.discountType, discountValue: voucher.discountValue, discountAmount });
            toast.success(`Áp dụng thành công! Tiết kiệm ${formatCurrency(discountAmount)}`);
            onClose();
        } catch {
            toast.error('Mã không hợp lệ hoặc không tồn tại');
        } finally {
            setManualLoading(false);
        }
    };

    if (!open) return null;

    const availableVouchers = vouchers.filter((v) => isVoucherValid(v, orderTotal).ok);
    const unavailableVouchers = vouchers.filter((v) => !isVoucherValid(v, orderTotal).ok);

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 animate-in fade-in duration-200"
                onClick={onClose}
            />
            {/* Panel — slide up từ dưới */}
            <div className="fixed bottom-0 left-0 right-0 z-50 max-w-lg mx-auto animate-in slide-in-from-bottom-8 duration-300">
                <div className="bg-white rounded-t-[2rem] shadow-2xl flex flex-col max-h-[88vh]">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 shrink-0">
                        <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                            <Ticket className="w-5 h-5 text-red-500" />
                            Chọn Voucher
                        </h3>
                        <button
                            onClick={onClose}
                            className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all"
                        >
                            <X className="w-4 h-4 text-gray-500" />
                        </button>
                    </div>

                    {/* Nhập tay */}
                    <div className="px-6 py-4 border-b border-gray-100 shrink-0">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={manualCode}
                                onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                                onKeyDown={(e) => e.key === 'Enter' && !manualLoading && void handleApplyManual()}
                                placeholder="Nhập mã voucher..."
                                className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-400 transition-all uppercase tracking-widest"
                                disabled={manualLoading}
                            />
                            <button
                                onClick={() => void handleApplyManual()}
                                disabled={manualLoading || !manualCode.trim()}
                                className="px-5 py-3 bg-gray-900 text-white rounded-xl font-black text-sm uppercase tracking-widest hover:bg-red-500 disabled:bg-gray-100 disabled:text-gray-300 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center gap-1.5 shrink-0"
                            >
                                {manualLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Áp dụng'}
                            </button>
                        </div>
                    </div>

                    {/* Danh sách voucher */}
                    <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
                        {loading ? (
                            <div className="flex flex-col items-center gap-3 py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-red-400" />
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Đang tải...</p>
                            </div>
                        ) : vouchers.length === 0 ? (
                            <div className="flex flex-col items-center gap-3 py-12">
                                <Ticket className="w-12 h-12 text-gray-200" />
                                <p className="text-sm font-bold text-gray-400">Không có voucher khả dụng</p>
                            </div>
                        ) : (
                            <>
                                {availableVouchers.length > 0 && (
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">
                                            Có thể áp dụng ({availableVouchers.length})
                                        </p>
                                        {availableVouchers.map((v) => (
                                            <VoucherCard
                                                key={v.id}
                                                voucher={v}
                                                orderTotal={orderTotal}
                                                selected={selectedId === v.id}
                                                onSelect={() => handleSelectVoucher(v)}
                                            />
                                        ))}
                                    </div>
                                )}
                                {unavailableVouchers.length > 0 && (
                                    <div className="space-y-2 mt-4">
                                        <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest px-1">
                                            Không đủ điều kiện ({unavailableVouchers.length})
                                        </p>
                                        {unavailableVouchers.map((v) => (
                                            <VoucherCard
                                                key={v.id}
                                                voucher={v}
                                                orderTotal={orderTotal}
                                                selected={false}
                                                onSelect={() => {}}
                                            />
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Footer nút xác nhận */}
                    <div className="px-6 py-5 border-t border-gray-100 shrink-0">
                        <button
                            onClick={selectedId ? handleConfirmSelected : onClose}
                            className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-[0.98] ${
                                selectedId
                                    ? 'bg-gray-900 text-white hover:bg-red-500 shadow-xl hover:shadow-red-200'
                                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                            }`}
                        >
                            {selectedId ? 'Xác nhận chọn voucher →' : 'Đóng'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

// ─── VoucherInput (entry point) ───────────────────────────────────────────────

export function VoucherInput({ orderTotal, onApply, appliedVoucher }: VoucherInputProps) {
    const [modalOpen, setModalOpen] = useState(false);

    const handleRemove = () => {
        onApply(null);
        toast.info('Đã gỡ mã voucher.');
    };

    // ── Đã áp dụng ──
    if (appliedVoucher) {
        return (
            <div className="flex items-center justify-between gap-3 p-4 bg-green-50 border border-green-200 rounded-2xl animate-in fade-in duration-300">
                <div className="flex items-center gap-3 min-w-0">
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-black text-green-700 text-sm uppercase tracking-widest">
                                {appliedVoucher.code}
                            </span>
                            <span className="text-[10px] font-black bg-green-100 text-green-600 px-2 py-0.5 rounded-full uppercase">
                                {appliedVoucher.discountType === 'PERCENTAGE'
                                    ? `−${appliedVoucher.discountValue}%`
                                    : 'Cố định'}
                            </span>
                        </div>
                        <p className="text-xs font-bold text-green-600 mt-0.5">
                            Tiết kiệm{' '}
                            <span className="font-black text-green-700">
                                {formatCurrency(appliedVoucher.discountAmount)}
                            </span>
                        </p>
                    </div>
                </div>
                <button
                    onClick={handleRemove}
                    className="shrink-0 w-9 h-9 rounded-full bg-green-100 hover:bg-red-100 hover:text-red-500 text-green-500 flex items-center justify-center transition-all"
                    aria-label="Gỡ voucher"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        );
    }

    // ── Chưa chọn ──
    return (
        <>
            <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="w-full flex items-center justify-between gap-3 px-5 py-4 bg-gray-50 border border-dashed border-gray-200 rounded-2xl hover:bg-white hover:border-red-300 hover:shadow-sm transition-all group"
            >
                <div className="flex items-center gap-3">
                    <Tag className="w-4 h-4 text-gray-300 group-hover:text-red-400 transition-colors" />
                    <span className="text-sm font-bold text-gray-400 group-hover:text-gray-700 transition-colors">
                        Chọn hoặc nhập mã voucher
                    </span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-red-400 transition-colors shrink-0" />
            </button>

            <VoucherModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                orderTotal={orderTotal}
                onApply={(v) => { onApply(v); }}
                currentCode={null}
            />
        </>
    );
}
