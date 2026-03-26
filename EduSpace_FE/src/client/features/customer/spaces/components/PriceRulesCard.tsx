import { useTranslation } from 'react-i18next';
import { Tag, Clock, Info } from 'lucide-react';
import { RoomPriceRule } from '@/types/space';
import { formatCurrency } from '@/utils';

interface PriceRulesCardProps {
  rules: RoomPriceRule[];
}

export function PriceRulesCard({ rules }: PriceRulesCardProps) {
  const { t } = useTranslation();

  if (!rules || rules.length === 0) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm h-fit">
      <div className="flex items-center gap-2 mb-6">
        <Tag className="w-5 h-5 text-red-500" />
        <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">
          {t('customer.spaceDetail.pricing.pricingRules')}
        </h3>
      </div>

      <div className="space-y-4">
        {rules.map((rule, index) => (
          <div 
            key={index} 
            className="p-4 rounded-xl bg-gray-50 border border-gray-100 transition-all hover:bg-white hover:shadow-md group"
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-black text-gray-900 uppercase tracking-tight">
                {rule.label || `Rule #${index + 1}`}
              </span>
              <div className="bg-red-50 text-red-600 px-2 py-0.5 rounded text-[10px] font-bold">
                PROMO
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-500">
                <Clock className="w-3.5 h-3.5" />
                <span className="text-xs font-bold">
                  {rule.minHours}h {rule.maxHours ? `- ${rule.maxHours}h` : 'trở lên'}
                </span>
              </div>
              
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-lg font-black text-gray-900">
                  {rule.flatPrice != null 
                    ? formatCurrency(rule.flatPrice) 
                    : formatCurrency(rule.pricePerHour || 0)
                  }
                </span>
                <span className="text-[10px] font-bold text-gray-400 uppercase">
                  {rule.flatPrice != null ? '/ trọn gói' : '/ giờ'}
                </span>
              </div>
            </div>
          </div>
        ))}

        <div className="mt-6 flex items-start gap-2 p-3 rounded-lg bg-blue-50 text-blue-700">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <p className="text-[10px] font-medium leading-relaxed">
            Hệ thống sẽ tự động áp dụng quy tắc giá ưu đãi nhất dựa trên thời lượng đặt chỗ của bạn.
          </p>
        </div>
      </div>
    </div>
  );
}
