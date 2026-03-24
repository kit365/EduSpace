import apiClient from '@/lib/axios';

export interface BookingRefundRow {
    id: number;
    status: string;
    requestedAmount: number;
    currency: string;
    customerReason: string;
    evidenceUrls?: string;
    adminDecisionNote?: string;
    processedBy?: string;
    refundTransactionId?: string;
    adminEvidenceUrls?: string[];
    createdAt?: string;
    processedAt?: string;
    refundCompletedAt?: string;
}

export interface HandleRefundBody {
    approved: boolean;
    adminNote?: string;
    refundTransactionId?: string;
    adminEvidenceUrls?: string[];
}

function unwrapData<T>(res: unknown): T {
    const r = res as { data?: T };
    return (r?.data !== undefined ? r.data : res) as T;
}

export const bookingRefundAdminService = {
    listByBooking: async (bookingId: number): Promise<BookingRefundRow[]> => {
        const res = await apiClient.get(`/api/v1/admin/booking-refunds/booking/${bookingId}`);
        return unwrapData<BookingRefundRow[]>(res);
    },

    handle: async (refundId: number, body: HandleRefundBody): Promise<BookingRefundRow> => {
        const res = await apiClient.put(`/api/v1/admin/booking-refunds/${refundId}/handle`, body);
        return unwrapData<BookingRefundRow>(res);
    },
};
