import { useTranslation } from 'react-i18next';
import { Tag, Clock, Info } from 'lucide-react';
import { RoomPriceRule } from '@/types/space';
import { formatCurrency } from '@/utils';

interface PriceRulesCardProps {
  rules: RoomPriceRule[];
  selectedDurationMinutes?: number;
}

export function PriceRulesCard({ rules, selectedDurationMinutes = 0 }: PriceRulesCardProps) {
  const { t } = useTranslation();

  if (!rules || rules.length === 0) return null;

  const durationHours = selectedDurationMinutes / 60;
  const isWholeHour = selectedDurationMinutes % 60 === 0;

  return (
    <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-2xl shadow-gray-200/50 h-fit">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-red-50 rounded-2xl flex items-center justify-center">
          <Tag className="w-5 h-5 text-red-500" />
        </div>
        <div>
          <h3 className="text-xs font-black text-gray-900 uppercase tracking-[0.2em]">
            {t('customer.spaceDetail.pricing.pricingRules')}
          </h3>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Ưu đãi theo thời lượng</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {rules.map((rule, index) => {
          const isActive = isWholeHour && 
            durationHours >= (rule.minHours || 0) && 
            (!rule.maxHours || durationHours <= rule.maxHours);

          return (
            <div 
              key={index} 
              className={`p-5 rounded-[1.5rem] transition-all group relative overflow-hidden border-2 ${
                isActive 
                  ? 'bg-white border-red-500 shadow-xl shadow-red-100 ring-4 ring-red-50' 
                  : 'bg-gray-50 border-transparent hover:bg-white hover:border-gray-100 hover:shadow-xl hover:shadow-gray-100'
              }`}
            >

            <div className="absolute top-0 right-0 p-3">
              <div className="bg-red-500 text-white px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-lg shadow-red-200">
                PROMO
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">
                  {rule.label || `Gói ưu đãi #${index + 1}`}
                </span>
                <div className="flex items-center gap-2 text-gray-900">
                  <Clock className="w-3.5 h-3.5 text-red-500" />
                  <span className="text-sm font-black">
                    {rule.minHours}h {rule.maxHours ? `- ${rule.maxHours}h` : 'trở lên'}
                  </span>
                </div>
              </div>
              
              <div className="flex items-baseline gap-1.5 pt-2 border-t border-gray-100">
                <span className="text-2xl font-black text-gray-900 tracking-tighter">
                  {rule.flatPrice != null 
                    ? formatCurrency(rule.flatPrice) 
                    : formatCurrency(rule.pricePerHour || 0)
                  }
                </span>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  {rule.flatPrice != null ? '/ trọn gói' : '/ giờ'}
                </span>
              </div>
              </div>
            </div>
          );
        })}


        <div className="mt-6 flex items-start gap-4 p-5 rounded-[1.5rem] bg-blue-50/50 border border-blue-100/50 text-blue-700">

          <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
            <Info className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-[11px] font-bold leading-relaxed opacity-80 uppercase tracking-tight">
            Hệ thống sẽ tự động áp dụng quy tắc giá {rules.some(r => r.flatPrice != null) ? 'trọn gói' : 'giờ'} ưu đãi nhất dựa trên thời lượng đặt chỗ của bạn.
          </p>
        </div>
      </div>
    </div>
  );
}

