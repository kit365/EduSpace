/**
 * EduSpace Dispute & Report System
 */

export type DisputeStatus = 'open' | 'under_review' | 'resolved_refund' | 'resolved_payout' | 'closed';
export type DisputePriority = 'low' | 'medium' | 'high' | 'critical';
export type DisputeCategory = 'room_mismatch' | 'cancellation' | 'payment_issue' | 'behavior' | 'safety' | 'fraud' | 'other';

export interface Dispute {
    id: string;
    bookingId: string;

    // Reporter
    reporterId: string;
    reporterName: string;
    reporterRole: 'renter' | 'host';

    // Reported party
    againstId: string;
    againstName: string;
    againstRole: 'renter' | 'host';

    // Details
    category: DisputeCategory;
    title: string;
    description: string;
    evidence?: string[];          // Cloudinary links to photos/screenshots

    // Resolution
    status: DisputeStatus;
    priority: DisputePriority;
    resolution?: string;
    resolvedBy?: string;          // Admin who resolved
    refundAmount?: number;

    // Timestamps
    createdAt: string;
    updatedAt: string;
    resolvedAt?: string;
}

export interface Report {
    id: string;
    reporterId: string;
    reporterName: string;
    targetType: 'user' | 'space' | 'review';
    targetId: string;
    reason: string;
    description: string;
    status: 'pending' | 'reviewed' | 'dismissed';
    createdAt: string;
}
