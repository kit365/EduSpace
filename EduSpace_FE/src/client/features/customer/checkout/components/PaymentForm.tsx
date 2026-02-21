import { CreditCard, User, Calendar as CalendarIcon, Lock } from 'lucide-react';

interface PaymentFormProps {
  paymentMethod: 'card' | 'bank' | 'momo';
}

export function PaymentForm({ paymentMethod }: PaymentFormProps) {
  if (paymentMethod === 'card') {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-2">Card Number</label>
          <div className="relative">
            <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="1234 5678 9012 3456"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-red-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Cardholder Name</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="NGUYEN VAN A"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-red-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Expiry Date</label>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="MM/YY"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-red-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">CVV</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="123"
                maxLength={3}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-red-500"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (paymentMethod === 'bank') {
    return (
      <div className="bg-blue-50 rounded-lg p-6 text-center">
        <h4 className="font-semibold mb-2">Bank Transfer Instructions</h4>
        <p className="text-sm text-gray-600 mb-4">
          You will receive bank transfer details after confirming your booking
        </p>
        <div className="text-xs text-gray-500">
          Please complete the transfer within 24 hours to secure your booking
        </div>
      </div>
    );
  }

  if (paymentMethod === 'momo') {
    return (
      <div className="bg-pink-50 rounded-lg p-6 text-center">
        <div className="w-16 h-16 bg-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center">
          <span className="text-white font-bold text-2xl">M</span>
        </div>
        <h4 className="font-semibold mb-2">MoMo Payment</h4>
        <p className="text-sm text-gray-600">
          You will be redirected to MoMo app to complete payment
        </p>
      </div>
    );
  }

  return null;
}
