import { useTranslation } from 'react-i18next';
import { Star, Users, Loader2 } from 'lucide-react';
import { Space } from '../../../../../types/space';
import { formatCurrency } from '../../../../../utils';
import { useTopRatedSpaces } from '../../spaces/hooks/useSpaces';

interface TopRatedSpacesProps {
  onSpaceClick: (spaceId: number) => void;
}

export function TopRatedSpaces({ onSpaceClick }: TopRatedSpacesProps) {
  const { data: spaces, loading } = useTopRatedSpaces();
  const { t } = useTranslation();

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
          <button className="w-14 h-14 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center text-gray-400 hover:text-gray-900">
            ←
          </button>
          <button className="w-14 h-14 rounded-2xl bg-gray-900 text-white shadow-xl hover:bg-red-500 hover:-translate-y-1 transition-all flex items-center justify-center">
            →
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {spaces.map((space) => (
          <SpaceCard key={space.id} space={space} onClick={() => onSpaceClick(space.id)} />
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

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-[32px] overflow-hidden border border-slate-50 shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer group hover:-translate-y-2"
    >
      <div className="relative h-56">
        <img
          src={space.image}
          alt={space.name}
          className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
        />
        {space.badge && (
          <div className="absolute top-4 left-4 bg-gray-900/80 backdrop-blur-md text-white px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg">
            {getBadgeText(space.badge)}
          </div>
        )}
        <button className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-2xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-xl">
          ♡
        </button>
      </div>

      <div className="p-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{space.location}</span>
          {space.verified && (
            <span className="text-blue-500 text-[10px] font-black uppercase bg-blue-50 px-2 py-0.5 rounded-md tracking-wider">{t('customer.home.topRated.verified')}</span>
          )}
        </div>
        <h3 className="text-lg font-black text-gray-900 mb-4 group-hover:text-red-500 transition-colors leading-tight h-12 line-clamp-2">
          {space.name}
        </h3>

        <div className="flex items-center gap-4 text-sm font-bold text-gray-500 mb-6 bg-slate-50 p-4 rounded-2xl">
          <span className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-400" /> {space.capacity} {t('customer.home.topRated.pax')}
          </span>
          <div className="w-1 h-1 bg-gray-300 rounded-full" />
          <span>{space.size} m²</span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-black text-gray-900">
              {formatCurrency(space.price)}
            </span>
            <span className="text-sm font-bold text-gray-400"> {t('customer.home.topRated.perHour')}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-xl">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span className="font-black text-amber-700">{space.rating}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
