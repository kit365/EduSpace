import type { RoomDto } from '@/client/features/room/types';
import type { RoomOperationalStatus } from '@/client/features/room/types';
import {
  BUTTON_ACTIVE_CLASS,
  BUTTON_INACTIVE_CLASS,
  OPERATIONAL_LABELS,
  OPERATIONAL_STATUSES,
} from '@/client/features/room/utils/roomOperationalStatus';
import { getRoomStatusPageBadge } from '@/client/features/room/utils/roomStatusPageBadge';

function firstImageUrl(images: string | null): string {
  const u = images?.split(',')[0]?.trim();
  if (u) return u;
  return 'https://placehold.co/1200x800/e2e8f0/64748b?text=EduSpace';
}

export interface RoomStatusCardProps {
  room: RoomDto;
  /** Trạng thái hiển thị (đã gộp lịch khóa bảo trì nếu có). */
  displayStatus: RoomOperationalStatus;
  onStatusChange: (roomId: number, status: RoomOperationalStatus) => void | Promise<void>;
  isUpdating?: boolean;
}

export function RoomStatusCard({
  room,
  displayStatus,
  onStatusChange,
  isUpdating,
}: RoomStatusCardProps) {
  const operational = displayStatus;
  const topBadge = getRoomStatusPageBadge(room, operational);

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="relative h-48 overflow-hidden">
        <img
          src={firstImageUrl(room.images)}
          alt={room.name}
          className="h-full w-full object-cover rounded-t-2xl"
        />
        <div
          className={`absolute left-3 top-3 rounded-lg px-3 py-1.5 text-xs font-bold ${topBadge.className}`}
        >
          {topBadge.label}
        </div>
      </div>

      <div className="p-5">
        <h3 className="text-lg font-bold text-gray-900">{room.name}</h3>

        {operational === 'IN_USE' && (
          <div className="mt-3 rounded-xl border border-blue-100 bg-blue-50/90 p-3">
            <p className="text-xs font-bold text-blue-800">Khách thuê</p>
            <p className="mt-1 text-xs text-blue-600/90">
              Chi tiết booking sẽ được kết nối khi API đặt phòng sẵn sàng.
            </p>
          </div>
        )}

        <p className="mt-3 text-xs text-gray-400">
          Cập nhật:{' '}
          {room.updatedAt
            ? new Date(room.updatedAt).toLocaleString('vi-VN')
            : '—'}
        </p>

        <div
          className={`mt-4 grid grid-cols-2 gap-2 ${isUpdating ? 'pointer-events-none opacity-50' : ''}`}
        >
          {OPERATIONAL_STATUSES.map((key) => {
            const isActive = operational === key;
            return (
              <button
                key={key}
                type="button"
                disabled={isUpdating}
                onClick={() => void onStatusChange(room.id, key)}
                className={`rounded-xl border-2 px-3 py-2.5 text-xs font-bold transition-all active:scale-[0.98] ${
                  isActive ? BUTTON_ACTIVE_CLASS[key] : BUTTON_INACTIVE_CLASS
                }`}
              >
                {OPERATIONAL_LABELS[key]}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
