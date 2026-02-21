import { MapPin, Calendar, Search, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface SearchHeaderProps {
  onBackToHome: () => void;
}

export function SearchHeader({ onBackToHome }: SearchHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToHome}
            className="text-gray-400 hover:text-gray-900 font-black text-xs uppercase tracking-widest transition-colors"
          >
            ← {t('common.goBack')}
          </button>
          <div className="flex-1 flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus-within:border-red-400 focus-within:ring-2 focus-within:ring-red-100 transition-all">
            <MapPin className="w-4 h-4 text-red-500 flex-shrink-0" />
            <input
              type="text"
              placeholder={t('customer.search.placeholder')}
              className="flex-1 bg-transparent outline-none font-medium text-sm text-gray-900 placeholder:text-gray-400"
            />
          </div>
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus-within:border-red-400 focus-within:ring-2 focus-within:ring-red-100 transition-all">
            <Calendar className="w-4 h-4 text-red-500 flex-shrink-0" />
            <input
              type="date"
              className="bg-transparent outline-none font-medium text-sm text-gray-900"
            />
          </div>
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus-within:border-red-400 focus-within:ring-2 focus-within:ring-red-100 transition-all">
            <Clock className="w-4 h-4 text-red-500 flex-shrink-0" />
            <input
              type="time"
              className="bg-transparent outline-none font-medium text-sm text-gray-900"
              placeholder="Hr"
            />
          </div>
          <button className="bg-red-500 text-white p-3 rounded-xl hover:bg-red-600 transition-all shadow-lg shadow-red-200 hover:shadow-xl active:scale-95">
            <Search className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
