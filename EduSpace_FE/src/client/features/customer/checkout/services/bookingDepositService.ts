import apiClient from '@/lib/axios';

export interface CreateDepositIntentResponse {
    depositId: number;
    expiresAt: string;
    bookingId: number;
    bookingCode: string;
}

export interface CreateDepositPayosResponse {
    depositId: number;
    payosOrderCode: number;
    checkoutUrl: string;
    expiresAt: string;
    bookingId: number;
    bookingCode: string;
}

export interface DepositStatusResponse {
    depositId: number;
    status: string;
    depositPaid: boolean | null;
    bookingCode: string | null;
    paymentStatus: string | null;
    bookingStatus: string | null;
}

function unwrapData<T>(res: unknown): T {
    const r = res as { data?: T };
    return (r?.data !== undefined ? r.data : res) as T;
}

export const bookingDepositService = {
    createIntent: async (body: {
        spaceRef?: string;
        customerEmail?: string;
        customerName?: string;
        grandTotal: number;
    }): Promise<CreateDepositIntentResponse> => {
        const res = await apiClient.post('/api/v1/bookings/deposit-intent', {
            spaceRef: body.spaceRef ?? 'SPACE-DEMO',
            customerEmail: body.customerEmail ?? 'guest@example.com',
            customerName: body.customerName ?? 'Guest',
            grandTotal: body.grandTotal,
        });
        return unwrapData<CreateDepositIntentResponse>(res);
    },

    createPayos: async (depositId: number, returnUrl: string): Promise<CreateDepositPayosResponse> => {
        const res = await apiClient.post(
            `/api/v1/bookings/deposit-intent/${depositId}/payos`,
            {},
            { params: { returnUrl } }
        );
        return unwrapData<CreateDepositPayosResponse>(res);
    },

    getStatus: async (depositId: number): Promise<DepositStatusResponse> => {
        const res = await apiClient.get(`/api/v1/bookings/deposit-intent/${depositId}/status`);
        return unwrapData<DepositStatusResponse>(res);
    },
};
