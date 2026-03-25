import apiClient from '@/lib/axios';
import { User, Paginated } from '@/types';

export interface UserFilterParams {
    page?: number;
    size?: number;
    search?: string;
    /** One role or comma-separated list sent as `role` query param */
    role?: string;
    status?: string;
    kyc?: string;
}

/** BE UserResponse shape (account-service) */
interface ApiUser {
    id?: string;
    email?: string;
    fullName?: string;
    phoneNumber?: string;
    avatarUrl?: string;
    isActive?: boolean;
    isEmailVerified?: boolean;
    verificationStatus?: string;
    verificationDocument?: string;
    roles?: string[];
    createdAt?: string;
    [key: string]: unknown;
}

/** BE PageResponse shape (account-service) */
interface PageResponse<T> {
    content: T[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
}

function mapApiUserToUser(api: ApiUser): User {
    const roles = Array.isArray(api.roles) ? api.roles : [];
    const role = roles.includes('SUPER_ADMIN') ? 'super_admin'
        : roles.includes('ADMIN') ? 'admin'
        : roles.includes('HOST') ? 'host'
        : roles.includes('MANAGER') ? 'manager'
        : roles.includes('GUEST') ? 'guest'
        : ('guest' as User['role']);
    const rawKyc = (api.verificationStatus ?? '').toLowerCase();
    const kycStatus: User['kycStatus'] =
        rawKyc === 'pending' ? 'pending'
            : rawKyc === 'verified' || rawKyc === 'approved' ? 'verified'
                : rawKyc === 'rejected' ? 'rejected'
                    : 'not_submitted';

    return {
        id: api.id ?? '',
        name: api.fullName ?? api.email ?? '-',
        email: api.email ?? '',
        phone: api.phoneNumber,
        avatar: api.avatarUrl,
        role,
        accountStatus: api.isActive === false ? 'suspended' : 'active',
        kycStatus,
        isVerified: Boolean(api.isEmailVerified),
        verificationDocs: api.verificationDocument ? [api.verificationDocument] : [],
        joinedAt: api.createdAt ? new Date(api.createdAt).toISOString() : new Date().toISOString()
    };
}

/** Map BE role name to filter value for getUsers */
export function roleNameToFilterValue(roleName: string): string {
    const map: Record<string, string> = {
        GUEST: 'Khách hàng',
        HOST: 'Host',
        MANAGER: 'Quản lý',
        ADMIN: 'Admin',
        SUPER_ADMIN: 'Super Admin',
    };
    return map[roleName] ?? roleName;
}

export const userService = {
    getUsers: async (params: UserFilterParams): Promise<Paginated<User>> => {
        const res = await apiClient.get<{ data?: PageResponse<ApiUser> }>('/api/v1/accounts/admin/users', { params });
        const raw = res as unknown as { data?: PageResponse<ApiUser> } | PageResponse<ApiUser>;
        const pageData: PageResponse<ApiUser> = ('data' in raw && raw.data) ? raw.data : (raw as PageResponse<ApiUser>);
        const content = pageData.content ?? [];
        return {
            items: content.map(mapApiUserToUser),
            total: pageData.totalElements ?? 0,
            page: pageData.page ?? 0,
            limit: pageData.size ?? 10,
            totalPages: pageData.totalPages ?? 0
        };
    },

    approveUserKyc: async (userId: string): Promise<void> => {
        await apiClient.post(`/api/v1/accounts/admin/users/${userId}/kyc/approve`);
    },

    rejectUserKyc: async (userId: string, reason?: string): Promise<void> => {
        const query = reason && reason.trim()
            ? `?reason=${encodeURIComponent(reason.trim())}`
            : '';
        await apiClient.post(`/api/v1/accounts/admin/users/${userId}/kyc/reject${query}`);
    },
};
