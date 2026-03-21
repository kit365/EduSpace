import type { RoomOperationalStatus, RoomStatus } from '../types';

/** 4 trạng thái vận hành trên dashboard (thứ tự nút). */
export const OPERATIONAL_STATUSES: RoomOperationalStatus[] = ['READY', 'IN_USE', 'CLEANING', 'MAINTENANCE'];

export const OPERATIONAL_LABELS: Record<RoomOperationalStatus, string> = {
  READY: 'Sẵn sàng',
  IN_USE: 'Đang có khách',
  CLEANING: 'Đang dọn',
  MAINTENANCE: 'Bảo trì',
};

/**
 * Chuẩn hoá status từ API → 1 trong 4 trạng thái nút.
 * ACTIVE (legacy) → READY; INACTIVE → MAINTENANCE.
 */
export function toOperationalStatus(raw: RoomStatus | string | undefined | null): RoomOperationalStatus {
  const s = String(raw ?? 'ACTIVE').toUpperCase();
  if (s === 'ACTIVE') return 'READY';
  if (s === 'INACTIVE') return 'MAINTENANCE';
  if (s === 'READY' || s === 'IN_USE' || s === 'CLEANING' || s === 'MAINTENANCE') {
    return s as RoomOperationalStatus;
  }
  return 'READY';
}

/** Badge góc trên ảnh — nền nhạt + viền. */
export const BADGE_CLASS: Record<RoomOperationalStatus, string> = {
  READY: 'bg-green-50 text-green-800 border border-green-200',
  IN_USE: 'bg-blue-50 text-blue-800 border border-blue-200',
  CLEANING: 'bg-orange-50 text-orange-800 border border-orange-200',
  MAINTENANCE: 'bg-red-50 text-red-800 border border-red-200',
};

/** Nút đang active (khớp status). */
export const BUTTON_ACTIVE_CLASS: Record<RoomOperationalStatus, string> = {
  READY: 'border-green-500 text-green-600 bg-green-50/50',
  IN_USE: 'border-blue-500 text-blue-600 bg-blue-50/50',
  CLEANING: 'border-orange-500 text-orange-600 bg-orange-50/50',
  MAINTENANCE: 'border-red-500 text-red-600 bg-red-50/50',
};

export const BUTTON_INACTIVE_CLASS = 'border border-gray-200 text-gray-400 bg-white hover:bg-gray-50';

/** Phòng coi là đang mở cho thuê (legacy ACTIVE hoặc READY). */
export function isRoomOpenForBooking(status: RoomStatus | string | undefined | null): boolean {
  const s = String(status ?? '').toUpperCase();
  return s === 'ACTIVE' || s === 'READY';
}
