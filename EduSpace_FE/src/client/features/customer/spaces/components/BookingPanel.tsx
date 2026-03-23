import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Star, Clock } from 'lucide-react';
import { formatCurrency } from '../../../../../utils';

import { ReservationSchedule } from '@/types/space';

interface BookingPanelProps {
  price: number;
  rating: number;
  reviewCount: number;
  spaceName: string;
  spaceImage: string;
  capacity?: number;
  schedules?: ReservationSchedule[];
  is24_7?: boolean;
}

export function BookingPanel({ price, rating, reviewCount, spaceName, spaceImage, capacity = 100, schedules = [], is24_7 = false }: BookingPanelProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('11:00');
  const [guests, setGuests] = useState(1);

  // Derived validation
  const jsDay = new Date(selectedDate).getDay(); // 0 (Sun) - 6 (Sat)
  const userDay = jsDay === 0 ? 8 : jsDay + 1; // 2 (Mon) - 8 (Sun)
  const daySchedule = schedules.find(s => s.dayOfWeek === userDay);

  const isClosed = !is24_7 && daySchedule ? !daySchedule.isOpen : false;
  
  // Basic time comparison (HH:mm)
  const isTimeValid = () => {
    if (is24_7) return endTime > startTime;
    if (!daySchedule || !daySchedule.isOpen) return false;
    if (!daySchedule.openTime || !daySchedule.closeTime) return endTime > startTime;
    
    return startTime >= daySchedule.openTime.substring(0, 5) && 
           endTime <= daySchedule.closeTime.substring(0, 5) &&
           endTime > startTime;
  };

  const isCapacityValid = guests <= capacity;
  const canReserve = !isClosed && isTimeValid() && isCapacityValid;

  const hours = parseInt(endTime.split(':')[0]) - parseInt(startTime.split(':')[0]);
  const serviceFee = 100000;
  const cleaningFee = 50000;
  const total = price * Math.max(hours, 1) + serviceFee + cleaningFee;

  const handleReserve = () => {
    if (!canReserve) return;
    navigate('/checkout', {
      state: {
        bookingDetails: {
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
    if (is24_7) return [...Array(24)].map((_, i) => i.toString().padStart(2, '0'));
    if (!daySchedule || !daySchedule.openTime || !daySchedule.closeTime) return [];
    
    const openHour = parseInt(daySchedule.openTime.split(':')[0]);
    const closeHour = parseInt(daySchedule.closeTime.split(':')[0]);
    
    const available = [];
    for (let i = openHour; i <= closeHour; i++) {
        available.push(i.toString().padStart(2, '0'));
    }
    return available;
  };

  const availableHours = getAvailableHours();

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg">
      <div className="mb-6">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-3xl font-black text-gray-900 tracking-tight">
            {formatCurrency(price)}
          </span>
          <span className="text-gray-500 font-bold">{t('customer.spaceDetail.perHour')}</span>
        </div>
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span className="font-bold text-gray-900">{rating}</span>
          <span className="text-gray-400 font-medium text-xs">({reviewCount} {t('customer.spaceDetail.reviews').toLowerCase()})</span>
        </div>
      </div>

      {/* Date and Time Selection */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">{t('customer.spaceDetail.date')}</label>
          <div className="relative">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all font-bold text-gray-900"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">{t('customer.spaceDetail.checkIn')}</label>
            <select
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className={`w-full px-4 py-3 bg-gray-50 border ${isClosed ? 'border-red-500 bg-red-50' : 'border-gray-200'} rounded-xl outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all font-bold text-gray-900 appearance-none`}
              disabled={isClosed}
            >
              {availableHours.length > 0 ? (
                availableHours.map((hour) => (
                  <option key={hour} value={`${hour}:00`}>{hour}:00</option>
                ))
              ) : (
                <option value="">{isClosed ? 'Closed' : '--:--'}</option>
              )}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">{t('customer.spaceDetail.checkOut')}</label>
            <select
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className={`w-full px-4 py-3 bg-gray-50 border ${isClosed ? 'border-red-500 bg-red-50' : 'border-gray-200'} rounded-xl outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all font-bold text-gray-900 appearance-none`}
              disabled={isClosed}
            >
              {availableHours.length > 0 ? (
                availableHours.map((hour) => (
                  <option key={hour} value={`${hour}:00`}>{hour}:00</option>
                ))
              ) : (
                <option value="">{isClosed ? 'Closed' : '--:--'}</option>
              )}
            </select>
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

      {isClosed && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-6 flex items-start gap-3">
          <Clock className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs font-bold text-red-800 leading-relaxed uppercase tracking-tight">
            Phòng đóng cửa vào ngày này
          </p>
        </div>
      )}

      {/* Notice */}
      <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 mb-6 flex items-start gap-3">
        <Clock className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs font-medium text-orange-800 leading-relaxed">
          {t('customer.spaceDetail.notChargedYet')}
          <span className="block mt-1 font-bold">{t('customer.spaceDetail.freeCancellation')}</span>
        </p>
      </div>

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
        <div className="flex justify-between text-sm font-medium text-gray-500">
          <span>{formatCurrency(price)} × {hours} {t('customer.spaceDetail.hours')}</span>
          <span className="text-gray-900">{formatCurrency(price * hours)}</span>
        </div>
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
