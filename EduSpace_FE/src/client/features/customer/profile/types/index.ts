import type { UserRole, KycStatus } from '../../../../../types/user';

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  location?: string;
  memberSince: string;

  // Role & verification
  role: UserRole;
  verified: boolean;
  kycStatus: KycStatus;

  // Stats
  totalBookings: number;
  totalReviews: number;
  rating: number;
  totalSpent?: number;         // VNĐ for renters
}

export interface NotificationSettings {
  emailBookingConfirm: boolean;
  emailMessages: boolean;
  emailPromotions: boolean;
  pushNotifications: boolean;
}

export interface PaymentMethod {
  id: number;
  type: 'card' | 'bank' | 'momo';
  last4: string;
  name: string;
  isDefault: boolean;
}
