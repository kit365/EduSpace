import { CreditCard, Building2, Plus } from 'lucide-react';
import { PaymentMethod } from '../types';

interface PaymentMethodsTabProps {
  methods: PaymentMethod[];
}

export function PaymentMethodsTab({ methods }: PaymentMethodsTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">Payment Methods</h3>
        <button className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-semibold">
          <Plus className="w-4 h-4" />
          Add Payment Method
        </button>
      </div>

      <div className="space-y-3">
        {methods.map((method) => (
          <div
            key={method.id}
            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                method.type === 'card' ? 'bg-blue-100' : 'bg-green-100'
              }`}>
                {method.type === 'card' ? (
                  <CreditCard className={`w-6 h-6 ${method.type === 'card' ? 'text-blue-500' : 'text-green-500'}`} />
                ) : (
                  <Building2 className="w-6 h-6 text-green-500" />
                )}
              </div>
              <div>
                <div className="font-semibold">{method.name}</div>
                <div className="text-sm text-gray-600">
                  {method.type === 'card' ? 'Credit/Debit Card' : 'Bank Account'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {method.isDefault && (
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                  Default
                </span>
              )}
              <button className="text-gray-600 hover:text-gray-800">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Payment Form (could be shown in modal) */}
      <div className="border-t border-gray-200 pt-6">
        <div className="bg-gray-50 rounded-lg p-6 text-center">
          <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 mb-4">
            Add a payment method to make bookings easier
          </p>
          <div className="text-sm text-gray-500">
            Your payment information is encrypted and secure
          </div>
        </div>
      </div>
    </div>
  );
}
