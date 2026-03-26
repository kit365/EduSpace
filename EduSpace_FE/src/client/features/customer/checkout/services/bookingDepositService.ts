/**
 * Thanh toán cọc / PayOS — khi backend có endpoint, thay thế phần mock bên dưới.
 * Hiện tại: stub để luồng checkout chuyển về /checkout/deposit-return (dev).
 */
export type CreateDepositIntentPayload = {
    grandTotal: number;
    customerName: string;
    customerEmail: string;
    spaceRef: string;
};

export const bookingDepositService = {
    async createIntent(_payload: CreateDepositIntentPayload): Promise<{ depositId: string }> {
        return { depositId: `dev-${Date.now()}` };
    },

    async createPayos(_depositId: string, returnUrl: string): Promise<{ checkoutUrl: string }> {
        return { checkoutUrl: returnUrl };
    },
};
