import { useState, useCallback, useEffect } from 'react';
import { voucherService } from '../services/voucherService';
import type { Voucher } from '../services/types';
import { toast } from 'sonner';
import { getApiErrorMessage } from '@/utils/apiError';

export function useVouchers(campaignId?: number) {
    const [vouchers, setVouchers] = useState<Voucher[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetch = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const list = await voucherService.getAll(campaignId);
            setVouchers(list);
        } catch (err: unknown) {
            const msg = getApiErrorMessage(err, 'Không thể tải danh sách voucher');
            setError(msg);
            setVouchers([]);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    }, [campaignId]);

    useEffect(() => { fetch(); }, [fetch]);

    const createVoucher = useCallback(async (payload: Partial<Voucher>) => {
        try {
            await voucherService.create(payload);
            toast.success('Mã giảm giá đã được tạo!');
            await fetch();
        } catch (err: unknown) {
            toast.error(getApiErrorMessage(err, 'Không thể tạo voucher'));
            throw err;
        }
    }, [fetch]);

    const updateVoucher = useCallback(async (id: number, payload: Partial<Voucher>) => {
        try {
            await voucherService.update(id, payload);
            toast.success('Đã cập nhật voucher!');
            await fetch();
        } catch (err: unknown) {
            toast.error(getApiErrorMessage(err, 'Không thể cập nhật voucher'));
            throw err;
        }
    }, [fetch]);

    const toggleActive = useCallback(async (id: number) => {
        try {
            await voucherService.toggleActive(id);
            toast.success('Đã cập nhật voucher!');
            await fetch();
        } catch (err: unknown) {
            toast.error(getApiErrorMessage(err, 'Không thể cập nhật'));
            throw err;
        }
    }, [fetch]);

    const deleteVoucher = useCallback(async (id: number) => {
        try {
            await voucherService.delete(id);
            toast.success('Đã xóa voucher!');
            await fetch();
        } catch (err: unknown) {
            toast.error(getApiErrorMessage(err, 'Không thể xóa voucher'));
            throw err;
        }
    }, [fetch]);

    return { vouchers, loading, error, refresh: fetch, createVoucher, updateVoucher, toggleActive, deleteVoucher };
}
