import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Star, Clock } from 'lucide-react';
import { formatCurrency } from '../../../../../utils';

interface BookingPanelProps {
  price: number;
  rating: number;
  reviewCount: number;
  spaceName: string;
  spaceImage: string;
}

export function BookingPanel({ price, rating, reviewCount, spaceName, spaceImage }: BookingPanelProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [selectedDate, setSelectedDate] = useState('2024-01-20');
  const [startTime, setStartTime] = useState('09:00 AM');
  const [endTime, setEndTime] = useState('11:00 AM');
  const [guests, setGuests] = useState(25);

  const hours = 3;
  const serviceFee = 100000;
  const cleaningFee = 50000;
  const total = price * hours + serviceFee + cleaningFee;

  const handleReserve = () => {
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

  return (
    <div className="sticky top-32 bg-white border border-gray-200 rounded-2xl p-6 shadow-lg animate-in slide-in-from-right-8 duration-700">
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
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all font-bold text-gray-900 appearance-none"
            >
              <option>09:00 AM</option>
              <option>10:00 AM</option>
              <option>11:00 AM</option>
              <option>02:00 PM</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">{t('customer.spaceDetail.checkOut')}</label>
            <select
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all font-bold text-gray-900 appearance-none"
            >
              <option>11:00 AM</option>
              <option>12:00 PM</option>
              <option>01:00 PM</option>
              <option>05:00 PM</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">{t('customer.spaceDetail.guests')}</label>
          <input
            type="number"
            min="1"
            max="100"
            value={guests}
            onChange={(e) => setGuests(parseInt(e.target.value))}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all font-bold text-gray-900"
          />
        </div>
      </div>

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
        className="w-full bg-gray-900 text-white py-4 rounded-xl font-black text-lg hover:bg-red-600 transition-all mb-6 shadow-xl shadow-gray-200 hover:shadow-red-200 active:scale-95 group"
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
