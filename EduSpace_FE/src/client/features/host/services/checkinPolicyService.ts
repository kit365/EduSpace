import apiClient from '@/lib/axios';

export type LateWithinGraceUsageMode = 'DEDUCT_LATE_TIME' | 'KEEP_ORIGINAL_SLOT';
export type CheckinRefundMode = 'FOLLOW_DEPOSIT_REFUND_POLICY' | 'ZERO_DEPOSIT_REFUND';

export interface BookingCheckinPolicyScenarioDto {
  situation: string;
  systemAction: string;
  refund: string;
  slotUsage: string;
}

export interface BookingCheckinPolicyDto {
  id: number;
  propertyId: number;
  graceMinutes: number;
  autoCancelMinutes: number;
  allowEarlyWaiting: boolean;
  allowLateWithinGraceCheckin: boolean;
  lateWithinGraceUsageMode: LateWithinGraceUsageMode;
  lateOverGraceRefundMode: CheckinRefundMode;
  noShowRefundMode: CheckinRefundMode;
  isActive: boolean;
  scenarios: BookingCheckinPolicyScenarioDto[];
}

export interface UpsertCheckinPolicyPayload {
  propertyId: number;
  graceMinutes: number;
  autoCancelMinutes: number;
  allowEarlyWaiting: boolean;
  allowLateWithinGraceCheckin: boolean;
  lateWithinGraceUsageMode: LateWithinGraceUsageMode;
  lateOverGraceRefundMode: CheckinRefundMode;
  noShowRefundMode: CheckinRefundMode;
  isActive: boolean;
}

function unwrap<T>(res: unknown): T {
  if (res && typeof res === 'object' && 'data' in res && (res as { data: unknown }).data !== undefined) {
    return (res as { data: T }).data;
  }
  return res as T;
}

const HOST_CHECKIN_POLICY_API = '/api/v1/host/checkin-policies';

export const checkinPolicyService = {
  async listByPropertyId(propertyId: number): Promise<BookingCheckinPolicyDto[]> {
    const res = await apiClient.get(HOST_CHECKIN_POLICY_API, { params: { propertyId } });
    const data = unwrap<BookingCheckinPolicyDto[] | null | undefined>(res);
    return Array.isArray(data) ? data : [];
  },

  async upsertByPropertyId(propertyId: number, payload: UpsertCheckinPolicyPayload): Promise<BookingCheckinPolicyDto> {
    const res = await apiClient.put(`${HOST_CHECKIN_POLICY_API}/${propertyId}`, payload);
    return unwrap<BookingCheckinPolicyDto>(res);
  },

  async deleteById(id: number): Promise<void> {
    await apiClient.delete(`${HOST_CHECKIN_POLICY_API}/${id}`);
  },
};

