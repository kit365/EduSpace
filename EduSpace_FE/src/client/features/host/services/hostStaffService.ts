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
}

function unwrap<T>(res: { data: ApiResponse<T> }): T {
    return res.data.data;
}

export async function fetchHostStaffList(): Promise<HostStaffMember[]> {
    const res = await apiClient.get<ApiResponse<HostStaffMember[]>>(ACCOUNT_API.HOST_STAFF);
    return unwrap(res) ?? [];
}

export async function inviteBranchManager(payload: InviteBranchManagerPayload): Promise<HostStaffMember> {
    const res = await apiClient.post<ApiResponse<HostStaffMember>>(ACCOUNT_API.HOST_STAFF, payload);
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
