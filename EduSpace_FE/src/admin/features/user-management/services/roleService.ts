import apiClient from '@/lib/axios';
import { Permission, PermissionTemplate, Role } from '@/types';

type ApiEnvelope<T> = { data?: T; success?: boolean };

/**
 * apiClient interceptor returns the HTTP JSON body (ApiResponse), not AxiosResponse.
 * Also accept a raw array if the list is returned at the root.
 */
function unwrapList<T>(res: unknown): T[] {
    if (Array.isArray(res)) {
        return res as T[];
    }
    if (res && typeof res === 'object' && 'data' in res) {
        const payload = (res as { data: unknown }).data;
        if (Array.isArray(payload)) {
            return payload as T[];
        }
        if (payload && typeof payload === 'object' && 'data' in payload && Array.isArray((payload as { data: unknown }).data)) {
            return (payload as { data: T[] }).data;
        }
    }
    return [];
}

function unwrapObject<T>(res: unknown): T {
    if (res && typeof res === 'object' && 'data' in res) {
        const payload = (res as { data: unknown }).data;
        if (payload !== undefined && payload !== null) {
            return payload as T;
        }
    }
    return res as T;
}

function normalizePermission(p: Permission & { group_name?: string }): Permission {
    const groupName = p.groupName ?? p.group_name ?? 'Other';
    const id = typeof p.id === 'number' ? p.id : Number(p.id);
    return {
        id: Number.isFinite(id) ? id : 0,
        name: p.name,
        description: p.description ?? '',
        groupName,
    };
}

function normalizeRole(r: Role & { id?: number | string }): Role {
    return {
        id: String(r.id),
        name: r.name,
        userCount: r.userCount ?? 0,
        permissions: (r.permissions ?? []).map(normalizePermission),
    };
}

function normalizeTemplate(t: PermissionTemplate & { id?: number }): PermissionTemplate {
    return {
        id: typeof t.id === 'number' ? t.id : Number(t.id),
        name: t.name,
        description: t.description ?? undefined,
        permissions: (t.permissions ?? []).map(normalizePermission),
    };
}

/**
 * Admin RBAC APIs — requires realm role ADMIN or SUPER_ADMIN on the token.
 */
export const roleService = {
    getRoles: async (): Promise<Role[]> => {
        const response = await apiClient.get<ApiEnvelope<Role[]>>('/api/v1/accounts/admin/roles');
        return unwrapList<Role>(response).map((r) => normalizeRole(r as Role));
    },

    getPermissionCatalog: async (): Promise<Permission[]> => {
        const response = await apiClient.get<unknown>('/api/v1/accounts/admin/permissions');
        return unwrapList<Permission>(response).map((p) =>
            normalizePermission(p as Permission & { group_name?: string })
        );
    },

    createPermission: async (body: {
        name: string;
        description?: string;
        groupName: string;
    }): Promise<Permission> => {
        const response = await apiClient.post<unknown>('/api/v1/accounts/admin/permissions', body);
        return normalizePermission(unwrapObject<Permission>(response) as Permission & { group_name?: string });
    },

    updatePermission: async (
        id: number,
        body: { name: string; description?: string; groupName: string }
    ): Promise<Permission> => {
        const response = await apiClient.put<unknown>(`/api/v1/accounts/admin/permissions/${id}`, body);
        return normalizePermission(unwrapObject<Permission>(response) as Permission & { group_name?: string });
    },

    deletePermission: async (id: number): Promise<void> => {
        await apiClient.delete(`/api/v1/accounts/admin/permissions/${id}`);
    },

    getPermissionTemplates: async (): Promise<PermissionTemplate[]> => {
        const response = await apiClient.get<unknown>('/api/v1/accounts/admin/permission-templates');
        return unwrapList<PermissionTemplate>(response).map((t) => normalizeTemplate(t as PermissionTemplate));
    },

    getPermissionTemplate: async (id: number): Promise<PermissionTemplate> => {
        const response = await apiClient.get<unknown>(`/api/v1/accounts/admin/permission-templates/${id}`);
        return normalizeTemplate(unwrapObject<PermissionTemplate>(response) as PermissionTemplate);
    },

    createPermissionTemplate: async (body: {
        name: string;
        description?: string;
        permissionIds: number[];
    }): Promise<PermissionTemplate> => {
        const response = await apiClient.post<ApiEnvelope<PermissionTemplate>>(
            '/api/v1/accounts/admin/permission-templates',
            body
        );
        return normalizeTemplate(unwrapObject<PermissionTemplate>(response) as PermissionTemplate);
    },

    updatePermissionTemplate: async (
        id: number,
        body: { name: string; description?: string; permissionIds: number[] }
    ): Promise<PermissionTemplate> => {
        const response = await apiClient.put<ApiEnvelope<PermissionTemplate>>(
            `/api/v1/accounts/admin/permission-templates/${id}`,
            body
        );
        return normalizeTemplate(unwrapObject<PermissionTemplate>(response) as PermissionTemplate);
    },

    deletePermissionTemplate: async (id: number): Promise<void> => {
        await apiClient.delete(`/api/v1/accounts/admin/permission-templates/${id}`);
    },

    updateRolePermissions: async (roleId: number | string, permissionIds: number[]): Promise<Role> => {
        const response = await apiClient.put<ApiEnvelope<Role>>(`/api/v1/accounts/admin/roles/${roleId}/permissions`, {
            permissionIds,
        });
        return normalizeRole(unwrapObject<Role>(response) as Role);
    },

    applyTemplateToRole: async (
        roleId: number | string,
        templateId: number,
        mode: 'merge' | 'replace'
    ): Promise<Role> => {
        const response = await apiClient.post<ApiEnvelope<Role>>(
            `/api/v1/accounts/admin/roles/${roleId}/permissions/apply-template/${templateId}`,
            {},
            { params: { mode } }
        );
        return normalizeRole(unwrapObject<Role>(response) as Role);
    },
};

const HOST_ACCOUNT_BASE = '/api/v1/accounts/host';

/** Partner Portal (/rental) — token có HOST/MANAGER; gọi API /host/... (không dùng /admin/...). */
export const hostRbacService = {
    getPermissionCatalog: async (): Promise<Permission[]> => {
        const response = await apiClient.get<unknown>(`${HOST_ACCOUNT_BASE}/permissions`);
        return unwrapList<Permission>(response).map((p) =>
            normalizePermission(p as Permission & { group_name?: string })
        );
    },

    getPermissionTemplates: async (): Promise<PermissionTemplate[]> => {
        const response = await apiClient.get<unknown>(`${HOST_ACCOUNT_BASE}/permission-templates`);
        return unwrapList<PermissionTemplate>(response).map((t) => normalizeTemplate(t as PermissionTemplate));
    },

    getPermissionTemplate: async (id: number): Promise<PermissionTemplate> => {
        const response = await apiClient.get<unknown>(`${HOST_ACCOUNT_BASE}/permission-templates/${id}`);
        return normalizeTemplate(unwrapObject<PermissionTemplate>(response) as PermissionTemplate);
    },

    createPermissionTemplate: async (body: {
        name: string;
        description?: string;
        permissionIds: number[];
    }): Promise<PermissionTemplate> => {
        const response = await apiClient.post<ApiEnvelope<PermissionTemplate>>(
            `${HOST_ACCOUNT_BASE}/permission-templates`,
            body
        );
        return normalizeTemplate(unwrapObject<PermissionTemplate>(response) as PermissionTemplate);
    },

    updatePermissionTemplate: async (
        id: number,
        body: { name: string; description?: string; permissionIds: number[] }
    ): Promise<PermissionTemplate> => {
        const response = await apiClient.put<ApiEnvelope<PermissionTemplate>>(
            `${HOST_ACCOUNT_BASE}/permission-templates/${id}`,
            body
        );
        return normalizeTemplate(unwrapObject<PermissionTemplate>(response) as PermissionTemplate);
    },

    deletePermissionTemplate: async (id: number): Promise<void> => {
        await apiClient.delete(`${HOST_ACCOUNT_BASE}/permission-templates/${id}`);
    },
};

export type HostRbacTemplateApi = Pick<
    typeof hostRbacService,
    | 'getPermissionCatalog'
    | 'getPermissionTemplates'
    | 'getPermissionTemplate'
    | 'createPermissionTemplate'
    | 'updatePermissionTemplate'
    | 'deletePermissionTemplate'
>;
