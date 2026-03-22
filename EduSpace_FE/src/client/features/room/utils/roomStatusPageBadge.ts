import type { RoomDto } from '../types';
import type { RoomOperationalStatus } from '../types';
import { BADGE_CLASS, OPERATIONAL_LABELS } from './roomOperationalStatus';

/**
 * Badge trên trang Trạng thái phòng: ưu tiên chờ duyệt / chờ duyệt sửa,
 * sau đó mới đến trạng thái vận hành (Sẵn sàng, …). Phòng REJECTED không vào trang này.
 */
export function getRoomStatusPageBadge(
  room: RoomDto,
  operationalDisplay: RoomOperationalStatus
): { label: string; className: string } {
  if (room.pendingEditStatus === 'PENDING') {
    return {
      label: 'Chờ duyệt sửa',
      className: 'bg-sky-600/95 text-white border-0 shadow-sm',
    };
  }
  if (room.approvalStatus === 'PENDING') {
    return {
      label: 'Chờ duyệt',
      className: 'bg-amber-500/95 text-white border-0 shadow-sm',
    };
  }
  return {
    label: OPERATIONAL_LABELS[operationalDisplay],
    className: BADGE_CLASS[operationalDisplay],
  };
}

/** Chỉ phòng đã duyệt đăng mới vào bộ lọc / thống kê READY·IN_USE·… (tránh lẫn với từ chối/chờ duyệt). */
export function isRoomApprovedForOperationalListing(room: RoomDto): boolean {
  return room.approvalStatus === 'APPROVED';
}
