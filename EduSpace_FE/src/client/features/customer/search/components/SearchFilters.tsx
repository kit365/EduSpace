import { useTranslation } from 'react-i18next';
import { PRICE_RANGE, CAPACITY_OPTIONS, AMENITIES_LIST, ROOM_TYPES, DISTRICT_OPTIONS, TIME_SLOTS } from '../../../../../config';

interface SearchFiltersProps {
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
  selectedCapacity: string;
  onCapacityChange: (capacity: string) => void;
  selectedAmenities: string[];
  onAmenitiesChange: (amenities: string[]) => void;
  selectedRoomType: string;
  onRoomTypeChange: (roomType: string) => void;
  selectedDistrict: string;
  onDistrictChange: (district: string) => void;
  selectedTimeStart: string;
  onTimeStartChange: (time: string) => void;
  selectedTimeEnd: string;
  onTimeEndChange: (time: string) => void;
}

export function SearchFilters({
  priceRange,
  onPriceRangeChange,
  selectedCapacity,
  onCapacityChange,
  selectedAmenities,
  onAmenitiesChange,
  selectedRoomType,
  onRoomTypeChange,
  selectedDistrict,
  onDistrictChange,
  selectedTimeStart,
  onTimeStartChange,
  selectedTimeEnd,
  onTimeEndChange,
}: SearchFiltersProps) {
  const { t } = useTranslation();

  const toggleAmenity = (amenity: string) => {
    if (selectedAmenities.includes(amenity)) {
      onAmenitiesChange(selectedAmenities.filter(a => a !== amenity));
    } else {
      onAmenitiesChange([...selectedAmenities, amenity]);
    }
  };

  const handleClearAll = () => {
    onPriceRangeChange([PRICE_RANGE.MIN, PRICE_RANGE.MAX]);
    onCapacityChange('10-20');
    onAmenitiesChange(['projector', 'wifi', 'ac']);
    onRoomTypeChange('classroom');
    onDistrictChange('all');
    onTimeStartChange('');
    onTimeEndChange('');
  };

  return (
    <div className="w-72 flex-shrink-0">
      <div className="sticky top-8 space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="font-black text-gray-900 text-lg">{t('customer.search.filters')}</h3>
          <button
            onClick={handleClearAll}
            className="text-red-500 text-xs font-black uppercase tracking-widest hover:text-red-600 transition-colors"
          >
            {t('customer.search.clearAll')}
          </button>
        </div>

        {/* FR-06: Khu vực (Quận/Huyện) */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h4 className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em] mb-3">📍 {t('customer.search.district')}</h4>
          <select
            value={selectedDistrict}
            onChange={(e) => onDistrictChange(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all font-bold text-gray-900 appearance-none text-sm"
          >
            {DISTRICT_OPTIONS.map((d) => (
              <option key={d.value} value={d.value}>{t(d.labelKey)}</option>
            ))}
          </select>
        </div>

        {/* FR-06: Khung giờ tìm kiếm */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h4 className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em] mb-3">🕐 {t('customer.search.timeSlots')}</h4>
          <p className="text-[10px] font-medium text-gray-400 mb-3">{t('customer.search.searching')}</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-gray-400 mb-1 block">{t('customer.search.from')}</label>
              <select
                value={selectedTimeStart}
                onChange={(e) => onTimeStartChange(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-red-500 transition-all font-bold text-gray-900 appearance-none text-sm"
              >
                <option value="">--:--</option>
                {TIME_SLOTS.map((slot) => (
                  <option key={slot} value={slot}>{slot}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 mb-1 block">{t('customer.search.to')}</label>
              <select
                value={selectedTimeEnd}
                onChange={(e) => onTimeEndChange(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-red-500 transition-all font-bold text-gray-900 appearance-none text-sm"
              >
                <option value="">--:--</option>
                {TIME_SLOTS.filter(slot => !selectedTimeStart || slot > selectedTimeStart).map((slot) => (
                  <option key={slot} value={slot}>{slot}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Mức giá */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h4 className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em] mb-3">💰 {t('customer.search.priceRange')}</h4>
          <div className="space-y-3">
            <input
              type="range"
              min={PRICE_RANGE.MIN}
              max={PRICE_RANGE.MAX}
              value={priceRange[1]}
              onChange={(e) => onPriceRangeChange([priceRange[0], parseInt(e.target.value)])}
              className="w-full accent-red-500"
            />
            <div className="flex justify-between text-xs font-bold text-gray-500">
              <span className="bg-gray-50 px-3 py-1.5 rounded-lg">{priceRange[0].toLocaleString()}đ</span>
              <span className="bg-gray-50 px-3 py-1.5 rounded-lg">{priceRange[1].toLocaleString()}đ</span>
            </div>
          </div>
        </div>

        {/* FR-06: Sức chứa 4-50 người */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h4 className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em] mb-3">👥 {t('customer.search.capacity')}</h4>
          <div className="space-y-2">
            {CAPACITY_OPTIONS.map((capacity) => (
              <button
                key={capacity.value}
                onClick={() => onCapacityChange(capacity.value)}
                className={`w-full px-4 py-2.5 rounded-xl border text-left font-bold text-sm transition-all ${selectedCapacity === capacity.value
                  ? 'border-red-500 text-red-600 bg-red-50 shadow-sm'
                  : 'border-gray-200 text-gray-600 hover:border-gray-400 hover:bg-gray-50'
                  }`}
              >
                {t(capacity.labelKey)}
              </button>
            ))}
          </div>
        </div>

        {/* Tiện ích */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h4 className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em] mb-3">✨ {t('customer.search.amenities')}</h4>
          <div className="space-y-2.5">
            {AMENITIES_LIST.map((amenity) => (
              <label key={amenity.value} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={selectedAmenities.includes(amenity.value)}
                  onChange={() => toggleAmenity(amenity.value)}
                  className="w-4 h-4 accent-red-500 rounded"
                />
                <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors uppercase text-[10px] font-black">{t(amenity.labelKey)}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Loại phòng */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h4 className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em] mb-3">🏢 {t('customer.search.roomType')}</h4>
          <div className="space-y-2.5">
            {ROOM_TYPES.map((type) => (
              <label key={type.value} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="radio"
                  name="roomType"
                  checked={selectedRoomType === type.value}
                  onChange={() => onRoomTypeChange(type.value)}
                  className="w-4 h-4 accent-red-500"
                />
                <span className="flex-1 text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors">{t(type.labelKey)}</span>
                <span className="text-xs font-bold text-gray-300 bg-gray-50 px-2 py-0.5 rounded-lg">{type.count}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
