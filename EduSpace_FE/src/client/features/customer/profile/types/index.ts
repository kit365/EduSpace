import { User, ID, Timestamp, UserRole, KycStatus } from '@/types';

// Interface mapped from backend DTO
export interface UserResponse {
  id: string;
  /** Keycloak subject; matches JWT `sub` and conversation participant ids. */
  keycloakId?: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  avatarUrl: string;
  studentId: string;
  isActive: boolean;
  isEmailVerified: boolean;
  is2faEnabled: boolean;
  roles: string[];
  /** Permissions resolved from role permissions on server side (DB). */
  permissions?: string[];
  createdAt: string;
  updatedAt: string;
  location: string;
  shortBio: string;
  cityState?: string;
  district?: string;
  ward?: string;
  streetAddress?: string;
  postalCode?: string;
  taxId?: string;
  organizationName?: string;
}

export interface TwoFactorSetup {
  secret: string;
  qrCodeUrl: string;
}

export interface UpdateProfileRequest {
  fullName: string;
  phoneNumber: string;
  avatarUrl: string;
  studentId: string;
  location: string;
  shortBio: string;
  cityState?: string;
  district?: string;
  ward?: string;
  streetAddress?: string;
  postalCode?: string;
  taxId?: string;
  organizationName?: string;
}

export interface UserProfile {
  id: string; // From BE
  /** JWT `sub` / Keycloak user id — useful for legacy ownerId matching. */
  keycloakId?: string;
  name: string; // Mapped from BE fullName
  email: string;
  phone?: string; // Mapped from BE phoneNumber
  avatar?: string; // Mapped from BE avatarUrl
  bio?: string;
  location?: string;
  cityState?: string;
  district?: string;
  ward?: string;
  streetAddress?: string;
  postalCode?: string;
  taxId?: string;
  memberSince: string; // Mapped from BE createdAt
  is2faEnabled: boolean;
  organizationName?: string;

  // Role & verification
  role: UserRole | string; // Mapped from BE roles[0]
  verified: boolean; // Mapped from BE isEmailVerified
  kycStatus: KycStatus;

  // Stats
  totalBookings: number;
  totalReviews: number;
  rating: number;
  totalSpent?: number;
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

export interface PublicUserProfile {
  id: string;
  fullName: string;
  avatarUrl?: string;
  shortBio?: string;
  location?: string;
  createdAt: string;
  isEmailVerified: boolean;
  organizationName?: string;
}
