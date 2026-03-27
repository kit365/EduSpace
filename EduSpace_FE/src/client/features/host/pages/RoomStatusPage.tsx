import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw, Loader2 } from 'lucide-react';
import { RentalLayout } from '../../../layouts/RentalLayout';
import { useBranch } from '../context/BranchContext';
import { useProfile } from '../../customer/profile/hooks/useProfile';
import { roomApiService } from '@/client/features/room/services/roomApiService';
import type { RoomDto } from '@/client/features/room/types';
import type { RoomOperationalStatus } from '@/client/features/room/types';
import {
  OPERATIONAL_LABELS,
  OPERATIONAL_STATUSES,
} from '@/client/features/room/utils/roomOperationalStatus';
import { getEffectiveOperationalStatus } from '@/client/features/room/utils/roomBlockEffectiveStatus';
import { isRoomApprovedForOperationalListing } from '@/client/features/room/utils/roomStatusPageBadge';
import { RoomStatusCard } from '../components/RoomStatusCard';
import { roomBlockService, type RoomBlockDto } from '../services/roomBlockService';
import { showToast } from '@/utils/toast';
import { getApiErrorMessage } from '@/utils/apiError';
import { useAuthStore } from '@/stores/authStore';
import { getRealmRolesFromAccessToken, normalizeRoleName } from '@/utils/keycloakTokenRoles';
import { fetchMyManagerScope } from '../services/hostStaffService';
import {
  hostPartnerApplicationService,
  type MyHostApplicationStatus,
} from '../services/hostPartnerApplicationService';

const FILTER_BG: Record<'all' | RoomOperationalStatus, string> = {
  all: 'bg-gray-50',
  READY: 'bg-green-50',
  IN_USE: 'bg-blue-50',
  CLEANING: 'bg-orange-50',
  MAINTENANCE: 'bg-red-50',
};

const FILTER_TEXT: Record<'all' | RoomOperationalStatus, string> = {
  all: 'text-gray-600',
  READY: 'text-green-600',
  IN_USE: 'text-blue-600',
  CLEANING: 'text-orange-600',
  MAINTENANCE: 'text-red-600',
};

export function RoomStatusPage() {
  const { profile, loading: profileLoading } = useProfile();
  const { selectedBranch } = useBranch();
  const accessToken = useAuthStore((s) => s.accessToken);
  const [hostApp, setHostApp] = useState<MyHostApplicationStatus | null | undefined>(undefined);

  const [rooms, setRooms] = useState<RoomDto[]>([]);
  const [roomBlocks, setRoomBlocks] = useState<RoomBlockDto[]>([]);
  /** Làm mới suy luận “đang trong lịch khóa” theo thời gian thực (mỗi phút). */
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [isLoading, setIsLoading] = useState(false);
  const [updatingIds, setUpdatingIds] = useState<Record<number, boolean>>({});
  const [filter, setFilter] = useState<'all' | RoomOperationalStatus>('all');

  const isHostPartner = profile?.role === 'host';
  const canManageRooms = isHostPartner || hostApp?.status === 'APPROVED';
  const isManagerOnly = useMemo(() => {
    const roles = getRealmRolesFromAccessToken(accessToken).map(normalizeRoleName);
    return roles.includes('MANAGER') && !roles.includes('HOST');
  }, [accessToken]);

  useEffect(() => {
    let cancelled = false;
    hostPartnerApplicationService
      .getMyStatus()
      .then((s) => {
        if (!cancelled) setHostApp(s);
      })
      .catch(() => {
        if (!cancelled) setHostApp(null);
      });
    return () => {
      cancelled = true;
    };
  }, [profile?.id]);

  const loadRooms = useCallback(async () => {
    setIsLoading(true);
    try {
      let roomList: RoomDto[] = [];
      if (isManagerOnly) {
        let branchId = selectedBranch?.id;
        if (branchId == null) {
          const scope = await fetchMyManagerScope().catch(() => ({ managerScoped: true, branchPropertyId: null }));
          branchId = scope.managerScoped ? (scope.branchPropertyId ?? undefined) : undefined;
        }
        if (branchId != null) {
          roomList = await roomApiService.getAll({ propertyId: branchId });
        }
      } else if (profile?.id) {
        roomList = await roomApiService.getAll({ ownerId: profile.id });
      }
      const [list, allBlocks] = await Promise.all([
        Promise.resolve(roomList),
        roomBlockService.listAll(),
      ]);
      const propertyIds = new Set(list.map((r) => r.propertyId));
      setRooms(list);
      setRoomBlocks(allBlocks.filter((b) => propertyIds.has(b.propertyId)));
    } catch {
      setRooms([]);
      setRoomBlocks([]);
      showToast.error('Không tải được danh sách phòng / lịch khóa.');
    } finally {
      setIsLoading(false);
    }
  }, [isManagerOnly, profile?.id, selectedBranch?.id]);

  useEffect(() => {
    if (profileLoading || hostApp === undefined) return;
    if (!canManageRooms) return;
    void loadRooms();
  }, [profileLoading, hostApp, canManageRooms, loadRooms]);

  useEffect(() => {
    const id = window.setInterval(() => setNowMs(Date.now()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  const branchFilteredRooms = useMemo(() => {
    if (!selectedBranch) return rooms;
    return rooms.filter((r) => r.propertyId === selectedBranch.id);
  }, [rooms, selectedBranch]);

  /** Phòng bị admin từ chối duyệt không hiển thị trên trang này. */
  const roomsOnStatusPage = useMemo(
    () => branchFilteredRooms.filter((r) => r.approvalStatus !== 'REJECTED'),
    [branchFilteredRooms]
  );

  /**
   * Lịch chặn:
   * - block theo cơ sở: `roomId = null` → áp dụng cho mọi phòng trong property.
   * - block theo phòng: `roomId = room.id` → áp dụng đúng phòng đó.
   */
  const blocksByRoomId = useMemo(() => {
    const m = new Map<number, RoomBlockDto[]>();
    for (const r of rooms) {
      const forRoom = roomBlocks.filter(
        (b) =>
          b.propertyId === r.propertyId &&
          (b.roomId == null || b.roomId === r.id),
      );
      m.set(r.id, forRoom);
    }
    return m;
  }, [roomBlocks, rooms]);

  const filteredRooms = useMemo(() => {
    if (filter === 'all') return roomsOnStatusPage;
    return roomsOnStatusPage.filter((r) => {
      if (!isRoomApprovedForOperationalListing(r)) return false;
      const { effective } = getEffectiveOperationalStatus(r, blocksByRoomId.get(r.id) ?? [], nowMs);
      return effective === filter;
    });
  }, [roomsOnStatusPage, filter, blocksByRoomId, nowMs]);

  const counts = useMemo(() => {
    const c = {
      all: roomsOnStatusPage.length,
      READY: 0,
      IN_USE: 0,
      CLEANING: 0,
      MAINTENANCE: 0,
    };
    roomsOnStatusPage.forEach((r) => {
      if (!isRoomApprovedForOperationalListing(r)) return;
      const { effective } = getEffectiveOperationalStatus(r, blocksByRoomId.get(r.id) ?? [], nowMs);
      c[effective]++;
    });
    return c;
  }, [roomsOnStatusPage, blocksByRoomId, nowMs]);

  const handleStatusChange = async (roomId: number, newStatus: RoomOperationalStatus) => {
    setUpdatingIds((prev) => ({ ...prev, [roomId]: true }));
    try {
      const updated = await roomApiService.patchStatus(roomId, newStatus);
      setRooms((prev) => prev.map((r) => (r.id === roomId ? updated : r)));
    } catch (e) {
      showToast.error(getApiErrorMessage(e, 'Không cập nhật được trạng thái phòng.'));
    } finally {
      setUpdatingIds((prev) => {
        const next = { ...prev };
        delete next[roomId];
        return next;
      });
    }
  };

  if (profileLoading || hostApp === undefined) {
    return (
      <RentalLayout title="Trạng thái phòng">
        <div className="flex min-h-[50vh] items-center justify-center p-8">
          <Loader2 className="h-10 w-10 animate-spin text-red-500" />
        </div>
      </RentalLayout>
    );
  }

  if (!canManageRooms) {
    return (
      <RentalLayout title="Trạng thái phòng">
        <div className="mx-auto max-w-lg p-8 text-center">
          <h1 className="mb-2 text-2xl font-black text-gray-900">Chưa có quyền quản lý</h1>
          <p className="mb-6 text-gray-600">
            Đăng ký đối tác đã duyệt hoặc đăng nhập tài khoản có role Host để cập nhật trạng thái phòng.
          </p>
          <Link
            to="/rental/register"
            className="inline-block rounded-2xl bg-gray-900 px-8 py-3 font-bold text-white hover:bg-red-500"
          >
            Đăng ký đối tác
          </Link>
        </div>
      </RentalLayout>
    );
  }

  const filterKeys: ('all' | RoomOperationalStatus)[] = ['all', ...OPERATIONAL_STATUSES];

  return (
    <RentalLayout title="Trạng thái phòng">
      <div className="p-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-black tracking-tight text-gray-900">Trạng thái phòng</h1>
            <p className="font-medium text-gray-500">
              Phòng <span className="font-semibold text-gray-700">bị admin từ chối duyệt</span> không hiển thị ở đây — xem
              tại <span className="font-semibold text-gray-700">Phòng của tôi</span>.{' '}
              <span className="font-semibold text-gray-700">Sẵn sàng · Đang có khách…</span> chỉ áp cho phòng{' '}
              <span className="font-semibold text-gray-700">đã duyệt</span>. Lịch{' '}
              <span className="font-semibold text-gray-700">khóa bảo trì</span> (Khóa phòng) ưu tiên hiện Bảo trì trong
              khung giờ.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void loadRooms()}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-xl bg-gray-100 px-6 py-3 font-bold text-gray-600 transition-all hover:bg-gray-200 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Làm mới
          </button>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {filterKeys.map((key) => {
            const label =
              key === 'all'
                ? 'Tất cả'
                : OPERATIONAL_LABELS[key];
            return (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                className={`rounded-2xl p-4 text-center transition-all ${
                  filter === key ? 'shadow-lg ring-2 ring-gray-900' : 'hover:shadow-md'
                } ${FILTER_BG[key]}`}
              >
                <div className={`text-2xl font-black ${FILTER_TEXT[key]}`}>{counts[key]}</div>
                <div className="mt-1 text-xs font-bold text-gray-500">{label}</div>
              </button>
            );
          })}
        </div>

        {isLoading && rooms.length === 0 ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-red-500" />
          </div>
        ) : filteredRooms.length === 0 ? (
          <p className="py-12 text-center text-gray-500">
            {branchFilteredRooms.length === 0
              ? 'Chưa có phòng nào — tạo phòng tại mục Phòng của tôi.'
              : roomsOnStatusPage.length === 0
                ? 'Phòng bị từ chối duyệt không hiển thị tại đây. Xem và chỉnh sửa tại Phòng của tôi.'
                : 'Không có phòng khớp bộ lọc.'}
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredRooms.map((room) => {
              const { effective } = getEffectiveOperationalStatus(
                room,
                blocksByRoomId.get(room.id) ?? [],
                nowMs
              );
              return (
                <RoomStatusCard
                  key={room.id}
                  room={room}
                  displayStatus={effective}
                  onStatusChange={handleStatusChange}
                  isUpdating={!!updatingIds[room.id]}
                />
              );
            })}
          </div>
        )}
      </div>
    </RentalLayout>
  );
}
