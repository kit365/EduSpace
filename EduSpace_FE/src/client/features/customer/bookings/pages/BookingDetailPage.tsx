import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CustomerLayout } from '../../../../layouts/CustomerLayout';
import { ArrowLeft, QrCode, MessageCircle, Calendar, Clock, MapPin, Users, CreditCard, Star, Copy, CheckCircle2, Phone, ShieldCheck } from 'lucide-react';
import { formatCurrency } from '../../../../../utils';
import { BOOKINGS } from '../data/mockData';
import { Booking } from '../types';

export function BookingDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [copied, setCopied] = useState(false);
    const [showReview, setShowReview] = useState(false);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [reviewSubmitted, setReviewSubmitted] = useState(false);

    const booking: Booking | undefined = BOOKINGS.find((b: Booking) => b.id === Number(id));

    if (!booking) {
        return (
            <CustomerLayout>
                <div className="min-h-[60vh] flex flex-col items-center justify-center">
                    <h2 className="text-2xl font-black text-gray-900 mb-4">Không tìm thấy đơn đặt phòng</h2>
                    <button onClick={() => navigate('/bookings')} className="bg-gray-900 text-white px-8 py-3 rounded-2xl font-black active:scale-95">Quay lại</button>
                </div>
            </CustomerLayout>
        );
    }

    const handleCopy = () => {
        navigator.clipboard.writeText(booking.bookingCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSubmitReview = () => {
        if (!rating || !comment.trim()) return;
        setReviewSubmitted(true);
        setShowReview(false);
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

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left: Main Info */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Space Card */}
                            <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
                                <div className="relative h-56">
                                    <img src={booking.spaceImage} alt={booking.spaceName} className="w-full h-full object-cover" />
                                    <div className="absolute top-4 left-4">
                                        <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-white shadow-lg ${getStatusColor(booking.status)}`}>
                                            {getStatusText(booking.status)}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <h1 className="text-2xl font-black text-gray-900 mb-1 tracking-tight">{booking.spaceName}</h1>
                                    <p className="text-sm font-medium text-gray-400">Host: {booking.hostName}</p>
                                </div>
                            </div>

                            {/* Booking Details */}
                            <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                                <h3 className="font-black text-gray-900 mb-5">Chi tiết đặt phòng</h3>
                                <div className="grid grid-cols-2 gap-5">
                                    <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-2xl">
                                        <Calendar className="w-5 h-5 text-blue-500" />
                                        <div>
                                            <div className="text-[10px] font-bold text-gray-400 uppercase">Ngày</div>
                                            <div className="font-bold text-gray-900 text-sm">{new Date(booking.date).toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-2xl">
                                        <Clock className="w-5 h-5 text-amber-500" />
                                        <div>
                                            <div className="text-[10px] font-bold text-gray-400 uppercase">Thời gian</div>
                                            <div className="font-bold text-gray-900 text-sm">{booking.time} ({booking.duration}h)</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-2xl">
                                        <MapPin className="w-5 h-5 text-red-500" />
                                        <div>
                                            <div className="text-[10px] font-bold text-gray-400 uppercase">Địa điểm</div>
                                            <div className="font-bold text-gray-900 text-sm">{booking.spaceLocation}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-2xl">
                                        <Users className="w-5 h-5 text-green-500" />
                                        <div>
                                            <div className="text-[10px] font-bold text-gray-400 uppercase">Số khách</div>
                                            <div className="font-bold text-gray-900 text-sm">{booking.guests} người</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Breakdown */}
                            <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                                <h3 className="font-black text-gray-900 mb-5 flex items-center gap-2">
                                    <CreditCard className="w-5 h-5 text-gray-400" /> Chi tiết thanh toán
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm"><span className="text-gray-500">{formatCurrency(booking.pricePerHour)} × {booking.duration} giờ</span><span className="font-bold text-gray-900">{formatCurrency(booking.subtotal)}</span></div>
                                    <div className="flex justify-between text-sm"><span className="text-gray-500">Phí vệ sinh</span><span className="font-bold text-gray-900">{formatCurrency(booking.cleaningFee)}</span></div>
                                    <div className="flex justify-between text-sm"><span className="text-gray-500">Phí dịch vụ</span><span className="font-bold text-gray-900">{formatCurrency(booking.serviceFee)}</span></div>
                                    {booking.extraCharges.map((c: { name: string; amount: number }, i: number) => (
                                        <div key={i} className="flex justify-between text-sm"><span className="text-gray-500">{c.name}</span><span className="font-bold text-gray-900">{formatCurrency(c.amount)}</span></div>
                                    ))}
                                    <div className="flex justify-between pt-4 border-t border-gray-100">
                                        <span className="font-black text-gray-900">Tổng cộng</span>
                                        <span className="font-black text-xl text-gray-900">{formatCurrency(booking.totalPrice)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* FR-10: Review Form */}
                            {booking.status === 'completed' && !reviewSubmitted && (
                                <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                                    {!showReview ? (
                                        <div className="text-center py-4">
                                            <Star className="w-10 h-10 text-amber-400 mx-auto mb-3" />
                                            <h3 className="font-black text-gray-900 mb-2">Đánh giá trải nghiệm</h3>
                                            <p className="text-sm text-gray-400 font-medium mb-4">Chia sẻ cảm nhận để giúp cải thiện dịch vụ</p>
                                            <button onClick={() => setShowReview(true)} className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-8 py-3 rounded-2xl font-black shadow-lg shadow-amber-200 active:scale-95 transition-all">
                                                Viết đánh giá
                                            </button>
                                        </div>
                                    ) : (
                                        <div>
                                            <h3 className="font-black text-gray-900 mb-4">Đánh giá Host & Phòng</h3>
                                            {/* Star Rating */}
                                            <div className="flex items-center gap-2 mb-6">
                                                <span className="text-sm font-bold text-gray-500 mr-2">Chất lượng:</span>
                                                {[1, 2, 3, 4, 5].map(star => (
                                                    <button key={star} onClick={() => setRating(star)} className="transition-all hover:scale-125">
                                                        <Star className={`w-8 h-8 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'} transition-colors`} />
                                                    </button>
                                                ))}
                                                {rating > 0 && <span className="text-sm font-black text-amber-500 ml-2">{rating}/5</span>}
                                            </div>
                                            {/* Comment */}
                                            <textarea
                                                value={comment}
                                                onChange={(e) => setComment(e.target.value)}
                                                placeholder="Chia sẻ cảm nhận của bạn về không gian, tiện ích, Host..."
                                                className="w-full h-28 px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all text-sm font-medium resize-none"
                                            />
                                            <div className="flex gap-3 mt-4">
                                                <button onClick={handleSubmitReview} disabled={!rating || !comment.trim()} className="flex-1 bg-gray-900 text-white py-3 rounded-xl font-black disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all">
                                                    Gửi đánh giá
                                                </button>
                                                <button onClick={() => setShowReview(false)} className="px-6 py-3 border border-gray-200 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition-all">
                                                    Huỷ
                                                </button>
                                            </div>
                                        </div>
                                    )}
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
                        <div className="space-y-6">
                            {/* QR Code Card */}
                            <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm text-center">
                                <h3 className="font-black text-gray-900 mb-1">Mã đặt phòng</h3>
                                <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mb-4">Xuất trình cho nhân viên khi check-in</p>

                                {/* QR Code simulation */}
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
                                    <span className="font-black text-gray-900 text-lg tracking-wider">{booking.bookingCode}</span>
                                    <button onClick={handleCopy} className="text-gray-400 hover:text-gray-900 transition-colors active:scale-90">
                                        {copied ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                                    </button>
                                </div>
                                {copied && <p className="text-xs font-bold text-green-500 mb-2">Đã sao chép!</p>}

                                <div className="text-[10px] font-bold text-gray-400">
                                    Mã xác nhận: {booking.confirmationCode}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-3">
                                <button
                                    onClick={() => navigate('/messages')}
                                    className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-3.5 rounded-xl font-black shadow-lg shadow-blue-200 hover:shadow-xl transition-all active:scale-95"
                                >
                                    <MessageCircle className="w-5 h-5" /> Chat với Host
                                </button>

                                <button className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 text-gray-700 py-3.5 rounded-xl font-bold hover:bg-gray-50 transition-all">
                                    <Phone className="w-5 h-5" /> Liên hệ hỗ trợ
                                </button>
                            </div>

                            {/* Security Note */}
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
        </CustomerLayout>
    );
}
