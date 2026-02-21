import { Filter, SlidersHorizontal } from 'lucide-react';
import { BookingFilters as BookingFiltersType } from '../types';

interface BookingFiltersProps {
  filters: BookingFiltersType;
  onFiltersChange: (filters: BookingFiltersType) => void;
}

export function BookingFilters({ filters, onFiltersChange }: BookingFiltersProps) {
  const statusOptions = [
    { value: 'all', label: 'Tất cả' },
    { value: 'upcoming', label: 'Sắp tới' },
    { value: 'confirmed', label: 'Đã xác nhận' },
    { value: 'checked_in', label: 'Đã check-in' },
    { value: 'completed', label: 'Hoàn thành' },
    { value: 'cancelled', label: 'Đã huỷ' }
  ];

  const sortOptions = [
    { value: 'date', label: 'Ngày' },
    { value: 'price', label: 'Giá' },
    { value: 'name', label: 'Tên phòng' }
  ];

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Lọc:</span>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filters.status}
            onChange={(e) => onFiltersChange({ ...filters, status: e.target.value as any })}
            className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 font-bold text-sm text-gray-900 appearance-none transition-all"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <SlidersHorizontal className="w-4 h-4 text-gray-300" />
          <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Sắp xếp:</span>
          <select
            value={filters.sortBy}
            onChange={(e) => onFiltersChange({ ...filters, sortBy: e.target.value as any })}
            className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 font-bold text-sm text-gray-900 appearance-none transition-all"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
