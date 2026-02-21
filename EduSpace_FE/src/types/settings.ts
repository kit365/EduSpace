/**
 * EduSpace System Settings
 * Configurable by Admin without code changes
 */

export interface SystemSettings {
    // Commission
    defaultCommissionRate: number;    // e.g., 10 (%)

    // Booking rules
    bookingTimeoutMinutes: number;    // Auto-cancel if unpaid (e.g., 15)
    maxAdvanceBookingDays: number;    // How far ahead can book (e.g., 30)

    // Financials
    minWithdrawAmount: number;        // Min payout request (VNĐ)
    escrowHoldDays: number;           // Days to hold before auto-release

    // Points
    pointConversionRate: number;      // 1 point = X VNĐ
    pointsPerBooking: number;         // Points earned per completed booking

    // System
    maintenanceMode: boolean;
    maintenanceMessage?: string;

    // Policies
    cancellationWindowHours: number;  // Free cancellation window
    maxRefundPercentage: number;      // Max refund % after window
}

export const DEFAULT_SETTINGS: SystemSettings = {
    defaultCommissionRate: 10,
    bookingTimeoutMinutes: 15,
    maxAdvanceBookingDays: 30,
    minWithdrawAmount: 500000,
    escrowHoldDays: 3,
    pointConversionRate: 100,
    pointsPerBooking: 10,
    maintenanceMode: false,
    cancellationWindowHours: 24,
    maxRefundPercentage: 80,
};
