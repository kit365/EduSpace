import { Calendar, Clock, Users } from 'lucide-react';
import { CheckoutData } from '../types';
import { formatCurrency } from '../../../../../utils';

interface CheckoutSummaryProps {
  data: CheckoutData;
}

export function CheckoutSummary({ data }: CheckoutSummaryProps) {
  const serviceFee = data.serviceFee ?? (data.totalPrice * 0.1);
  const cleaningFee = data.cleaningFee ?? 0;
  const total = data.grandTotal ?? (data.totalPrice + serviceFee + cleaningFee);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="font-bold text-xl mb-4">Booking Summary</h3>

      {/* Space Info */}
      <div className="flex gap-4 mb-6 pb-6 border-b border-gray-200">
        <img
          src={data.spaceImage}
          alt={data.spaceName}
          className="w-24 h-24 rounded-lg object-cover"
        />
        <div>
          <h4 className="font-semibold mb-2">{data.spaceName}</h4>
          <div className="space-y-1 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{data.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{data.time}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>{data.guests} guests</span>
            </div>
          </div>
        </div>
      </div>

      {/* Price Breakdown */}
      <div className="space-y-3 mb-6">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">{formatCurrency(data.pricePerHour)}/hour × {data.duration} hours</span>
          <span className="font-semibold">{formatCurrency(data.totalPrice)}</span>
        </div>
        {cleaningFee > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Cleaning fee</span>
            <span className="font-semibold">{formatCurrency(cleaningFee)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Service fee</span>
          <span className="font-semibold">{formatCurrency(serviceFee)}</span>
        </div>
      </div>

      {/* Total */}
      <div className="pt-6 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <span className="font-bold text-lg">Total</span>
          <span className="font-bold text-2xl text-red-500">{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  );
}
