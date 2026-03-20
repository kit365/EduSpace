import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshCcw, Settings } from 'lucide-react';
import { formatCurrency } from '@/utils/format';

interface ConversionRateCardProps {
  vndPerPoint: number;
  loading: boolean;
  saving: boolean;
  onSave: (vndPerPoint: number) => Promise<void>;
}

function parseDigitsToNumber(s: string): number {
  const digits = s.replace(/\D/g, '');
  return digits === '' ? 0 : parseInt(digits, 10);
}

export function ConversionRateCard({ vndPerPoint, loading, saving, onSave }: ConversionRateCardProps) {
  const { t } = useTranslation();
  const [digits, setDigits] = useState<string>(String(vndPerPoint));

  useEffect(() => {
    setDigits(String(vndPerPoint));
  }, [vndPerPoint]);

  const num = parseDigitsToNumber(digits);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (num < 1) return;
    await onSave(num);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDigits(e.target.value.replace(/\D/g, ''));
  };

  const displayInInput = num >= 1 ? formatCurrency(num) : digits;
  const placeholderVnd = formatCurrency(vndPerPoint);

  return (
    <div className="px-6 py-4">
      <div className="rounded-2xl border border-gray-200 bg-gray-50/80 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Settings className="w-4 h-4 text-gray-500" />
          <span className="text-xs font-black text-gray-500 uppercase tracking-widest">
            {t('points.globalSettings')}
          </span>
        </div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
          {t('points.conversionRate')}
        </p>
        <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-bold text-gray-700">{t('points.conversionLabel')}</span>
          <input
            type="text"
            inputMode="numeric"
            value={displayInInput}
            onChange={handleChange}
            placeholder={placeholderVnd}
            disabled={loading}
            className="w-36 min-w-[8rem] px-3 py-2 border border-gray-200 rounded-xl text-sm font-bold text-right bg-white disabled:bg-gray-100 placeholder:text-gray-400 placeholder:font-normal"
          />
          <span className="text-sm font-bold text-gray-500">{t('points.conversionSuffix')}</span>
          <button
            type="submit"
            disabled={loading || saving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 disabled:opacity-50 ml-auto"
          >
            {(loading || saving) && <RefreshCcw className="w-4 h-4 animate-spin" />}
            {t('points.saveConfig')}
          </button>
        </form>
      </div>
    </div>
  );
}
