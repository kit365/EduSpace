/**
 * EduSpace Financial Types
 * Covers: Commission, Escrow, Payouts, Refunds
 */

export type TransactionType = 'booking_payment' | 'commission' | 'payout' | 'refund' | 'service_charge';
export type TransactionStatus = 'escrow' | 'completed' | 'pending' | 'failed' | 'refunded';
export type PayoutStatus = 'pending' | 'approved' | 'processing' | 'completed' | 'rejected';

export interface Transaction {
    id: string;
    type: TransactionType;
    amount: number;            // VNĐ
    currency: 'VND';
    fromUserId?: string;
    fromUserName?: string;
    toUserId?: string;
    toUserName?: string;
    bookingId?: string;
    status: TransactionStatus;
    description: string;
    createdAt: string;
    completedAt?: string;
}

export interface SystemWallet {
    totalBalance: number;       // All money currently in system
    escrowBalance: number;      // Money held pending release
    commissionEarned: number;   // Total commission collected
    pendingPayouts: number;     // Awaiting release to hosts
}

export interface PayoutRequest {
    id: string;
    hostId: string;
    hostName: string;
    amount: number;
    commission: number;         // Amount deducted as commission
    netAmount: number;          // amount - commission
    bankInfo: string;           // Masked bank details
    status: PayoutStatus;
    requestedAt: string;
    processedAt?: string;
    processedBy?: string;       // Admin who approved
}

export interface CommissionConfig {
    defaultRate: number;        // System default (e.g., 10%)
    hostOverrides: {
        hostId: string;
        hostName: string;
        rate: number;             // Custom rate for VIP hosts
    }[];
}

export interface RefundRequest {
    id: string;
    bookingId: string;
    renterId: string;
    renterName: string;
    hostId: string;
    hostName: string;
    amount: number;
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
    requestedAt: string;
    decidedBy?: string;
    decidedAt?: string;
}
