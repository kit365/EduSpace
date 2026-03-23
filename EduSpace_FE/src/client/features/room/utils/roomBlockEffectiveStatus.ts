import type { RoomDto } from '../types';
import type { RoomOperationalStatus } from '../types';
import { toOperationalStatus } from './roomOperationalStatus';

/** Khối thời gian tối thiểu để suy ra trạng thái (khớp room_blocks). */
export interface RoomBlockTimeLike {
  roomId: number;
  startDatetime: string;
  endDatetime: string;
  blockType?: string | null;
}

function parseMs(iso: string): number {
  return new Date(iso).getTime();
}

/** Block đang chiếm thời điểm `nowMs` (bán mở [start, end)). */
export function isBlockActiveAt(block: RoomBlockTimeLike, nowMs: number): boolean {
  const start = parseMs(block.startDatetime);
  const end = parseMs(block.endDatetime);
  if (Number.isNaN(start) || Number.isNaN(end)) return false;
  return nowMs >= start && nowMs < end;
}

export function isMaintenanceBlockType(blockType: string | null | undefined): boolean {
  return String(blockType ?? '').toUpperCase() === 'MAINTENANCE';
}

/**
 * Trạng thái hiển thị: nếu có lịch khóa bảo trì (MAINTENANCE) đang hiệu lực → luôn Bảo trì,
 * bất kể `rooms.status` trong DB (đồng bộ với trang Khóa phòng / room_blocks).
 */
export function getEffectiveOperationalStatus(
  room: RoomDto,
  blocksForRoom: RoomBlockTimeLike[],
  nowMs: number = Date.now()
): { effective: RoomOperationalStatus; lockedByMaintenanceSchedule: boolean } {
  const base = toOperationalStatus(room.status);
  const hasActiveMaintenance = blocksForRoom.some(
    (b) => b.roomId === room.id && isMaintenanceBlockType(b.blockType) && isBlockActiveAt(b, nowMs)
  );
  if (hasActiveMaintenance) {
    return {
      effective: 'MAINTENANCE',
      lockedByMaintenanceSchedule: base !== 'MAINTENANCE',
    };
  }
  return { effective: base, lockedByMaintenanceSchedule: false };
}
