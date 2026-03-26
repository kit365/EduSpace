export type UserRole = 'admin' | 'super_admin' | 'host' | 'staff' | 'renter';
export type KycStatus = 'not_submitted' | 'PENDING' | 'VERIFIED' | 'REJECTED' | 'FAILED';
export type AccountStatus = 'active' | 'pending' | 'suspended' | 'banned' | 'blocked';

export interface User {
    id: string;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
    role: UserRole;
    accountStatus: AccountStatus;
    kycStatus: KycStatus;
    isVerified: boolean;
    verificationDocs?: string[];
    commissionRate?: number;
    joinedAt: string;
    lastLoginAt?: string;
    bio?: string;
    location?: string;
    parentHostId?: string;
}

export interface Staff extends User {
    role: 'staff';
    hostId: string;
    hostName: string;
    permissions: StaffPermission[];
}

export type StaffPermission =
    | 'check_in'
    | 'collect_payment'
    | 'manage_schedule'
    | 'view_bookings'
    | 'add_services';

export interface Permission {
    id: number;
    name: string;
    description: string;
    groupName: string;
}

export interface Role {
    id: string;
    name: string;
    userCount: number;
    permissions: Permission[];
}

export interface AuthResponse {
    user: User;
    accessToken: string;
    refreshToken: string;
}
