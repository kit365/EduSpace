import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, MapPin, Calendar as CalendarIcon, Users, ChevronDown } from 'lucide-react';
import { DISTRICT_OPTIONS } from '../../../../../config';
import { Popover, PopoverContent, PopoverTrigger } from '../../../../../components/ui/popover';
import { Calendar } from '../../../../../components/ui/calendar';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface HeroSectionProps {
  onSearch: () => void;
}

export function HeroSection({ onSearch }: HeroSectionProps) {
  const { t } = useTranslation();
  const [location, setLocation] = useState<string>('');
  const [date, setDate] = useState<Date>();
  const [dateOpen, setDateOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);

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
            <div className="text-center text-white px-4 max-w-5xl w-full">
              <h1 className="text-5xl mb-4">
                {t('customer.home.hero.title')}
              </h1>
              <p className="text-xl mb-8 text-gray-200">
                {t('customer.home.hero.subtitle')}
              </p>

              {/* Search Bar */}
              <div className="bg-white rounded-full p-2 flex flex-col md:flex-row gap-2 shadow-xl">
                {/* Location Dropdown */}
                <Popover open={locationOpen} onOpenChange={setLocationOpen}>
                  <PopoverTrigger asChild>
                    <div className="flex items-center justify-between gap-3 px-4 py-3 md:py-2 flex-1 relative group cursor-pointer hover:bg-gray-50 rounded-2xl transition-colors min-w-[160px]">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <MapPin className="w-5 h-5 text-red-500 shrink-0 group-hover:scale-110 transition-transform" />
                        <span className={`truncate font-bold text-sm ${location ? 'text-gray-900' : 'text-gray-400'}`}>
                          {location ? t(DISTRICT_OPTIONS.find(d => d.value === location)?.labelKey || '') : t('customer.home.hero.searchLocation')}
                        </span>
                      </div>
                      <ChevronDown className="w-4 h-4 text-gray-400 shrink-0 group-hover:text-gray-600 transition-colors" />
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className="w-[280px] p-2 rounded-2xl shadow-xl border-gray-100" align="start">
                    <div className="max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                      {DISTRICT_OPTIONS.map((d) => (
                        <div
                          key={d.value}
                          onClick={() => {
                            setLocation(d.value);
                            setLocationOpen(false);
                          }}
                          className={`px-4 py-3 rounded-xl cursor-pointer font-bold text-sm transition-colors ${location === d.value
                            ? 'bg-red-50 text-red-600'
                            : 'text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                          {t(d.labelKey)}
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>

                <div className="hidden md:block w-px bg-gray-200 my-2" />

                {/* Date Picker */}
                <Popover open={dateOpen} onOpenChange={setDateOpen}>
                  <PopoverTrigger asChild>
                    <div className="flex items-center justify-between gap-3 px-4 py-3 md:py-2 flex-1 relative group cursor-pointer hover:bg-gray-50 rounded-2xl transition-colors min-w-[160px]">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <CalendarIcon className="w-5 h-5 text-red-500 shrink-0 group-hover:scale-110 transition-transform" />
                        <span className={`truncate font-bold text-sm ${date ? 'text-gray-900' : 'text-gray-400'}`}>
                          {date ? format(date, 'dd/MM/yyyy') : t('customer.home.hero.whenDate')}
                        </span>
                      </div>
                      <ChevronDown className="w-4 h-4 text-gray-400 shrink-0 group-hover:text-gray-600 transition-colors" />
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 rounded-2xl shadow-xl border-gray-100" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(day) => {
                        setDate(day);
                        setDateOpen(false);
                      }}
                      locale={vi}
                      className="p-3"
                    />
                  </PopoverContent>
                </Popover>
                <div className="hidden md:block w-px bg-gray-200 my-2" />

                {/* Capacity Input */}
                <div className="flex items-center gap-3 px-4 py-3 md:py-2 flex-1 group cursor-text hover:bg-gray-50 rounded-2xl transition-colors min-w-[160px]">
                  <Users className="w-5 h-5 text-red-500 shrink-0 group-hover:scale-110 transition-transform" />
                  <input
                    type="number"
                    min="1"
                    placeholder={t('customer.home.hero.capacity')}
                    className="flex-1 w-full outline-none text-gray-900 bg-transparent font-bold text-sm placeholder:text-gray-400 placeholder:font-bold"
                  />
                </div>
                <button
                  onClick={onSearch}
                  className="bg-red-500 text-white px-8 py-3 rounded-full hover:bg-red-600 hover:shadow-lg hover:shadow-red-200 transition-all flex items-center justify-center gap-2 font-black tracking-wide shrink-0 whitespace-nowrap"
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
