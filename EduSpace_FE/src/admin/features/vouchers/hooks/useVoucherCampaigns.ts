import { useState, useCallback, useEffect } from 'react';
import { voucherCampaignService } from '../services/voucherService';
import type { VoucherCampaign } from '../services/types';
import { toast } from 'sonner';
import { getApiErrorMessage } from '@/utils/apiError';

export function useVoucherCampaigns() {
    const [campaigns, setCampaigns] = useState<VoucherCampaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetch = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const list = await voucherCampaignService.getAll();
            setCampaigns(list);
        } catch (err: unknown) {
            const msg = getApiErrorMessage(err, 'Không thể tải danh sách chiến dịch');
            setError(msg);
            setCampaigns([]);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetch(); }, [fetch]);

    const createCampaign = useCallback(async (payload: Partial<VoucherCampaign>) => {
        try {
            await voucherCampaignService.create(payload);
            toast.success('Chiến dịch đã được tạo!');
            await fetch();
        } catch (err: unknown) {
            toast.error(getApiErrorMessage(err, 'Không thể tạo chiến dịch'));
            throw err;
        }
    }, [fetch]);

    const toggleActive = useCallback(async (id: number) => {
        try {
            await voucherCampaignService.toggleActive(id);
            toast.success('Đã cập nhật trạng thái chiến dịch!');
            await fetch();
        } catch (err: unknown) {
            toast.error(getApiErrorMessage(err, 'Không thể cập nhật'));
            throw err;
        }
    }, [fetch]);

    const deleteCampaign = useCallback(async (id: number) => {
        try {
            await voucherCampaignService.delete(id);
            toast.success('Đã xóa chiến dịch!');
            await fetch();
        } catch (err: unknown) {
            toast.error(getApiErrorMessage(err, 'Không thể xóa chiến dịch'));
            throw err;
        }
    }, [fetch]);

    return { campaigns, loading, error, refresh: fetch, createCampaign, toggleActive, deleteCampaign };
}
