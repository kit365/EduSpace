import apiClient from '@/lib/axios';
import type { Permission } from '@/types';
import type { HostStaffMember } from './hostStaffService';

type ApiEnvelope<T> = { data?: T; success?: boolean };

function unwrapList<T>(res: unknown): T[] {
    if (Array.isArray(res)) return res as T[];
    if (res && typeof res === 'object' && 'data' in (res as Record<string, unknown>)) {
        const payload = (res as { data: unknown }).data;
        if (Array.isArray(payload)) return payload as T[];
        if (payload && typeof payload === 'object' && 'data' in (payload as Record<string, unknown>)) {
            const nested = (payload as { data?: unknown }).data;
            if (Array.isArray(nested)) return nested as T[];
        }
    }
    return [];
}

function unwrapObject<T>(res: unknown): T {
    if (res && typeof res === 'object' && 'data' in (res as Record<string, unknown>)) {
        const payload = (res as { data: unknown }).data;
        if (payload !== undefined && payload !== null) return payload as T;
    }
    return res as T;
}

function normalizePermission(p: Permission & { group_name?: string }): Permission {
    return {
        id: Number(p.id),
        name: p.name,
        description: p.description ?? '',
        groupName: p.groupName ?? p.group_name ?? 'Other',
    };
}

const HOST_STAFF_API_BASE = '/api/v1/accounts/host/staff';
const HOST_RBAC_API_BASE = '/api/v1/accounts/host';

export const hostManagerRoleService = {
    getPermissionCatalog: async (): Promise<Permission[]> => {
        const response = await apiClient.get<ApiEnvelope<Permission[]>>(`${HOST_RBAC_API_BASE}/permissions`);
        return unwrapList<Permission>(response).map((p) =>
            normalizePermission(p as Permission & { group_name?: string }),
        );
    },

    updateManagerPermissions: async (staffUserId: string, permissionIds: number[]): Promise<HostStaffMember> => {
        const response = await apiClient.put<ApiEnvelope<HostStaffMember>>(
            `${HOST_STAFF_API_BASE}/${staffUserId}/manager-permissions`,
            {
            permissionIds,
            },
        );
        return unwrapObject<HostStaffMember>(response);
    },
};

