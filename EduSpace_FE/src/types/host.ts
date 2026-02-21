/**
 * EduSpace Host Profile & Management Types
 * Used by Admin to review, manage, and monitor Hosts.
 */

export type HostType = 'individual' | 'business';
export type HostTrustLevel = 'new' | 'standard' | 'trusted' | 'premium';

export interface HostProfile {
    id: string;
    name: string;
    email: string;
    phone: string;
    avatar?: string;

    // Business info
    hostType: HostType;
    businessName?: string;          // For business hosts
    businessLicense?: string;       // Cloudinary link
    taxCode?: string;

    // Verification
    kycStatus: 'not_submitted' | 'pending' | 'verified' | 'rejected';
    kycDocuments: HostKycDocument[];
    kycReviewedBy?: string;
    kycReviewedAt?: string;

    // Account
    accountStatus: 'active' | 'pending' | 'suspended' | 'banned';
    joinedAt: string;
    lastLoginAt?: string;
    address?: string;
    location?: string;

    // Performance metrics
    totalSpaces: number;            // Total rooms/spaces managed
    activeSpaces: number;           // Currently active (approved) spaces
    pendingSpaces: number;          // Awaiting approval
    totalBookings: number;          // Lifetime bookings received
    completedBookings: number;
    cancelledBookings: number;
    totalRevenue: number;           // VNĐ lifetime revenue
    monthlyRevenue: number;         // Current month revenue

    // Trust & Rating
    averageRating: number;          // 0-5
    totalReviews: number;
    responseRate: number;           // % (0-100)
    responseTime: string;           // Average response time, e.g., "< 1 giờ"
    trustLevel: HostTrustLevel;
    trustScore: number;             // 0-100 computed score
    disputeCount: number;           // Total disputes against this host
    resolvedDisputeCount: number;

    // Commission
    commissionRate: number;         // Custom or system default (%)
    isCustomCommission: boolean;    // true if overridden from default

    // Activity
    recentActivities: HostActivity[];
}

export interface HostKycDocument {
    id: string;
    type: 'cccd_front' | 'cccd_back' | 'business_license' | 'other';
    label: string;                  // Display name, e.g., "CCCD - Mặt trước"
    url: string;                    // Cloudinary link
    status: 'pending' | 'approved' | 'rejected';
    uploadedAt: string;
    reviewNote?: string;
}

export type HostActivityType =
    | 'space_submitted'       // Host submitted a new listing
    | 'space_approved'        // Listing was approved
    | 'space_rejected'        // Listing was rejected
    | 'booking_received'      // New booking for host's space
    | 'booking_completed'     // Booking completed successfully
    | 'booking_cancelled'     // Booking was cancelled
    | 'payout_requested'      // Host requested a payout
    | 'payout_completed'      // Payout was processed
    | 'kyc_submitted'         // Host submitted KYC docs
    | 'kyc_approved'          // KYC was approved
    | 'kyc_rejected'          // KYC was rejected
    | 'dispute_opened'        // Dispute filed against host
    | 'dispute_resolved'      // Dispute resolved
    | 'account_suspended'     // Account was suspended
    | 'account_reactivated'   // Account was reactivated
    | 'commission_changed';   // Custom commission rate updated

export interface HostActivity {
    id: string;
    type: HostActivityType;
    message: string;
    details?: string;               // Optional extra context
    timestamp: string;
    performedBy?: string;           // Admin name, or "system"
}
