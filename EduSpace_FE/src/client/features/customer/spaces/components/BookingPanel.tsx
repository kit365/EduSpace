import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Star, Clock, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { formatCurrency } from '../../../../../utils';

import { ReservationSchedule } from '@/types/space';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { roomApiService } from '@/client/features/room/services/roomApiService';
import { showToast } from '@/utils/toast';
import { getApiErrorMessage } from '@/utils/apiError';
import { TimePickerScroll } from '@/components/ui/time-picker-scroll';
import { cn } from '@/components/ui/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import * as LucideIcons from 'lucide-react';
import { RoomPriceRule } from '@/types/space';

interface BookingPanelProps {
  roomId: number;
  price: number;
  rating: number;
  reviewCount: number;
  spaceName: string;
  spaceImage: string;
  capacity?: number;
  schedules?: ReservationSchedule[];
  minDuration?: number;
  stepUnit?: number;
  selectedDate?: string;
  onSelectedDateChange?: (value: string) => void;
  duration?: number;
  onDurationChange?: (value: number) => void;
  amenities?: Array<{ id: number; name: string; price: number; type?: string; icon?: any }>;
  priceRules?: RoomPriceRule[];
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

export function BookingPanel({
  roomId,
  price,
  rating,
  reviewCount,
  spaceName,
  spaceImage,
  capacity = 100,
  schedules = [],
  minDuration = 60,
  stepUnit = 30,
  selectedDate: selectedDateProp,
  onSelectedDateChange,
  duration: durationProp,
  onDurationChange,
  amenities = [],
}: BookingPanelProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [selectedDate, setSelectedDate] = useState<string>(selectedDateProp ?? dateToYmd(new Date()));
  const [dateOpen, setDateOpen] = useState(false);
  const [startTime, setStartTime] = useState('09:00');
  const [localDuration, setLocalDuration] = useState(durationProp ?? 120);
  const [isDurationMinError, setIsDurationMinError] = useState(false);
  const [isDurationMaxError, setIsDurationMaxError] = useState(false);

  const finalDuration = durationProp ?? localDuration;

  const [selectedAmenities, setSelectedAmenities] = useState<number[]>([]);
  const [filterType, setFilterType] = useState<string>('ALL');

  const AMENITY_TYPE_LABELS: Record<string, string> = {
    ALL: 'Tất cả',
    BASIC: 'Cơ bản',
    EQUIPMENT: 'Thiết bị',
    SERVICE: 'Dịch vụ',
  };

  const endTime = useMemo(() => {
    return minutesToHm(parseMinutes(startTime) + finalDuration);
  }, [startTime, finalDuration]);

  const [guests, setGuests] = useState(1);

  const [quotedTotal, setQuotedTotal] = useState<number | null>(null);
  const [quotedUnitPrice, setQuotedUnitPrice] = useState<number | null>(null);
  const [quoteMode, setQuoteMode] = useState<string>('ROOM_DEFAULT_PER_UNIT');
  const [quoteSubtotal, setQuoteSubtotal] = useState<number | null>(null);
  const [weekendSurchargeApplied, setWeekendSurchargeApplied] = useState(false);
  const [weekendSurchargeAmount, setWeekendSurchargeAmount] = useState<number>(0);
  const [weekendSurchargePercent, setWeekendSurchargePercent] = useState<number>(0);
  const [quoteLoading, setQuoteLoading] = useState(false);

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
  const durationMinutes = useMemo(() => {
    const diff = parseMinutes(endTime) - parseMinutes(startTime);
    return Math.max(0, diff);
  }, [startTime, endTime]);
  const meetsDurationRules = durationMinutes >= minDuration && durationMinutes % stepUnit === 0;
  const canReserve = !isClosed && isTimeValid() && isCapacityValid && meetsDurationRules && !quoteLoading;

  const equipmentAddOnTotal = useMemo(() => {
    return selectedAmenities.reduce((acc, id) => {
      const amn = amenities.find(a => a.id === id);
      return acc + (amn?.price || 0);
    }, 0);
  }, [selectedAmenities, amenities]);

  const roomCost = quotedTotal ?? price * (durationMinutes / 60);
  const roomSubtotal = quoteSubtotal ?? roomCost;
  const total = roomSubtotal + equipmentAddOnTotal;

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

  const isWholeHour = finalDuration % 60 === 0;

  useEffect(() => {
    if (isClosed || !isTimeValid() || durationMinutes <= 0 || !meetsDurationRules) {
      setQuotedTotal(null);
      setQuoteSubtotal(null);
      setQuotedUnitPrice(null);
      setWeekendSurchargeApplied(false);
      setWeekendSurchargeAmount(0);
      setWeekendSurchargePercent(0);
      return;
    }

    // For fractional hours (e.g. 2h30, 3h30), force linear step-unit pricing
    // as per user request: "nếu lẻ thì áp dụng giá theo giá của 1 step_unit"
    if (!isWholeHour) {
      const stepPrice = price * (stepUnit / 60);
      const totalUnits = finalDuration / stepUnit;
      const totalCost = stepPrice * totalUnits;
      
      setQuotedTotal(totalCost);
      setQuoteSubtotal(totalCost);
      setQuotedUnitPrice(stepPrice);
      setQuoteMode('STEP_UNIT');
      setWeekendSurchargeApplied(false);
      setWeekendSurchargeAmount(0);
      setWeekendSurchargePercent(0);
      setQuoteLoading(false);
      return;
    }

    let cancelled = false;
    const loadQuote = async () => {
      setQuoteLoading(true);
      try {
        const quote = await roomApiService.quotePrice(roomId, {
          durationMinutes,
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
  }, [roomId, finalDuration, isClosed, selectedDate, startTime, endTime, minDuration, stepUnit, isWholeHour, price]);


  const handleReserve = () => {
    if (!canReserve) return;

    // Strip non-serializable data (Lucide icons) from amenities
    const serializableAmenities = amenities.map(({ id, name, price, type }) => ({
      id,
      name,
      price,
      type
    }));

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
          duration: finalDuration,
          durationValue: finalDuration,
          durationUnit: 'MINUTE',
          total,
          spaceName,
          spaceImage,
          equipmentAddOnTotal,
          // Full list for CheckoutPage to allow editing
          amenities: serializableAmenities,
          // Currently selected subset
          selectedEquipmentAmenities: serializableAmenities.filter(a => selectedAmenities.includes(a.id || 0)),
          stepUnit,
        }
      }
    });
  };

  const getAvailableHours = () => {
    const interval = Math.max(stepUnit, 1);
    if (!daySchedule || !daySchedule.openTime || !daySchedule.closeTime) return [];

    const now = new Date();
    const todayYmd = dateToYmd(now);
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    const openMinutes = parseMinutes(daySchedule.openTime.substring(0, 5));
    const closeMinutes = parseMinutes(daySchedule.closeTime.substring(0, 5));
    
    // Logic cũ: Nếu là ngày hiện tại, chỉ lấy từ giờ hiện tại
    const actualStart = selectedDate === todayYmd ? Math.max(openMinutes, nowMinutes) : openMinutes;

    const available: string[] = [];
    for (let m = actualStart; m <= closeMinutes; m += interval) {
      available.push(minutesToHm(m));
    }
    return available;
  };

  const availableHours = getAvailableHours();

  const selectedDateObj = useMemo(() => {
    try {
      return ymdToDate(selectedDate);
    } catch {
      return undefined;
    }
  }, [selectedDate]);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg">
      <div className="mb-6">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-3xl font-black text-gray-900 tracking-tight">
            {quotedUnitPrice ? formatCurrency(quotedUnitPrice) : formatCurrency(price)}
          </span>
          <span className="text-gray-500 font-bold">
            {!isWholeHour
              ? ` / ${stepUnit} phút`
              : (quotedTotal && quotedTotal !== (price * (finalDuration / 60)) 
                ? '/ đợt' 
                : ` / ${t('customer.spaceDetail.perHour')}`)}
          </span>
        </div>
        {quotedTotal && quotedTotal !== (price * (finalDuration / 60)) && (
          <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider">
            Đã áp dụng quy tắc giá ưu đãi
          </p>
        )}
      </div>


      {/* Date and Time Selection */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">NGÀY</label>
          <div className="relative">
            <Popover open={dateOpen} onOpenChange={setDateOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all font-bold text-gray-900 flex items-center justify-between gap-3"
                >
                  <span className="truncate">
                    {selectedDate ? format(ymdToDate(selectedDate), 'dd/MM/yyyy') : ''}
                  </span>
                  <CalendarIcon className="w-5 h-5 text-red-500 shrink-0" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 rounded-2xl shadow-xl border-gray-100" align="start">
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
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    if (day < today) return true; // logic cũ: không cho chọn ngày quá khứ

                    const js = day.getDay();
                    const uDay = js === 0 ? 8 : js + 1;
                    const ds = schedules.find((s) => s.dayOfWeek === uDay);
                    return ds ? !ds.isOpen : false;
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="space-y-4">
          <div className="min-w-0">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block truncate">
              GIỜ VÀO
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className={`w-full px-4 py-3 bg-gray-50 border ${isClosed ? 'border-red-500 bg-red-50' : 'border-gray-200'} rounded-xl outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all font-bold text-gray-900 flex items-center justify-between`}
                  disabled={isClosed}
                >
                  {startTime}
                  <Clock className="w-5 h-5 text-gray-400" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-0 rounded-2xl shadow-xl border-gray-100" align="start">
                <div className="p-1">
                  {availableHours.length > 0 ? (
                    <TimePickerScroll 
                      value={startTime}
                      onChange={(val) => setStartTime(val)}
                      minTime={(() => {
                        if (!daySchedule || !daySchedule.openTime) return undefined;
                        const openTime = daySchedule.openTime.substring(0, 5);
                        const now = new Date();
                        if (selectedDate === dateToYmd(now)) {
                          const nowMinutes = now.getHours() * 60 + now.getMinutes();
                          const openMinutes = parseMinutes(openTime);
                          return minutesToHm(Math.max(openMinutes, nowMinutes));
                        }
                        return openTime;
                      })()}
                      maxTime={daySchedule?.closeTime?.substring(0, 5)}
                    />
                  ) : (
                    <div className="px-4 py-8 text-center text-xs font-black text-gray-400 uppercase tracking-widest">
                      {isClosed ? 'Phòng đóng cửa' : 'Không có giờ trống'}
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <div className="min-w-0">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block truncate">
              THỜI LƯỢNG THUÊ
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  const val = finalDuration - stepUnit;
                  if (val >= minDuration) {
                    onDurationChange ? onDurationChange(val) : setLocalDuration(val);
                    setIsDurationMinError(false);
                  } else {
                    showToast.error(`Thời lượng thuê tối thiểu là ${Math.floor(minDuration / 60)}h${minDuration % 60 > 0 ? ` ${minDuration % 60}p` : ''}`);
                    setIsDurationMinError(true);
                    setTimeout(() => setIsDurationMinError(false), 2000);
                  }
                }}
                className={cn(
                  "w-12 h-12 flex items-center justify-center bg-gray-50 border rounded-xl transition-all font-black text-gray-900 shadow-sm disabled:opacity-50",
                  isDurationMinError ? "border-red-500 bg-red-50 text-red-600 animate-shake" : "border-gray-200 hover:bg-gray-100",
                  finalDuration <= minDuration && !isDurationMinError && "opacity-50 cursor-not-allowed"
                )}
              >
                -
              </button>
              <div className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 text-center uppercase tracking-tight">
                {Math.floor(finalDuration / 60)}h{finalDuration % 60 > 0 ? ` ${finalDuration % 60}p` : ''}
              </div>
              <button
                type="button"
                onClick={() => {
                  const val = finalDuration + stepUnit;
                  const nextEndTime = parseMinutes(startTime) + val;
                  const closeMinutes = daySchedule?.closeTime ? parseMinutes(daySchedule.closeTime.substring(0, 5)) : 1440;
                  
                  if (nextEndTime <= closeMinutes) {
                    onDurationChange ? onDurationChange(val) : setLocalDuration(val);
                    setIsDurationMaxError(false);
                  } else {
                    showToast.error(`Giờ ra không được vượt quá giờ đóng cửa (${daySchedule?.closeTime?.substring(0, 5)})`);
                    setIsDurationMaxError(true);
                    setTimeout(() => setIsDurationMaxError(false), 2000);
                  }
                }}
                className={cn(
                  "w-12 h-12 flex items-center justify-center bg-gray-50 border rounded-xl transition-all font-black text-gray-900 shadow-sm",
                  isDurationMaxError ? "border-red-500 bg-red-50 text-red-600 animate-shake" : "border-gray-200 hover:bg-gray-100",
                  (() => {
                    const nextEndTime = parseMinutes(startTime) + finalDuration + stepUnit;
                    const closeMinutes = daySchedule?.closeTime ? parseMinutes(daySchedule.closeTime.substring(0, 5)) : 1440;
                    return nextEndTime > closeMinutes && !isDurationMaxError;
                  })() && "opacity-50 cursor-not-allowed"
                )}
              >
                +
              </button>
            </div>
          </div>
        </div>

        <div className="pt-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block truncate">
            GIỜ RA
          </label>
          <div className="relative">
             <input
              type="text"
              value={endTime}
              readOnly
              className="w-full px-4 py-3 bg-gray-100 border border-gray-100 rounded-xl font-black text-gray-500 cursor-not-allowed shadow-inner"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-300 uppercase tracking-tighter">
              Auto
            </div>
          </div>
        </div>



        <div>
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">
            SỐ KHÁCH (tối đa {capacity})
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
            className={`w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all font-bold text-gray-900`}
          />
        </div>

        {/* Tiện ích thêm */}
        {(amenities?.length ?? 0) > 0 && (
          <div className="pt-4 border-t border-gray-100 mt-4">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 block">
              TIỆN ÍCH THÊM
            </label>
            
            <Dialog>
              <DialogTrigger asChild>
                <button
                  type="button"
                  className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-xl hover:border-red-200 hover:bg-red-50/30 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-red-100 transition-colors">
                      <LucideIcons.Plus className="w-4 h-4 text-gray-500 group-hover:text-red-600" />
                    </div>
                    <span className="text-sm font-bold text-gray-700">
                      {selectedAmenities.length > 0 
                        ? `${selectedAmenities.length} tiện ích được chọn`
                        : "Chọn thêm tiện ích..."}
                    </span>
                  </div>
                  <LucideIcons.ChevronRight className="w-4 h-4 text-gray-400" />
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-md rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
                <DialogHeader className="p-6 bg-gray-900 text-white">
                  <DialogTitle className="text-xl font-black uppercase tracking-tight">Tiện ích thêm</DialogTitle>
                  <DialogDescription className="text-gray-400 text-xs font-bold">
                    Tùy chỉnh trải nghiệm của bạn với các thiết bị và dịch vụ bổ sung.
                  </DialogDescription>
                </DialogHeader>

                <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                  {/* Category Chips - Simple implementation for now */}
                  <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar pb-2">
                    {["ALL", ...Array.from(new Set(amenities?.map(a => a.type).filter(Boolean)))].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFilterType(type as string)}
                        className={cn(
                          "px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all whitespace-nowrap",
                          filterType === type 
                            ? "bg-gray-900 border-gray-900 text-white" 
                            : "bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-900 hover:text-gray-900"
                        )}
                      >
                        {AMENITY_TYPE_LABELS[type as string] || type}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-4">
                    {amenities
                      ?.filter(amn => filterType === 'ALL' || amn.type === filterType)
                      ?.map((amn) => {
                      const Icon = (LucideIcons as any)[amn.icon as string] || LucideIcons.Layers;
                      return (
                        <div 
                          key={amn.id}
                          className={cn(
                            "flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer group",
                            selectedAmenities.includes(amn.id) 
                              ? "bg-red-50 border-red-200" 
                              : "bg-gray-50 border-gray-100 hover:border-gray-200"
                          )}
                          onClick={() => {
                            if (selectedAmenities.includes(amn.id)) {
                              setSelectedAmenities(prev => prev.filter(id => id !== amn.id));
                            } else {
                              setSelectedAmenities(prev => [...prev, amn.id]);
                            }
                          }}
                        >
                          <div className="flex items-center gap-4">
                            <Checkbox 
                              checked={selectedAmenities.includes(amn.id)}
                              onCheckedChange={() => {}} // Handled by div onClick
                              className="rounded-full border-gray-300 data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500"
                            />
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                                selectedAmenities.includes(amn.id) ? "bg-white" : "bg-white"
                              )}>
                                <Icon className={cn("w-5 h-5", selectedAmenities.includes(amn.id) ? "text-red-500" : "text-gray-400")} />
                              </div>
                              <div>
                                <p className="text-sm font-black text-gray-900">{amn.name}</p>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                  {AMENITY_TYPE_LABELS[amn.type as string] || amn.type || 'Dịch vụ'}
                                </p>
                              </div>
                            </div>
                          </div>
                          <span className="text-xs font-black text-gray-900">
                            {amn.price && amn.price > 0 ? `+${formatCurrency(amn.price)}` : 'Miễn phí'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <DialogFooter className="p-6 bg-gray-50 border-t border-gray-100 sm:justify-between items-center">
                  <div className="text-left">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Tổng cộng tiện ích</p>
                    <p className="text-xl font-black text-gray-900">{formatCurrency(equipmentAddOnTotal)}</p>
                  </div>
                  <DialogTrigger asChild>
                    <button className="px-8 py-3 bg-gray-900 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-red-600 transition-colors shadow-lg shadow-gray-200">
                      Xác nhận
                    </button>
                  </DialogTrigger>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>
      {!meetsDurationRules && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-3 mb-4">
          <p className="text-xs font-semibold text-red-700">
            Thời lượng phải {'>='} {minDuration} phút và là bội số của {stepUnit} phút.
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
      <button
        onClick={handleReserve}
        disabled={!canReserve}
        className="w-full bg-gray-900 text-white py-4 rounded-xl font-black text-lg hover:bg-red-600 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-all mb-6 shadow-xl shadow-gray-200 hover:shadow-red-200 active:scale-95 group"
      >
        {t('customer.spaceDetail.selectContinue')}
      </button>

      {/* Price Breakdown */}
      <div className="space-y-3 pt-6 border-t border-gray-100">
        {quotedTotal != null ? (
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                {isWholeHour ? `GIÁ ƯU ĐÃI THEO ĐỢT` : `GIÁ THEO BƯỚC NHẢY (${stepUnit}P)`}
              </span>
              <span className="text-sm font-black text-gray-900">{formatCurrency(quotedTotal)}</span>
            </div>
            {quotedUnitPrice != null && (
              <div className="flex items-center gap-2 text-xs font-bold text-gray-500 ml-3.5">
                <span className="text-gray-900">{formatCurrency(quotedUnitPrice)}</span>
                <span className="text-gray-300">×</span>
                <span className="inline-flex items-center bg-white border border-gray-200 px-2 py-0.5 rounded-lg text-gray-900 shadow-sm text-[10px]">
                  {Math.round(finalDuration / (stepUnit || 60))} đơn vị
                </span>
              </div>
            )}
            {!quotedUnitPrice && (
              <span className="text-[10px] text-gray-400 font-bold ml-3.5">Giá trọn gói</span>
            )}
          </div>
        ) : (
          <div className="flex justify-between text-sm font-medium text-gray-500">
            <span>{formatCurrency(price)} × {durationMinutes / 60} {t('customer.spaceDetail.hours')}</span>
            <span className="text-gray-900">{formatCurrency(roomSubtotal)}</span>
          </div>
        )}
        {weekendSurchargeApplied && weekendSurchargeAmount > 0 ? (
          <div className="flex justify-between text-sm font-bold text-amber-700">
            <span className="flex items-center gap-2">
              <LucideIcons.Sparkles className="w-3 h-3" />
              Phụ thu cuối tuần (+{weekendSurchargePercent}%)
            </span>
            <span>{formatCurrency(weekendSurchargeAmount)}</span>
          </div>
        ) : null}

        {selectedAmenities.map(id => {
          const amn = amenities?.find(a => a.id === id);
          if (!amn) return null;
          return (
             <div key={id} className="flex justify-between text-sm font-bold text-gray-500">
              <span className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-gray-300" />
                {amn.name}
              </span>
              <span className="text-gray-900">{amn.price && amn.price > 0 ? formatCurrency(amn.price) : 'Miễn phí'}</span>
            </div>
          );
        })}
        <div className="flex justify-between pt-4 border-t border-gray-100 mt-2">
          <span className="font-black text-gray-900">{t('customer.spaceDetail.total')}</span>
          <span className="font-black text-xl text-gray-900">{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  );
}
