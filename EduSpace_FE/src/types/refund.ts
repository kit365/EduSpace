/**
 * EduSpace Refund & Refund Policy Types
 * FR-13: Manual Refund Queue + Refund Policy Configuration
 */

export type ManualRefundStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface ManualRefundTicket {
    id: string;
    bookingId: string;
    bookingCode: string;             // e.g., "EDU-2024-0001"

    // Guest info (non-registered user)
    guestName: string;
    guestEmail: string;
    guestPhone?: string;

    // Bank details provided by guest
    bankName: string;
    bankAccountNumber: string;
    bankAccountHolder: string;       // Name on the bank account

    // Refund details
    originalAmount: number;          // Original booking amount (VNĐ)
    refundAmount: number;            // Actual refund amount (VNĐ)
    refundPercentage: number;        // % of original (100/50/0)
    reason: string;
    cancellationTime: string;        // When the guest cancelled

    // Processing
    status: ManualRefundStatus;
    createdAt: string;
    processedAt?: string;
    processedBy?: string;            // Admin who confirmed
    transferReference?: string;      // Bank transfer reference number
    adminNote?: string;
}

/**
 * Refund Policy Tier Configuration
 * Admin defines time-based refund percentages.
 * Example:
 *   - Cancel > 48h before booking: 100% refund
 *   - Cancel 24-48h before: 50% refund
 *   - Cancel < 24h before: 0% refund
 */
export interface RefundPolicyTier {
    id: string;
    label: string;                    // e.g., "Hủy trước 48 giờ"
    minHoursBefore: number;           // Min hours before booking start
    maxHoursBefore: number | null;    // null = infinity (earliest tier)
    refundPercentage: number;         // 0-100
}

export interface RefundPolicyConfig {
    tiers: RefundPolicyTier[];
    isActive: boolean;
    lastUpdatedAt: string;
    lastUpdatedBy: string;
}
