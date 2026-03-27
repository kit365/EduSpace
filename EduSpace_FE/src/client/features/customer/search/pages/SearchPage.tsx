import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CustomerLayout } from '../../../../layouts/CustomerLayout';
import { SearchHeader, SearchFilters, SearchResults } from '../components';
import { PRICE_RANGE, ROUTES } from '../../../../../config';
import { useSearchSpaces } from '../../spaces/hooks/useSpaces';
import { Loader2, ChevronLeft, ChevronRight, Grid3x3, List } from 'lucide-react';
import { spaceService } from '../../spaces/services/spaceService';
import { DISTRICT_OPTIONS } from '../../../../../config';

export function SearchPage() {
  const navigate = useNavigate();
  const { categorySlug } = useParams();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();

  // Prefer category from URL path, fallback to query param
  const category = categorySlug || searchParams.get('category') || undefined;
  const bookingDate = searchParams.get('date') || undefined;

  const [priceRange, setPriceRange] = useState<[number, number]>([PRICE_RANGE.MIN, PRICE_RANGE.MAX]);
  const [selectedCapacity, setSelectedCapacity] = useState<string>(
    () => searchParams.get('capacity') ?? '',
  );
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>('capacity');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [selectedDistrict, setSelectedDistrict] = useState<string>(
    () => searchParams.get('district') ?? 'all',
  );
  const [selectedTimeStart, setSelectedTimeStart] = useState<string>('');
  const [selectedTimeEnd, setSelectedTimeEnd] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;
  const [availableDistricts, setAvailableDistricts] = useState<readonly { readonly value: string; readonly labelKey: string }[]>(DISTRICT_OPTIONS);

  useEffect(() => {
    spaceService.getAvailableDistricts().then(setAvailableDistricts);
  }, []);

  useEffect(() => {
    setSelectedDistrict(searchParams.get('district') ?? 'all');
    setSelectedCapacity(searchParams.get('capacity') ?? '');
  }, [searchParams]);

  const { data: spaces, loading } = useSearchSpaces({
    priceRange,
    capacity: selectedCapacity,
    amenities: selectedAmenities,
    category,
    district: selectedDistrict,
    timeStart: selectedTimeStart,
    timeEnd: selectedTimeEnd,
    bookingDate,
    q: searchParams.get('q') || '',
    page: currentPage,
    size: pageSize,
    sortBy,
    sortDir
  });

  // Reset to page 1 when any filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [
    priceRange,
    selectedCapacity,
    selectedAmenities,
    category,
    selectedDistrict,
    searchParams.get('q'),
    bookingDate,
    selectedTimeStart,
    selectedTimeEnd,
    sortBy,
    sortDir,
  ]);

  const handleSpaceClick = (slug: string) => {
    navigate(`${ROUTES.SPACE_DETAIL}/${slug}`);
  };

  const handleBackToHome = () => navigate('/');

  return (
    <CustomerLayout>
      {/* <SearchHeader onBackToHome={handleBackToHome} /> */}

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
              selectedDistrict={selectedDistrict}
              onDistrictChange={setSelectedDistrict}
              selectedTimeStart={selectedTimeStart}
              onTimeStartChange={setSelectedTimeStart}
              selectedTimeEnd={selectedTimeEnd}
              onTimeEndChange={setSelectedTimeEnd}
              availableDistricts={availableDistricts}
            />
          </div>

          {/* Results Area */}
          <div className="flex-1">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-gray-900">
                {spaces?.totalElements || 0} {t('customer.search.resultsFound')}
              </h2>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{t('common.sortBy')}</span>
                  <select 
                    value={`${sortBy}-${sortDir}`}
                    onChange={(e) => {
                      const [field, dir] = e.target.value.split('-');
                      setSortBy(field);
                      setSortDir(dir as 'asc' | 'desc');
                    }}
                    className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm font-bold text-gray-900 shadow-sm outline-none focus:border-red-500 transition-all appearance-none cursor-pointer"
                  >
                    <option value="capacity-asc">{t('common.capacityLowHigh')}</option>
                    <option value="capacity-desc">{t('common.capacityHighLow')}</option>
                    <option value="pricePerHour-asc">{t('common.priceLowHigh')}</option>
                    <option value="pricePerHour-desc">{t('common.priceHighLow')}</option>
                  </select>
                </div>

                <div className="flex bg-white rounded-xl border border-gray-200 shadow-sm p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-red-50 text-red-500' : 'text-gray-400 hover:bg-gray-50'}`}
                  >
                    <Grid3x3 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-red-50 text-red-500' : 'text-gray-400 hover:bg-gray-50'}`}
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Active Filters Summary */}
            {(selectedDistrict !== 'all' || selectedTimeStart) && (
              <div className="flex flex-wrap gap-2 mb-6 animate-in fade-in duration-300">
                {selectedDistrict !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-xl text-xs font-black">
                    {selectedDistrict.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    <button onClick={() => setSelectedDistrict('all')} className="ml-1 hover:text-red-800">×</button>
                  </span>
                )}
                {selectedTimeStart && selectedTimeEnd && (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-xl text-xs font-black">
                    {selectedTimeStart} - {selectedTimeEnd}
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
              <>
                <SearchResults
                  spaces={spaces?.content || []}
                  viewMode={viewMode}
                  onViewModeChange={setViewMode}
                  onSpaceClick={(space) => handleSpaceClick(space.slug || String(space.id))}
                />

                {/* Pagination UI */}
                {spaces && spaces.totalPages > 1 && (
                  <div className="mt-12 flex items-center justify-center gap-4">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => {
                        setCurrentPage(p => p - 1);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="p-2 rounded-xl border border-gray-200 hover:border-red-500 hover:bg-red-50 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:border-gray-200 transition-all"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-gray-900">
                        {t('customer.search.page')} {currentPage} / {spaces.totalPages}
                      </span>
                    </div>

                    <button
                      disabled={spaces.last}
                      onClick={() => {
                        setCurrentPage(p => p + 1);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="p-2 rounded-xl border border-gray-200 hover:border-red-500 hover:bg-red-50 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:border-gray-200 transition-all"
                    >
                      <ChevronRight className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}

