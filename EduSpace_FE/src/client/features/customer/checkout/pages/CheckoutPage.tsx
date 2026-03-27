import { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CreateBookingReq, BookingPriceCalculationResult } from '@/types';
import { roomApiService } from '@/client/features/room';
import { checkoutBookingApiService } from '../services/checkoutBookingApiService';
import { profileService } from '../../profile/services/profileService';
import { CustomerLayout } from '../../../../layouts/CustomerLayout';
import { Calendar, Clock, CreditCard, ChevronRight, CheckCircle2, Loader2, Timer, Info, FileText, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { bookingDepositService } from '../services/bookingDepositService';
import { formatCurrency } from '../../../../../utils';
import { VoucherInput } from '../components/VoucherInput';
import type { AppliedVoucher } from '../components/VoucherInput';
import {
  publicDepositRefundPolicyService,
  type PublicDepositRefundPolicy,
  matchDepositPolicyForDuration,
  pickPrimaryRefundPolicy,
  refundApplicabilityLabel,
  hoursUntilCheckIn,
} from '../services/publicDepositRefundPolicyService';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

/** Chuẩn hóa SĐT VN: +84 / 84 → 0, bỏ khoảng trắng, dấu chấm/gạch */
function normalizeVnPhone(raw: string): string {
  let t = raw.trim().replace(/[\s.-]/g, '');
  if (t.startsWith('+84')) t = `0${t.slice(3)}`;
  else if (/^84(3|5|7|8|9)\d{8}$/.test(t)) t = `0${t.slice(2)}`;
  return t;
}

/** Di động VN: 10 số, đầu 03 / 05 / 07 / 08 / 09 */
function isValidVietnamesePhone(raw: string): boolean {
  return /^0(3|5|7|8|9)\d{8}$/.test(normalizeVnPhone(raw));
}

function isValidEmailFormat(email: string): boolean {
  const s = email.trim();
  if (s.length < 5) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s);
}

export function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const bookingDetails = (location.state as any)?.bookingDetails;

  // Form State aligned with CreateBookingReq
  const startTimeStr: string | undefined = bookingDetails?.startTime;
  const endTimeStr: string | undefined = bookingDetails?.endTime;

  const computeDurationMinutes = (startHm?: string, endHm?: string) => {
    if (!startHm || !endHm) return 0;
    const [sh, sm] = startHm.split(':').map((v: string) => Number(v));
    const [eh, em] = endHm.split(':').map((v: string) => Number(v));
    if (!Number.isFinite(sh) || !Number.isFinite(sm) || !Number.isFinite(eh) || !Number.isFinite(em)) return 0;
    const start = sh * 60 + sm;
    const end = eh * 60 + em;
    return Math.max(0, end - start);
  };

  const [bookingData, setBookingData] = useState<Partial<CreateBookingReq>>(() => {
    const bookingDate = bookingDetails?.bookingDate;
    const durationMinutes = computeDurationMinutes(startTimeStr, endTimeStr);
    return {
      roomId: bookingDetails?.roomId,
      bookingDate,
      durationValue: durationMinutes,
      durationUnit: durationMinutes > 0 ? 'MINUTE' : 'HOUR',
      startDateTime: bookingDate && startTimeStr ? `${bookingDate}T${startTimeStr}:00` : undefined,
      endDateTime: bookingDate && endTimeStr ? `${bookingDate}T${endTimeStr}:00` : undefined,
    };
  });

  // Mock Pricing Result from BE
  const [pricing, setPricing] = useState<BookingPriceCalculationResult>({
    dailyBreakdown: [],
    totalRoomPrice: 0,
    cleaningFee: 0,
    serviceFee: 0,
    extraCharges: [],
    grandTotal: 0,
    currency: 'VNĐ'
  });

  const [policyRows, setPolicyRows] = useState<PublicDepositRefundPolicy[]>([]);
  const [policyLoadDone, setPolicyLoadDone] = useState(false);

  const [appliedVoucher, setAppliedVoucher] = useState<AppliedVoucher | null>(null);

  const [holdTimer, setHoldTimer] = useState(600); // 10 mins
  const [paymentTimer, setPaymentTimer] = useState(900); // 15 mins
  const [payerName, setPayerName] = useState('');
  const [payerEmail, setPayerEmail] = useState('');
  const [payerPhone, setPayerPhone] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [payingDeposit, setPayingDeposit] = useState(false);

  useEffect(() => {
    let interval: any;
    if (step === 2 && holdTimer > 0) {
      interval = setInterval(() => setHoldTimer(prev => prev - 1), 1000);
    } else if (step === 3 && paymentTimer > 0) {
      interval = setInterval(() => setPaymentTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, holdTimer, paymentTimer]);

  // Keep start/end datetime in sync when user changes booking date on step 1.
  useEffect(() => {
    if (!bookingData.bookingDate || !startTimeStr || !endTimeStr) return;
    const durationMinutes = computeDurationMinutes(startTimeStr, endTimeStr);
    setBookingData((prev) => ({
      ...prev,
      startDateTime: `${bookingData.bookingDate}T${startTimeStr}:00`,
      endDateTime: `${bookingData.bookingDate}T${endTimeStr}:00`,
      durationValue: durationMinutes,
      durationUnit: durationMinutes > 0 ? 'MINUTE' : 'HOUR',
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingData.bookingDate, startTimeStr, endTimeStr]);

  useEffect(() => {
    let cancelled = false;
    publicDepositRefundPolicyService
      .listActive()
      .then((rows) => {
        if (!cancelled) setPolicyRows(rows);
      })
      .catch(() => {
        if (!cancelled) setPolicyRows([]);
      })
      .finally(() => {
        if (!cancelled) setPolicyLoadDone(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const durationMinutesForPolicy = bookingData.durationValue ?? 0;
  const applicableDepositPolicy = useMemo(
    () => matchDepositPolicyForDuration(durationMinutesForPolicy, policyRows),
    [durationMinutesForPolicy, policyRows],
  );
  const primaryRefundPolicy = useMemo(() => pickPrimaryRefundPolicy(policyRows), [policyRows]);
  const hoursUntilCheckInVal = useMemo(
    () => hoursUntilCheckIn(bookingData.bookingDate, startTimeStr),
    [bookingData.bookingDate, startTimeStr],
  );
  const refundTierLine = useMemo(
    () => refundApplicabilityLabel(hoursUntilCheckInVal, primaryRefundPolicy),
    [hoursUntilCheckInVal, primaryRefundPolicy],
  );

  const depositPoliciesForDialog = useMemo(
    () =>
      [...policyRows]
        .filter((p) => p.policyType === 'DEPOSIT')
        .sort((a, b) => (a.startHour ?? 0) - (b.startHour ?? 0)),
    [policyRows],
  );

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const nextStep = async () => {
    if (step === 3) {
      if (
        !bookingData.roomId ||
        !bookingData.bookingDate ||
        !bookingData.startDateTime ||
        !bookingData.endDateTime ||
        !bookingData.durationValue ||
        !bookingData.durationUnit
      ) {
        return;
      }
      const profile = await profileService.getProfile();
      const email = (payerEmail || (profile as { email?: string }).email || '').trim();
      if (!email) {
        toast.error(t('checkout.emailRequired', 'Vui lòng nhập email để nhận xác nhận đặt phòng.'));
        return;
      }
      await checkoutBookingApiService.createBooking({
        roomId: bookingData.roomId,
        userId: profile.id,
        guestEmail: email,
        bookingDate: bookingData.bookingDate!,
        startDateTime: bookingData.startDateTime!,
        endDateTime: bookingData.endDateTime!,
        durationValue: bookingData.durationValue!,
        durationUnit: bookingData.durationUnit!,
        extraAmenities: [],
      });
    }
    setStep((prev) => (prev < 4 ? prev + 1 : prev) as any);
  };
  const prevStep = () => setStep(prev => (prev > 1 ? prev - 1 : prev) as any);

  const stepUnit = bookingDetails?.stepUnit || 60;
  const isWholeHour = bookingData.durationValue ? (bookingData.durationValue % 60 === 0) : true;

  useEffect(() => {
    if (
      !bookingData.roomId ||
      !bookingData.bookingDate ||
      !bookingData.startDateTime ||
      !bookingData.endDateTime ||
      bookingData.durationValue === undefined
    ) {
      return;
    }

    // Nếu thời gian lẻ, tính giá dựa trên step_unit thay vì gọi API bảng quy tắc
    if (!isWholeHour) {
      const pricePerHour = bookingDetails?.price || 0;
      const stepPrice = pricePerHour * (stepUnit / 60);
      const totalUnits = bookingData.durationValue / stepUnit;
      const roomTotal = stepPrice * totalUnits;
      
      setPricing({
        dailyBreakdown: [
          {
            date: bookingData.bookingDate ?? '',
            hours: bookingData.durationValue / 60,
            basePrice: stepPrice,
            appliedPrice: stepPrice,
            isWeekend: false,
          },
        ],
        totalRoomPrice: roomTotal,
        cleaningFee: 0,
        serviceFee: 0,
        extraCharges: [],
        grandTotal: roomTotal,
        currency: 'VNĐ',
      });
      return;
    }

    roomApiService
      .quotePrice(bookingData.roomId, {
        startDateTime: bookingData.startDateTime,
        endDateTime: bookingData.endDateTime,
      })
      .then((quote) => {
        const hours = quote.durationMinutes / 60;
        const appliedPerHour = hours > 0 ? quote.subtotal / hours : quote.unitPrice ?? 0;
        setPricing({
            dailyBreakdown: [
              {
                date: bookingData.bookingDate ?? '',
                hours,
                basePrice: appliedPerHour,
                appliedPrice: appliedPerHour,
                isWeekend: quote.weekendSurchargeApplied,
              },
            ],
            totalRoomPrice: quote.total,
            cleaningFee: 0,
            serviceFee: 0,
            extraCharges: [],
            grandTotal: quote.total,
            currency: 'VNĐ',
          });
      })
      .catch(() => undefined);
  }, [bookingData.roomId, bookingData.bookingDate, bookingData.startDateTime, bookingData.endDateTime, bookingData.durationValue, isWholeHour, stepUnit, bookingDetails?.price]);

  const discountAmount = appliedVoucher?.discountAmount ?? 0;
  const finalTotal = Math.max(0, pricing.grandTotal - discountAmount);

  const isPayDepositFormValid = useMemo(() => {
    const fullName = payerName.trim();
    const email = payerEmail.trim();
    if (!fullName || !email || !payerPhone.trim()) return false;
    if (!isValidEmailFormat(email)) return false;
    if (!isValidVietnamesePhone(payerPhone)) return false;
    if (!agreeTerms) return false;
    return true;
  }, [payerName, payerEmail, payerPhone, agreeTerms]);

  const handlePayDeposit = async () => {
    const fullName = payerName.trim();
    const email = payerEmail.trim();
    const phoneNorm = normalizeVnPhone(payerPhone);

    if (!fullName) {
      toast.error('Vui lòng nhập họ và tên.');
      return;
    }
    if (!email) {
      toast.error('Vui lòng nhập email.');
      return;
    }
    if (!isValidEmailFormat(email)) {
      toast.error('Email không đúng định dạng (ví dụ: ten@email.com).');
      return;
    }
    if (!payerPhone.trim()) {
      toast.error('Vui lòng nhập số điện thoại.');
      return;
    }
    if (!isValidVietnamesePhone(payerPhone)) {
      toast.error(
        'Số điện thoại không hợp lệ. Nhập 10 số di động Việt Nam (ví dụ 0912345678) hoặc +84912345678.',
      );
      return;
    }
    if (!agreeTerms) {
      toast.error('Bạn cần đồng ý điều khoản dịch vụ trước khi thanh toán cọc.');
      return;
    }

    setPayingDeposit(true);
    try {
      const profile = await profileService.getProfile();
      // 1. Create the booking first
      const booking = await checkoutBookingApiService.createBooking({
        roomId: bookingData.roomId!,
        userId: profile.id,
        guestEmail: email,
        bookingDate: bookingData.bookingDate!,
        startDateTime: bookingData.startDateTime!,
        endDateTime: bookingData.endDateTime!,
        durationValue: bookingData.durationValue!,
        durationUnit: bookingData.durationUnit!,
        extraAmenities: [],
        totalPrice: pricing.totalRoomPrice,
        finalPrice: finalTotal,
        discountAmount: discountAmount > 0 ? discountAmount : 0,
        voucherCode: appliedVoucher?.code || undefined,
      });

      // 2. Create the deposit intent using the booking ID
      const intent = await bookingDepositService.createIntent(booking.id);
      toast.success('Đã tạo giữ chỗ 5 phút. Vui lòng hoàn tất thanh toán cọc.');
      navigate(`/bookings/${booking.id}`, {
        state: {
          showPayment: true,
          depositId: intent.depositId,
          expiresAt: intent.expiresAt,
          bookingCode: booking.bookingCode,
          totalPrice: finalTotal,
          spaceName: bookingDetails?.roomName || 'EduSpace Room',
          spaceImage: bookingDetails?.image || bookingDetails?.roomImage,
          payerName: fullName,
          payerEmail: email,
          payerPhone: phoneNorm,
        },
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Tạo thanh toán cọc thất bại');
    } finally {
      setPayingDeposit(false);
    }
  };

  const steps = [
    { id: 1, name: t('customer.checkout.steps.schedule') },
    { id: 2, name: t('customer.checkout.steps.review') },
    { id: 3, name: t('customer.checkout.steps.payment') },
    { id: 4, name: t('customer.checkout.steps.confirm') },
  ];

  return (
    <CustomerLayout>
      <div className="min-h-screen bg-gray-50/50 py-12 animate-in fade-in duration-700">
        <div className="max-w-5xl mx-auto px-4">
          {/* Header & Steps */}
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-900 font-black text-xs uppercase tracking-widest">{t('common.goBack')}</button>
              <h1 className="text-3xl font-black text-gray-900">{t('customer.checkout.title')}</h1>
            </div>
            {(step === 2 || step === 3) && (
              <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-100 rounded-full shadow-sm animate-pulse">
                <Timer className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-black text-amber-600 uppercase tracking-wider">
                  {step === 2 ? t('customer.checkout.pricing.holdTimer') : 'Thanh toán'}: {formatTime(step === 2 ? holdTimer : paymentTimer)}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mb-12 bg-white p-4 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
            {steps.map((s, i) => (
              <div key={s.id} className="flex items-center gap-3 relative z-10 flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm transition-all duration-500 ${step >= s.id ? 'bg-red-500 text-white shadow-lg shadow-red-200' : 'bg-gray-100 text-gray-400'
                  }`}>
                  {step > s.id ? '✓' : s.id}
                </div>
                <span className={`text-xs font-black uppercase tracking-widest ${step >= s.id ? 'text-gray-900' : 'text-gray-300'}`}>{s.name}</span>
                {i < steps.length - 1 && <div className="flex-1 h-px bg-gray-100 mx-4" />}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Step 1: Schedule */}
              {step === 1 && (
                <div className="bg-white rounded-[32px] border border-gray-100 p-10 shadow-sm space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-gray-900 tracking-tight">
                        {formatCurrency(bookingDetails?.price || 0)}
                      </span>
                      <span className="text-gray-500 font-bold">/ giờ</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="w-6 h-6 text-red-500" />
                      <h2 className="text-2xl font-black text-gray-900">{t('customer.checkout.steps.schedule')}</h2>
                    </div>
                  </div>

                  <div className="space-y-6 max-w-md">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('customer.checkout.schedule.startDate')}</label>
                      <input
                        type="date"
                        value={bookingData.bookingDate}
                        readOnly
                        tabIndex={-1}
                        aria-readonly="true"
                        className="w-full px-5 py-4 bg-gray-100 border border-gray-100 rounded-2xl font-bold text-gray-400 cursor-not-allowed shadow-inner pointer-events-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">GIỜ VÀO</label>
                      <input
                        type="time"
                        value={bookingDetails?.startTime || ''}
                        readOnly
                        tabIndex={-1}
                        aria-readonly="true"
                        className="w-full px-5 py-4 bg-gray-100 border border-gray-100 rounded-2xl font-bold text-gray-400 cursor-not-allowed shadow-inner pointer-events-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">THỜI LƯỢNG THUÊ</label>
                      <div className="w-full px-5 py-4 bg-gray-100 border border-gray-100 rounded-2xl font-bold text-gray-400 cursor-not-allowed shadow-inner select-none">
                        {bookingData.durationUnit === 'MINUTE'
                          ? (bookingData.durationValue ?? 0) + ' phút'
                          : (bookingData.durationValue ?? 0) + ' giờ'}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">GIỜ RA</label>
                      <div className="relative">
                        <input
                          type="time"
                          value={bookingDetails?.endTime || ''}
                          readOnly
                          tabIndex={-1}
                          aria-readonly="true"
                          className="w-full px-5 py-4 bg-gray-100 border border-gray-100 rounded-2xl font-bold text-gray-400 cursor-not-allowed shadow-inner pointer-events-none"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-300 uppercase tracking-tighter">
                          AUTO
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">SỐ KHÁCH (tối đa 20)</label>
                      <div className="w-full px-5 py-4 bg-gray-100 border border-gray-100 rounded-2xl font-bold text-gray-400 cursor-not-allowed shadow-inner select-none">
                        {bookingDetails?.guests ?? 1}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-5 bg-blue-50/50 border border-blue-100 rounded-2xl">
                    <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs font-medium text-blue-700 leading-relaxed">
                      {t('customer.checkout.schedule.availabilityNote')}
                    </p>
                  </div>
                </div>
              )}

              {/* Step 2: Pricing Review */}
              {step === 2 && (
                <div className="bg-white rounded-[40px] border border-gray-100 p-10 shadow-[0_20px_60px_rgba(0,0,0,0.03)] ring-1 ring-gray-100/50 space-y-10 animate-in slide-in-from-bottom-8 duration-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-4 bg-gradient-to-br from-red-50 to-orange-50 rounded-[24px] ring-1 ring-red-100/50 shadow-sm">
                        <Timer className="w-6 h-6 text-red-500" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">{t('customer.checkout.pricing.title')}</h2>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-1">Review your calculation</p>
                      </div>
                    </div>
                  </div>

                  <div className="overflow-hidden rounded-[24px] border border-gray-100/80 shadow-sm">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-900 border-b border-gray-800">
                          <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{t('customer.checkout.pricing.day')}</th>
                          <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{t('customer.checkout.pricing.hours')}</th>
                          <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{t('customer.checkout.pricing.rate')}</th>
                          <th className="px-8 py-5 text-right text-[10px] font-black text-white uppercase tracking-[0.2em]">{t('customer.checkout.pricing.subtotal')}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50 bg-white">
                        {pricing.totalRoomPrice === 0 ? (
                          <tr>
                            <td colSpan={4} className="px-8 py-10 text-center">
                              <div className="flex flex-col items-center gap-2">
                                <Loader2 className="w-6 h-6 animate-spin text-gray-200" />
                                <span className="text-xs font-bold text-gray-300 uppercase tracking-widest">Calculating…</span>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          pricing.dailyBreakdown.map((item, i) => (
                            <tr key={i} className="group hover:bg-gray-50/80 transition-all duration-300">
                              <td className="px-8 py-6">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-gray-900">{item.date}</span>
                                  {item.isWeekend && (
                                    <span className="px-2 py-0.5 bg-orange-100 text-orange-600 rounded-full text-[8px] font-black uppercase ring-1 ring-orange-200/50">
                                      Weekend
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-8 py-6">
                                <span className="font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full text-xs">{item.hours}h</span>
                              </td>
                              <td className="px-8 py-6 font-bold text-gray-400">{formatCurrency(item.appliedPrice)}</td>
                              <td className="px-8 py-6 text-right">
                                <span className="font-black text-gray-900 tracking-tight">{formatCurrency(item.hours * item.appliedPrice)}</span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Promotion Code</label>
                        <VoucherInput
                          orderTotal={pricing.grandTotal}
                          onApply={setAppliedVoucher}
                          appliedVoucher={appliedVoucher}
                        />
                      </div>

                      <div className="bg-gray-50/50 rounded-[32px] p-8 space-y-4 ring-1 ring-gray-100/50">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-gray-400 uppercase tracking-widest">Tiền phòng</span>
                          <span className="font-black text-gray-900 leading-none">{formatCurrency(pricing.totalRoomPrice)}</span>
                        </div>
                        
                        {pricing.cleaningFee > 0 && (
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-gray-400 uppercase tracking-widest">{t('customer.checkout.pricing.cleaningFee')}</span>
                            <span className="font-black text-gray-900 leading-none">{formatCurrency(pricing.cleaningFee)}</span>
                          </div>
                        )}
                        
                        {pricing.serviceFee > 0 && (
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-gray-400 uppercase tracking-widest">{t('customer.checkout.pricing.serviceFee')}</span>
                            <span className="font-black text-gray-900 leading-none">{formatCurrency(pricing.serviceFee)}</span>
                          </div>
                        )}

                        {discountAmount > 0 && (
                          <div className="flex justify-between items-center text-xs animate-in slide-in-from-right-2">
                            <span className="font-bold text-green-600 uppercase tracking-widest flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                              Giảm giá ({appliedVoucher?.code})
                            </span>
                            <span className="font-black text-green-600 leading-none">-{formatCurrency(discountAmount)}</span>
                          </div>
                        )}

                        <div className="h-px bg-gray-200/50 my-2" />
                        
                        <div className="flex justify-between items-end pt-2">
                          <div className="space-y-1">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{t('customer.checkout.pricing.grandTotal')}</span>
                            <h3 className="text-3xl font-black text-gray-900 tracking-tighter">
                              {t('TỔNG CỘNG')}
                            </h3>
                          </div>
                          <div className="text-right">
                            {discountAmount > 0 && (
                              <div className="text-xs font-bold text-gray-300 line-through mb-1">{formatCurrency(pricing.grandTotal)}</div>
                            )}
                            <div className="px-4 py-2 bg-red-50 rounded-2xl ring-1 ring-red-100/50">
                              <span className="text-3xl font-black text-red-500 tracking-tighter drop-shadow-sm">{formatCurrency(finalTotal)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Payment */}
              {step === 3 && (
                <div className="bg-white rounded-[32px] border border-gray-100 p-10 shadow-sm space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-6 h-6 text-red-500" />
                    <h2 className="text-2xl font-black text-gray-900">{t('customer.checkout.payment.onlineTitle')}</h2>
                  </div>

                  <div className="rounded-3xl border-2 border-red-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="rounded-2xl border border-gray-200 bg-white px-3 py-2 text-xs font-black text-gray-700">
                          Powered by PayOS
                        </div>
                        <div>
                          <p className="text-lg font-black text-gray-900">CHUYỂN KHOẢN VIETQR</p>
                          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Mô phỏng thanh toán cọc</p>
                        </div>
                      </div>
                      <CheckCircle2 className="h-6 w-6 text-red-500" />
                    </div>
                  </div>

                  <div className="bg-gray-50 p-8 rounded-3xl space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Full Name</label>
                        <input
                          value={payerName}
                          onChange={(e) => setPayerName(e.target.value)}
                          className="w-full px-5 py-4 border border-gray-200 rounded-2xl font-bold bg-white"
                          placeholder="Nguyễn Văn A"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Email</label>
                        <input
                          type="email"
                          value={payerEmail}
                          onChange={(e) => setPayerEmail(e.target.value)}
                          className="w-full px-5 py-4 border border-gray-200 rounded-2xl font-bold bg-white"
                          placeholder="you@email.com"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Số điện thoại</label>
                        <input
                          type="tel"
                          inputMode="numeric"
                          autoComplete="tel"
                          value={payerPhone}
                          onChange={(e) => setPayerPhone(e.target.value)}
                          className="w-full px-5 py-4 border border-gray-200 rounded-2xl font-bold bg-white"
                          placeholder="0912345678 hoặc +84912345678"
                        />
                        <p className="text-[10px] text-gray-400 font-medium mt-1">10 số di động (đầu 03, 05, 07, 08, 09).</p>
                      </div>
                    </div>
                    <label className="flex items-start gap-3 mt-6 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={agreeTerms}
                        onChange={(e) => setAgreeTerms(e.target.checked)}
                        className="mt-1 accent-red-500 w-4 h-4 rounded"
                      />
                      <span className="text-xs font-medium text-gray-500 leading-relaxed group-hover:text-gray-900 transition-colors">
                        I agree to the <button className="text-red-500 font-bold hover:underline">Terms of Service</button> and booking policies.
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {/* Step 4: System Checking & Final Result */}
              {step === 4 && (
                <div className="bg-white rounded-[32px] border border-gray-100 p-16 shadow-lg text-center space-y-8 animate-in zoom-in duration-500">
                  <div className="relative w-32 h-32 mx-auto">
                    <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-20" />
                    <div className="relative w-32 h-32 bg-green-500 rounded-full flex items-center justify-center shadow-xl shadow-green-200">
                      <CheckCircle2 className="w-16 h-16 text-white" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-4xl font-black text-gray-900 tracking-tight">{t('customer.checkout.success')}</h2>
                    <p className="text-gray-400 font-medium">{t('customer.checkout.payment.escrowNote')}</p>
                  </div>

                  <div className="bg-gray-50 p-8 rounded-[32px] max-w-sm mx-auto text-left space-y-4">
                    <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-gray-400">
                      <span>Mã đơn hàng</span>
                      <span className="text-gray-900">#EDU-2024-0010</span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-gray-400">
                      <span>Trạng thái</span>
                      <span className="bg-green-100 text-green-600 px-2 py-0.5 rounded">Đã thanh toán</span>
                    </div>
                  </div>

                  <div className="pt-4 flex flex-col items-center gap-4">
                    <button
                      onClick={() => navigate('/bookings')}
                      className="bg-gray-900 text-white px-10 py-4 rounded-2xl font-black shadow-xl hover:shadow-2xl transition-all active:scale-95 flex items-center gap-3 mx-auto"
                    >
                      Xem đơn đặt hàng
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => navigate('/')}
                      className="text-xs font-black text-gray-400 uppercase tracking-widest hover:text-red-500 transition-colors"
                    >
                      Tiếp tục tìm kiếm
                    </button>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              {step < 4 && (
                <div className="flex items-center justify-between pt-6">
                  <button
                    onClick={prevStep}
                    disabled={step === 1}
                    className={`px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${step === 1 ? 'text-gray-200' : 'text-gray-400 hover:text-gray-900'}`}
                  >
                    ← {t('common.goBack')}
                  </button>
                  <button
                    onClick={() => {
                      if (step === 3) void handlePayDeposit();
                      else nextStep();
                    }}
                    disabled={step === 3 && (payingDeposit || !isPayDepositFormValid)}
                    className="bg-gray-900 text-white px-10 py-5 rounded-2xl font-black shadow-xl hover:shadow-2xl active:scale-95 transition-all flex items-center gap-3 group disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {step === 3 ? (
                      payingDeposit ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          PayOS…
                        </>
                      ) : (
                        t('customer.checkout.payment.payDeposit')
                      )
                    ) : (
                      `Tiếp tục → ${steps[step].name}`
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Sidebar Summary */}
            <div className="space-y-6">
              <div className="bg-white rounded-[32px] border border-gray-100 p-8 shadow-sm">
                <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
                  Booking Summary
                </h3>
                <div className="space-y-6">
                  <div className="flex gap-4 p-3 bg-gray-50 rounded-2xl overflow-hidden hover:bg-gray-100 transition-colors">
                    <img
                      src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=100&h=100&fit=crop"
                      className="w-16 h-16 rounded-xl object-cover shadow-sm"
                    />
                    <div>
                      <div className="font-bold text-gray-900 text-sm line-clamp-1">Modern Training Room A</div>
                      <div className="flex items-center gap-1 text-[10px] text-gray-400 font-bold mt-1">
                        <Calendar className="w-3 h-3" /> {bookingData.bookingDate}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-gray-400 font-bold">
                        <Clock className="w-3 h-3" /> {bookingDetails?.startTime} - {bookingDetails?.endTime}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-dashed border-gray-100">
                    <div className="flex justify-between text-xs font-bold items-center">
                      <span className="text-gray-400 uppercase tracking-widest text-[9px]">
                        {isWholeHour 
                          ? `Price/hr × ${pricing.dailyBreakdown[0]?.hours ?? 0}h` 
                          : `Price/${stepUnit}m × ${Math.round((bookingData.durationValue || 0) / stepUnit)} u`}
                      </span>
                      <span className="text-gray-900">{formatCurrency(pricing.totalRoomPrice)}</span>
                    </div>
                    
                    {pricing.cleaningFee > 0 && (
                      <div className="flex justify-between text-xs font-bold items-center">
                        <span className="text-gray-400 uppercase tracking-widest text-[9px]">{t('customer.checkout.pricing.cleaningFee')}</span>
                        <span className="text-gray-900">{formatCurrency(pricing.cleaningFee)}</span>
                      </div>
                    )}
                    
                    {pricing.serviceFee > 0 && (
                      <div className="flex justify-between text-xs font-bold items-center">
                        <span className="text-gray-400 uppercase tracking-widest text-[9px]">{t('customer.checkout.pricing.serviceFee')}</span>
                        <span className="text-gray-900">{formatCurrency(pricing.serviceFee)}</span>
                      </div>
                    )}

                    {discountAmount > 0 && (
                      <div className="flex justify-between text-[11px] font-bold text-green-600 animate-in fade-in duration-300 items-center">
                        <span className="uppercase tracking-widest text-[9px]">Giảm giá ({appliedVoucher?.code})</span>
                        <span>-{formatCurrency(discountAmount)}</span>
                      </div>
                    )}

                    <div className="h-px bg-gray-50 my-2" />
                    <div className="flex justify-between items-end">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Total</span>
                      <div className="text-right">
                        {discountAmount > 0 && (
                          <div className="text-[10px] font-black text-gray-300 line-through opacity-50">{formatCurrency(pricing.grandTotal)}</div>
                        )}
                        <span className="text-2xl font-black text-red-500 tracking-tighter drop-shadow-sm">{formatCurrency(finalTotal)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {/* Deposit Policy Card */}
                <div className="bg-white rounded-[32px] border border-gray-100 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] ring-1 ring-gray-100/50 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] group">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl ring-1 ring-orange-100/50 group-hover:scale-110 transition-transform duration-500">
                      <FileText className="w-5 h-5 text-orange-500" />
                    </div>
                    <div className="space-y-2 min-w-0 flex-1">
                      <h4 className="font-black text-[10px] uppercase tracking-[0.2em] text-gray-400 group-hover:text-orange-500 transition-colors duration-300">
                        Chính sách cọc
                      </h4>
                      {!policyLoadDone ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-3 h-3 animate-spin text-gray-300" />
                          <p className="text-xs text-gray-300 font-medium">Đang tải…</p>
                        </div>
                      ) : applicableDepositPolicy ? (
                        <div className="space-y-2">
                          <p className="text-sm font-black text-gray-900 leading-snug tracking-tight">
                            {applicableDepositPolicy.policyName}
                          </p>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-100/50 text-orange-600 border border-orange-200/50 shadow-sm">
                              Cọc {Number(applicableDepositPolicy.depositPercentage ?? 0)}%
                            </span>
                            {applicableDepositPolicy.startHour != null && (
                              <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-full border border-gray-100">
                                {applicableDepositPolicy.endHour != null
                                  ? `⏱️ ${applicableDepositPolicy.startHour}–${applicableDepositPolicy.endHour} giờ`
                                  : `⏱️ ≥${applicableDepositPolicy.startHour} giờ`}
                              </span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <p className="text-[11px] text-gray-500 font-medium italic">Chưa cấu hình.</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Refund Policy Card */}
                <div className="bg-white rounded-[32px] border border-gray-100 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] ring-1 ring-gray-100/50 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] group">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl ring-1 ring-emerald-100/50 group-hover:scale-110 transition-transform duration-500">
                      <ShieldCheck className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div className="space-y-2 min-w-0 flex-1">
                      <h4 className="font-black text-[10px] uppercase tracking-[0.2em] text-gray-400 group-hover:text-emerald-500 transition-colors duration-300">
                        Chính sách hoàn tiền
                      </h4>
                      {!policyLoadDone ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-3 h-3 animate-spin text-gray-300" />
                          <p className="text-xs text-gray-300 font-medium">Đang tải…</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="bg-emerald-50/30 p-2.5 rounded-xl border border-emerald-100/50">
                            <p className="text-[11px] font-bold text-emerald-900 leading-relaxed">
                              {refundTierLine}
                            </p>
                          </div>
                          {primaryRefundPolicy?.highlightText && (
                            <p className="text-[10px] text-gray-400 font-medium italic leading-relaxed pl-1 border-l-2 border-gray-100">
                              "{primaryRefundPolicy.highlightText}"
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <Dialog>
                  <DialogTrigger asChild>
                    <button
                      type="button"
                      className="group/btn relative w-full overflow-hidden rounded-2xl bg-gray-900 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] active:scale-95"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-orange-600/20 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500" />
                      <span className="relative z-10">Xem chi tiết chính sách cọc</span>
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl">
                    <DialogHeader>
                      <DialogTitle className="text-lg font-black text-gray-900 pr-8">
                        Chính sách hoàn cọc theo từng mức đặt chỗ
                      </DialogTitle>
                      <p className="text-xs text-gray-500 font-medium pt-1">
                        Các mức cọc và quy tắc hoàn do nền tảng/cơ sở áp dụng có thể thay đổi; vui lòng đối chiếu bản chính trên hợp đồng điện tử khi thanh toán.
                      </p>
                    </DialogHeader>
                    <div className="space-y-3 pt-2">
                      {depositPoliciesForDialog.length === 0 ? (
                        <p className="text-sm text-gray-500 font-medium">Chưa có chính sách cọc công khai.</p>
                      ) : (
                        depositPoliciesForDialog.map((p) => {
                          const isApplied =
                            applicableDepositPolicy != null && p.id === applicableDepositPolicy.id;
                          return (
                            <div
                              key={p.id}
                              data-applied-policy={isApplied ? 'true' : undefined}
                              className={`rounded-2xl p-4 space-y-2 transition-colors ${
                                isApplied
                                  ? 'border-2 border-red-500 bg-gradient-to-br from-red-50/90 to-orange-50/50 shadow-md shadow-red-100/80 ring-1 ring-red-200/60'
                                  : 'border border-gray-100 bg-gray-50/80'
                              }`}
                            >
                              {isApplied && (
                                <div className="flex items-center gap-2 -mt-0.5 mb-1">
                                  <span className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white">
                                    <CheckCircle2 className="w-3.5 h-3.5" aria-hidden />
                                    Đang áp dụng cho đơn này
                                  </span>
                                </div>
                              )}
                              <div className="flex items-start justify-between gap-2">
                                <span className="text-sm font-black text-gray-900">{p.policyName}</span>
                                <span className="text-xs font-black text-red-600 whitespace-nowrap">
                                  {Number(p.depositPercentage ?? 0)}% cọc
                                </span>
                              </div>
                              {p.description && (
                                <p className="text-xs text-gray-600 font-medium leading-relaxed">{p.description}</p>
                              )}
                              <div
                                className={`text-[10px] font-bold uppercase tracking-wider ${
                                  isApplied ? 'text-red-700/80' : 'text-gray-400'
                                }`}
                              >
                                {p.startHour != null
                                  ? p.endHour != null
                                    ? `Áp dụng khi tổng thời lượng đặt: ${p.startHour}–${p.endHour} giờ`
                                    : `Áp dụng khi tổng thời lượng đặt từ ${p.startHour} giờ trở lên`
                                  : 'Áp dụng theo cấu hình chung'}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}
