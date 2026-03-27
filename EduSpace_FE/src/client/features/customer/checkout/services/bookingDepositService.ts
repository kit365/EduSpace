/**
 * Booking Deposit Service — calls real backend API for deposit payment flow.
 */
import apiClient from '@/lib/axios';

export type CreateDepositIntentPayload = {
    grandTotal: number;
    customerName: string;
    customerEmail: string;
    spaceRef: string;
};

export type DepositIntentResponse = {
    depositId: number;
    expiresAt: string;
    bookingId: number;
    bookingCode: string;
};

export type DepositPayosResponse = {
    depositId: number;
    payosOrderCode: number;
    checkoutUrl: string;
    expiresAt: string;
    bookingId: number;
    bookingCode: string;
};

export type DepositStatusResponse = {
    depositId: number;
    status: string; // PENDING | PAID | EXPIRED
    bookingId: number;
    bookingCode: string;
    expiresAt: string;
    depositPaid: boolean;
    bookingStatus?: string; // PENDING | CONFIRMED | CANCELLED
};

export type SimulateDepositPaymentPayload = {
    payerName?: string;
    payerEmail?: string;
    payerPhone?: string;
    transferContent?: string;
};

function unwrap<T>(res: unknown): T {
    if (res && typeof res === 'object' && 'data' in res && (res as { data: unknown }).data !== undefined) {
        return (res as { data: T }).data;
    }
    return res as T;
}

export const bookingDepositService = {
    /**
     * Create a deposit intent — marks booking as temporary and starts 5-min hold.
     */
    async createIntent(bookingId: number): Promise<DepositIntentResponse> {
        const res = await apiClient.post(`/api/v1/bookings/deposit-intent?bookingId=${bookingId}`);
        return unwrap<DepositIntentResponse>(res);
    },

    /**
     * Create a PayOS checkout URL for the deposit.
     */
    async createPayos(depositId: number, returnUrl: string): Promise<DepositPayosResponse> {
        const res = await apiClient.post(
            `/api/v1/bookings/deposit-intent/${depositId}/payos?returnUrl=${encodeURIComponent(returnUrl)}`
        );
        return unwrap<DepositPayosResponse>(res);
    },

    /**
     * Poll the deposit status (PENDING / PAID / EXPIRED).
     */
    async getStatus(depositId: number): Promise<DepositStatusResponse> {
        const res = await apiClient.get(`/api/v1/bookings/deposit-intent/${depositId}/status`);
        return unwrap<DepositStatusResponse>(res);
    },

    /**
     * Simulate a successful PayOS payment (demo).
     * Confirms the booking, records the transaction, and cancels conflicting bookings.
     */
    async simulatePayment(
        depositId: number,
        payload?: SimulateDepositPaymentPayload
    ): Promise<DepositStatusResponse> {
        const res = await apiClient.post(`/api/v1/bookings/deposit-intent/${depositId}/confirm`, payload ?? {});
        return unwrap<DepositStatusResponse>(res);
    },
};
