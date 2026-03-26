import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Star, Users, Loader2, Heart, ArrowRight } from 'lucide-react';
import { Space } from '../../../../../types/space';
import { formatCurrency } from '../../../../../utils';
import { useTopRatedSpaces } from '../../spaces/hooks/useSpaces';

interface TopRatedSpacesProps {
  onSpaceClick: (space: Space) => void;
}

export function TopRatedSpaces({ onSpaceClick }: TopRatedSpacesProps) {
  const { data: spaces, loading } = useTopRatedSpaces();
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-red-500 animate-spin" />
      </div>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="flex justify-between items-end mb-12">
        <div>
          <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">{t('customer.home.topRated.title')}</h2>
          <p className="text-gray-500 text-lg font-medium">{t('customer.home.topRated.subtitle')}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/search')}
            className="text-red-500 hover:text-red-600 flex items-center gap-1 font-semibold transition-colors"
          >
            {t('customer.home.categories.viewAll')}
            <ArrowRight className="w-4 h-4 ml-1 hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {spaces.map((space) => (
          <SpaceCard key={space.id} space={space} onClick={() => onSpaceClick(space)} />
        ))}
      </div>
    </section>
  );
}

interface SpaceCardProps {
  space: Space;
  onClick: () => void;
}

function SpaceCard({ space, onClick }: SpaceCardProps) {
  const { t } = useTranslation();

  // Translate badge text
  const getBadgeText = (badge: string | null) => {
    if (!badge) return null;
    const badgeMap: Record<string, string> = {
      'Top Rated': t('customer.home.topRated.topRated'),
      'Featured': t('customer.home.topRated.featured'),
    };
    return badgeMap[badge] || badge;
  };

  const badgeLabel = space.instantBook ? 'INSTANT BOOK' : getBadgeText(space.badge ?? null);

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition cursor-pointer group h-full flex flex-col"
    >
      <div className="relative">
        <img
          src={space.image || '/placeholder-space.jpg'}
          alt={space.name}
          className="w-full h-64 object-cover group-hover:scale-105 transition duration-300"
          onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/600x400/e2e8f0/64748b?text=EduSpace'; }}
        />
        {badgeLabel && (
          <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded text-xs">
            {badgeLabel}
          </div>
        )}
        <button className="absolute top-3 right-3 w-9 h-9 bg-white rounded-full flex items-center justify-center hover:bg-gray-100">
          <Heart className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h3
                title={space.name}
                className="font-semibold text-lg mb-1 line-clamp-1 min-h-[28px]"
              >
                {space.name}
              </h3>
              <p className="text-gray-600 text-sm line-clamp-1 min-h-[20px]">{space.location}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600 mb-3 min-h-[20px]">
            <Users className="w-4 h-4" />
            <span>{space.capacity} {t('customer.home.topRated.pax')}</span>
            <span>•</span>
            <span>{space.size || 0} m²</span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-3 pt-1">
          <div>
            <span className="text-2xl font-bold">{formatCurrency(space.price)}</span>
            <span className="text-gray-500 text-sm"> {t('customer.home.topRated.perHour')}</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-gray-900 px-3 py-1.5">
            <Star className="w-4 h-4 fill-red-500 text-red-500" />
            <span className="font-semibold text-white">{space.rating}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
