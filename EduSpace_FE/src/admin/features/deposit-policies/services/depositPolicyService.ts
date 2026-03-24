import apiClient from '@/lib/axios';

export interface DepositRefundPolicy {
    id: number;
    policyName: string;
    description?: string;
    depositPercentage: number;
    fullRefundHours: number;
    fullRefundPercentage: number;
    partialRefundHours: number;
    partialRefundPercentage: number;
    noRefundHours: number;
    noRefundPercentage: number;
    noShowRefundPercentage: number;
    noShowPenalty: number;
    allowForceMajeure: boolean;
    forceMajeureRefundPercentage: number;
    forceMajeureRequiresEvidence: boolean;
    isDefault: boolean;
    displayOrder: number;
    highlightText?: string;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export type UpsertDepositRefundPolicy = {
    policyName: string;
    description?: string;
    depositPercentage: number;
    fullRefundHours: number;
    fullRefundPercentage: number;
    partialRefundHours: number;
    partialRefundPercentage: number;
    noRefundHours: number;
    noRefundPercentage: number;
    noShowRefundPercentage: number;
    noShowPenalty: number;
    allowForceMajeure: boolean;
    forceMajeureRefundPercentage: number;
    forceMajeureRequiresEvidence: boolean;
    isDefault: boolean;
    displayOrder?: number;
    highlightText?: string;
    isActive: boolean;
};

function unwrapData<T>(res: unknown): T {
    const r = res as { data?: T };
    return (r?.data !== undefined ? r.data : res) as T;
}

export const depositPolicyService = {
    list: async (): Promise<DepositRefundPolicy[]> => {
        const res = await apiClient.get('/api/v1/admin/booking-deposit-refund-policies');
        return unwrapData<DepositRefundPolicy[]>(res);
    },

    create: async (body: UpsertDepositRefundPolicy): Promise<DepositRefundPolicy> => {
        const res = await apiClient.post('/api/v1/admin/booking-deposit-refund-policies', body);
        return unwrapData<DepositRefundPolicy>(res);
    },

    update: async (id: number, body: UpsertDepositRefundPolicy): Promise<DepositRefundPolicy> => {
        const res = await apiClient.put(`/api/v1/admin/booking-deposit-refund-policies/${id}`, body);
        return unwrapData<DepositRefundPolicy>(res);
    },

    delete: async (id: number): Promise<void> => {
        await apiClient.delete(`/api/v1/admin/booking-deposit-refund-policies/${id}`);
    },
};
