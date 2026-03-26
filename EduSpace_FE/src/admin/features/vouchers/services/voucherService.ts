import apiClient from '@/lib/axios';
import { BOOKING_API } from '@/config/api';
import type { VoucherCampaign, Voucher } from './types';

/** Helper: unwrap BE response (trả { data: T } hoặc T trực tiếp) */
function unwrap<T>(res: unknown): T {
    const raw = res as Record<string, unknown> | T;
    if (raw && typeof raw === 'object' && 'data' in raw && (raw as Record<string, unknown>).data !== undefined) {
        return (raw as Record<string, unknown>).data as T;
    }
    return raw as T;
}

// --- Campaign Service ---

export const voucherCampaignService = {
    getAll: async (): Promise<VoucherCampaign[]> => {
        try {
            const res = await apiClient.get(BOOKING_API.VOUCHER_CAMPAIGNS);
            const list = unwrap<VoucherCampaign[]>(res);
            return Array.isArray(list) ? list : [];
        } catch {
            return [];
        }
    },

    create: async (payload: Partial<VoucherCampaign>): Promise<VoucherCampaign> => {
        const res = await apiClient.post(BOOKING_API.VOUCHER_CAMPAIGNS, payload);
        return unwrap<VoucherCampaign>(res);
    },

    update: async (id: number, payload: Partial<VoucherCampaign>): Promise<VoucherCampaign> => {
        const res = await apiClient.put(`${BOOKING_API.VOUCHER_CAMPAIGNS}/${id}`, payload);
        return unwrap<VoucherCampaign>(res);
    },

    toggleActive: async (id: number): Promise<VoucherCampaign> => {
        const res = await apiClient.patch(`${BOOKING_API.VOUCHER_CAMPAIGNS}/${id}/toggle-active`);
        return unwrap<VoucherCampaign>(res);
    },

    delete: async (id: number): Promise<void> => {
        await apiClient.delete(`${BOOKING_API.VOUCHER_CAMPAIGNS}/${id}`);
    },
};

// --- Voucher Service ---

export const voucherService = {
    getAll: async (campaignId?: number): Promise<Voucher[]> => {
        try {
            const res = await apiClient.get(BOOKING_API.VOUCHERS, { params: campaignId ? { campaignId } : undefined });
            const list = unwrap<Voucher[]>(res);
            return Array.isArray(list) ? list : [];
        } catch {
            return [];
        }
    },

    create: async (payload: Partial<Voucher>): Promise<Voucher> => {
        const res = await apiClient.post(BOOKING_API.VOUCHERS, payload);
        return unwrap<Voucher>(res);
    },

    update: async (id: number, payload: Partial<Voucher>): Promise<Voucher> => {
        const res = await apiClient.put(`${BOOKING_API.VOUCHERS}/${id}`, payload);
        return unwrap<Voucher>(res);
    },

    toggleActive: async (id: number): Promise<Voucher> => {
        const res = await apiClient.patch(`${BOOKING_API.VOUCHERS}/${id}/toggle-active`);
        return unwrap<Voucher>(res);
    },

    delete: async (id: number): Promise<void> => {
        await apiClient.delete(`${BOOKING_API.VOUCHERS}/${id}`);
    },
};
