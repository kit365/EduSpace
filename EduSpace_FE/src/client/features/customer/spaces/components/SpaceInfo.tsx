import { useTranslation } from 'react-i18next';
import { Users, Maximize } from 'lucide-react';
import { SpaceAmenity } from '../../../../../types/space';

interface SpaceInfoProps {
  rating: number;
  capacity: number;
  size: number;
  description: string;
  additionalInfo: string;
  amenities: SpaceAmenity[];
  showQuickInfo?: boolean;
}

export function SpaceInfo({ capacity, size, description, additionalInfo, amenities }: SpaceInfoProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-12">
      {/* About this space */}
      <section>
        <h2 className="text-2xl font-black text-gray-900 mb-6 uppercase tracking-widest text-xs">{t('customer.spaceDetail.aboutSpace')}</h2>
        <div className="prose prose-slate max-w-none">
          <p className="text-lg text-gray-600 leading-relaxed mb-6 font-medium">{description}</p>
          {additionalInfo && (
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
               <p className="text-gray-500 text-sm leading-relaxed italic">{additionalInfo}</p>
            </div>
          )}
        </div>
      </section>

      {/* What this place offers / Space Details */}
      <section>
        <h2 className="text-2xl font-black text-gray-900 mb-8 uppercase tracking-widest text-xs">
          {t('customer.spaceDetail.whatOffers')}
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
          {/* Capacity Stat */}
          <div className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 bg-white hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <p className="font-black text-gray-900">{capacity} {t('customer.spaceDetail.guests')}</p>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">{t('customer.spaceDetail.capacity')}</p>
            </div>
          </div>

          {/* Size Stat */}
          <div className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 bg-white hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <Maximize className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="font-black text-gray-900">{size} m²</p>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">{t('customer.spaceDetail.size')}</p>
            </div>
          </div>

          {/* Amenities Mapping */}
          {amenities.map((amenity, index) => {
            const Icon = amenity.icon;
            return (
              <div key={index} className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 bg-white hover:shadow-md transition-shadow text-gray-500 hover:text-gray-900">
                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center transition-colors">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-black">{amenity.name}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-40">{t('customer.spaceDetail.amenity')}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
