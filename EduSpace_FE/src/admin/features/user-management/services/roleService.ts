import apiClient from '@/lib/axios';
import { Role } from '@/types';

/**
 * API /api/v1/accounts/admin/roles requires:
 * - Header: Authorization: Bearer <access_token>
 * - Token must contain realm role ADMIN or SUPER_ADMIN (Keycloak).
 * 401 = chưa đăng nhập hoặc token hết hạn / không hợp lệ. Cần đăng nhập bằng tài khoản Admin.
 */
export const roleService = {
    getRoles: async (): Promise<Role[]> => {
        const response = await apiClient.get<{ data?: Role[] }>('/api/v1/accounts/admin/roles');
        return response?.data ?? [];
    }
};
