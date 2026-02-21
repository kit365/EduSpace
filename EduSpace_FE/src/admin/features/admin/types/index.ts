export interface ModerationListing {
  id: number;
  hostId: string;
  hostName: string;
  hostAvatar: string;
  hostStatus: string;
  hostSince: string;
  spaceTitle: string;
  spaceType: string;
  capacity: number;
  price: number;
  location: string;
  image: string;
  listingType: 'Standard Listing' | 'Premium Listing';
  submissionDate: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
}

export interface SystemHealth {
  apiLatency: number;
  apiStatus: 'Normal' | 'Warning' | 'Critical';
  storageUsage: number;
  storagePercentage: number;
  activeConnections: number;
  uptime: string;
}

export interface ActivityLog {
  id: number;
  type: 'approval' | 'rejection' | 'flag' | 'kyc_review' | 'payout' | 'dispute' | 'check_in';
  message: string;
  timestamp: string;
  user: string;
  userRole?: 'admin' | 'host' | 'staff' | 'renter' | 'system';
}

export interface KycRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  avatar: string;
  documents: {
    type: string;        // e.g., 'CCCD (Mặt trước)', 'Giấy phép kinh doanh'
    url: string;
    status: 'pending' | 'approved' | 'rejected';
  }[];
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  note?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface PendingRoom {
  id: number;
  name: string;
  hostId: string;
  hostName: string;
  type: string;
  capacity: number;
  price: number;
  location: string;
  image: string;
  submittedAt: string;
  approvalStatus: 'pending_review' | 'approved' | 'rejected';
  description: string;
  rejectionReason?: string;
}
