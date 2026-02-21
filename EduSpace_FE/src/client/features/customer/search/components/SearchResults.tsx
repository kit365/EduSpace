import { useTranslation } from 'react-i18next';
import { Star, Users, Heart, Grid3x3, List } from 'lucide-react';
import { Space } from '../../../../../types/space';
import { formatCurrency } from '../../../../../utils';

interface SearchResultsProps {
  spaces: Space[];
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  onSpaceClick: (spaceId: number) => void;
}

export function SearchResults({ spaces, viewMode, onViewModeChange, onSpaceClick }: SearchResultsProps) {
  const { t } = useTranslation();

  return (
    <div className="flex-1">
      {/* Results Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold">124 {t('common.spacesFound')}</h2>
          <p className="text-gray-600 text-sm">{t('common.showingResults')} Dec 12 - Dec 15</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">{t('common.sortBy')}</span>
            <select className="px-4 py-2 border border-gray-300 rounded-lg outline-none">
              <option>{t('common.recommended')}</option>
              <option>{t('common.priceLowHigh')}</option>
              <option>{t('common.priceHighLow')}</option>
              <option>{t('common.rating')}</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-red-100 text-red-500' : 'text-gray-400 hover:bg-gray-100'}`}
            >
              <Grid3x3 className="w-5 h-5" />
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-red-100 text-red-500' : 'text-gray-400 hover:bg-gray-100'}`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Space Cards */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-2 gap-6' : 'space-y-4'}>
        {spaces.map((space) => (
          <SpaceCard
            key={space.id}
            space={space}
            viewMode={viewMode}
            onClick={() => onSpaceClick(space.id)}
          />
        ))}
      </div>
    </div>
  );
}

interface SpaceCardProps {
  space: Space;
  viewMode: 'grid' | 'list';
  onClick: () => void;
}

function SpaceCard({ space, viewMode, onClick }: SpaceCardProps) {
  const { t } = useTranslation();

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition cursor-pointer group ${viewMode === 'list' ? 'flex gap-4' : ''
        }`}
    >
      <div className={`relative ${viewMode === 'list' ? 'w-80 flex-shrink-0' : ''}`}>
        <img
          src={space.image}
          alt={space.name}
          className={`object-cover group-hover:scale-105 transition duration-300 ${viewMode === 'list' ? 'w-full h-full' : 'w-full h-64'
            }`}
        />
        {space.verified && (
          <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded text-xs">
            {t('common.verifiedSpace')}
          </div>
        )}
        {space.instantBook && (
          <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded text-xs">
            INSTANT BOOK
          </div>
        )}
        <button className="absolute top-3 right-3 w-9 h-9 bg-white rounded-full flex items-center justify-center hover:bg-gray-100">
          <Heart className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      <div className={`p-5 ${viewMode === 'list' ? 'flex-1 flex flex-col justify-between' : ''}`}>
        <div>
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1">{space.name}</h3>
              <p className="text-gray-600 text-sm">{space.location}</p>
            </div>
            <div className="flex items-center gap-1 ml-4">
              <Star className="w-4 h-4 fill-red-500 text-red-500" />
              <span className="font-semibold">{space.rating}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
            <Users className="w-4 h-4" />
            <span>{space.capacity} {t('common.seats')}</span>
            <span>•</span>
            <span>{space.amenities.join(' • ')}</span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div>
            <span className="text-2xl font-bold">{formatCurrency(space.price)}</span>
            <span className="text-gray-500 text-sm"> {t('common.perHour')}</span>
          </div>
          <button className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition">
            {t('common.book')}
          </button>
        </div>
      </div>
    </div>
  );
}
