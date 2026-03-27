import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { CustomerLayout } from '../../../../layouts/CustomerLayout';
import { useAuthStore } from '@/stores/authStore';
import { guestFeatureAllowed, guestPermissions } from '../../permissions/guestPermissions';
import {
  ArrowLeft, QrCode, MessageCircle, Calendar, Clock, MapPin, Users,
  CreditCard, Star, Copy, CheckCircle2, Phone, ShieldCheck, Timer,
  Loader2, AlertCircle,
} from 'lucide-react';
import { formatCurrency } from '../../../../../utils';
import { BOOKINGS } from '../data/mockData';
import { Booking } from '../types';
import { ReviewModal } from '../components/ReviewModal';
import { bookingDepositService } from '../../checkout/services/bookingDepositService';
import { toast } from 'sonner';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type PaymentState = {
  showPayment: true;
  depositId: number;
  expiresAt: string;
  bookingCode: string;
  totalPrice: number;
  spaceName?: string;
  spaceImage?: string;
  payerName?: string;
  payerEmail?: string;
  payerPhone?: string;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

// ---------------------------------------------------------------------------
// PayOS Simulated Payment Modal
// ---------------------------------------------------------------------------

function PayOSModal({
  depositId,
  expiresAt,
  bookingCode,
  totalPrice,
  spaceName,
  spaceImage,
  payerName,
  payerEmail,
  payerPhone,
  onSuccess,
  onExpired,
}: {
  depositId: number;
  expiresAt: string;
  bookingCode: string;
  totalPrice: number;
  spaceName?: string;
  spaceImage?: string;
  payerName?: string;
  payerEmail?: string;
  payerPhone?: string;
  onSuccess: (bookingCode: string) => void;
  onExpired: () => void;
}) {
  const depositAmount = Math.round(totalPrice * 0.25);

  // Timer: remaining seconds until expiresAt
  const [timer, setTimer] = useState(() => {
    const remaining = Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000);
    return Math.max(0, remaining);
  });

  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Countdown
  useEffect(() => {
    if (timer <= 0) { onExpired(); return; }
    const id = setInterval(() => setTimer(prev => {
      if (prev <= 1) { clearInterval(id); onExpired(); return 0; }
      return prev - 1;
    }), 1000);
    return () => clearInterval(id);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Polling deposit status
  const startPolling = useCallback(() => {
    if (pollingRef.current) return;
    pollingRef.current = setInterval(async () => {
      try {
        const status = await bookingDepositService.getStatus(depositId);
        if (status.status === 'PAID' || status.depositPaid) {
          clearInterval(pollingRef.current!);
          pollingRef.current = null;
          setPaid(true);
          onSuccess(status.bookingCode);
        } else if (status.status === 'EXPIRED') {
          clearInterval(pollingRef.current!);
          pollingRef.current = null;
          onExpired();
        }
      } catch {
        // ignore transient errors
      }
    }, 5000);
  }, [depositId, onSuccess, onExpired]);

  useEffect(() => {
    startPolling();
    return () => {
      if (pollingRef.current) { clearInterval(pollingRef.current); pollingRef.current = null; }
    };
  }, [startPolling]);

  const handlePay = async () => {
    if (paying || paid) return;
    setPaying(true);
    try {
      const result = await bookingDepositService.simulatePayment(depositId, {
        payerName,
        payerEmail,
        payerPhone,
        transferContent: `CK coc ${bookingCode} thanh cong`,
      });
      if (result.status === 'PAID' || result.depositPaid) {
        if (pollingRef.current) { clearInterval(pollingRef.current); pollingRef.current = null; }
        setPaid(true);
        toast.success('Thanh toán cọc thành công!');
        onSuccess(result.bookingCode);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Thanh toán thất bại. Vui lòng thử lại.');
    } finally {
      setPaying(false);
    }
  };

  const urgency = timer < 60;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-sm mx-4 bg-white rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 text-white text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'radial-gradient(circle at 70% 20%, #fff 0%, transparent 60%)' }} />
          <div className="relative z-10">
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Powered by</span>
              <span className="text-lg font-black text-white">PayOS</span>
            </div>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest">Mô phỏng thanh toán cọc</p>
          </div>
        </div>

        {/* Timer */}
        <div className={`flex items-center justify-center gap-2 py-3 ${urgency ? 'bg-red-50' : 'bg-amber-50'}`}>
          <Timer className={`w-4 h-4 ${urgency ? 'text-red-500' : 'text-amber-500'}`} />
          <span className={`text-sm font-black ${urgency ? 'text-red-600 animate-pulse' : 'text-amber-600'}`}>
            Hết hạn sau: {formatCountdown(timer)}
          </span>
        </div>

        <div className="p-6 space-y-5">
          {/* Space info */}
          {spaceImage && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl">
              <img src={spaceImage} alt={spaceName} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
              <div>
                <p className="text-xs font-black text-gray-900 line-clamp-1">{spaceName || 'EduSpace Room'}</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{bookingCode}</p>
              </div>
            </div>
          )}

          {/* QR simulation */}
          <div className="flex flex-col items-center gap-3">
            <div className="w-36 h-36 bg-gray-900 rounded-2xl flex items-center justify-center relative overflow-hidden">
              <div className="grid grid-cols-7 gap-[2px] w-28 h-28">
                {Array.from({ length: 49 }).map((_, i) => (
                  <div key={i} className={`rounded-sm ${Math.random() > 0.4 ? 'bg-white' : 'bg-gray-900'}`} />
                ))}
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center shadow-lg">
                  <QrCode className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
            <p className="text-[10px] text-gray-400 font-bold text-center">Quét mã QR hoặc nhấn "Thanh toán ngay"</p>
          </div>

          {/* Amount */}
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 space-y-2">
            {payerName && (
              <div className="flex justify-between text-xs">
                <span className="text-gray-500 font-medium">Người thanh toán</span>
                <span className="font-bold text-gray-900">{payerName}</span>
              </div>
            )}
            {payerEmail && (
              <div className="flex justify-between text-xs">
                <span className="text-gray-500 font-medium">Email</span>
                <span className="font-bold text-gray-900 truncate max-w-[140px]">{payerEmail}</span>
              </div>
            )}
            <div className="h-px bg-blue-100 my-1" />
            <div className="flex justify-between text-xs">
              <span className="text-gray-500 font-medium">Tổng tiền phòng</span>
              <span className="font-bold text-gray-700">{formatCurrency(totalPrice)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-black text-gray-900">Số tiền cọc (25%)</span>
              <span className="text-lg font-black text-blue-600">{formatCurrency(depositAmount)}</span>
            </div>
            <div className="flex items-center gap-1 pt-1">
              <ShieldCheck className="w-3 h-3 text-green-500" />
              <span className="text-[10px] text-green-600 font-bold">Thanh toán giả lập qua VietQR · Bảo mật SSL</span>
            </div>
          </div>

          {/* Pay button */}
          {!paid ? (
            <button
              onClick={handlePay}
              disabled={paying || timer <= 0}
              className="w-full py-4 rounded-2xl font-black text-white text-sm uppercase tracking-widest bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg shadow-blue-200 hover:shadow-xl transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {paying ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Đang xử lý...</>
              ) : (
                'Thanh toán ngay'
              )}
            </button>
          ) : (
            <div className="flex items-center justify-center gap-2 py-4 text-green-600">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-black text-sm">Thanh toán thành công!</span>
            </div>
          )}

          <p className="text-center text-[10px] text-gray-400">
            Đây là giao diện mô phỏng · Dữ liệu thực tế được ghi nhận trên hệ thống
          </p>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Success overlay (after payment)
// ---------------------------------------------------------------------------

function PaymentSuccessOverlay({
  bookingCode,
  onViewBookings,
}: {
  bookingCode: string;
  onViewBookings: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-sm mx-4 bg-white rounded-[32px] shadow-2xl p-10 text-center space-y-6 animate-in zoom-in-95 duration-300">
        <div className="relative w-24 h-24 mx-auto">
          <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-30" />
          <div className="relative w-24 h-24 bg-green-500 rounded-full flex items-center justify-center shadow-xl shadow-green-200">
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-black text-gray-900 mb-1">Đặt phòng thành công!</h2>
          <p className="text-sm text-gray-400 font-medium">Cọc đã được thanh toán · Trạng thái: Đã xác nhận</p>
        </div>
        <div className="bg-gray-50 rounded-2xl p-4 text-left space-y-2">
          <div className="flex justify-between text-xs font-black uppercase tracking-widest text-gray-400">
            <span>Mã đặt phòng</span>
            <span className="text-gray-900">{bookingCode}</span>
          </div>
          <div className="flex justify-between text-xs font-black uppercase tracking-widest text-gray-400">
            <span>Trạng thái</span>
            <span className="bg-green-100 text-green-600 px-2 py-0.5 rounded-full">Đã xác nhận</span>
          </div>
          <div className="flex justify-between text-xs font-black uppercase tracking-widest text-gray-400">
            <span>Thanh toán</span>
            <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">Cọc · PayOS · Online</span>
          </div>
        </div>
        <button
          onClick={onViewBookings}
          className="w-full py-4 rounded-2xl font-black text-white bg-gray-900 shadow-xl hover:shadow-2xl transition-all active:scale-95"
        >
          Xem danh sách đặt phòng
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const paymentState = (location.state as PaymentState | null);

  const accessToken = useAuthStore((s) => s.accessToken);
  const hostPermissionsFromAccount = useAuthStore((s) => s.hostPermissionsFromAccount);
  const canWriteReview = useMemo(
    () => guestFeatureAllowed(accessToken, guestPermissions.createReviews, hostPermissionsFromAccount),
    [accessToken, hostPermissionsFromAccount],
  );
  const [copied, setCopied] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paidBookingCode, setPaidBookingCode] = useState('');

  const booking: Booking | undefined = BOOKINGS.find((b: Booking) => b.id === Number(id));

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmitReview = (rating: number, comment: string) => {
    if (!rating) return;
    console.log('Submitted review:', { rating, comment });
    setReviewSubmitted(true);
    setShowReview(false);
  };

  const handlePaymentSuccess = (code: string) => {
    setPaidBookingCode(code);
    setPaymentSuccess(true);
  };

  const handlePaymentExpired = () => {
    toast.error('Hết thời gian thanh toán. Vui lòng đặt lại.');
    navigate('/bookings');
  };

  const getStatusColor = (s: string) => {
    switch (s) {
      case 'upcoming': case 'confirmed': return 'bg-blue-500';
      case 'checked_in': return 'bg-amber-500';
      case 'completed': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (s: string) => {
    switch (s) {
      case 'upcoming': return 'Sắp tới';
      case 'confirmed': return 'Đã xác nhận';
      case 'checked_in': return 'Đã check-in';
      case 'completed': return 'Hoàn thành';
      case 'cancelled': return 'Đã huỷ';
      default: return s;
    }
  };

  // ── Payment overlay from checkout redirect ───────────────────────────────
  const showPaymentModal = paymentState?.showPayment && !paymentSuccess;

  // ── Booking not found (and not coming from checkout) ─────────────────────
  if (!booking && !paymentState?.showPayment) {
    return (
      <CustomerLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center">
          <h2 className="text-2xl font-black text-gray-900 mb-4">Không tìm thấy đơn đặt phòng</h2>
          <button onClick={() => navigate('/bookings')} className="bg-gray-900 text-white px-8 py-3 rounded-2xl font-black active:scale-95">
            Quay lại
          </button>
        </div>
      </CustomerLayout>
    );
  }

  // ── Booking from checkout (no mock match yet) ─────────────────────────────
  if (paymentState?.showPayment && !booking) {
    return (
      <CustomerLayout>
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 animate-in fade-in duration-700">
          <div className="max-w-4xl mx-auto px-4">
            <button
              onClick={() => navigate('/bookings')}
              className="group flex items-center gap-3 text-gray-400 hover:text-gray-900 transition-all font-black text-xs uppercase tracking-widest mb-8"
            >
              <div className="w-10 h-10 bg-white border border-gray-100 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:-translate-x-1 transition-all">
                <ArrowLeft className="w-5 h-5" />
              </div>
              Quay lại danh sách
            </button>

            {/* Booking summary card */}
            <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm mb-6">
              {paymentState.spaceImage && (
                <div className="relative h-48">
                  <img src={paymentState.spaceImage} alt={paymentState.spaceName} className="w-full h-full object-cover" />
                  <div className="absolute top-4 left-4">
                    <span className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-white shadow-lg bg-amber-500">
                      Chờ thanh toán
                    </span>
                  </div>
                </div>
              )}
              <div className="p-5 space-y-3">
                <h1 className="text-xl font-black text-gray-900">{paymentState.spaceName || 'EduSpace Room'}</h1>
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <CreditCard className="w-4 h-4" />
                  <span className="font-bold">Tổng: {formatCurrency(paymentState.totalPrice)}</span>
                  <span className="text-gray-300">·</span>
                  <span className="font-bold text-blue-600">Cọc (25%): {formatCurrency(Math.round(paymentState.totalPrice * 0.25))}</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl w-fit">
                  <span className="font-black text-gray-900 tracking-wider">{paymentState.bookingCode}</span>
                  <button onClick={() => handleCopy(paymentState.bookingCode)} className="text-gray-400 hover:text-gray-900 transition-colors">
                    {copied ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                  <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs font-medium text-amber-700">
                    Slot thời gian đang được giữ tạm thời. Vui lòng hoàn tất thanh toán cọc trong vòng 5 phút.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PayOS Modal */}
        {showPaymentModal && (
          <PayOSModal
            depositId={paymentState.depositId}
            expiresAt={paymentState.expiresAt}
            bookingCode={paymentState.bookingCode}
            totalPrice={paymentState.totalPrice}
            spaceName={paymentState.spaceName}
            spaceImage={paymentState.spaceImage}
            payerName={paymentState.payerName}
            payerEmail={paymentState.payerEmail}
            payerPhone={paymentState.payerPhone}
            onSuccess={handlePaymentSuccess}
            onExpired={handlePaymentExpired}
          />
        )}

        {/* Success Overlay */}
        {paymentSuccess && (
          <PaymentSuccessOverlay
            bookingCode={paidBookingCode}
            onViewBookings={() => navigate('/bookings')}
          />
        )}
      </CustomerLayout>
    );
  }

  // ── Normal booking detail (mock data) ─────────────────────────────────────
  return (
    <CustomerLayout>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 animate-in fade-in duration-700">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <button onClick={() => navigate('/bookings')} className="group flex items-center gap-3 text-gray-400 hover:text-gray-900 transition-all font-black text-xs uppercase tracking-widest mb-8">
            <div className="w-10 h-10 bg-white border border-gray-100 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:-translate-x-1 transition-all">
              <ArrowLeft className="w-5 h-5" />
            </div>
            Quay lại danh sách
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Left: Main Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Space Card */}
              <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
                <div className="relative h-56">
                  <img src={booking!.spaceImage} alt={booking!.spaceName} className="w-full h-full object-cover" />
                  <div className="absolute top-4 left-4">
                    <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-white shadow-lg ${getStatusColor(booking!.status)}`}>
                      {getStatusText(booking!.status)}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h1 className="text-xl font-black text-gray-900 mb-1 tracking-tight">{booking!.spaceName}</h1>
                  <p className="text-sm font-medium text-gray-400">Host: {booking!.hostName}</p>
                </div>
              </div>

              {/* Booking Details */}
              <div className="bg-white rounded-3xl border border-gray-100 p-4 shadow-sm">
                <h3 className="font-black text-gray-900 mb-4">Chi tiết đặt phòng</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-2xl">
                    <Calendar className="w-5 h-5 text-blue-500" />
                    <div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase">Ngày</div>
                      <div className="font-bold text-gray-900 text-sm">{new Date(booking!.date).toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-2xl">
                    <Clock className="w-5 h-5 text-amber-500" />
                    <div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase">Thời gian</div>
                      <div className="font-bold text-gray-900 text-sm">{booking!.time} ({booking!.duration}h)</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-2xl">
                    <MapPin className="w-5 h-5 text-red-500" />
                    <div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase">Địa điểm</div>
                      <div className="font-bold text-gray-900 text-sm">{booking!.spaceLocation}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-2xl">
                    <Users className="w-5 h-5 text-green-500" />
                    <div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase">Số khách</div>
                      <div className="font-bold text-gray-900 text-sm">{booking!.guests} người</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Breakdown */}
              <div className="bg-white rounded-3xl border border-gray-100 p-4 shadow-sm">
                <h3 className="font-black text-gray-900 mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-gray-400" /> Chi tiết thanh toán
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm"><span className="text-gray-500">{formatCurrency(booking!.pricePerHour)} × {booking!.duration} giờ</span><span className="font-bold text-gray-900">{formatCurrency(booking!.subtotal)}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-500">Phí vệ sinh</span><span className="font-bold text-gray-900">{formatCurrency(booking!.cleaningFee)}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-500">Phí dịch vụ</span><span className="font-bold text-gray-900">{formatCurrency(booking!.serviceFee)}</span></div>
                  {booking!.extraCharges.map((c: { name: string; amount: number }, i: number) => (
                    <div key={i} className="flex justify-between text-sm"><span className="text-gray-500">{c.name}</span><span className="font-bold text-gray-900">{formatCurrency(c.amount)}</span></div>
                  ))}
                  <div className="flex justify-between pt-4 border-t border-gray-100">
                    <span className="font-black text-gray-900">Tổng cộng</span>
                    <span className="font-black text-xl text-gray-900">{formatCurrency(booking!.totalPrice)}</span>
                  </div>
                </div>
              </div>

              {/* FR-10: Review Form */}
              {booking!.status === 'completed' && !reviewSubmitted && canWriteReview && (
                <div className="bg-white rounded-3xl border border-gray-100 p-4 shadow-sm">
                  <div className="text-center py-4">
                    <Star className="w-10 h-10 text-amber-400 mx-auto mb-3" />
                    <h3 className="font-black text-gray-900 mb-2">Đánh giá trải nghiệm</h3>
                    <p className="text-sm text-gray-400 font-medium mb-4">Chia sẻ cảm nhận để giúp cải thiện dịch vụ</p>
                    <button onClick={() => setShowReview(true)} className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-8 py-3 rounded-2xl font-black shadow-lg shadow-amber-200 active:scale-95 transition-all">
                      Viết đánh giá
                    </button>
                  </div>
                  <ReviewModal open={showReview} onOpenChange={setShowReview} onSubmit={handleSubmitReview} spaceName={booking!.spaceName} />
                </div>
              )}
              {reviewSubmitted && (
                <div className="bg-green-50 border border-green-200 rounded-3xl p-6 text-center">
                  <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <p className="font-black text-green-700">Cảm ơn bạn đã đánh giá!</p>
                </div>
              )}
            </div>

            {/* Right: QR & Actions */}
            <div className="space-y-4">
              <div className="bg-white rounded-3xl border border-gray-100 p-4 shadow-sm text-center">
                <h3 className="font-black text-gray-900 mb-1">Mã đặt phòng</h3>
                <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mb-4">Xuất trình cho nhân viên khi check-in</p>
                <div className="w-48 h-48 bg-gray-900 rounded-3xl mx-auto mb-4 flex items-center justify-center relative overflow-hidden">
                  <div className="grid grid-cols-8 gap-[2px] w-36 h-36">
                    {Array.from({ length: 64 }).map((_, i) => (
                      <div key={i} className={`rounded-sm ${Math.random() > 0.4 ? 'bg-white' : 'bg-gray-900'}`} />
                    ))}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center shadow-lg">
                      <QrCode className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2 bg-gray-50 rounded-xl px-4 py-3 mb-4">
                  <span className="font-black text-gray-900 text-lg tracking-wider">{booking!.bookingCode}</span>
                  <button onClick={() => handleCopy(booking!.bookingCode)} className="text-gray-400 hover:text-gray-900 transition-colors active:scale-90">
                    {copied ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
                {copied && <p className="text-xs font-bold text-green-500 mb-2">Đã sao chép!</p>}
                <div className="text-[10px] font-bold text-gray-400">Mã xác nhận: {booking!.confirmationCode}</div>
              </div>

              <div className="bg-white rounded-3xl border border-gray-100 p-4 shadow-sm space-y-3">
                <button onClick={() => navigate('/messages')} className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-3.5 rounded-xl font-black shadow-lg shadow-blue-200 hover:shadow-xl transition-all active:scale-95">
                  <MessageCircle className="w-5 h-5" /> Chat với Host
                </button>
                <button className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 text-gray-700 py-3.5 rounded-xl font-bold hover:bg-gray-50 transition-all">
                  <Phone className="w-5 h-5" /> Liên hệ hỗ trợ
                </button>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-blue-700 mb-1">Thanh toán an toàn</p>
                  <p className="text-[10px] text-blue-500">Tiền được giữ trong hệ thống Escrow và chỉ chuyển cho Host sau khi bạn check-in thành công.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PayOS Modal (for existing bookings that still have pending payment) */}
      {showPaymentModal && paymentState && (
        <PayOSModal
          depositId={paymentState.depositId}
          expiresAt={paymentState.expiresAt}
          bookingCode={paymentState.bookingCode}
          totalPrice={paymentState.totalPrice}
          spaceName={paymentState.spaceName}
          spaceImage={paymentState.spaceImage}
          payerName={paymentState.payerName}
          payerEmail={paymentState.payerEmail}
          payerPhone={paymentState.payerPhone}
          onSuccess={handlePaymentSuccess}
          onExpired={handlePaymentExpired}
        />
      )}
      {paymentSuccess && (
        <PaymentSuccessOverlay
          bookingCode={paidBookingCode}
          onViewBookings={() => navigate('/bookings')}
        />
      )}
    </CustomerLayout>
  );
}
