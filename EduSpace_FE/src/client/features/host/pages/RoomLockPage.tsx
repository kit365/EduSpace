import { useCallback, useEffect, useMemo, useState } from 'react';
import { CalendarClock, Lock, Unlock, Wrench, Loader2 } from 'lucide-react';
import { RentalLayout } from '../../../layouts/RentalLayout';
import { useBranch } from '../context/BranchContext';
import { showToast } from '@/utils/toast';
import { getApiErrorMessage } from '@/utils/apiError';
import { profileService } from '@/client/features/customer/profile/services/profileService';
import { roomApiService } from '@/client/features/room/services/roomApiService';
import type { RoomDto } from '@/client/features/room/types';
import { roomBlockService, type RoomBlockDto } from '../services/roomBlockService';

type RoomOption = { id: number; name: string; branchId: number };

type RoomBlockRow = {
  id: number;
  propertyId: number;
  branchLabel: string;
  startDatetime: string;
  endDatetime: string;
  reason: string;
};

function toDatetimeLocalValue(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** datetime-local (YYYY-MM-DDTHH:mm) → ISO LocalDateTime cho backend */
function toLocalDateTimeIso(dt: string): string {
  if (!dt) return '';
  return dt.length === 16 ? `${dt}:00` : dt;
}

function apiBlockToRow(block: RoomBlockDto, branchNameByPropertyId: Map<number, string>): RoomBlockRow {
  return {
    id: block.id,
    propertyId: block.propertyId,
    branchLabel:
      branchNameByPropertyId.get(block.propertyId) ?? `Cơ sở #${block.propertyId}`,
    startDatetime: block.startDatetime,
    endDatetime: block.endDatetime,
    reason: (block.reason && block.reason.trim()) || '—',
  };
}

function blockStatusLabel(end: string): { label: string; className: string } {
  const endAt = new Date(end);
  const past = endAt.getTime() < Date.now();
  if (past) {
    return { label: 'Đã qua', className: 'bg-gray-100 text-gray-600' };
  }
  return { label: 'Đang khóa', className: 'bg-red-50 text-red-700' };
}

function formatRangeVi(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  const opt: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };
  return `${s.toLocaleString('vi-VN', opt)} → ${e.toLocaleString('vi-VN', opt)}`;
}

export function RoomLockPage() {
  const { selectedBranch, branches } = useBranch();

  const [rooms, setRooms] = useState<RoomDto[]>([]);
  const [blocks, setBlocks] = useState<RoomBlockRow[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const roomOptions: RoomOption[] = useMemo(
    () =>
      rooms.map((r) => ({
        id: r.id,
        name: r.name,
        branchId: r.propertyId,
      })),
    [rooms],
  );

  const visibleRooms = useMemo(() => {
    if (!selectedBranch) return roomOptions;
    return roomOptions.filter((r) => r.branchId === selectedBranch.id);
  }, [roomOptions, selectedBranch]);

  const loadData = useCallback(async () => {
    setLoadingData(true);
    try {
      const profile = await profileService.getProfile();
      if (!profile?.id) {
        setRooms([]);
        setBlocks([]);
        return;
      }
      const roomList = await roomApiService.getAll({ ownerId: profile.id });
      setRooms(roomList);
      const propertyIds = new Set(roomList.map((r) => r.propertyId));
      const branchNameByPropertyId = new Map(branches.map((br) => [br.id, br.name] as const));
      const allBlocks = await roomBlockService.listAll();
      const mine = allBlocks.filter((b) => propertyIds.has(b.propertyId));
      setBlocks(mine.map((b) => apiBlockToRow(b, branchNameByPropertyId)));
    } catch (error) {
      setRooms([]);
      setBlocks([]);
      showToast.error(getApiErrorMessage(error, 'Không tải được dữ liệu khóa phòng.'));
    } finally {
      setLoadingData(false);
    }
  }, [branches]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const [roomId, setRoomId] = useState<number>(0);
  const [startDt, setStartDt] = useState('');
  const [endDt, setEndDt] = useState('');
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (visibleRooms.length === 0) {
      setRoomId(0);
      return;
    }
    if (!visibleRooms.some((r) => r.id === roomId)) {
      setRoomId(visibleRooms[0].id);
    }
  }, [visibleRooms, roomId]);

  const filteredBlocks = useMemo(() => {
    if (!selectedBranch) return blocks;
    const pids = new Set(visibleRooms.map((r) => r.branchId));
    return blocks.filter((b) => pids.has(b.propertyId));
  }, [blocks, selectedBranch, visibleRooms]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomId) {
      showToast.error('Vui lòng chọn phòng.');
      return;
    }
    if (!startDt || !endDt) {
      showToast.error('Vui lòng chọn đủ thời gian bắt đầu và kết thúc.');
      return;
    }
    if (new Date(startDt).getTime() >= new Date(endDt).getTime()) {
      showToast.error('Thời gian kết thúc phải sau thời gian bắt đầu.');
      return;
    }
    const profile = await profileService.getProfile();
    if (!profile?.id) {
      showToast.error('Không xác định được tài khoản host.');
      return;
    }
    const propertyId = roomOptions.find((r) => r.id === roomId)?.branchId;
    if (!propertyId) {
      showToast.error('Không xác định được cơ sở.');
      return;
    }
    setSubmitting(true);
    try {
      await roomBlockService.create({
        propertyId,
        startDatetime: toLocalDateTimeIso(startDt),
        endDatetime: toLocalDateTimeIso(endDt),
        reason: reason.trim() || null,
        blockType: 'MAINTENANCE',
        createdBy: profile.id,
      });
      setReason('');
      showToast.success('Đã thêm lịch khóa phòng.');
      await loadData();
    } catch (error) {
      showToast.error(getApiErrorMessage(error, 'Không tạo được lịch khóa.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnlock = async (id: number) => {
    if (!window.confirm('Mở khóa và xóa lịch chặn này?')) return;
    try {
      await roomBlockService.remove(id);
      showToast.success('Đã xóa lịch khóa.');
      await loadData();
    } catch (error) {
      showToast.error(getApiErrorMessage(error, 'Không xóa được lịch khóa.'));
    }
  };

  return (
    <RentalLayout title="Khóa phòng">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Khóa lịch phòng</h1>
          <p className="text-gray-500 font-medium text-base max-w-2xl">
            Chủ động chặn đặt phòng khi bảo trì, hỏng thiết bị hoặc bạn tự sử dụng phòng. Dữ liệu lấy từ{' '}
            <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">room_blocks</code> (room-service).
          </p>
        </div>

        {loadingData && (
          <div className="flex items-center gap-2 text-gray-500 font-medium">
            <Loader2 className="w-5 h-5 animate-spin text-red-500" />
            Đang tải phòng và lịch khóa…
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-red-50 text-red-500">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-900 tracking-tight">Khóa phòng / Bảo trì</h2>
                <p className="text-sm text-gray-500 font-medium">Thiết lập khoảng thời gian phòng không nhận đặt</p>
              </div>
            </div>

            <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-0.5">Chọn phòng</label>
                <select
                  value={roomId || ''}
                  onChange={(e) => setRoomId(Number(e.target.value))}
                  disabled={loadingData || visibleRooms.length === 0}
                  className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50/80 text-gray-900 font-semibold focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all appearance-none disabled:opacity-50"
                >
                  {visibleRooms.length === 0 ? (
                    <option value="">
                      {loadingData ? 'Đang tải…' : 'Không có phòng (thêm phòng hoặc chọn chi nhánh khác)'}
                    </option>
                  ) : (
                    visibleRooms.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-0.5 flex items-center gap-2">
                    <CalendarClock className="w-4 h-4 text-red-400" /> Bắt đầu
                  </label>
                  <input
                    type="datetime-local"
                    value={startDt}
                    onChange={(e) => setStartDt(e.target.value)}
                    disabled={submitting}
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white text-gray-900 font-medium focus:border-red-500 focus:ring-2 focus:ring-red-100"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-0.5 flex items-center gap-2">
                    <CalendarClock className="w-4 h-4 text-red-400" /> Kết thúc
                  </label>
                  <input
                    type="datetime-local"
                    value={endDt}
                    onChange={(e) => setEndDt(e.target.value)}
                    disabled={submitting}
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white text-gray-900 font-medium focus:border-red-500 focus:ring-2 focus:ring-red-100"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-0.5">Lý do</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={4}
                  placeholder="Ví dụ: Hỏng điều hòa, Sơn lại tường, Họp nội bộ..."
                  disabled={submitting}
                  className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 font-medium resize-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                />
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="submit"
                  disabled={visibleRooms.length === 0 || submitting || loadingData}
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition-all shadow-md shadow-red-100 disabled:opacity-40 disabled:grayscale"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wrench className="w-4 h-4" />}
                  Khóa phòng
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStartDt('');
                    setEndDt('');
                    setReason('');
                  }}
                  disabled={submitting}
                  className="inline-flex items-center justify-center px-6 py-3.5 rounded-full border border-gray-200 bg-white text-gray-700 font-bold text-sm hover:bg-gray-50 transition-all"
                >
                  Xóa nhập
                </button>
              </div>
            </form>
          </section>

          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8 xl:min-h-[480px]">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-gray-100 text-gray-700">
                <CalendarClock className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-900 tracking-tight">Lịch đang khóa</h2>
                <p className="text-sm text-gray-500 font-medium">Theo chi nhánh đang chọn (nếu có)</p>
              </div>
            </div>

            {filteredBlocks.length === 0 ? (
              <div className="text-center py-16 rounded-xl border border-dashed border-gray-200 bg-gray-50/50">
                <p className="text-gray-500 font-medium">{loadingData ? 'Đang tải…' : 'Chưa có lịch khóa nào.'}</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="w-full text-sm min-w-[640px]">
                  <thead>
                    <tr className="bg-gray-50/90 text-left text-xs font-black uppercase tracking-wider text-gray-400">
                      <th className="px-4 py-3.5 rounded-tl-xl">Phòng</th>
                      <th className="px-4 py-3.5 min-w-[220px]">Thời gian</th>
                      <th className="px-4 py-3.5">Lý do</th>
                      <th className="px-4 py-3.5">Trạng thái</th>
                      <th className="px-4 py-3.5 text-right rounded-tr-xl">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredBlocks.map((row) => {
                      const st = blockStatusLabel(row.endDatetime);
                      return (
                        <tr key={row.id} className="hover:bg-gray-50/80 transition-colors">
                          <td className="px-4 py-4 font-bold text-gray-900">{row.branchLabel}</td>
                          <td className="px-4 py-4 text-gray-600 font-medium whitespace-nowrap">
                            {formatRangeVi(row.startDatetime, row.endDatetime)}
                          </td>
                          <td className="px-4 py-4 text-gray-600 max-w-[200px] truncate" title={row.reason}>
                            {row.reason}
                          </td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-black ${st.className}`}>
                              {st.label}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <button
                              type="button"
                              onClick={() => void handleUnlock(row.id)}
                              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-red-600 font-bold text-xs border border-red-100 bg-red-50/50 hover:bg-red-100/80 transition-all"
                            >
                              <Unlock className="w-3.5 h-3.5" />
                              Mở khóa
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </div>
    </RentalLayout>
  );
}
