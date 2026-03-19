import apiClient from '@/lib/axios';
import { ACCOUNT_API } from '@/config/api/account';

function unwrap<T>(res: unknown): T {
  if (res && typeof res === 'object' && 'data' in res && (res as { data: unknown }).data !== undefined) {
    return (res as { data: T }).data;
  }
  return res as T;
}

export type HostApplicationUiStatus = 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED';

export interface MyHostApplicationStatus {
  status: HostApplicationUiStatus;
  applicationId?: string;
  rejectedReason?: string | null;
  submittedAt?: string | null;
}

export interface SubmitHostPartnerApplicationPayload {
  applicantType: string;
  fullName: string;
  phone: string;
  email: string;
  address: string;
  message?: string;
  documentFrontUrl?: string;
  documentBackUrl?: string;
  businessLicenseUrl?: string;
}

export interface HostPartnerApplicationAdminItem {
  id: string;
  userId: string;
  applicantType: string;
  fullName: string;
  phone: string | null;
  email: string;
  address: string | null;
  message: string | null;
  status: string;
  adminNote: string | null;
  createdAt: string | null;
  reviewedAt: string | null;
  reviewedBy: string | null;
}

export const hostPartnerApplicationService = {
  getMyStatus: async (): Promise<MyHostApplicationStatus> => {
    const res = await apiClient.get(ACCOUNT_API.HOST_APPLICATIONS_ME);
    return unwrap<MyHostApplicationStatus>(res);
  },

  submit: async (body: SubmitHostPartnerApplicationPayload): Promise<void> => {
    await apiClient.post(ACCOUNT_API.HOST_APPLICATIONS_ME, body);
  },

  adminListPending: async (): Promise<HostPartnerApplicationAdminItem[]> => {
    const res = await apiClient.get(`${ACCOUNT_API.HOST_APPLICATIONS_ADMIN}/pending`);
    const list = unwrap<HostPartnerApplicationAdminItem[]>(res);
    return Array.isArray(list) ? list : [];
  },

  adminApprove: async (id: string): Promise<void> => {
    await apiClient.post(`${ACCOUNT_API.HOST_APPLICATIONS_ADMIN}/${id}/approve`);
  },

  adminReject: async (id: string, adminNote?: string): Promise<void> => {
    await apiClient.post(`${ACCOUNT_API.HOST_APPLICATIONS_ADMIN}/${id}/reject`, { adminNote: adminNote ?? '' });
  },
};
