import { CreditCard, Building2, Plus, Trash2, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PaymentMethod } from '../types';

interface PaymentMethodsTabProps {
  methods: PaymentMethod[];
}

export function PaymentMethodsTab({ methods }: PaymentMethodsTabProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-black text-gray-900 tracking-tight">
          {t('customer.profile.billing.title')}
        </h3>
        <button className="flex items-center gap-2 px-6 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all font-black shadow-lg shadow-red-200 active:scale-95 text-sm uppercase tracking-wider">
          <Plus className="w-5 h-5" />
          {t('customer.profile.billing.addMethod')}
        </button>
      </div>

      <div className="space-y-4">
        {methods.length > 0 ? (
          methods.map((method) => (
            <div
              key={method.id}
              className="flex items-center justify-between p-6 bg-white border border-slate-100 rounded-[32px] hover:shadow-xl hover:shadow-slate-100 transition-all group"
            >
              <div className="flex items-center gap-6">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${method.type === 'card' ? 'bg-indigo-50 border border-indigo-100' : 'bg-emerald-50 border border-emerald-100'
                  }`}>
                  {method.type === 'card' ? (
                    <CreditCard className={`w-8 h-8 ${method.type === 'card' ? 'text-indigo-500' : 'text-emerald-500'}`} />
                  ) : (
                    <Building2 className="w-8 h-8 text-emerald-500" />
                  )}
                </div>
                <div>
                  <div className="font-black text-gray-900 text-lg">{method.name}</div>
                  <div className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                    {method.type === 'card' ? '•••• •••• •••• 4242' : 'AGRIBANK •••• 8888'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {method.isDefault && (
                  <span className="px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                    {t('customer.profile.billing.default')}
                  </span>
                )}
                <button className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 text-center bg-slate-50/50 rounded-[40px] border-2 border-dashed border-slate-100">
            <CreditCard className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">
              {t('customer.profile.billing.noMethods')}
            </p>
          </div>
        )}
      </div>

      {/* Security Badge */}
      <div className="pt-8 border-t border-slate-50">
        <div className="bg-slate-50 rounded-[32px] p-8 flex items-center gap-6 border border-slate-100">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
            <ShieldCheck className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <div className="font-black text-gray-900 text-sm uppercase tracking-wider mb-1">PCI-DSS Compliant Security</div>
            <p className="text-xs font-medium text-gray-400 leading-relaxed">
              Your payment information is encrypted and processed through our secure payment gateway partner. We never store your full card details.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
