import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CustomerLayout } from '../../../../layouts/CustomerLayout';
import { SearchHeader, SearchFilters, SearchResults } from '../components';
import { PRICE_RANGE } from '../../../../../config';
import { useSearchSpaces } from '../../spaces/hooks/useSpaces';
import { Loader2 } from 'lucide-react';

export function SearchPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSpaceClick = (id: number) => navigate(`/spaces/${id}`);
  const handleBackToHome = () => navigate('/');

  const [priceRange, setPriceRange] = useState<[number, number]>([PRICE_RANGE.MIN, PRICE_RANGE.MAX]);
  const [selectedCapacity, setSelectedCapacity] = useState<string>('10-20');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(['projector', 'wifi', 'ac']);
  const [selectedRoomType, setSelectedRoomType] = useState<string>('classroom');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [selectedTimeStart, setSelectedTimeStart] = useState<string>('');
  const [selectedTimeEnd, setSelectedTimeEnd] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { data: spaces, loading } = useSearchSpaces({
    priceRange,
    capacity: selectedCapacity,
    amenities: selectedAmenities,
    roomType: selectedRoomType
  });

  return (
    <CustomerLayout>
      <SearchHeader onBackToHome={handleBackToHome} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-in fade-in duration-700">
        <div className="flex gap-10">
          {/* Sidebar Filters */}
          <div className="w-80 shrink-0 hidden lg:block">
            <SearchFilters
              priceRange={priceRange}
              onPriceRangeChange={setPriceRange}
              selectedCapacity={selectedCapacity}
              onCapacityChange={setSelectedCapacity}
              selectedAmenities={selectedAmenities}
              onAmenitiesChange={setSelectedAmenities}
              selectedRoomType={selectedRoomType}
              onRoomTypeChange={setSelectedRoomType}
              selectedDistrict={selectedDistrict}
              onDistrictChange={setSelectedDistrict}
              selectedTimeStart={selectedTimeStart}
              onTimeStartChange={setSelectedTimeStart}
              selectedTimeEnd={selectedTimeEnd}
              onTimeEndChange={setSelectedTimeEnd}
            />
          </div>

          {/* Results Area */}
          <div className="flex-1">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-gray-900">
                {spaces.length} kết quả tìm được
              </h2>
            </div>

            {/* Active Filters Summary */}
            {(selectedDistrict !== 'all' || selectedTimeStart) && (
              <div className="flex flex-wrap gap-2 mb-6 animate-in fade-in duration-300">
                {selectedDistrict !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-xl text-xs font-black">
                    📍 {selectedDistrict.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    <button onClick={() => setSelectedDistrict('all')} className="ml-1 hover:text-red-800">×</button>
                  </span>
                )}
                {selectedTimeStart && selectedTimeEnd && (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-xl text-xs font-black">
                    🕐 {selectedTimeStart} - {selectedTimeEnd}
                    <button onClick={() => { setSelectedTimeStart(''); setSelectedTimeEnd(''); }} className="ml-1 hover:text-blue-800">×</button>
                  </span>
                )}
              </div>
            )}

            {loading ? (
              <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-12 h-12 text-red-500 animate-spin" />
                <p className="font-black text-gray-400 uppercase tracking-widest text-xs">{t('customer.search.searching')}</p>
              </div>
            ) : (
              <SearchResults
                spaces={spaces}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                onSpaceClick={handleSpaceClick}
              />
            )}
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}

