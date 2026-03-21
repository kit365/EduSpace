import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarOff,
  Plus,
  Unlock,
  Save,
  AlertCircle,
  CalendarDays,
  Loader2,
  DoorOpen,
  ArrowRight,
  Copy,
} from 'lucide-react';
import { RentalLayout } from '../../../layouts/RentalLayout';
import { useBranch } from '../context/BranchContext';
import { useProfile } from '../../customer/profile/hooks/useProfile';
import { roomApiService } from '@/client/features/room/services/roomApiService';
import type { RoomDto, RoomScheduleSaveItem } from '@/client/features/room/types';
import { roomBlockService, type RoomBlockDto } from '../services/roomBlockService';
import { showToast } from '@/utils/toast';
import { getApiErrorMessage } from '@/utils/apiError';

/** Quy ước DB: 2 = Thứ 2 … 7 = Thứ 7, 8 = Chủ nhật */
const DB_DAYS = [2, 3, 4, 5, 6, 7, 8] as const;

/** Một dòng cấu hình — dayOfWeek khớp DB: 2 = Thứ 2 … 8 = Chủ nhật */
export type DaySchedule = {
  dayOfWeek: number;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
};

const WEEKDAY_ROWS: { dayOfWeek: (typeof DB_DAYS)[number]; label: string }[] = [
  { dayOfWeek: 2, label: 'Thứ 2' },
  { dayOfWeek: 3, label: 'Thứ 3' },
  { dayOfWeek: 4, label: 'Thứ 4' },
  { dayOfWeek: 5, label: 'Thứ 5' },
  { dayOfWeek: 6, label: 'Thứ 6' },
  { dayOfWeek: 7, label: 'Thứ 7' },
  { dayOfWeek: 8, label: 'Chủ nhật' },
];

function createDefaultSchedules(): DaySchedule[] {
  return WEEKDAY_ROWS.map(({ dayOfWeek }) => ({
    dayOfWeek,
    isOpen: true,
    openTime: '07:00',
    closeTime: '22:00',
  }));
}

/** Map từ RoomDto.schedules (API) → 7 dòng state. */
function roomToSchedules(room: RoomDto): DaySchedule[] {
  const rows = room.schedules;
  if (rows && rows.length > 0) {
    return WEEKDAY_ROWS.map(({ dayOfWeek }) => {
      const r = rows.find((x) => x.dayOfWeek === dayOfWeek);
      const o = r?.openTime ? toTimeInput(r.openTime) : '07:00';
      const c = r?.closeTime ? toTimeInput(r.closeTime) : '22:00';
      return {
        dayOfWeek,
        isOpen: r ? Boolean(r.isOpen) : true,
        openTime: o,
        closeTime: c,
      };
    });
  }
  return createDefaultSchedules();
}

/** Hàng hiển thị — khớp room_blocks + tên phòng */
type ScheduleBlockRow = {
  id: number;
  roomId: number;
  roomName: string;
  startDatetime: string;
  endDatetime: string;
  reason: string;
};

function toTimeInput(t?: string | null): string {
  if (!t?.trim()) return '';
  const m = /^(\d{1,2}):(\d{2})/.exec(t.trim());
  if (!m) return '';
  return `${m[1].padStart(2, '0')}:${m[2]}`;
}

/** HH:mm → HH:mm:ss cho API */
function toLocalTime(hhmm: string): string {
  const s = hhmm.trim();
  if (/^\d{1,2}:\d{2}$/.test(s)) {
    const [h, m] = s.split(':');
    return `${h.padStart(2, '0')}:${m.padStart(2, '0')}:00`;
  }
  if (s.split(':').length === 3) return s;
  return `${s}:00`;
}

/** So khớp pattern 24/7 với BE (00:00 → 23:59, cả 7 ngày mở). */
function normalizeTimeForCompare(hhmm: string): string {
  const m = /^(\d{1,2}):(\d{2})/.exec(hhmm.trim());
  if (!m) return '';
  return `${m[1].padStart(2, '0')}:${m[2]}`;
}

function is247WeekPattern(rows: DaySchedule[]): boolean {
  return (
    rows.length === 7 &&
    rows.every(
      (s) =>
        s.isOpen &&
        normalizeTimeForCompare(s.openTime) === '00:00' &&
        normalizeTimeForCompare(s.closeTime) === '23:59',
    )
  );
}

/** Phòng đang ở chế độ 24/7 (cờ BE hoặc 7 ngày đều 00:00–23:59). */
function derive247ModeFromRoom(room: RoomDto, rows: DaySchedule[]): boolean {
  if (room.is24_7) return true;
  return is247WeekPattern(rows);
}

/** datetime-local (YYYY-MM-DDTHH:mm) → ISO cho BE */
function toLocalDateTimeIso(dt: string): string {
  if (!dt) return '';
  return dt.length === 16 ? `${dt}:00` : dt;
}

function apiBlockToRow(block: RoomBlockDto, roomNameById: Map<number, string>): ScheduleBlockRow {
  return {
    id: block.id,
    roomId: block.roomId,
    roomName: roomNameById.get(block.roomId) ?? `Phòng #${block.roomId}`,
    startDatetime: block.startDatetime,
    endDatetime: block.endDatetime,
    reason: (block.reason && block.reason.trim()) || '—',
  };
}

/** Hiển thị khoảng chặn (có thể khác ngày) */
function formatBlockedRangeVi(start: string, end: string): string {
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

export function SchedulePage() {
  const { profile, loading: profileLoading } = useProfile();
  const { selectedBranch } = useBranch();

  const [rooms, setRooms] = useState<RoomDto[]>([]);
  const [blocks, setBlocks] = useState<ScheduleBlockRow[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [roomsError, setRoomsError] = useState<string | null>(null);

  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [schedules, setSchedules] = useState<DaySchedule[]>(() => createDefaultSchedules());
  /** Bật: khóa chỉnh từng ngày; chỉ khi Lưu mới gửi 00:00–23:59 cho cả tuần (không đổi state schedules lúc bật). */
  const [is247Mode, setIs247Mode] = useState(false);

  const [showBlockForm, setShowBlockForm] = useState(false);
  const [newBlock, setNewBlock] = useState({ startDt: '', endDt: '', reason: '' });
  const [blockSubmitting, setBlockSubmitting] = useState(false);

  const filteredRooms = useMemo(() => {
    const active = rooms.filter((r) => !r.deletedAt);
    if (selectedBranch == null) return active;
    return active.filter((r) => r.propertyId === selectedBranch.id);
  }, [rooms, selectedBranch]);

  /** Chỉ hiển thị lịch chặn khi đã chọn phòng — không gộp tất cả phòng trong chi nhánh. */
  const blocksForSelectedRoom = useMemo(() => {
    if (selectedRoomId == null) return [];
    return blocks.filter((b) => b.roomId === selectedRoomId);
  }, [blocks, selectedRoomId]);

  const loadRoomsAndBlocks = useCallback(async () => {
    const ownerId = profile?.id?.trim();
    if (!ownerId) {
      setRooms([]);
      setBlocks([]);
      return;
    }
    setLoadingRooms(true);
    setRoomsError(null);
    try {
      const list = await roomApiService.getAll({ ownerId });
      const roomList = Array.isArray(list) ? list : [];
      setRooms(roomList);
      const roomIds = new Set(roomList.map((r) => r.id));
      const nameById = new Map(roomList.map((r) => [r.id, r.name] as const));
      const allBlocks = await roomBlockService.listAll();
      const mine = allBlocks.filter((b) => roomIds.has(b.roomId));
      setBlocks(mine.map((b) => apiBlockToRow(b, nameById)));
    } catch {
      setRoomsError('Không tải được danh sách phòng hoặc lịch chặn. Thử lại sau.');
      setRooms([]);
      setBlocks([]);
    } finally {
      setLoadingRooms(false);
    }
  }, [profile?.id]);

  useEffect(() => {
    void loadRoomsAndBlocks();
  }, [loadRoomsAndBlocks]);

  useEffect(() => {
    if (selectedRoomId == null) return;
    const ok = filteredRooms.some((r) => r.id === selectedRoomId);
    if (!ok) setSelectedRoomId(null);
  }, [filteredRooms, selectedRoomId]);

  useEffect(() => {
    if (selectedRoomId == null) setShowBlockForm(false);
  }, [selectedRoomId]);

  useEffect(() => {
    if (selectedRoomId == null) return;
    const room = filteredRooms.find((r) => r.id === selectedRoomId);
    if (!room) return;
    const next = roomToSchedules(room);
    setSchedules(next);
    setIs247Mode(derive247ModeFromRoom(room, next));
  }, [selectedRoomId, filteredRooms]);

  const selectedRoom = useMemo(
    () => (selectedRoomId != null ? filteredRooms.find((r) => r.id === selectedRoomId) : undefined),
    [filteredRooms, selectedRoomId],
  );

  const [savedFlash, setSavedFlash] = useState(false);
  const [savingSchedule, setSavingSchedule] = useState(false);

  const updateDaySchedule = useCallback((dayOfWeek: number, patch: Partial<DaySchedule>) => {
    if (is247Mode) return;
    setSchedules((prev) => prev.map((s) => (s.dayOfWeek === dayOfWeek ? { ...s, ...patch } : s)));
  }, [is247Mode]);

  /** Sao chép giờ & trạng thái mở của Thứ 2 sang cả tuần */
  const copyMondayToAllDays = useCallback(() => {
    if (is247Mode) return;
    setSchedules((prev) => {
      const mon = prev.find((s) => s.dayOfWeek === 2);
      if (!mon) return prev;
      return prev.map((s) => ({
        ...s,
        isOpen: mon.isOpen,
        openTime: mon.openTime,
        closeTime: mon.closeTime,
      }));
    });
  }, [is247Mode]);

  const toggle247Master = useCallback(() => {
    setIs247Mode((v) => !v);
  }, []);

  const handleSaveClick = async () => {
    if (selectedRoomId == null) {
      showToast.error('Chọn phòng trước khi lưu.');
      return;
    }
    const uid = profile?.id?.trim();
    if (!uid) {
      showToast.error('Không xác định được tài khoản host.');
      return;
    }
    setSavingSchedule(true);
    try {
      const items: RoomScheduleSaveItem[] = is247Mode
        ? DB_DAYS.map((dayOfWeek) => ({
            dayOfWeek,
            isOpen: true,
            openTime: toLocalTime('00:00'),
            closeTime: toLocalTime('23:59'),
          }))
        : schedules.map((s) => ({
            dayOfWeek: s.dayOfWeek,
            isOpen: s.isOpen,
            openTime: s.isOpen ? toLocalTime(s.openTime) : null,
            closeTime: s.isOpen ? toLocalTime(s.closeTime) : null,
          }));
      const updated = await roomApiService.putSchedules(selectedRoomId, uid, items);
      const is247 = is247Mode;
      let merged: RoomDto = updated;
      let synced247 = true;
      try {
        merged = await roomApiService.update(selectedRoomId, { is24_7: is247 });
      } catch {
        synced247 = false;
      }
      setRooms((prev) => prev.map((r) => (r.id === merged.id ? merged : r)));
      if (synced247) {
        showToast.success('Đã lưu lịch & giờ hoạt động.');
      } else {
        showToast.error('Đã lưu lịch nhưng không cập nhật được cờ 24/7. Thử bấm Lưu lại.');
      }
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 2500);
    } catch (error) {
      showToast.error(getApiErrorMessage(error, 'Không lưu được. Thử lại sau.'));
    } finally {
      setSavingSchedule(false);
    }
  };

  const submitBlock = async () => {
    if (!newBlock.startDt || !newBlock.endDt) return;
    if (new Date(newBlock.startDt).getTime() >= new Date(newBlock.endDt).getTime()) {
      window.alert('Thời gian kết thúc phải sau thời gian bắt đầu (có thể khác ngày).');
      return;
    }
    if (!selectedRoomId) {
      showToast.error('Chọn phòng ở card “Chọn phòng” phía trên để gắn lịch chặn.');
      return;
    }
    const uid = profile?.id?.trim();
    if (!uid) {
      showToast.error('Không xác định được tài khoản host.');
      return;
    }
    setBlockSubmitting(true);
    try {
      await roomBlockService.create({
        roomId: selectedRoomId,
        startDatetime: toLocalDateTimeIso(newBlock.startDt),
        endDatetime: toLocalDateTimeIso(newBlock.endDt),
        reason: newBlock.reason.trim() || null,
        blockType: 'MAINTENANCE',
        createdBy: uid,
      });
      setNewBlock({ startDt: '', endDt: '', reason: '' });
      setShowBlockForm(false);
      showToast.success('Đã thêm lịch chặn.');
      await loadRoomsAndBlocks();
    } catch (error) {
      showToast.error(getApiErrorMessage(error, 'Không tạo được lịch chặn.'));
    } finally {
      setBlockSubmitting(false);
    }
  };

  const handleUnlockBlock = async (id: number) => {
    if (!window.confirm('Mở khóa và xóa khoảng chặn này?')) return;
    try {
      await roomBlockService.remove(id);
      showToast.success('Đã xóa lịch chặn.');
      await loadRoomsAndBlocks();
    } catch (error) {
      showToast.error(getApiErrorMessage(error, 'Không xóa được lịch chặn.'));
    }
  };

  const showScheduleForm = selectedRoomId != null && selectedRoom != null;
  const noRoomsInScope =
    !profileLoading && !loadingRooms && Boolean(profile?.id) && filteredRooms.length === 0;
  const canSave = showScheduleForm && !savingSchedule;

  return (
    <RentalLayout title="Lịch & Giờ hoạt động">
      <div className="p-8 max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Lịch &amp; Giờ hoạt động</h1>
            <p className="text-gray-500 font-medium text-sm max-w-xl">
              Lịch và giờ mở cửa được lưu <span className="font-semibold text-gray-700">theo từng phòng</span>. Chọn phòng
              bên dưới — quy ước ngày trong DB: 2–7 = Thứ 2–Thứ 7,{' '}
              <span className="font-semibold text-gray-700">8 = Chủ nhật</span>.
            </p>
          </div>
          <button
            type="button"
            disabled={!canSave}
            onClick={() => void handleSaveClick()}
            className={`shrink-0 flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-black shadow-lg transition-all active:scale-[0.98] w-full sm:w-auto disabled:opacity-40 disabled:pointer-events-none ${
              savedFlash ? 'bg-emerald-500 text-white' : 'bg-gray-900 text-white hover:bg-red-500'
            }`}
          >
            {savingSchedule ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {savedFlash ? 'Đã lưu' : savingSchedule ? 'Đang lưu…' : 'Lưu thay đổi'}
          </button>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center text-violet-600 shrink-0">
                <DoorOpen className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h2 className="font-black text-gray-900 text-lg">Chọn phòng</h2>
                <p className="text-xs text-gray-400 font-medium truncate">
                  {selectedBranch
                    ? `Chi nhánh: ${selectedBranch.name}`
                    : 'Tất cả chi nhánh — chọn phòng trong danh sách của bạn'}
                </p>
              </div>
            </div>
            <div className="w-full sm:w-80 shrink-0">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
                Phòng cần cài đặt
              </label>
              {profileLoading || loadingRooms ? (
                <div className="flex items-center gap-2 text-gray-500 font-medium text-sm py-3">
                  <Loader2 className="w-5 h-5 animate-spin shrink-0" />
                  {profileLoading ? 'Đang tải tài khoản…' : 'Đang tải danh sách phòng…'}
                </div>
              ) : (
                <select
                  value={selectedRoomId ?? ''}
                  onChange={(e) => {
                    const v = e.target.value;
                    setSelectedRoomId(v === '' ? null : Number(v));
                  }}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl font-bold text-gray-900 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition-all"
                >
                  <option value="">— Chọn phòng —</option>
                  {filteredRooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
          {roomsError && <p className="mt-4 text-sm text-red-600 font-medium">{roomsError}</p>}
        </div>

        {!profileLoading && !profile?.id && (
          <div className="rounded-3xl border border-gray-200 bg-white p-8 text-center mb-8">
            <p className="text-gray-700 font-bold mb-2">Cần đăng nhập để quản lý lịch phòng</p>
            <p className="text-sm text-gray-500">Đăng nhập tài khoản host để tải danh sách phòng.</p>
          </div>
        )}

        {noRoomsInScope && !loadingRooms && (
          <div className="rounded-3xl border border-dashed border-gray-200 bg-gray-50/80 p-10 text-center mb-8">
            <p className="text-gray-700 font-bold mb-2">
              {selectedBranch
                ? `Chưa có phòng nào thuộc chi nhánh “${selectedBranch.name}”.`
                : 'Bạn chưa có phòng nào để cài đặt lịch giờ.'}
            </p>
            <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
              Hãy đăng phòng trước — lịch &amp; giờ hoạt động gắn với từng phòng trong hệ thống.
            </p>
            <Link
              to="/rental/spaces"
              className="inline-flex items-center justify-center px-6 py-3 rounded-2xl bg-gray-900 text-white font-black text-sm hover:bg-red-500 transition-colors"
            >
              Đến Phòng của tôi
            </Link>
          </div>
        )}

        {!noRoomsInScope && !loadingRooms && selectedRoomId == null && (
          <div className="rounded-3xl border border-amber-100 bg-amber-50/90 p-6 mb-8 flex gap-3 text-left">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-900">Chọn một phòng ở ô phía trên</p>
              <p className="text-sm text-amber-800/90 mt-1">
                Cài đặt lịch và giờ chỉ áp dụng khi đã chọn phòng — tránh nhầm với dữ liệu tổng hợp chi nhánh.
              </p>
            </div>
          </div>
        )}

        {showScheduleForm && selectedRoom && (
          <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm mb-8">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                  <CalendarDays className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-black text-gray-900 text-lg">Giờ mở cửa theo từng ngày</h2>
                  <p className="text-xs text-gray-400 font-medium">
                    Đang chỉnh: <span className="text-gray-600 font-bold">{selectedRoom.name}</span>
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-stretch sm:items-end gap-2 shrink-0">
                <div className="flex items-center gap-3 justify-end">
                  <span className="text-sm font-bold text-gray-700 whitespace-nowrap">Mở cửa 24/7</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={is247Mode}
                    title={
                      is247Mode
                        ? 'Tắt để chỉnh giờ từng ngày. Giờ 24/7 chỉ được ghi khi bấm Lưu.'
                        : 'Bật để tạm khóa lịch theo ngày; bấm Lưu để ghi 00:00–23:59 cả tuần.'
                    }
                    onClick={toggle247Master}
                    className={`relative w-14 h-8 rounded-full transition-colors shrink-0 ${
                      is247Mode ? 'bg-emerald-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow transition-transform ${
                        is247Mode ? 'translate-x-6' : ''
                      }`}
                    />
                  </button>
                </div>
                <p className="text-[11px] text-gray-400 font-medium text-right max-w-[280px]">
                  {is247Mode ? (
                    <>
                      Đang bật 24/7: lịch theo ngày tạm khóa. Bấm{' '}
                      <span className="font-semibold text-gray-600">Lưu thay đổi</span> để hệ thống ghi 00:00–23:59 cho
                      Thứ 2–Chủ nhật.
                    </>
                  ) : (
                    <>
                      Bật 24/7 rồi <span className="font-semibold text-gray-600">Lưu</span> — đồng bộ cờ phòng &amp; lịch
                      cả tuần.
                    </>
                  )}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-gray-50/40 overflow-hidden divide-y divide-gray-100">
              {schedules.map((row) => {
                const label = WEEKDAY_ROWS.find((w) => w.dayOfWeek === row.dayOfWeek)?.label ?? '';
                const isMonday = row.dayOfWeek === 2;
                const rowLocked = is247Mode;
                const showDayOn = rowLocked ? false : row.isOpen;
                return (
                  <div
                    key={row.dayOfWeek}
                    className={`flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 px-4 py-4 sm:px-5 bg-white ${
                      rowLocked ? 'opacity-60' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 shrink-0">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={showDayOn}
                        disabled={rowLocked}
                        onClick={() => updateDaySchedule(row.dayOfWeek, { isOpen: !row.isOpen })}
                        className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
                          rowLocked ? 'bg-gray-200 cursor-not-allowed' : showDayOn ? 'bg-emerald-500' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                            showDayOn ? 'translate-x-5' : ''
                          }`}
                        />
                      </button>
                      <div className="flex items-center gap-2 min-w-[140px] sm:min-w-[160px]">
                        {isMonday && (
                          <button
                            type="button"
                            disabled={rowLocked}
                            onClick={copyMondayToAllDays}
                            title="Sao chép giờ Thứ 2 cho tất cả các ngày"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:border-red-200 hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-40 disabled:pointer-events-none"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                        )}
                        {!isMonday && <span className="inline-block w-8 shrink-0" aria-hidden />}
                        <span
                          className={`text-sm tracking-tight ${
                            showDayOn ? 'font-bold text-gray-900' : 'font-medium text-gray-400'
                          }`}
                        >
                          {label}
                        </span>
                      </div>
                    </div>

                    <div
                      className={`flex flex-wrap items-center gap-2 sm:gap-3 flex-1 sm:justify-end ${
                        !rowLocked && !row.isOpen ? 'opacity-50 pointer-events-none' : ''
                      }`}
                    >
                      <input
                        type="time"
                        value={row.openTime}
                        onChange={(e) => updateDaySchedule(row.dayOfWeek, { openTime: e.target.value })}
                        disabled={rowLocked || !row.isOpen}
                        className="min-w-[7.5rem] px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold text-sm text-gray-900 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none disabled:cursor-not-allowed"
                      />
                      <span className="text-xs font-bold text-gray-400">đến</span>
                      <ArrowRight className="hidden sm:block w-4 h-4 text-gray-300 shrink-0" />
                      <input
                        type="time"
                        value={row.closeTime}
                        onChange={(e) => updateDaySchedule(row.dayOfWeek, { closeTime: e.target.value })}
                        disabled={rowLocked || !row.isOpen}
                        className="min-w-[7.5rem] px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold text-sm text-gray-900 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {!noRoomsInScope && (
          <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-500">
                  <CalendarOff className="w-5 h-5" />
                </div>
                <h2 className="font-black text-gray-900 text-lg">Chặn lịch</h2>
              </div>
              <button
                type="button"
                disabled={!selectedRoomId}
                title={!selectedRoomId ? 'Chọn phòng trước khi thêm lịch chặn' : undefined}
                onClick={() => selectedRoomId && setShowBlockForm(!showBlockForm)}
                className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-500 rounded-xl font-bold hover:bg-red-100 transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
              >
                <Plus className="w-4 h-4" /> Thêm khoảng chặn
              </button>
            </div>

            {showBlockForm && (
              <div className="bg-gray-50 rounded-2xl p-6 mb-6 animate-in slide-in-from-top duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
                      Từ (ngày &amp; giờ)
                    </label>
                    <input
                      type="datetime-local"
                      value={newBlock.startDt}
                      onChange={(e) => setNewBlock((p) => ({ ...p, startDt: e.target.value }))}
                      disabled={blockSubmitting}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl font-bold text-sm text-gray-900 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
                      Đến (ngày &amp; giờ)
                    </label>
                    <input
                      type="datetime-local"
                      value={newBlock.endDt}
                      onChange={(e) => setNewBlock((p) => ({ ...p, endDt: e.target.value }))}
                      disabled={blockSubmitting}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl font-bold text-sm text-gray-900 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none disabled:opacity-50"
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Lý do</label>
                  <input
                    type="text"
                    value={newBlock.reason}
                    onChange={(e) => setNewBlock((p) => ({ ...p, reason: e.target.value }))}
                    placeholder="VD: Bảo trì"
                    disabled={blockSubmitting}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl font-bold text-sm text-gray-900 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none disabled:opacity-50"
                  />
                </div>
                {!selectedRoomId && (
                  <p className="text-xs text-amber-800 font-medium bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 mb-4">
                    Chọn phòng ở card &quot;Chọn phòng&quot; phía trên để thêm lịch chặn.
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => void submitBlock()}
                  disabled={blockSubmitting || !selectedRoomId}
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-red-500 transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
                >
                  {blockSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Xác nhận
                </button>
              </div>
            )}

            <div className="space-y-3">
              {blocksForSelectedRoom.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between gap-3 p-4 bg-red-50/50 border border-red-100 rounded-2xl flex-wrap sm:flex-nowrap"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="font-bold text-gray-900 text-sm break-words">
                        {formatBlockedRangeVi(b.startDatetime, b.endDatetime)}
                      </p>
                      <p className="text-xs text-gray-500 font-medium mt-0.5 break-words">
                        <span className="font-semibold text-gray-600">{b.roomName}</span>
                        {' · '}
                        {b.reason}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => void handleUnlockBlock(b.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-red-600 font-bold text-xs border border-red-100 bg-red-50/50 hover:bg-red-100/80 transition-all shrink-0"
                  >
                    <Unlock className="w-3.5 h-3.5" />
                    Mở khóa
                  </button>
                </div>
              ))}
              {!loadingRooms && blocksForSelectedRoom.length === 0 && (
                <div className="text-center py-8 text-gray-400 font-medium">
                  {selectedRoomId == null
                    ? 'Chọn phòng ở ô phía trên để xem lịch chặn của phòng đó.'
                    : 'Chưa có khoảng chặn nào'}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </RentalLayout>
  );
}
