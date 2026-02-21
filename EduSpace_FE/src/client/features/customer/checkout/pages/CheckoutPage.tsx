import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CustomerLayout } from '../../../../layouts/CustomerLayout';
import { Calendar, Clock, CreditCard, ChevronRight, CheckCircle2, ShieldCheck, Loader2, Timer, Info } from 'lucide-react';
import { formatCurrency } from '../../../../../utils';
import { BookingPriceCalculationResult, CreateBookingReq } from '../../../../../types/api';

export function CheckoutPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State aligned with CreateBookingReq
  const [bookingData, setBookingData] = useState<Partial<CreateBookingReq>>({
    startDate: '2024-01-20',
    durationDays: 1,
    startTime: '09:00',
    endTime: '12:00',
    guests: 15,
    paymentMethod: 'card'
  });

  // Mock Pricing Result from BE
  const [pricing, setPricing] = useState<BookingPriceCalculationResult>({
    dailyBreakdown: [
      { date: 'Th 7, 20/1', hours: 3, basePrice: 500000, appliedPrice: 650000, isWeekend: true }
    ],
    totalRoomPrice: 1950000,
    cleaningFee: 50000,
    serviceFee: 100000,
    extraCharges: [],
    grandTotal: 2100000,
    currency: 'VNĐ'
  });

  const [holdTimer, setHoldTimer] = useState(600); // 10 mins
  const [paymentTimer, setPaymentTimer] = useState(900); // 15 mins

  useEffect(() => {
    let interval: any;
    if (step === 2 && holdTimer > 0) {
      interval = setInterval(() => setHoldTimer(prev => prev - 1), 1000);
    } else if (step === 3 && paymentTimer > 0) {
      interval = setInterval(() => setPaymentTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, holdTimer, paymentTimer]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const nextStep = () => setStep(prev => (prev < 4 ? prev + 1 : prev) as any);
  const prevStep = () => setStep(prev => (prev > 1 ? prev - 1 : prev) as any);

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
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar className="w-6 h-6 text-red-500" />
                    <h2 className="text-2xl font-black text-gray-900">{t('customer.checkout.steps.schedule')}</h2>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('customer.checkout.schedule.startDate')}</label>
                      <input
                        type="date"
                        value={bookingData.startDate}
                        onChange={(e) => setBookingData({ ...bookingData, startDate: e.target.value })}
                        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-400 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('customer.checkout.schedule.numDays')}</label>
                      <select
                        value={bookingData.durationDays}
                        onChange={(e) => setBookingData({ ...bookingData, durationDays: parseInt(e.target.value) })}
                        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-400 transition-all appearance-none"
                      >
                        {[1, 2, 3, 4, 5, 6, 7].map(d => <option key={d} value={d}>{d} ngày</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('customer.checkout.schedule.startTime')}</label>
                      <input
                        type="time"
                        value={bookingData.startTime}
                        onChange={(e) => setBookingData({ ...bookingData, startTime: e.target.value })}
                        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-100 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('customer.checkout.schedule.endTime')}</label>
                      <input
                        type="time"
                        value={bookingData.endTime}
                        onChange={(e) => setBookingData({ ...bookingData, endTime: e.target.value })}
                        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-100 transition-all"
                      />
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
                <div className="bg-white rounded-[32px] border border-gray-100 p-10 shadow-sm space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-red-50 rounded-2xl"><Timer className="w-6 h-6 text-red-500" /></div>
                      <h2 className="text-2xl font-black text-gray-900">{t('customer.checkout.pricing.title')}</h2>
                    </div>
                  </div>

                  <div className="overflow-hidden border border-gray-100 rounded-3xl">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                          <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('customer.checkout.pricing.day')}</th>
                          <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('customer.checkout.pricing.hours')}</th>
                          <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('customer.checkout.pricing.rate')}</th>
                          <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('customer.checkout.pricing.subtotal')}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {pricing.dailyBreakdown.map((item, i) => (
                          <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-6 py-4">
                              <span className="font-bold text-gray-900">{item.date}</span>
                              {item.isWeekend && <span className="ml-2 px-2 py-0.5 bg-orange-100 text-orange-600 rounded text-[8px] font-black uppercase">Cuối tuần</span>}
                            </td>
                            <td className="px-6 py-4 font-bold text-gray-500">{item.hours}h</td>
                            <td className="px-6 py-4 font-bold text-gray-500">{formatCurrency(item.appliedPrice)}</td>
                            <td className="px-6 py-4 text-right font-black text-gray-900">{formatCurrency(item.hours * item.appliedPrice)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="space-y-4 pt-6">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-bold text-gray-400">Tổng phòng</span>
                      <span className="font-black text-gray-900">{formatCurrency(pricing.totalRoomPrice)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-bold text-gray-400">{t('customer.checkout.pricing.cleaningFee')}</span>
                      <span className="font-black text-gray-900">{formatCurrency(pricing.cleaningFee)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-bold text-gray-400">{t('customer.checkout.pricing.serviceFee')}</span>
                      <span className="font-black text-gray-900">{formatCurrency(pricing.serviceFee)}</span>
                    </div>
                    <div className="h-px bg-gray-100 my-4" />
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-black text-gray-900">{t('customer.checkout.pricing.grandTotal')}</span>
                      <span className="text-3xl font-black text-red-500 tracking-tight">{formatCurrency(pricing.grandTotal)}</span>
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

                  <div className="grid grid-cols-3 gap-4">
                    {['card', 'bank', 'momo'].map((meth) => (
                      <button
                        key={meth}
                        onClick={() => setBookingData({ ...bookingData, paymentMethod: meth as any })}
                        className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${bookingData.paymentMethod === meth ? 'border-red-500 bg-red-50/50 shadow-lg shadow-red-100' : 'border-gray-100 hover:border-gray-300'}`}
                      >
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${meth === 'momo' ? 'bg-[#A50064]' : 'bg-gray-100'}`}>
                          {meth === 'momo' ? <span className="text-white font-black text-xs">Momo</span> : <CreditCard className="w-6 h-6 text-gray-400" />}
                        </div>
                        <span className="font-black text-xs uppercase tracking-widest">{meth}</span>
                      </button>
                    ))}
                  </div>

                  <div className="bg-gray-50 p-8 rounded-3xl space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Full Name</label>
                        <input className="w-full px-5 py-4 border border-gray-200 rounded-2xl font-bold bg-white" placeholder="Nguyễn Văn A" />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Card Number</label>
                        <input className="w-full px-5 py-4 border border-gray-200 rounded-2xl font-bold bg-white" placeholder="**** **** **** 1234" />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Expiry</label>
                        <input className="w-full px-5 py-4 border border-gray-200 rounded-2xl font-bold bg-white" placeholder="MM/YY" />
                      </div>
                    </div>
                    <label className="flex items-start gap-3 mt-6 cursor-pointer group">
                      <input type="checkbox" className="mt-1 accent-red-500 w-4 h-4 rounded" defaultChecked />
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
                    onClick={nextStep}
                    className="bg-gray-900 text-white px-10 py-5 rounded-2xl font-black shadow-xl hover:shadow-2xl active:scale-95 transition-all flex items-center gap-3 group"
                  >
                    {step === 3 ? t('customer.checkout.payment.submit') : `Tiếp tục → ${steps[step].name}`}
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
                        <Calendar className="w-3 h-3" /> {bookingData.startDate}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-gray-400 font-bold">
                        <Clock className="w-3 h-3" /> {bookingData.startTime} - {bookingData.endTime}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-dashed border-gray-100">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-gray-400">Price/hr × {pricing.dailyBreakdown[0].hours}h</span>
                      <span className="text-gray-900">{formatCurrency(pricing.totalRoomPrice)}</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-gray-400">{t('customer.checkout.pricing.cleaningFee')}</span>
                      <span className="text-gray-900">{formatCurrency(pricing.cleaningFee)}</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-gray-400">{t('customer.checkout.pricing.serviceFee')}</span>
                      <span className="text-gray-900">{formatCurrency(pricing.serviceFee)}</span>
                    </div>
                    <div className="h-px bg-gray-50 my-2" />
                    <div className="flex justify-between items-end">
                      <span className="text-sm font-black text-gray-900">Total</span>
                      <span className="text-2xl font-black text-red-500 tracking-tight">{formatCurrency(pricing.grandTotal)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[32px] p-8 text-white shadow-xl shadow-blue-100">
                <ShieldCheck className="w-8 h-8 opacity-50 mb-4" />
                <h4 className="font-black mb-2 uppercase tracking-widest text-xs opacity-75">EduSpace Guarantee</h4>
                <p className="text-[10px] font-medium leading-relaxed opacity-90">
                  Your payment is strictly held in escrow. Host only receives funds after you successfully check-in. Professional cleaning service is certified.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}
