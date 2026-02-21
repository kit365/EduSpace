/**
 * EduSpace User Roles
 * - admin: System operator, approves hosts & listings
 * - host: Space provider, needs KYC verification
 * - staff: Created by Host, handles check-in & on-site payments
 * - renter: Teachers, tutors, speakers looking to rent spaces
 */
export type UserRole = 'admin' | 'host' | 'staff' | 'renter';

export type KycStatus = 'not_submitted' | 'pending' | 'verified' | 'rejected';
export type AccountStatus = 'active' | 'pending' | 'suspended' | 'banned';

export interface User {
    id: string;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
    role: UserRole;
    accountStatus: AccountStatus;

    // KYC fields (primarily for Host)
    kycStatus: KycStatus;
    isVerified: boolean;
    verificationDocs?: string[];  // Cloudinary links: CCCD, Business License

    // Host-specific
    commissionRate?: number;      // Override system default (e.g., VIP host = 8% instead of 10%)
    parentHostId?: string;        // For Staff: links to their Host employer

    // Metadata
    joinedAt: string;
    lastLoginAt?: string;
    bio?: string;
    location?: string;
}

export interface Staff {
    id: string;
    name: string;
    email: string;
    phone: string;
    hostId: string;              // The Host who created this staff
    hostName: string;
    role: 'staff';
    permissions: StaffPermission[];
    accountStatus: AccountStatus;
    joinedAt: string;
}

export type StaffPermission =
    | 'check_in'            // Can check-in guests
    | 'collect_payment'     // Can collect remaining payments
    | 'manage_schedule'     // Can update room availability
    | 'view_bookings'       // Can view booking list
    | 'add_services';       // Can add extra services & charges
