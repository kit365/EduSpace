import { Calendar, Clock, Users, MapPin, FileText, CreditCard } from 'lucide-react';
import { Booking } from '../types';
import { formatCurrency } from '../../../../../utils';

interface BookingCardProps {
  booking: Booking;
  onViewDetails: (id: number) => void;
  onCancel?: (id: number) => void;
}

export function BookingCard({ booking, onViewDetails, onCancel }: BookingCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
      case 'confirmed':
        return 'bg-blue-100 text-blue-700';
      case 'checked_in':
        return 'bg-amber-100 text-amber-700';
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'Sắp tới';
      case 'confirmed':
        return 'Đã xác nhận';
      case 'checked_in':
        return 'Đã check-in';
      case 'completed':
        return 'Hoàn thành';
      case 'cancelled':
        return 'Đã huỷ';
      default:
        return status;
    }
  };

  const getPaymentBadge = (paymentStatus: string) => {
    switch (paymentStatus) {
      case 'escrow':
        return <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg">Tiền giữ</span>;
      case 'fully_paid':
        return <span className="text-[10px] font-black uppercase tracking-widest text-green-600 bg-green-50 px-2 py-0.5 rounded-lg">Đã thanh toán</span>;
      case 'partially_paid':
        return <span className="text-[10px] font-black uppercase tracking-widest text-orange-600 bg-orange-50 px-2 py-0.5 rounded-lg">Thanh toán 1 phần</span>;
      case 'refunded':
        return <span className="text-[10px] font-black uppercase tracking-widest text-purple-600 bg-purple-50 px-2 py-0.5 rounded-lg">Đã hoàn tiền</span>;
      default:
        return null;
    }
  };

  const canCancel = booking.status === 'upcoming' || booking.status === 'confirmed';

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 group">
      <div className="flex">
        {/* Image */}
        <div className="w-48 min-h-[180px] relative overflow-hidden">
          <img
            src={booking.spaceImage}
            alt={booking.spaceName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-3 left-3">
            <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${getStatusColor(booking.status)} shadow-sm`}>
              {getStatusText(booking.status)}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6">
          <div className="flex justify-between items-start mb-1">
            <div>
              <h3 className="text-lg font-black text-gray-900 mb-1 tracking-tight">{booking.spaceName}</h3>
              <p className="text-xs font-bold text-gray-400">
                Host: {booking.hostName} · <span className="text-gray-300">{booking.bookingCode}</span>
              </p>
            </div>
            <div className="text-right">
              <div className="text-xs font-bold text-gray-400 mb-1">Tổng tiền</div>
              <div className="text-xl font-black text-gray-900">{formatCurrency(booking.totalPrice)}</div>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-3 mb-4">
            <CreditCard className="w-3 h-3 text-gray-300" />
            {getPaymentBadge(booking.paymentStatus)}
            {booking.remainingAmount > 0 && (
              <span className="text-[10px] font-bold text-red-500">
                Còn thiếu: {formatCurrency(booking.remainingAmount)}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4 text-gray-300" />
              <span className="font-medium">{new Date(booking.date).toLocaleDateString('vi-VN', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4 text-gray-300" />
              <span className="font-medium">{booking.time}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4 text-gray-300" />
              <span className="font-medium">{booking.spaceLocation}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="w-4 h-4 text-gray-300" />
              <span className="font-medium">{booking.guests} khách</span>
            </div>
          </div>

          {/* Extra charges summary */}
          {booking.extraCharges.length > 0 && (
            <div className="text-[10px] font-bold text-gray-400 mb-4 bg-gray-50 px-3 py-2 rounded-lg">
              Phụ thu: {booking.extraCharges.map(c => c.name).join(', ')} (+{formatCurrency(booking.extraCharges.reduce((s, c) => s + c.amount, 0))})
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-50">
            <button
              onClick={() => onViewDetails(booking.id)}
              className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-600 transition-all active:scale-95 shadow-sm"
            >
              <FileText className="w-3.5 h-3.5" />
              Chi tiết
            </button>
            {canCancel && onCancel && (
              <button
                onClick={() => onCancel(booking.id)}
                className="px-5 py-2.5 text-red-500 border border-red-200 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-50 transition-all active:scale-95"
              >
                Huỷ đặt
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
