import { CreditCard, Building2, Smartphone } from 'lucide-react';

interface PaymentMethodSelectorProps {
  selectedMethod: 'card' | 'bank' | 'momo';
  onMethodChange: (method: 'card' | 'bank' | 'momo') => void;
}

export function PaymentMethodSelector({ selectedMethod, onMethodChange }: PaymentMethodSelectorProps) {
  const methods = [
    { id: 'card' as const, label: 'Credit/Debit Card', icon: CreditCard, description: 'Visa, Mastercard, JCB' },
    { id: 'bank' as const, label: 'Bank Transfer', icon: Building2, description: 'Local banks' },
    { id: 'momo' as const, label: 'MoMo Wallet', icon: Smartphone, description: 'Pay with MoMo' }
  ];

  return (
    <div>
      <h3 className="font-semibold mb-4">Payment Method</h3>
      <div className="grid grid-cols-3 gap-4">
        {methods.map((method) => {
          const Icon = method.icon;
          return (
            <button
              key={method.id}
              onClick={() => onMethodChange(method.id)}
              className={`p-4 border-2 rounded-lg transition ${
                selectedMethod === method.id
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <Icon className={`w-8 h-8 mx-auto mb-2 ${
                selectedMethod === method.id ? 'text-red-500' : 'text-gray-600'
              }`} />
              <div className="font-semibold text-sm mb-1">{method.label}</div>
              <div className="text-xs text-gray-600">{method.description}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
