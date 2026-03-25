import apiClient from '@/lib/axios';
import { DashboardResponse, DashboardStats } from '../types/dashboard';

/**
 * Service fetch dữ liệu thống kê cho Admin Dashboard từ account-service (Aggregator).
 */
export const dashboardService = {
    /**
     * Lấy snapshot thống kê mới nhất.
     */
    getStats: async (): Promise<DashboardStats> => {
        const res = await apiClient.get<DashboardResponse>('/api/v1/accounts/admin/dashboard/stats');
        // Trả về trường 'data' trong response bọc bởi BE
        return (res as any).data;
    },

    /**
     * Yêu cầu hệ thống tính toán lại snapshot ngay lập tức.
     */
    refreshStats: async (): Promise<DashboardStats> => {
        const res = await apiClient.post<DashboardResponse>('/api/v1/accounts/admin/dashboard/stats/refresh');
        return (res as any).data;
    }
};
