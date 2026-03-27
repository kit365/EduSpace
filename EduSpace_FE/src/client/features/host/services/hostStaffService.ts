import apiClient from '@/lib/axios';
import { ACCOUNT_API } from '@/config/api/account';
import type { ApiResponse } from '@/types/api';

export interface HostStaffMember {
    id: string;
    email: string;
    fullName: string;
    phoneNumber?: string | null;
    isActive: boolean;
    /** MANAGER | STAFF */
    memberRole?: string;
    branchPropertyId?: number | null;
    permissionNames: string[];
    createdAt: string;
}

export interface InviteBranchManagerPayload {
    email: string;
    branchPropertyId: number;
    fullName?: string;
    temporaryPassword?: string;
}

export interface InviteBranchManagerResult {
    member: HostStaffMember;
    created: boolean;
}

export interface HostManagerScope {
    managerScoped: boolean;
    branchPropertyId: number | null;
}

function unwrap<T>(res: unknown): T {
    if (res && typeof res === 'object' && 'data' in (res as Record<string, unknown>)) {
        const maybeApi = res as { data?: unknown };
        const maybeData = maybeApi.data;
        if (maybeData && typeof maybeData === 'object' && 'data' in (maybeData as Record<string, unknown>)) {
            return (maybeData as { data: T }).data;
        }
        return maybeData as T;
    }
    return res as T;
}

export async function fetchHostStaffList(): Promise<HostStaffMember[]> {
    const res = await apiClient.get<ApiResponse<HostStaffMember[]>>(ACCOUNT_API.HOST_STAFF);
    return unwrap(res) ?? [];
}

export async function fetchMyManagerScope(): Promise<HostManagerScope> {
    const res = await apiClient.get<ApiResponse<HostManagerScope>>(ACCOUNT_API.HOST_STAFF_ME_SCOPE);
    return unwrap<HostManagerScope>(res) ?? { managerScoped: false, branchPropertyId: null };
}

export async function inviteBranchManager(payload: InviteBranchManagerPayload): Promise<InviteBranchManagerResult> {
    const res = await apiClient.post<ApiResponse<InviteBranchManagerResult>>(ACCOUNT_API.HOST_STAFF, payload);
    return unwrap(res);
}

export async function replaceStaffPermissions(
    staffUserId: string,
    permissionNames: string[],
): Promise<HostStaffMember> {
    const res = await apiClient.put<ApiResponse<HostStaffMember>>(
        `${ACCOUNT_API.HOST_STAFF}/${staffUserId}/permissions`,
        { permissionNames },
    );
    return unwrap(res);
}

export async function removeHostStaff(staffUserId: string): Promise<void> {
    await apiClient.delete<ApiResponse<null>>(`${ACCOUNT_API.HOST_STAFF}/${staffUserId}`);
}
