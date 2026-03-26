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
}: BookingPanelProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [selectedDate, setSelectedDate] = useState<string>(selectedDateProp ?? dateToYmd(new Date()));
  const [dateOpen, setDateOpen] = useState(false);
  const [startTime, setStartTime] = useState('09:00');
  const [duration, setDuration] = useState(120); // default 2 hours
  const endTime = useMemo(() => {
    return minutesToHm(parseMinutes(startTime) + duration);
  }, [startTime, duration]);

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

  const hours = durationMinutes / 60;
  const serviceFee = 100000;
  const cleaningFee = 50000;
  const roomCost = quotedTotal ?? price * Math.max(hours, 1);
  const roomSubtotal = quoteSubtotal ?? roomCost;
  const total = roomCost + serviceFee + cleaningFee;

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
    if (isClosed || !isTimeValid() || durationMinutes <= 0 || !meetsDurationRules) {
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
  }, [roomId, durationMinutes, isClosed, selectedDate, startTime, endTime, minDuration, stepUnit]);

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
          total,
          spaceName,
          spaceImage,
        }
      }
    });
  };

  const getAvailableHours = () => {
    const interval = Math.max(stepUnit, 1);
    if (!daySchedule || !daySchedule.openTime || !daySchedule.closeTime) return [];

    const openMinutes = parseMinutes(daySchedule.openTime.substring(0, 5));
    const closeMinutes = parseMinutes(daySchedule.closeTime.substring(0, 5));
    const available: string[] = [];
    for (let m = openMinutes; m <= closeMinutes; m += interval) {
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
            {formatCurrency(price)}
          </span>
          <span className="text-gray-500 font-bold">{t('customer.spaceDetail.perHour')}</span>
        </div>
      </div>


      {/* Date and Time Selection */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">{t('customer.spaceDetail.date')}</label>
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
              {t('customer.spaceDetail.checkIn')}
            </label>
            <select
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className={`w-full px-4 py-3 bg-gray-50 border ${isClosed ? 'border-red-500 bg-red-50' : 'border-gray-200'} rounded-xl outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all font-bold text-gray-900 appearance-none`}
              disabled={isClosed}
            >
              {availableHours.length > 0 ? (
                availableHours.map((slot) => (
                  <option key={slot} value={slot}>{slot}</option>
                ))
              ) : (
                <option value="">{isClosed ? 'Closed' : '--:--'}</option>
              )}
            </select>
          </div>
          <div className="min-w-0">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block truncate">
              {t('customer.spaceDetail.duration')}
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value, 10))}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all font-bold text-gray-900 appearance-none"
              disabled={isClosed}
            >
              {[60, 90, 120, 150, 180, 240, 300, 360, 480, 600, 720].map((mins) => (
                <option key={mins} value={mins}>
                  {mins / 60} giờ {mins % 60 > 0 ? `${mins % 60}p` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="pt-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block truncate">
            {t('customer.spaceDetail.checkOut')}
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
            {t('customer.spaceDetail.guests')}
            <span className="ml-1 text-gray-400 lowercase font-medium">(Tối đa {capacity})</span>
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
                Giá theo bước nhảy ({stepUnit}p)
              </span>
              <span className="text-sm font-black text-gray-900">{formatCurrency(quotedTotal)}</span>
            </div>
            {quotedUnitPrice != null && (
              <div className="flex items-center gap-2 text-xs font-bold text-gray-500 ml-3.5">
                <span className="text-gray-900">{formatCurrency(quotedUnitPrice)}</span>
                <span className="text-gray-300">×</span>
                <span className="inline-flex items-center bg-white border border-gray-200 px-2 py-0.5 rounded-lg text-gray-900 shadow-sm text-[10px]">
                  {Math.round(duration / (stepUnit || 60))} đơn vị
                </span>
              </div>
            )}
            {!quotedUnitPrice && (
              <span className="text-[10px] text-gray-400 font-bold ml-3.5">Giá trọn gói</span>
            )}
          </div>
        ) : (
          <div className="flex justify-between text-sm font-medium text-gray-500">
            <span>{formatCurrency(price)} × {hours} {t('customer.spaceDetail.hours')}</span>
            <span className="text-gray-900">{formatCurrency(roomSubtotal)}</span>
          </div>
        )}
        {weekendSurchargeApplied && weekendSurchargeAmount > 0 ? (
          <div className="flex justify-between text-sm font-medium text-amber-700">
            <span>Phụ thu cuối tuần (+{weekendSurchargePercent}%)</span>
            <span>{formatCurrency(weekendSurchargeAmount)}</span>
          </div>
        ) : null}
        <div className="flex justify-between text-sm font-medium text-gray-500">
          <span>{t('customer.spaceDetail.cleaningFee')}</span>
          <span className="text-gray-900">{formatCurrency(cleaningFee)}</span>
        </div>
        <div className="flex justify-between text-sm font-medium text-gray-500">
          <span>{t('customer.spaceDetail.serviceFee')}</span>
          <span className="text-gray-900">{formatCurrency(serviceFee)}</span>
        </div>
        <div className="flex justify-between pt-4 border-t border-gray-100 mt-2">
          <span className="font-black text-gray-900">{t('customer.spaceDetail.total')}</span>
          <span className="font-black text-xl text-gray-900">{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  );
}
