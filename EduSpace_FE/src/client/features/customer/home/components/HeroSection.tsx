import { useTranslation } from 'react-i18next';
import { Search, MapPin, Calendar, Users } from 'lucide-react';

interface HeroSectionProps {
  onSearch: () => void;
}

export function HeroSection({ onSearch }: HeroSectionProps) {
  const { t } = useTranslation();

  return (
    <section className="relative bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="relative rounded-3xl overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1758270704524-596810e891b5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkZW50cyUyMGNsYXNzcm9vbSUyMGxlYXJuaW5nfGVufDF8fHx8MTc2ODM0NDExOXww&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Hero background"
            className="w-full h-96 object-cover"
          />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <div className="text-center text-white px-4 max-w-3xl">
              <h1 className="text-5xl mb-4">
                {t('customer.home.hero.title')}
              </h1>
              <p className="text-xl mb-8 text-gray-200">
                {t('customer.home.hero.subtitle')}
              </p>

              {/* Search Bar */}
              <div className="bg-white rounded-full p-2 flex flex-col md:flex-row gap-2 shadow-xl">
                <div className="flex items-center gap-3 px-4 py-2 flex-1">
                  <MapPin className="w-5 h-5 text-red-500" />
                  <input
                    type="text"
                    placeholder={t('customer.home.hero.searchLocation')}
                    className="flex-1 outline-none text-gray-800"
                  />
                </div>
                <div className="hidden md:block w-px bg-gray-300" />
                <div className="flex items-center gap-3 px-4 py-2 flex-1">
                  <Calendar className="w-5 h-5 text-red-500" />
                  <input
                    type="text"
                    placeholder={t('customer.home.hero.whenDate')}
                    className="flex-1 outline-none text-gray-800"
                  />
                </div>
                <div className="hidden md:block w-px bg-gray-300" />
                <div className="flex items-center gap-3 px-4 py-2 flex-1">
                  <Users className="w-5 h-5 text-red-500" />
                  <input
                    type="text"
                    placeholder={t('customer.home.hero.capacity')}
                    className="flex-1 outline-none text-gray-800"
                  />
                </div>
                <button
                  onClick={onSearch}
                  className="bg-red-500 text-white px-8 py-3 rounded-full hover:bg-red-600 transition flex items-center justify-center gap-2"
                >
                  <Search className="w-5 h-5" />
                  {t('customer.home.hero.searchBtn')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
