import { useEffect, useMemo, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Star, Clock, Calendar as CalendarIcon, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { formatCurrency } from '../../../../../utils';

import { ReservationSchedule, RoomPriceRule, SpaceAmenity } from '@/types/space';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { roomApiService } from '@/client/features/room/services/roomApiService';
import type { AmenityDto } from '@/client/features/room/types';
import { showToast } from '@/utils/toast';
import { getApiErrorMessage } from '@/utils/apiError';

interface BookingPanelProps {
  roomId: number;
  price: number;
  rating: number;
  reviewCount: number;
  spaceName: string;
  spaceImage: string;
  capacity?: number;
  schedules?: ReservationSchedule[];
  priceRules?: RoomPriceRule[];
  amenities?: SpaceAmenity[];
  minDuration?: number;
  stepUnit?: number;
  selectedDate?: string;
  onSelectedDateChange?: (value: string) => void;
  duration?: number;
  onDurationChange?: (value: number) => void;
}

function parseMinutes(hhmm: string): number {

  const [h, m] = hhmm.split(':').map((v) => parseInt(v, 10));
  return h * 60 + m;
}

function dateToYmd(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function ymdToDate(ymd: string): Date {
  const [y, m, d] = ymd.split('-').map((v) => parseInt(v, 10));
  return new Date(y, m - 1, d);
}

function minutesToHm(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function hmToHourMinuteLabel(hhmm: string): string {
  // Requirement: hiển thị dạng "9h01", "9h02" (không phải "09:01")
  const parts = hhmm.split(':');
  if (parts.length !== 2) return hhmm;
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return hhmm;
  return `${h}h${String(m).padStart(2, '0')}`;
}

function formatDurationUi(durationMinutes: number): string {
  // Requirement: nếu đang ở 60p thì hiển thị thành "1 giờ".
  if (!Number.isFinite(durationMinutes) || durationMinutes < 0) return '0 phút';
  if (durationMinutes % 60 === 0) return `${durationMinutes / 60} giờ`;
  const h = Math.floor(durationMinutes / 60);
  const m = durationMinutes % 60;
  return `${h} giờ ${m}p`;
}

export function BookingPanel({
  roomId,
  price,
  rating,
  reviewCount,
  spaceName,
  spaceImage,
  capacity = 100,
  schedules = [],
  priceRules = [],
  amenities = [],
  minDuration = 60,
  stepUnit = 30,
  selectedDate: selectedDateProp,
  onSelectedDateChange,
  duration = 60,
  onDurationChange,
}: BookingPanelProps) {

  const navigate = useNavigate();
  const { t } = useTranslation();
  const [selectedDate, setSelectedDate] = useState<string>(selectedDateProp ?? dateToYmd(new Date()));
  const [dateOpen, setDateOpen] = useState(false);
  const [timeOpen, setTimeOpen] = useState(false);
  const [startTime, setStartTime] = useState('09:00');
  
  const durationVal = duration;

  const endTime = useMemo(() => {
    return minutesToHm(parseMinutes(startTime) + durationVal);
  }, [startTime, durationVal]);

  const matchedRule = useMemo(() => {
    const hours = durationVal / 60;
    const isWhole = durationVal % 60 === 0;
    if (!isWhole || !priceRules) return null;
    return priceRules.find(r => hours >= (r.minHours || 0) && (!r.maxHours || hours <= r.maxHours));
  }, [durationVal, priceRules]);

  const [guests, setGuests] = useState(1);

  const [equipmentOpen, setEquipmentOpen] = useState(false);
  const [equipmentAmenities, setEquipmentAmenities] = useState<AmenityDto[]>([]);
  const [selectedEquipmentAmenityIds, setSelectedEquipmentAmenityIds] = useState<number[]>([]);

  const [quotedTotal, setQuotedTotal] = useState<number | null>(null);
  const [quotedUnitPrice, setQuotedUnitPrice] = useState<number | null>(null);
  const [quoteMode, setQuoteMode] = useState<string>('ROOM_DEFAULT_PER_UNIT');
  const [quoteSubtotal, setQuoteSubtotal] = useState<number | null>(null);
  const [weekendSurchargeApplied, setWeekendSurchargeApplied] = useState(false);
  const [weekendSurchargeAmount, setWeekendSurchargeAmount] = useState<number>(0);
  const [weekendSurchargePercent, setWeekendSurchargePercent] = useState<number>(0);
  const [quoteLoading, setQuoteLoading] = useState(false);

  const displayPriceMeta = useMemo(() => {
    const rules = Array.isArray(priceRules) ? priceRules : [];
    if (rules.length > 0) {
      // Requirement: choose the lowest `price_per_hour` among all room_price_rule records.
      const hourlyRules = rules
        .map((r) => ({
          rule: r,
          v: r.pricePerHour != null ? Number(r.pricePerHour) : NaN,
        }))
        .filter((x) => Number.isFinite(x.v) && x.v > 0)
        .sort((a, b) => a.v - b.v);

      if (hourlyRules.length > 0) {
        const picked = hourlyRules[0];
        return { price: picked.v, unitLabel: '/ giờ' };
      }
    }

    const safeStep = Number.isFinite(stepUnit) && stepUnit > 0 ? stepUnit : 60;
    const perStep = Math.round((Number(price) * safeStep) / 60);
    if (Number.isFinite(perStep) && perStep > 0) {
      return { price: perStep, unitLabel: `/ ${safeStep}p` };
    }
    return { price: Number(price) || 0, unitLabel: '/ giờ' };
  }, [priceRules, price, stepUnit]);

  // Keep local selectedDate in sync when parent controls it.
  useEffect(() => {
    if (selectedDateProp && selectedDateProp !== selectedDate) {
      setSelectedDate(selectedDateProp);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDateProp]);

  // Derived validation
  const jsDay = ymdToDate(selectedDate).getDay(); // 0 (Sun) - 6 (Sat)
  const userDay = jsDay === 0 ? 8 : jsDay + 1; // 2 (Mon) - 8 (Sun)
  const daySchedule = schedules.find(s => s.dayOfWeek === userDay);

  const isClosed = daySchedule ? !daySchedule.isOpen : false;
  
  // Basic time comparison (HH:mm)
  const isTimeValid = () => {
    if (!daySchedule || !daySchedule.isOpen) return false;
    if (!daySchedule.openTime || !daySchedule.closeTime) return endTime > startTime;
    
    return startTime >= daySchedule.openTime.substring(0, 5) && 
           endTime <= daySchedule.closeTime.substring(0, 5) &&
           endTime > startTime;
  };

  const isCapacityValid = guests <= capacity;
  const safeStepUnit = Number.isFinite(stepUnit) && stepUnit > 0 ? Math.round(stepUnit) : 60;
  const safeMinDuration = Number.isFinite(minDuration) && minDuration > 0 ? Math.round(minDuration) : 60;
  const meetsDurationRules = durationVal >= safeMinDuration && durationVal % safeStepUnit === 0;
  const canReserve = !isClosed && isTimeValid() && isCapacityValid && meetsDurationRules && !quoteLoading;

  const hours = durationVal / 60;
  const serviceFee = 100000;
  const cleaningFee = 50000;
  const roomCost = quotedTotal ?? price * Math.max(hours, 1);
  const roomSubtotal = quoteSubtotal ?? roomCost;
  const selectedEquipmentAmenities = useMemo(() => {
    if (!selectedEquipmentAmenityIds.length) return [];
    const selectedSet = new Set(selectedEquipmentAmenityIds);
    return equipmentAmenities.filter((a) => selectedSet.has(a.id));
  }, [equipmentAmenities, selectedEquipmentAmenityIds]);
  const equipmentAddOnTotal = useMemo(
    () => selectedEquipmentAmenities.reduce((sum, a) => sum + Number(a.price ?? 0), 0),
    [selectedEquipmentAmenities],
  );
  const equipmentSummaryText = useMemo(() => {
    if (selectedEquipmentAmenities.length === 0) return 'Chọn tiện ích thêm';
    if (selectedEquipmentAmenities.length === 1) return selectedEquipmentAmenities[0].name;
    return `${selectedEquipmentAmenities.length} tiện ích đã chọn`;
  }, [selectedEquipmentAmenities]);
  const total = roomCost + equipmentAddOnTotal + serviceFee + cleaningFee;

  const applySelectedDate = (next: string) => {
    setSelectedDate(next);
    onSelectedDateChange?.(next);
  };

  // When schedule arrives/changes and the currently selected day is closed,
  // auto-move to the next open day to keep the UX consistent.
  useEffect(() => {
    if (!schedules?.length) return;
    if (!isClosed) return;

    const startDate = ymdToDate(selectedDate);
    let nextYmd: string | null = null;
    for (let i = 1; i <= 14; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const js = d.getDay();
      const uDay = js === 0 ? 8 : js + 1;
      const s = schedules.find((x) => x.dayOfWeek === uDay);
      const closed = s ? !s.isOpen : false;
      if (!closed) {
        nextYmd = dateToYmd(d);
        break;
      }
    }

    if (nextYmd && nextYmd !== selectedDate) {
      applySelectedDate(nextYmd);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schedules, isClosed]);

  useEffect(() => {
    if (isClosed || !isTimeValid() || durationVal <= 0 || !meetsDurationRules) {
      setQuotedTotal(null);
      setQuoteSubtotal(null);
      setQuotedUnitPrice(null);
      setWeekendSurchargeApplied(false);
      setWeekendSurchargeAmount(0);
      setWeekendSurchargePercent(0);
      return;
    }
    let cancelled = false;
    const loadQuote = async () => {
      setQuoteLoading(true);
      try {
        const quote = await roomApiService.quotePrice(roomId, {
          durationMinutes: durationVal,
          startDateTime: `${selectedDate}T${startTime}:00`,
          endDateTime: `${selectedDate}T${endTime}:00`,
        });
        if (cancelled) return;
        setQuotedTotal(Number(quote.total));
        setQuoteSubtotal(Number(quote.subtotal));
        setQuotedUnitPrice(quote.unitPrice != null ? Number(quote.unitPrice) : null);
        setQuoteMode(quote.pricingMode);
        setWeekendSurchargeApplied(Boolean(quote.weekendSurchargeApplied));
        setWeekendSurchargeAmount(Number(quote.weekendSurchargeAmount ?? 0));
        setWeekendSurchargePercent(Number(quote.weekendSurchargePercent ?? 0));
      } catch (err) {
        if (!cancelled) {
          setQuotedTotal(null);
          setQuoteSubtotal(null);
          setQuotedUnitPrice(null);
          setWeekendSurchargeApplied(false);
          setWeekendSurchargeAmount(0);
          setWeekendSurchargePercent(0);
          showToast.error(getApiErrorMessage(err, 'Không tính được giá phòng. Vui lòng thử lại.'));
        }
      } finally {
        if (!cancelled) setQuoteLoading(false);
      }
    };
    void loadQuote();
    return () => {
      cancelled = true;
    };
  }, [roomId, durationVal, isClosed, selectedDate, startTime, endTime, safeMinDuration, safeStepUnit]);

  useEffect(() => {
    let cancelled = false;
    const loadEquipmentAmenities = async () => {
      try {
        const allAmenities = await roomApiService.getAllAmenities();
        if (cancelled) return;
        const roomAmenityIds = new Set(
          (amenities || [])
            .map((a) => Number(a.id))
            .filter((id) => Number.isFinite(id) && id > 0),
        );
        const equipment = allAmenities
          .filter((a) => (a.type ?? '').toUpperCase() === 'EQUIPMENT')
          .filter((a) => (roomAmenityIds.size > 0 ? roomAmenityIds.has(a.id) : true))
          .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
        setEquipmentAmenities(equipment);
      } catch {
        if (!cancelled) setEquipmentAmenities([]);
      }
    };
    void loadEquipmentAmenities();
    return () => {
      cancelled = true;
    };
  }, [amenities]);

  const handleReserve = () => {
    if (!canReserve) return;
    navigate('/checkout', {
      state: {
        bookingDetails: {
          roomId,
          bookingDate: selectedDate,
          date: selectedDate,
          startTime,
          endTime,
          guests,
          price,
          hours,
          serviceFee,
          cleaningFee,
          selectedEquipmentAmenities: selectedEquipmentAmenities.map((a) => ({
            amenityId: a.id,
            name: a.name,
            price: Number(a.price ?? 0),
          })),
          equipmentAddOnTotal,
          total,
          spaceName,
          spaceImage,
        }
      }
    });
  };

  const getAvailableHours = () => {
    // Requirement: giờ vào hiển thị theo các mốc cụ thể (vd 09h01, 09h02...)
    // => tạo danh sách theo bước 1 phút để người dùng chọn trực tiếp.
    const intervalMinutes = 1;
    if (!daySchedule || !daySchedule.openTime || !daySchedule.closeTime) return [];

    const openMinutes = parseMinutes(daySchedule.openTime.substring(0, 5));
    const closeMinutes = parseMinutes(daySchedule.closeTime.substring(0, 5));
    const available: string[] = [];

    // Ràng buộc: startTime + duration mặc định (min_duration) không được vượt closeTime.
    const latestStart = closeMinutes - safeMinDuration;
    for (let m = openMinutes; m <= closeMinutes; m += intervalMinutes) {
      if (m <= latestStart) {
        available.push(minutesToHm(m));
      }
    }
    return available;
  };

  const availableHours = getAvailableHours();

  // Requirement: default startTime should follow the branch's openTime.
  // Always reset to branch openTime when date changes (default value).
  useEffect(() => {
    if (isClosed) return;
    if (!daySchedule?.isOpen || !daySchedule.openTime) return;
    const desired = daySchedule.openTime.substring(0, 5);
    if (!desired) return;
    if (availableHours.length > 0) {
      setStartTime(availableHours.includes(desired) ? desired : availableHours[0]);
    } else {
      setStartTime(desired);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, daySchedule?.openTime, daySchedule?.closeTime, isClosed]);

  const handleStartTimeChange = (next: string) => {
    if (isClosed) return;
    if (!daySchedule?.closeTime) {
      setStartTime(next);
      return;
    }
    const closeMinutes = parseMinutes(daySchedule.closeTime.substring(0, 5));
    const nextEndMinutes = parseMinutes(next) + durationVal;

    if (nextEndMinutes > closeMinutes) {
      showToast.error('Giờ vào + thời lượng thuê vượt quá giờ đóng cửa của chi nhánh.');
      return;
    }
    setStartTime(next);
  };

  useEffect(() => {
    if (durationVal < safeMinDuration) onDurationChange?.(safeMinDuration);
  }, [durationVal, safeMinDuration, onDurationChange]);

  const computeAlignedMaxDuration = () => {
    if (isClosed) return 0;
    if (!daySchedule?.closeTime) return 0;
    const closeMinutes = parseMinutes(daySchedule.closeTime.substring(0, 5));
    const startMinutes = parseMinutes(startTime);
    const maxMinutes = closeMinutes - startMinutes;
    if (maxMinutes <= 0) return 0;
    return Math.floor(maxMinutes / safeStepUnit) * safeStepUnit;
  };

  useEffect(() => {
    const alignedMax = computeAlignedMaxDuration();
    if (alignedMax > 0 && durationVal > alignedMax) {
      onDurationChange?.(alignedMax >= safeMinDuration ? alignedMax : safeMinDuration);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startTime, daySchedule?.closeTime]);

  const handleDurationStepUp = () => {
    if (isClosed) return;
    const alignedMax = computeAlignedMaxDuration();
    const next = durationVal + safeStepUnit;
    if (alignedMax <= 0 || next > alignedMax) {
      showToast.error('Thời lượng vượt quá giờ đóng cửa của chi nhánh.');
      return;
    }
    onDurationChange?.(next);
  };

  const handleDurationStepDown = () => {
    if (isClosed) return;
    const next = durationVal - safeStepUnit;
    if (next < safeMinDuration) {
      showToast.error(`Không thể giảm dưới ${safeMinDuration} phút.`);
      return;
    }
    onDurationChange?.(next);
  };

  const selectedDateObj = useMemo(() => {
    try {
      return ymdToDate(selectedDate);
    } catch {
      return undefined;
    }
  }, [selectedDate]);

  const handleToggleEquipmentAmenity = (amenityId: number) => {
    setSelectedEquipmentAmenityIds((prev) =>
      prev.includes(amenityId) ? prev.filter((id) => id !== amenityId) : [...prev, amenityId],
    );
  };

  return (
    <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-2xl shadow-gray-200/50">
      <div className="mb-8 p-1">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Giá thuê từ</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-black text-gray-900 tracking-tighter">
            {formatCurrency(displayPriceMeta.price)}
          </span>
          <span className="text-gray-400 font-bold text-lg">{displayPriceMeta.unitLabel}</span>
        </div>
      </div>



      {/* Date and Time Selection */}
      <div className="space-y-6 mb-8">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">{t('customer.spaceDetail.date')}</label>
            <Popover open={dateOpen} onOpenChange={setDateOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="w-full px-4 py-4 bg-gray-50 border border-transparent rounded-[1.25rem] hover:bg-white hover:border-gray-100 hover:shadow-sm transition-all font-bold text-gray-900 flex items-center justify-between gap-2 group"
                >
                  <span className="truncate text-sm">
                    {selectedDate ? format(ymdToDate(selectedDate), 'dd/MM/yyyy') : ''}
                  </span>
                  <CalendarIcon className="w-4 h-4 text-gray-400 group-hover:text-red-500 transition-colors shrink-0" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 rounded-[2rem] shadow-2xl border-gray-100" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDateObj}
                  onSelect={(day) => {
                    if (!day) return;
                    applySelectedDate(dateToYmd(day));
                    setDateOpen(false);
                  }}
                  locale={vi}
                  className="p-3"
                  disabled={(day) => {
                    if (!day) return false;
                    const js = day.getDay();
                    const uDay = js === 0 ? 8 : js + 1;
                    const ds = schedules.find((s) => s.dayOfWeek === uDay);
                    return ds ? !ds.isOpen : false;
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">
              {t('customer.spaceDetail.checkIn')}
            </label>
            <Popover open={timeOpen} onOpenChange={setTimeOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className={`w-full px-4 py-4 rounded-[1.25rem] border border-transparent transition-all font-bold text-gray-900 flex items-center justify-between gap-2 group ${
                    isClosed ? 'bg-red-50 text-red-400 cursor-not-allowed' : 'bg-gray-50 hover:bg-white hover:border-gray-100 hover:shadow-sm'
                  }`}
                  disabled={isClosed}
                >
                  <span className="truncate text-sm">
                    {isClosed ? 'Closed' : hmToHourMinuteLabel(startTime)}
                  </span>
                  <Clock className="w-4 h-4 text-gray-400 group-hover:text-red-500 transition-colors shrink-0" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-3 rounded-[2rem] shadow-2xl border-gray-100" align="start">
                <TimePickerWheel
                  availableTimes={availableHours}
                  selectedValue={startTime}
                  onChange={(val) => {
                    handleStartTimeChange(val);
                    setTimeOpen(false);
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">
            {t('customer.spaceDetail.duration')}
          </label>
          <div className="flex items-center gap-2 p-1 bg-gray-50 rounded-[1.5rem] border border-transparent transition-all hover:bg-white hover:border-gray-100 hover:shadow-sm">
            <button
              type="button"
              onClick={handleDurationStepDown}
              disabled={isClosed}
              className="w-12 h-12 rounded-[1.25rem] flex items-center justify-center font-black text-gray-400 hover:text-gray-900 hover:bg-gray-50 disabled:opacity-20 transition-all shrink-0"
              aria-label="Giảm thời lượng"
            >
              <span className="text-2xl">-</span>
            </button>

            <div className="flex-1 flex flex-col items-center justify-center min-w-0">
              <span className="text-sm font-black text-gray-900">
                {formatDurationUi(durationVal)}
              </span>
            </div>

            <button
              type="button"
              onClick={handleDurationStepUp}
              disabled={isClosed || computeAlignedMaxDuration() <= 0 || durationVal + safeStepUnit > computeAlignedMaxDuration()}
              className="w-12 h-12 rounded-[1.25rem] flex items-center justify-center font-black text-gray-400 hover:text-gray-900 hover:bg-gray-50 disabled:opacity-20 transition-all shrink-0"
              aria-label="Tăng thời lượng"
            >
              <span className="text-2xl">+</span>
            </button>
          </div>
          <div className={`text-[10px] text-center uppercase tracking-tight transition-all duration-300 ${
            matchedRule ? 'text-red-500 font-black opacity-100 scale-105' : 'text-red-500 font-bold opacity-100'
          }`}>
            {matchedRule 
              ? `ĐÃ TỐI ƯU GIÁ THEO: ${matchedRule.label || 'QUY TẮC GIÁ'}`
              : `Tối thiểu ${safeMinDuration}p · Bước nhảy ${safeStepUnit}p`
            }
          </div>
        </div>

        <div className="pt-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1 mb-2 block">
            {t('customer.spaceDetail.checkOut')}
          </label>
          <div className="relative group">
            <div className="w-full px-5 py-4 bg-gray-100 rounded-[1.25rem] font-black text-gray-400 text-sm flex items-center justify-between border border-transparent shadow-inner">
              <span>{endTime}</span>
              <span className="text-[9px] font-black bg-gray-200 text-gray-400 px-2 py-0.5 rounded-full uppercase tracking-widest">
                Auto
              </span>
            </div>
          </div>
        </div>




        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">
              {t('customer.spaceDetail.guests')}
            </label>
            <input
              type="number"
              min="1"
              max={capacity}
              value={guests}
              onChange={(e) => {
                  const val = parseInt(e.target.value) || 0;
                  setGuests(Math.max(1, Math.min(val, capacity)));
              }}
              className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-[1.25rem] focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-100 transition-all font-bold text-gray-900 text-sm outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">
              Tiện ích thêm
            </label>
            <Popover open={equipmentOpen} onOpenChange={setEquipmentOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="w-full px-4 py-4 bg-gray-50 border border-transparent rounded-[1.25rem] hover:bg-white hover:border-gray-100 transition-all flex items-center justify-between gap-2 group min-w-0"
                >
                  <span className="min-w-0 flex-1 text-left">
                    <span className="block text-sm font-bold text-gray-900 truncate tracking-tight">{equipmentSummaryText}</span>
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-red-500 transition-colors shrink-0" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-4 rounded-[2rem] shadow-2xl border-gray-100" align="end">
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 px-2">Danh sách tiện ích</div>
                <div className="max-h-64 overflow-y-auto space-y-2 pr-1 scrollbar-hide">
                  {equipmentAmenities.length === 0 ? (
                    <p className="text-xs font-bold text-gray-400 text-center py-4">Không có tiện ích khả dụng</p>
                  ) : (
                    equipmentAmenities.map((amenity) => {
                      const checked = selectedEquipmentAmenityIds.includes(amenity.id);
                      return (
                        <label key={amenity.id} className={`flex items-center justify-between gap-3 cursor-pointer rounded-xl px-3 py-2.5 transition-all ${checked ? 'bg-red-50 border-red-100' : 'hover:bg-gray-50 border-transparent'} border`}>
                          <span className="flex items-center gap-3 min-w-0">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => handleToggleEquipmentAmenity(amenity.id)}
                              className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500 accent-red-600"
                            />
                            <span className="text-xs font-bold text-gray-800 truncate">{amenity.name}</span>
                          </span>
                          <span className="text-[10px] font-black text-gray-400 whitespace-nowrap uppercase">
                            {amenity.price ? `+${formatCurrency(Number(amenity.price))}` : 'Free'}
                          </span>
                        </label>
                      );
                    })
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      {!meetsDurationRules && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-3 mb-4">
          <p className="text-xs font-semibold text-red-700">
            Thời lượng phải {'>='} {safeMinDuration} phút và là bội số của {safeStepUnit} phút.
          </p>
        </div>
      )}

      {isClosed && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-6 flex items-start gap-3">
          <Clock className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs font-bold text-red-800 leading-relaxed uppercase tracking-tight">
            Phòng đóng cửa vào ngày này
          </p>
        </div>
      )}



      {/* Reserve Button */}
      <div className="mb-10">
        <button
          onClick={handleReserve}
          disabled={!canReserve}
          className="w-full bg-gray-900 text-white h-20 rounded-[1.5rem] font-black text-xl hover:bg-red-600 disabled:bg-gray-100 disabled:text-gray-300 disabled:cursor-not-allowed transition-all shadow-2xl shadow-gray-200 hover:shadow-red-200 active:scale-[0.98] flex flex-col items-center justify-center gap-0.5 group"
        >
          <span className="group-hover:translate-x-1 transition-transform">{t('customer.spaceDetail.selectContinue')}</span>
          {!isClosed && <span className="text-[10px] font-bold text-gray-500 group-hover:text-red-200 opacity-60 uppercase tracking-widest">Tiến hành thanh toán</span>}
        </button>
      </div>


      {/* Price Breakdown */}
      <div className="space-y-4 pt-8 border-t border-gray-100">
        {quotedTotal != null ? (
          <div className="bg-gray-50/80 rounded-[2rem] p-6 border border-gray-100/50">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                Giá theo thời lượng
              </span>
              <span className="text-lg font-black text-gray-900">{formatCurrency(quotedTotal)}</span>
            </div>
            {quotedUnitPrice != null && (
              <div className="flex items-center gap-3 text-xs font-bold text-gray-500">
                <span className="text-gray-900">{formatCurrency(quotedUnitPrice)}</span>
                <span className="text-gray-300">×</span>
                <span className="inline-flex items-center bg-white border border-gray-100 px-3 py-1 rounded-full text-gray-900 shadow-sm text-[10px] font-black">
                  {Math.round(duration / safeStepUnit)} Đơn vị
                </span>
              </div>
            )}
            {!quotedUnitPrice && (
              <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Giá trọn gói</span>
            )}
          </div>
        ) : (
          <div className="flex justify-between items-center px-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              {formatCurrency(price)} × {hours} {t('customer.spaceDetail.hours')}
            </span>
            <span className="text-sm font-black text-gray-900">{formatCurrency(roomSubtotal)}</span>
          </div>
        )}
        
        <div className="space-y-3 px-2">
          {weekendSurchargeApplied && weekendSurchargeAmount > 0 ? (
            <div className="flex justify-between text-xs font-bold text-amber-600">
              <span className="opacity-60 uppercase tracking-widest text-[10px]">Cuối tuần (+{weekendSurchargePercent}%)</span>
              <span>+{formatCurrency(weekendSurchargeAmount)}</span>
            </div>
          ) : null}
          
          <div className="flex justify-between text-xs font-bold text-gray-400">
            <span className="opacity-60 uppercase tracking-widest text-[10px]">{t('customer.spaceDetail.cleaningFee')}</span>
            <span className="text-gray-900">{formatCurrency(cleaningFee)}</span>
          </div>
          
          {equipmentAddOnTotal > 0 && (
            <div className="flex justify-between text-xs font-bold text-gray-400">
              <span className="opacity-60 uppercase tracking-widest text-[10px]">Tiện ích thêm</span>
              <span className="text-gray-900">{formatCurrency(equipmentAddOnTotal)}</span>
            </div>
          )}
          
          <div className="flex justify-between text-xs font-bold text-gray-400">
            <span className="opacity-60 uppercase tracking-widest text-[10px]">{t('customer.spaceDetail.serviceFee')}</span>
            <span className="text-gray-900">{formatCurrency(serviceFee)}</span>
          </div>
        </div>

        <div className="flex justify-between items-end pt-4 border-t border-gray-100/50 mt-2 px-2">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Tổng cộng</span>
            <span className="font-black text-gray-900 uppercase text-xs tracking-tighter">Bao gồm thuế phí</span>
          </div>
          <span className="font-black text-3xl text-gray-900 tracking-tighter">{formatCurrency(total)}</span>
        </div>
      </div>

    </div>
  );
}

interface TimePickerWheelProps {
  availableTimes: string[];
  selectedValue: string;
  onChange: (value: string) => void;
}

function TimePickerWheel({ availableTimes, selectedValue, onChange }: TimePickerWheelProps) {
  const [selH, selM] = selectedValue.split(':');
  const hRef = useRef<HTMLDivElement>(null);
  const mRef = useRef<HTMLDivElement>(null);
  
  const hours = useMemo(() => {
    const set = new Set<string>();
    availableTimes.forEach(t => set.add(t.split(':')[0]));
    return Array.from(set).sort();
  }, [availableTimes]);

  const minutesForSelectedHour = useMemo(() => {
    return availableTimes
      .filter(t => t.startsWith(`${selH}:`))
      .map(t => t.split(':')[1])
      .sort();
  }, [availableTimes, selH]);

  // If current minute is not available for selected hour, auto-pick first available
  useEffect(() => {
    if (minutesForSelectedHour.length > 0 && !minutesForSelectedHour.includes(selM)) {
      onChange(`${selH}:${minutesForSelectedHour[0]}`);
    }
  }, [selH, minutesForSelectedHour, selM, onChange]);

  // Auto-scroll to selected
  useEffect(() => {
    const scrollSelected = (ref: React.RefObject<HTMLDivElement>, val: string) => {
      if (!ref.current) return;
      const el = ref.current.querySelector(`[data-value="${val}"]`);
      if (el) {
        el.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
    };
    
    // Small timeout to ensure DOM is ready after popover opens
    const timer = setTimeout(() => {
      scrollSelected(hRef, selH);
      scrollSelected(mRef, selM);
    }, 100);
    return () => clearTimeout(timer);
  }, [selH, selM]);

  return (
    <div className="relative flex divide-x divide-gray-100 h-64 bg-white rounded-xl overflow-hidden group">
      {/* Centered Selection Highlight */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-10 bg-red-50/50 pointer-events-none z-0" />
      
      {/* Hours Column */}
      <div className="flex-1 flex flex-col relative z-10">
        <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest text-center py-2 bg-white/80 backdrop-blur-sm sticky top-0 z-20">Giờ</div>
        <div 
          ref={hRef}
          className="flex-1 overflow-y-auto scrollbar-hide py-24 snap-y snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <div className="flex flex-col gap-1 px-1">
            {hours.map((h) => (
              <button
                key={h}
                data-value={h}
                onClick={() => onChange(`${h}:${selM}`)}
                className={`h-10 shrink-0 flex items-center justify-center rounded-xl font-black text-sm transition-all snap-center ${
                  h === selH 
                    ? 'text-red-600 scale-110' 
                    : 'text-gray-300 hover:text-gray-500'
                }`}
              >
                {h}h
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Minutes Column */}
      <div className="flex-1 flex flex-col relative z-10">
        <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest text-center py-2 bg-white/80 backdrop-blur-sm sticky top-0 z-20">Phút</div>
        <div 
          ref={mRef}
          className="flex-1 overflow-y-auto scrollbar-hide py-24 snap-y snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <div className="flex flex-col gap-1 px-1">
            {minutesForSelectedHour.map((m) => (
              <button
                key={m}
                data-value={m}
                onClick={() => onChange(`${selH}:${m}`)}
                className={`h-10 shrink-0 flex items-center justify-center rounded-xl font-black text-sm transition-all snap-center ${
                  m === selM 
                    ? 'text-red-600 scale-110' 
                    : 'text-gray-300 hover:text-gray-500'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Wheel Overlays (Gradients) */}
      <div className="absolute inset-x-0 top-8 h-12 bg-gradient-to-b from-white to-transparent pointer-events-none z-20" />
      <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-white to-transparent pointer-events-none z-20" />
    </div>
  );
}
