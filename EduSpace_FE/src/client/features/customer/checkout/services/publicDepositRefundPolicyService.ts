import apiClient from '@/lib/axios';

export interface PublicDepositRefundPolicy {
  id: number;
  policyName: string;
  description?: string | null;
  policyType: 'DEPOSIT' | 'REFUND';
  depositPercentage: number;
  startHour?: number | null;
  endHour?: number | null;
  fullRefundHours?: number | null;
  fullRefundPercentage?: number | null;
  partialRefundHours?: number | null;
  partialRefundPercentage?: number | null;
  noRefundHours?: number | null;
  noRefundPercentage?: number | null;
  isDefault?: boolean | null;
  highlightText?: string | null;
  active?: boolean | null;
}

function unwrapData<T>(res: unknown): T {
  if (res && typeof res === 'object' && 'data' in res && (res as { data: unknown }).data !== undefined) {
    return (res as { data: T }).data;
  }
  return res as T;
}

/** Không cần đăng nhập — dùng trên màn checkout. */
export const publicDepositRefundPolicyService = {
  async listActive(): Promise<PublicDepositRefundPolicy[]> {
    const res = await apiClient.get('/api/v1/bookings/public/deposit-refund-policies');
    const data = unwrapData<PublicDepositRefundPolicy[]>(res);
    return Array.isArray(data) ? data : [];
  },
};

export function matchDepositPolicyForDuration(
  durationMinutes: number,
  policies: PublicDepositRefundPolicy[],
): PublicDepositRefundPolicy | null {
  const hours = durationMinutes / 60;
  const deposits = policies.filter((p) => p.policyType === 'DEPOSIT');
  const sorted = [...deposits].sort((a, b) => (a.startHour ?? 0) - (b.startHour ?? 0));

  for (const p of sorted) {
    const start = p.startHour;
    const end = p.endHour;
    if (start != null && end != null) {
      if (hours >= start && hours <= end) return p;
    } else if (start != null && end == null) {
      if (hours >= start) return p;
    }
  }

  const def = sorted.find((p) => p.isDefault);
  return def ?? sorted[0] ?? null;
}

export function pickPrimaryRefundPolicy(policies: PublicDepositRefundPolicy[]): PublicDepositRefundPolicy | null {
  const refunds = policies.filter((p) => p.policyType === 'REFUND');
  if (refunds.length === 0) return null;
  return refunds.find((p) => p.isDefault) ?? refunds[0];
}

/** Mốc hoàn cọc nếu hủy tại thời điểm hiện tại (theo khoảng cách tới giờ check-in). */
export function refundApplicabilityLabel(
  hoursUntilCheckIn: number | null,
  policy: PublicDepositRefundPolicy | null,
): string {
  if (!policy) return 'Đang cập nhật chính sách hoàn tiền.';
  if (hoursUntilCheckIn == null || Number.isNaN(hoursUntilCheckIn)) {
    return policy.highlightText || policy.policyName || '—';
  }
  if (hoursUntilCheckIn < 0) {
    return 'Thời điểm check-in đã qua — áp dụng theo hỗ trợ/EduSpace nếu có tranh chấp.';
  }

  const fullH = policy.fullRefundHours ?? 0;
  const fullPct = policy.fullRefundPercentage ?? 0;
  const partialH = policy.partialRefundHours ?? 0;
  const partialPct = policy.partialRefundPercentage ?? 0;
  const noPct = policy.noRefundPercentage ?? 0;

  if (hoursUntilCheckIn >= fullH) {
    return `Bạn đang ở mốc ≥${fullH} giờ trước check-in — nếu hủy ngay: hoàn ${fullPct}% số cọc.`;
  }
  if (hoursUntilCheckIn >= partialH) {
    return `Bạn đang ở mốc ${partialH}–${fullH} giờ trước check-in — nếu hủy ngay: hoàn ${partialPct}% số cọc.`;
  }
  return `Bạn đang ở mốc dưới ${partialH} giờ trước check-in — nếu hủy ngay: hoàn ${noPct}% số cọc.`;
}

export function hoursUntilCheckIn(bookingDate?: string, startTimeHm?: string): number | null {
  if (!bookingDate || !startTimeHm) return null;
  const iso = `${bookingDate}T${startTimeHm.length === 5 ? `${startTimeHm}:00` : startTimeHm}`;
  const checkIn = new Date(iso);
  if (Number.isNaN(checkIn.getTime())) return null;
  return (checkIn.getTime() - Date.now()) / (1000 * 60 * 60);
}
