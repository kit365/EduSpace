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
import { propertyApiService } from '@/client/features/room/services/propertyApiService';
import type { PropertyDto, RoomDto, RoomScheduleDto, RoomScheduleSaveItem } from '@/client/features/room/types';
import { roomBlockService, type RoomBlockDto } from '../services/roomBlockService';
import { showToast } from '@/utils/toast';
import { getApiErrorMessage } from '@/utils/apiError';
import {
  Alert,
  AlertTitle,
  AlertDescription,
} from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

/** Quy ước DB: 2 = Thứ 2 … 7 = Thứ 7, 8 = Chủ nhật */
const DB_DAYS = [2, 3, 4, 5, 6, 7, 8] as const;

/** Một dòng cấu hình — dayOfWeek khớp DB: 2 = Thứ 2 … 8 = Chủ nhật */
export type DaySchedule = {
  dayOfWeek: number;
  isOpen: boolean;
  isOverDay: boolean;
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
    isOverDay: false,
    openTime: '07:00',
    closeTime: '22:00',
  }));
}

const OVER_DAY_OPEN_TIME = '00:00';
const OVER_DAY_CLOSE_TIME = '23:59';

/** Map từ API lịch cơ sở → 7 dòng state. */
function schedulesFromApiRows(rows: RoomScheduleDto[]): DaySchedule[] {
  if (rows && rows.length > 0) {
    return WEEKDAY_ROWS.map(({ dayOfWeek }) => {
      const r = rows.find((x) => x.dayOfWeek === dayOfWeek);
      const overDay = r ? Boolean(r.isOverDay) : false;
      const o = overDay
        ? (r?.openTime ? toTimeInput(r.openTime) : OVER_DAY_OPEN_TIME)
        : (r?.openTime ? toTimeInput(r.openTime) : '07:00');
      const c = overDay
        ? (r?.closeTime ? toTimeInput(r.closeTime) : OVER_DAY_CLOSE_TIME)
        : (r?.closeTime ? toTimeInput(r.closeTime) : '22:00');
      return {
        dayOfWeek,
        isOpen: r ? Boolean(r.isOpen) : true,
        isOverDay: overDay,
        openTime: o,
        closeTime: c,
      };
    });
  }
  return createDefaultSchedules();
}

/** Hàng hiển thị — lịch chặn theo cơ sở (property) */
type ScheduleBlockRow = {
  id: number;
  propertyId: number;
  roomId?: number | null;
  branchLabel: string;
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

/** Cờ 24/7: suy ra từ lịch tuần của cơ sở (room_schedules). */
function derive247Mode(rows: DaySchedule[]): boolean {
  return is247WeekPattern(rows);
}

function firstRoomInProperty(rooms: RoomDto[], propertyId: number): RoomDto | undefined {
  const inProp = rooms.filter((r) => r.propertyId === propertyId && !r.deletedAt);
  if (inProp.length === 0) return undefined;
  return [...inProp].sort((a, b) => a.id - b.id)[0];
}

/** datetime-local (YYYY-MM-DDTHH:mm) → ISO cho BE */
function toLocalDateTimeIso(dt: string): string {
  if (!dt) return '';
  return dt.length === 16 ? `${dt}:00` : dt;
}

function nowLocalInput(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

function addDaysLocalInput(dtLocal: string, days: number): string {
  const d = new Date(dtLocal);
  d.setDate(d.getDate() + days);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

function splitDateTime(dtLocal: string): { date: string; time: string } {
  const [date = '', time = ''] = dtLocal.split('T');
  return { date, time };
}

function joinDateTime(date: string, time: string): string {
  if (!date || !time) return '';
  return `${date}T${time}`;
}

function clampMinTime(time: string, minTime: string): string {
  if (!time || !minTime) return time;
  return time < minTime ? minTime : time;
}

function formatWeekdayDateVi(dateInput: string): string {
  if (!dateInput) return '';
  const parts = dateInput.split('-');
  if (parts.length !== 3) return '';
  const [yyyy, mm, dd] = parts.map((p) => Number(p));
  if (!yyyy || !mm || !dd) return '';
  const date = new Date(yyyy, mm - 1, dd);
  const weekdayVi = ['chủ nhật', 'thứ 2', 'thứ 3', 'thứ 4', 'thứ 5', 'thứ 6', 'thứ 7'][date.getDay()] ?? '';
  const ddText = String(dd).padStart(2, '0');
  const mmText = String(mm).padStart(2, '0');
  return `${weekdayVi} (${ddText}/${mmText}/${yyyy})`;
}

function apiBlockToRow(block: RoomBlockDto, branchNameByPropertyId: Map<number, string>): ScheduleBlockRow {
  return {
    id: block.id,
    propertyId: block.propertyId,
    branchLabel:
      branchNameByPropertyId.get(block.propertyId) ?? `Chi nhánh #${block.propertyId}`,
    roomId: block.roomId ?? null,
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

function SchedulePageContent() {
  const { profile, loading: profileLoading } = useProfile();
  const { selectedBranch, branches } = useBranch();

  const [properties, setProperties] = useState<PropertyDto[]>([]);
  const [rooms, setRooms] = useState<RoomDto[]>([]);
  const [blocks, setBlocks] = useState<ScheduleBlockRow[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [roomsError, setRoomsError] = useState<string | null>(null);

  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);
  const [schedules, setSchedules] = useState<DaySchedule[]>(() => createDefaultSchedules());
  /** Phút nghỉ giữa các khung giờ liên tiếp (dọn phòng / buffer) — lưu theo cơ sở. */
  const [bufferMinutes, setBufferMinutes] = useState(0);
  /** Bật: khóa chỉnh từng ngày; chỉ khi Lưu mới gửi 00:00–23:59 cho cả tuần (không đổi state schedules lúc bật). */
  const [is247Mode, setIs247Mode] = useState(false);

  const [showBlockForm, setShowBlockForm] = useState(false);
  const [newBlock, setNewBlock] = useState({
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    reason: '',
  });
  const [blockScope, setBlockScope] = useState<'PROPERTY' | 'ROOM'>('PROPERTY');
  const [selectedBlockRoomId, setSelectedBlockRoomId] = useState<number | null>(null);
  const [blockToDelete, setBlockToDelete] = useState<number | null>(null);
  const [blockSubmitting, setBlockSubmitting] = useState(false);

  const filteredProperties = useMemo(() => {
    // properties state is already resolved for current host in loadRoomsAndBlocks()
    // via room ownership fallback (see below), so avoid strict ownerId equality here.
    if (selectedBranch == null) return properties;
    return properties.filter((p) => p.id === selectedBranch.id);
  }, [properties, selectedBranch]);

  const propertyOptions = useMemo(() => {
    if (filteredProperties.length > 0) {
      return filteredProperties.map((p) => ({ id: p.id, name: p.name }));
    }
    // Fallback: BranchContext list (user-facing "danh sách chi nhánh của bạn") may be available
    // while room/property owner identifiers are temporarily inconsistent.
    const dedup = new Map<number, string>();
    branches.forEach((b) => {
      if (b?.id != null && !dedup.has(b.id)) dedup.set(b.id, b.name);
    });
    // Hard fallback: if manager scope resolved selectedBranch but branches list is
    // temporarily empty, still render exactly that branch in selector.
    if (dedup.size === 0 && selectedBranch?.id != null) {
      dedup.set(selectedBranch.id, selectedBranch.name);
    }
    return Array.from(dedup.entries()).map(([id, name]) => ({ id, name }));
  }, [filteredProperties, branches, selectedBranch]);

  /** Lịch chặn theo cơ sở: chọn cơ sở → xem danh sách chặn của cơ sở đó. */
  const blocksForSelectedProperty = useMemo(() => {
    if (selectedPropertyId == null) return [];
    return blocks.filter((b) => b.propertyId === selectedPropertyId);
  }, [blocks, selectedPropertyId]);

  const roomsForSelectedProperty = useMemo(() => {
    if (selectedPropertyId == null) return [];
    return rooms.filter((r) => r.propertyId === selectedPropertyId);
  }, [rooms, selectedPropertyId]);

  const loadRoomsAndBlocks = useCallback(async () => {
    const ownerIds = Array.from(
      new Set(
        [profile?.id, profile?.keycloakId]
          .map((v) => (v ?? '').trim())
          .filter((v) => v.length > 0),
      ),
    );
    if (ownerIds.length === 0) {
      setProperties([]);
      setRooms([]);
      setBlocks([]);
      return;
    }
    setLoadingRooms(true);
    setRoomsError(null);
    try {
      const [propList, ...roomListsByOwner] = await Promise.all([
        propertyApiService.getAll(),
        ...ownerIds.map((oid) => roomApiService.getAll({ ownerId: oid })),
      ]);
      const roomMap = new Map<number, RoomDto>();
      roomListsByOwner.forEach((list) => {
        (Array.isArray(list) ? list : []).forEach((r) => roomMap.set(r.id, r));
      });
      const roomsNorm = Array.from(roomMap.values());
      const propsNorm = Array.isArray(propList) ? propList : [];
      // Owner identifiers can drift across environments (userId vs keycloakId in legacy rows).
      // Build property candidates from actual owned rooms first, then fallback to ownerId match.
      const propertyIdsFromRooms = new Set(roomsNorm.map((r) => r.propertyId));
      const ownerIdSet = new Set(ownerIds);
      const ownedProperties = propsNorm.filter(
        (p) => propertyIdsFromRooms.has(p.id) || ownerIdSet.has((p.ownerId ?? '').trim()),
      );
      setProperties(ownedProperties);
      setRooms(roomsNorm);
      const propertyIds = new Set(roomsNorm.map((r) => r.propertyId));
      propsNorm
        .filter((p) => ownerIdSet.has((p.ownerId ?? '').trim()))
        .forEach((p) => propertyIds.add(p.id));
      // Manager accounts can be scoped to a branch without owning rooms/ownerId rows.
      // Include scoped/fallback branch ids so newly created blocks don't disappear.
      branches.forEach((b) => {
        if (b?.id != null) propertyIds.add(b.id);
      });
      if (selectedBranch?.id != null) propertyIds.add(selectedBranch.id);
      if (selectedPropertyId != null) propertyIds.add(selectedPropertyId);
      const branchNameByPropertyId = new Map(branches.map((br) => [br.id, br.name] as const));
      const allBlocks = await roomBlockService.listAll();
      const mine = allBlocks.filter((b) => propertyIds.has(b.propertyId));
      setBlocks(mine.map((b) => apiBlockToRow(b, branchNameByPropertyId)));
    } catch {
      setRoomsError('Không tải được danh sách chi nhánh hoặc lịch chặn. Thử lại sau.');
      setProperties([]);
      setRooms([]);
      setBlocks([]);
    } finally {
      setLoadingRooms(false);
    }
  }, [profile?.id, profile?.keycloakId, branches, selectedBranch, selectedPropertyId]);

  useEffect(() => {
    void loadRoomsAndBlocks();
  }, [loadRoomsAndBlocks]);

  useEffect(() => {
    if (selectedPropertyId == null) return;
    // Keep selection aligned with what the branch dropdown can actually render.
    // `propertyOptions` may include BranchContext fallback entries even when
    // `filteredProperties` is temporarily empty.
    const ok = propertyOptions.some((p) => p.id === selectedPropertyId);
    if (!ok) setSelectedPropertyId(null);
  }, [propertyOptions, selectedPropertyId]);

  useEffect(() => {
    if (!selectedBranch) return;
    const branchId = selectedBranch.id;
    if (selectedPropertyId === branchId) return;
    const existsInOptions = propertyOptions.some((p) => p.id === branchId);
    if (existsInOptions) {
      setSelectedPropertyId(branchId);
    }
  }, [selectedBranch, selectedPropertyId, propertyOptions]);

  useEffect(() => {
    if (selectedPropertyId == null) setShowBlockForm(false);
  }, [selectedPropertyId]);

  useEffect(() => {
    if (selectedPropertyId == null) {
      setBlockScope('PROPERTY');
      setSelectedBlockRoomId(null);
      return;
    }
    if (blockScope === 'PROPERTY') {
      setSelectedBlockRoomId(null);
      return;
    }
    // blockScope === 'ROOM'
    const first = roomsForSelectedProperty[0]?.id ?? null;
    if (selectedBlockRoomId == null || !roomsForSelectedProperty.some((r) => r.id === selectedBlockRoomId)) {
      setSelectedBlockRoomId(first);
    }
  }, [selectedPropertyId, roomsForSelectedProperty, blockScope, selectedBlockRoomId]);

  const uid = profile?.id?.trim();
  useEffect(() => {
    if (selectedPropertyId == null || !uid) {
      setSchedules(createDefaultSchedules());
      setBufferMinutes(0);
      setIs247Mode(false);
      setHasExistingScheduleData(false);
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const bundle = await propertyApiService.getSchedules(selectedPropertyId, uid);
        if (cancelled) return;
        const next = schedulesFromApiRows(bundle.schedules);
        setSchedules(next);
        setBufferMinutes(Number.isFinite(bundle.bufferMinutes) ? bundle.bufferMinutes : 0);
        setIs247Mode(derive247Mode(next));
        setHasExistingScheduleData(Array.isArray(bundle.schedules) && bundle.schedules.length > 0);
      } catch {
        if (!cancelled) {
          setSchedules(createDefaultSchedules());
          setBufferMinutes(0);
          setIs247Mode(false);
          setHasExistingScheduleData(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedPropertyId, uid, rooms]);

  const selectedProperty = useMemo(
    () =>
      selectedPropertyId != null ? propertyOptions.find((p) => p.id === selectedPropertyId) : undefined,
    [propertyOptions, selectedPropertyId],
  );

  const [savedFlash, setSavedFlash] = useState(false);
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [hasExistingScheduleData, setHasExistingScheduleData] = useState(false);
  const [nowTick, setNowTick] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNowTick(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, []);
  const startNowMin = useMemo(() => nowLocalInput(), [nowTick]);
  const startNowMinParts = useMemo(() => splitDateTime(startNowMin), [startNowMin]);
  const startDateTimeValue = useMemo(
    () => joinDateTime(newBlock.startDate, newBlock.startTime),
    [newBlock.startDate, newBlock.startTime],
  );
  const endMinDateTimeValue = useMemo(() => {
    const base = startDateTimeValue || startNowMin;
    const d = new Date(base);
    d.setMinutes(d.getMinutes() + 30);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mi = String(d.getMinutes()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
  }, [startDateTimeValue, startNowMin]);
  const endMinParts = useMemo(() => splitDateTime(endMinDateTimeValue), [endMinDateTimeValue]);

  const updateDaySchedule = useCallback((dayOfWeek: number, patch: Partial<DaySchedule>) => {
    if (is247Mode) return;
    setSchedules((prev) =>
      prev.map((s) => {
        if (s.dayOfWeek !== dayOfWeek) return s;
        const next = { ...s, ...patch };
        if (patch.isOverDay === true) {
          next.openTime = OVER_DAY_OPEN_TIME;
          next.closeTime = OVER_DAY_CLOSE_TIME;
        }
        return next;
      }),
    );
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
    if (selectedPropertyId == null) {
      showToast.error('Chọn chi nhánh trước khi lưu.');
      return;
    }
    if (!selectedProperty) {
      showToast.error('Không tìm thấy chi nhánh đã chọn.');
      return;
    }
    if (!uid) {
      showToast.error('Không xác định được tài khoản host.');
      return;
    }
    setSavingSchedule(true);
    try {
      const items: RoomScheduleSaveItem[] = schedules.map((s) => {
        const effectiveIsOverDay = is247Mode ? true : Boolean(s.isOverDay);
        const overDayOpen = toLocalTime(OVER_DAY_OPEN_TIME);
        const overDayClose = toLocalTime(OVER_DAY_CLOSE_TIME);
        return {
          dayOfWeek: s.dayOfWeek,
          isOpen: s.isOpen,
          isOverDay: effectiveIsOverDay,
          openTime: s.isOpen
            ? (effectiveIsOverDay ? overDayOpen : toLocalTime(s.openTime))
            : null,
          closeTime: s.isOpen
            ? (effectiveIsOverDay ? overDayClose : toLocalTime(s.closeTime))
            : null,
        };
      });
      const propertyId = selectedPropertyId;
      const scheduleRows = await propertyApiService.putSchedules(propertyId, uid, {
        bufferMinutes,
        isOverDay: false,
        schedules: items,
      });
      setRooms((prev) =>
        prev.map((r) => {
          if (r.propertyId !== propertyId) return r;
          return {
            ...r,
            schedules: scheduleRows.schedules,
            scheduleBufferMinutes: scheduleRows.bufferMinutes,
            scheduleIsOverDay: scheduleRows.isOverDay,
          };
        }),
      );
      showToast.success('Đã lưu lịch & giờ hoạt động.');
      setHasExistingScheduleData(true);
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 2500);
    } catch (error) {
      showToast.error(getApiErrorMessage(error, 'Không lưu được. Thử lại sau.'));
    } finally {
      setSavingSchedule(false);
    }
  };

  const submitBlock = async () => {
    const startDt = joinDateTime(newBlock.startDate, newBlock.startTime);
    const endDt = joinDateTime(newBlock.endDate, newBlock.endTime);
    if (!startDt || !endDt) return;
    const startMs = new Date(startDt).getTime();
    const endMs = new Date(endDt).getTime();
    const nowMs = Date.now();
    if (startMs < nowMs) {
      showToast.error('Thời gian bắt đầu phải từ hiện tại trở đi.');
      return;
    }
    if (endMs < startMs + 30 * 60 * 1000) {
      showToast.error('Thời gian kết thúc phải cách thời gian bắt đầu ít nhất 30 phút.');
      return;
    }
    if (selectedPropertyId == null) {
      showToast.error('Chọn chi nhánh ở card “Chọn chi nhánh” phía trên để gắn lịch chặn.');
      return;
    }
    if (blockScope === 'ROOM' && selectedBlockRoomId == null) {
      showToast.error('Vui lòng chọn phòng (room id) để chặn.');
      return;
    }
    if (!uid) {
      showToast.error('Không xác định được tài khoản host.');
      return;
    }
    setBlockSubmitting(true);
    try {
      const pid = selectedPropertyId;
      await roomBlockService.create({
        propertyId: pid,
        roomId: blockScope === 'ROOM' ? selectedBlockRoomId : null,
        startDatetime: toLocalDateTimeIso(startDt),
        endDatetime: toLocalDateTimeIso(endDt),
        reason: newBlock.reason.trim() || null,
        blockType: 'MAINTENANCE',
        createdBy: uid,
      });
      setNewBlock({ startDate: '', startTime: '', endDate: '', endTime: '', reason: '' });
      setShowBlockForm(false);
      showToast.success('Đã thêm lịch chặn.');
      await loadRoomsAndBlocks();
    } catch (error) {
      showToast.error(getApiErrorMessage(error, 'Không tạo được lịch chặn.'));
    } finally {
      setBlockSubmitting(false);
    }
  };

  const handleUnlockBlock = (id: number) => {
    setBlockToDelete(id);
  };

  const confirmUnlockBlock = async () => {
    if (blockToDelete == null) return;
    try {
      const target = blocks.find((b) => b.id === blockToDelete);
      await roomBlockService.remove(blockToDelete);
      if (target?.roomId != null) {
        try {
          const updated = await roomApiService.patchStatus(target.roomId, 'READY');
          setRooms((prev) => prev.map((r) => (r.id === target.roomId ? updated : r)));
        } catch {
          // Unlock should still succeed even if status fallback fails.
        }
      }
      showToast.success('Đã xóa lịch chặn.');
      setBlockToDelete(null);
      await loadRoomsAndBlocks();
    } catch (error) {
      showToast.error(getApiErrorMessage(error, 'Không xóa được lịch chặn.'));
    }
  };

  const showScheduleForm = selectedPropertyId != null && selectedProperty != null;
  const noPropertiesInScope =
    !profileLoading && !loadingRooms && Boolean(profile?.id) && propertyOptions.length === 0;
  const canSave = showScheduleForm && !savingSchedule;
  const saveActionLabel = hasExistingScheduleData ? 'Cập nhật lịch' : 'Tạo lịch';

  return (
      <div className="p-8 max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Lịch &amp; Giờ hoạt động</h1>
            <p className="text-gray-500 font-medium text-sm max-w-xl">
              Giờ mở cửa được lưu <span className="font-semibold text-gray-700">theo chi nhánh</span> — chọn chi nhánh
              để chỉnh lịch. Cờ 24/7 đồng bộ lên một phòng đại diện trong chi nhánh (nếu đã có phòng).
              Quy ước ngày trong DB: 2–7 = Thứ 2–Thứ 7, <span className="font-semibold text-gray-700">8 = Chủ nhật</span>.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center text-violet-600 shrink-0">
                <DoorOpen className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h2 className="font-black text-gray-900 text-lg">Chọn chi nhánh</h2>
                <p className="text-xs text-gray-400 font-medium truncate">
                  {selectedBranch
                    ? `Chi nhánh: ${selectedBranch.name}`
                    : 'Tất cả chi nhánh — chọn chi nhánh trong danh sách của bạn'}
                </p>
              </div>
            </div>
            <div className="w-full sm:w-80 shrink-0">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
                Chi nhánh cần cài đặt
              </label>
              {profileLoading || loadingRooms ? (
                <div className="flex items-center gap-2 text-gray-500 font-medium text-sm py-3">
                  <Loader2 className="w-5 h-5 animate-spin shrink-0" />
                  {profileLoading ? 'Đang tải tài khoản…' : 'Đang tải danh sách chi nhánh…'}
                </div>
              ) : (
                <select
                  value={selectedPropertyId ?? ''}
                  onChange={(e) => {
                    const v = e.target.value;
                    setSelectedPropertyId(v === '' ? null : Number(v));
                  }}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl font-bold text-gray-900 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition-all"
                >
                  <option value="">— Chọn chi nhánh —</option>
                  {propertyOptions.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
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
            <p className="text-sm text-gray-500">Đăng nhập tài khoản host để tải danh sách chi nhánh.</p>
          </div>
        )}

        {noPropertiesInScope && !loadingRooms && (
          <div className="rounded-3xl border border-dashed border-gray-200 bg-gray-50/80 p-10 text-center mb-8">
            <p className="text-gray-700 font-bold mb-2">
              {selectedBranch
                ? `Chưa có chi nhánh nào thuộc bộ lọc “${selectedBranch.name}”.`
                : 'Bạn chưa có chi nhánh nào để cài đặt lịch giờ.'}
            </p>
            <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
              Hãy tạo chi nhánh trước — sau đó bạn cấu hình giờ mở cửa tại đây.
            </p>
            <Link
              to="/rental/branches"
              className="inline-flex items-center justify-center px-6 py-3 rounded-2xl bg-gray-900 text-white font-black text-sm hover:bg-red-500 transition-colors"
            >
              Đến Chi nhánh
            </Link>
          </div>
        )}

        {!noPropertiesInScope && !loadingRooms && selectedPropertyId == null && (
          <div className="rounded-3xl border border-amber-100 bg-amber-50/90 p-6 mb-8 flex gap-3 text-left">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-900">Chọn một chi nhánh ở ô phía trên</p>
              <p className="text-sm text-amber-800/90 mt-1">
                Chọn chi nhánh để chỉnh giờ mở cửa và lịch chặn (theo chi nhánh).
              </p>
            </div>
          </div>
        )}

        {showScheduleForm && selectedProperty && (
          <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm mb-8">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                  <CalendarDays className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-black text-gray-900 text-lg">Giờ mở cửa theo từng ngày</h2>
                  <p className="text-xs text-gray-400 font-medium">
                    Đang chỉnh: <span className="text-gray-600 font-bold">{selectedProperty.name}</span>
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
                        ? 'Tắt để chỉnh từng ngày. 24/7 sẽ được lưu dưới dạng isOverDay=true cho các ngày đang mở.'
                        : 'Bật để khóa chỉnh từng ngày; khi Lưu sẽ áp isOverDay=true (không đổi bật/tắt từng ngày).'
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
                      Đang bật 24/7: bạn vẫn có thể bật/tắt từng ngày. Bấm{' '}
                      <span className="font-semibold text-gray-600">Lưu thay đổi</span> để hệ thống áp{' '}
                      <span className="font-semibold text-gray-600">isOverDay=true</span> cho tất cả room_schedule.
                    </>
                  ) : (
                    <>
                      Bật 24/7 rồi <span className="font-semibold text-gray-600">Lưu</span> — áp{' '}
                      <span className="font-semibold text-gray-600">isOverDay=true</span> cho lịch cả tuần.
                    </>
                  )}
                </p>
              </div>
            </div>

            <div className="mb-6 rounded-2xl border border-gray-100 bg-gray-50/40 p-4 sm:p-5">
              <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3">Cài đặt khung giờ (slot)</p>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  Buffer giữa các slot (phút)
                </label>
                <p className="text-[11px] text-gray-500 mb-2">
                  Khoảng cách giữa hai slot liên tiếp — dùng khi tạo khung giờ (ví dụ dọn phòng cho lượt đặt sau).
                </p>
                <input
                  type="number"
                  min={0}
                  max={1440}
                  value={bufferMinutes}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setBufferMinutes(Number.isFinite(v) ? Math.max(0, Math.min(1440, Math.floor(v))) : 0);
                  }}
                  className="w-full max-w-[12rem] px-3 py-2.5 bg-white border border-gray-200 rounded-xl font-bold text-sm text-gray-900 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-gray-50/40 overflow-hidden divide-y divide-gray-100">
              {schedules.map((row) => {
                const label = WEEKDAY_ROWS.find((w) => w.dayOfWeek === row.dayOfWeek)?.label ?? '';
                const isMonday = row.dayOfWeek === 2;
                const showDayOn = row.isOpen;
                const effectiveIsOverDay = is247Mode || Boolean(row.isOverDay);
                const showAllDayOn = effectiveIsOverDay;
                return (
                  <div
                    key={row.dayOfWeek}
                    className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 px-4 py-4 sm:px-5 bg-white"
                  >
                    <div className="flex items-center gap-3 min-w-0 shrink-0">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={showDayOn}
                        disabled={false}
                        onClick={() => updateDaySchedule(row.dayOfWeek, { isOpen: !row.isOpen })}
                        className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
                          showDayOn ? 'bg-emerald-500' : 'bg-gray-300'
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
                            disabled={false}
                            onClick={copyMondayToAllDays}
                            title="Sao chép giờ Thứ 2 cho tất cả các ngày"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:border-red-200 hover:bg-red-50 hover:text-red-500 transition-colors"
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
                        !row.isOpen ? 'opacity-50 pointer-events-none' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2 mr-1">
                        <span className="text-xs font-semibold text-gray-500 whitespace-nowrap">Cả ngày</span>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={showAllDayOn}
                          disabled={is247Mode || !row.isOpen}
                          onClick={() => updateDaySchedule(row.dayOfWeek, { isOverDay: !row.isOverDay })}
                          className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
                            showAllDayOn
                              ? 'bg-violet-500'
                              : !row.isOpen
                              ? 'bg-gray-200 cursor-not-allowed'
                              : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                              showAllDayOn ? 'translate-x-5' : ''
                            }`}
                          />
                        </button>
                      </div>
                      <>
                      <input
                        type="time"
                        value={effectiveIsOverDay ? OVER_DAY_OPEN_TIME : row.openTime}
                        onChange={(e) => {
                          if (effectiveIsOverDay) return;
                          updateDaySchedule(row.dayOfWeek, { openTime: e.target.value });
                        }}
                        disabled={!row.isOpen || effectiveIsOverDay}
                        className="min-w-[7.5rem] px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold text-sm text-gray-900 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none disabled:cursor-not-allowed"
                      />
                      <span className="text-xs font-bold text-gray-400">đến</span>
                      <ArrowRight className="hidden sm:block w-4 h-4 text-gray-300 shrink-0" />
                      <input
                        type="time"
                        value={effectiveIsOverDay ? OVER_DAY_CLOSE_TIME : row.closeTime}
                        onChange={(e) => {
                          if (effectiveIsOverDay) return;
                          updateDaySchedule(row.dayOfWeek, { closeTime: e.target.value });
                        }}
                        disabled={!row.isOpen || effectiveIsOverDay}
                        className="min-w-[7.5rem] px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold text-sm text-gray-900 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none disabled:cursor-not-allowed"
                      />
                      </>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                disabled={!canSave}
                onClick={() => void handleSaveClick()}
                className={`shrink-0 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-black shadow-lg transition-all active:scale-[0.98] w-full sm:w-auto disabled:opacity-40 disabled:pointer-events-none ${
                  savedFlash ? 'bg-emerald-500 text-white' : 'bg-gray-900 text-white hover:bg-red-500'
                }`}
              >
                {savingSchedule ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                {savedFlash ? 'Đã lưu' : savingSchedule ? 'Đang lưu…' : saveActionLabel}
              </button>
            </div>
          </div>
        )}

        {!noPropertiesInScope && (
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
                disabled={!selectedPropertyId}
                title={!selectedPropertyId ? 'Chọn chi nhánh trước khi thêm lịch chặn' : undefined}
                onClick={() => selectedPropertyId && setShowBlockForm(!showBlockForm)}
                className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-500 rounded-xl font-bold hover:bg-red-100 transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
              >
                <Plus className="w-4 h-4" /> Thêm khoảng chặn
              </button>
            </div>

            {showBlockForm && (
              <div className="bg-gray-50 rounded-2xl p-6 mb-6 animate-in slide-in-from-top duration-300">
                <Alert className="mb-6 border-amber-200 bg-amber-50/50">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <AlertTitle className="text-amber-900 font-black">Lưu ý về khoảng chặn</AlertTitle>
                  <AlertDescription className="text-amber-800 font-medium">
                    Thời gian bắt đầu chỉ được chọn từ hiện tại trở đi. Thời gian kết thúc phải cách bắt đầu{' '}
                    <span className="font-bold">ít nhất 30 phút</span>.
                  </AlertDescription>
                </Alert>
                  <div className="mb-4">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                      Phạm vi chặn lịch
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setBlockScope('PROPERTY');
                          setSelectedBlockRoomId(null);
                        }}
                        disabled={blockSubmitting}
                        className={`px-4 py-3 rounded-xl border text-left font-bold transition-all ${
                          blockScope === 'PROPERTY'
                            ? 'bg-red-50 border-red-200 text-red-700'
                            : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        Chặn theo cơ sở (tất cả phòng)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setBlockScope('ROOM');
                        }}
                        disabled={blockSubmitting || roomsForSelectedProperty.length === 0}
                        className={`px-4 py-3 rounded-xl border text-left font-bold transition-all ${
                          blockScope === 'ROOM'
                            ? 'bg-red-50 border-red-200 text-red-700'
                            : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        Chặn theo phòng (của cơ sở này)
                      </button>
                    </div>

                    {blockScope === 'ROOM' ? (
                      <div className="mt-3 rounded-xl border border-gray-200 bg-white p-4">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                          Chọn phòng (room id)
                        </label>
                        <select
                          value={selectedBlockRoomId ?? ''}
                          onChange={(e) => setSelectedBlockRoomId(Number(e.target.value))}
                          disabled={blockSubmitting || roomsForSelectedProperty.length === 0}
                          className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold text-sm text-gray-900 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none disabled:opacity-50"
                        >
                          {roomsForSelectedProperty.length === 0 ? (
                            <option value="">Chưa có phòng trong cơ sở này</option>
                          ) : (
                            roomsForSelectedProperty.map((r) => (
                              <option key={r.id} value={r.id}>
                                {r.id}
                              </option>
                            ))
                          )}
                        </select>
                      </div>
                    ) : null}
                  </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="rounded-xl border border-gray-200 bg-white p-4">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                      Từ (ngày &amp; giờ)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <input
                          type="date"
                          value={newBlock.startDate}
                          min={startNowMinParts.date}
                          onChange={(e) =>
                            setNewBlock((p) => {
                              const nextDate = e.target.value;
                              const minStartTime = nextDate === startNowMinParts.date ? startNowMinParts.time : '';
                              const nextStartTime = clampMinTime(p.startTime, minStartTime);
                              return { ...p, startDate: nextDate, startTime: nextStartTime };
                            })
                          }
                          disabled={blockSubmitting}
                          className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold text-sm text-gray-900 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none disabled:opacity-50"
                        />
                        {newBlock.startDate ? (
                          <p className="mt-1 text-[11px] font-semibold text-gray-500">
                            {formatWeekdayDateVi(newBlock.startDate)}
                          </p>
                        ) : null}
                      </div>
                      <input
                        type="time"
                        value={newBlock.startTime}
                        min={newBlock.startDate === startNowMinParts.date ? startNowMinParts.time : undefined}
                        onChange={(e) =>
                          setNewBlock((p) => {
                            const minStartTime = p.startDate === startNowMinParts.date ? startNowMinParts.time : '';
                            const nextStartTime = clampMinTime(e.target.value, minStartTime);
                            return { ...p, startTime: nextStartTime };
                          })
                        }
                        disabled={blockSubmitting}
                        className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold text-sm text-gray-900 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none disabled:opacity-50"
                      />
                    </div>
                  </div>
                  <div className="rounded-xl border border-gray-200 bg-white p-4">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                      Đến (ngày &amp; giờ)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <input
                          type="date"
                          value={newBlock.endDate}
                          min={endMinParts.date}
                          onChange={(e) => setNewBlock((p) => ({ ...p, endDate: e.target.value }))}
                          disabled={blockSubmitting}
                          className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold text-sm text-gray-900 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none disabled:opacity-50"
                        />
                        {newBlock.endDate ? (
                          <p className="mt-1 text-[11px] font-semibold text-gray-500">
                            {formatWeekdayDateVi(newBlock.endDate)}
                          </p>
                        ) : null}
                      </div>
                      <input
                        type="time"
                        value={newBlock.endTime}
                        min={newBlock.endDate === endMinParts.date ? endMinParts.time : undefined}
                        onChange={(e) => setNewBlock((p) => ({ ...p, endTime: e.target.value }))}
                        disabled={blockSubmitting}
                        className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold text-sm text-gray-900 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none disabled:opacity-50"
                      />
                    </div>
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
                {!selectedPropertyId && (
                  <p className="text-xs text-amber-800 font-medium bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 mb-4">
                    Chọn chi nhánh ở card &quot;Chọn chi nhánh&quot; phía trên để thêm lịch chặn.
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => void submitBlock()}
                  disabled={
                    blockSubmitting ||
                    !selectedPropertyId ||
                    (blockScope === 'ROOM' && selectedBlockRoomId == null)
                  }
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-red-500 transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
                >
                  {blockSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Xác nhận
                </button>
              </div>
            )}

            <div className="overflow-x-auto border border-gray-100 rounded-3xl bg-white shadow-sm overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                    <TableHead className="font-black text-[10px] text-gray-400 uppercase tracking-widest pl-8 h-12">Khoảng thời gian</TableHead>
                    <TableHead className="font-black text-[10px] text-gray-400 uppercase tracking-widest h-12">Chi nhánh</TableHead>
                    <TableHead className="font-black text-[10px] text-gray-400 uppercase tracking-widest h-12">Lý do</TableHead>
                    <TableHead className="font-black text-[10px] text-gray-400 uppercase tracking-widest text-right pr-8 h-12">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {blocksForSelectedProperty.map((b) => (
                    <TableRow key={b.id} className="group hover:bg-white transition-colors border-gray-100">
                      <TableCell className="pl-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center text-red-500 shrink-0">
                            <AlertCircle className="w-4 h-4" />
                          </div>
                          <span className="font-bold text-gray-900 text-sm">{formatBlockedRangeVi(b.startDatetime, b.endDatetime)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-black text-xs px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg">
                          {b.branchLabel}
                          {b.roomId != null ? ` • Phòng #${b.roomId}` : ''}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-gray-500 font-bold text-sm">{b.reason}</span>
                      </TableCell>
                      <TableCell className="text-right pr-8">
                        <button
                          type="button"
                          onClick={() => void handleUnlockBlock(b.id)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-red-600 font-bold text-xs border border-red-100 bg-red-50/50 hover:bg-red-500 hover:text-white transition-all shadow-sm active:scale-95"
                        >
                          <Unlock className="w-3.5 h-3.5" />
                          Mở khóa
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!loadingRooms && blocksForSelectedProperty.length === 0 && (
                    <TableRow className="hover:bg-transparent">
                      <TableCell colSpan={4} className="text-center py-16">
                        <div className="flex flex-col items-center gap-2">
                           <CalendarOff className="w-8 h-8 text-gray-200" />
                           <p className="text-gray-400 font-bold text-sm">
                            {selectedPropertyId == null
                              ? 'Chọn chi nhánh ở ô phía trên để xem lịch chặn.'
                              : 'Chưa có khoảng chặn nào được thiết lập.'}
                           </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        <AlertDialog open={blockToDelete !== null} onOpenChange={(open) => !open && setBlockToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="font-black text-gray-900">Xác nhận mở khóa</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-500 font-medium">
                Khoảng chặn này sẽ bị xóa và lịch phòng sẽ được mở lại bình thường. Bạn có chắc chắn muốn tiếp tục?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-xl font-bold">Hủy</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => void confirmUnlockBlock()}
                className="bg-red-500 text-white hover:bg-red-600 rounded-xl font-bold"
              >
                Mở khóa ngay
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
  );
}

export function SchedulePage() {
  return (
    <RentalLayout title="Lịch & Giờ hoạt động">
      <SchedulePageContent />
    </RentalLayout>
  );
}
