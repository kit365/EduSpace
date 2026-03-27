import apiClient from '@/lib/axios';

type PolicyType = 'DEPOSIT' | 'REFUND';

export interface DepositRefundPolicyDto {
  id: number;
  policyName: string;
  description?: string | null;
  policyType: PolicyType;
  depositPercentage: number;
  startHour?: number | null;
  endHour?: number | null;
  fullRefundHours?: number | null;
  fullRefundPercentage?: number | null;
  partialRefundHours?: number | null;
  partialRefundPercentage?: number | null;
  noRefundHours?: number | null;
  noRefundPercentage?: number | null;
  isDefault: boolean;
  highlightText?: string | null;
  isActive: boolean;
}

export interface UpsertDepositRefundPolicyPayload {
  policyName: string;
  description?: string | null;
  policyType: PolicyType;
  depositPercentage: number;
  startHour?: number | null;
  endHour?: number | null;
  fullRefundHours?: number | null;
  fullRefundPercentage?: number | null;
  partialRefundHours?: number | null;
  partialRefundPercentage?: number | null;
  noRefundHours?: number | null;
  noRefundPercentage?: number | null;
  isDefault: boolean;
  highlightText?: string | null;
  isActive: boolean;
}

function unwrap<T>(res: unknown): T {
  if (res && typeof res === 'object' && 'data' in res && (res as { data: unknown }).data !== undefined) {
    return (res as { data: T }).data;
  }
  return res as T;
}

const ADMIN_POLICY_API = '/api/v1/admin/booking-deposit-refund-policies';

export const depositRefundPolicyService = {
  async getAll(): Promise<DepositRefundPolicyDto[]> {
    const res = await apiClient.get(ADMIN_POLICY_API);
    const data = unwrap<DepositRefundPolicyDto[]>(res);
    return Array.isArray(data) ? data : [];
  },

  async create(payload: UpsertDepositRefundPolicyPayload): Promise<DepositRefundPolicyDto> {
    const res = await apiClient.post(ADMIN_POLICY_API, payload);
    return unwrap<DepositRefundPolicyDto>(res);
  },

  async update(id: number, payload: UpsertDepositRefundPolicyPayload): Promise<DepositRefundPolicyDto> {
    const res = await apiClient.put(`${ADMIN_POLICY_API}/${id}`, payload);
    return unwrap<DepositRefundPolicyDto>(res);
  },

  async remove(id: number): Promise<void> {
    await apiClient.delete(`${ADMIN_POLICY_API}/${id}`);
  },
};

