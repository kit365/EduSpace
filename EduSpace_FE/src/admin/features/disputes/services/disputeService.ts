import apiClient from '@/lib/axios';
import type { Dispute, Report, DisputeStatus } from '@/types';

export const disputeService = {
    // Disputes
    getDisputes: async (params?: { 
        status?: DisputeStatus; 
        page?: number; 
        size?: number 
    }): Promise<{ items: Dispute[]; total: number }> => {
        const res = await apiClient.get('/api/v1/admin/disputes', { params });
        return res.data;
    },

    getDisputeById: async (id: string): Promise<Dispute> => {
        const res = await apiClient.get(`/api/v1/admin/disputes/${id}`);
        return res.data;
    },

    resolveDispute: async (id: string, data: { 
        resolution: string; 
        status: DisputeStatus;
        refundAmount?: number;
    }): Promise<void> => {
        await apiClient.post(`/api/v1/admin/disputes/${id}/resolve`, data);
    },

    // Reports
    getReports: async (params?: { 
        status?: 'pending' | 'reviewed' | 'dismissed'; 
        page?: number; 
        size?: number 
    }): Promise<{ items: Report[]; total: number }> => {
        const res = await apiClient.get('/api/v1/admin/reports', { params });
        return res.data;
    },

    updateReportStatus: async (id: string, status: 'reviewed' | 'dismissed'): Promise<void> => {
        await apiClient.patch(`/api/v1/admin/reports/${id}/status`, null, { 
            params: { status } 
        });
    }
};
