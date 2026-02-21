import { useTranslation } from 'react-i18next';
import { Star, Users, Maximize } from 'lucide-react';
import { SpaceAmenity } from '../../../../../types/space';

interface SpaceInfoProps {
  rating: number;
  capacity: number;
  size: number;
  description: string;
  additionalInfo: string;
  amenities: SpaceAmenity[];
}

export function SpaceInfo({ rating, capacity, size, description, additionalInfo, amenities }: SpaceInfoProps) {
  const { t } = useTranslation();

  return (
    <div className="col-span-2">
      {/* Quick Info */}
      <div className="flex items-center gap-6 pb-6 border-b border-gray-200 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <Star className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <div className="font-semibold">{rating}</div>
            <div className="text-sm text-gray-600">{t('customer.spaceDetail.rating')}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <Users className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <div className="font-semibold">{capacity}</div>
            <div className="text-sm text-gray-600">{t('customer.spaceDetail.capacity')}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <Maximize className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <div className="font-semibold">{size}m²</div>
            <div className="text-sm text-gray-600">{t('customer.spaceDetail.size')}</div>
          </div>
        </div>
      </div>

      {/* About this space */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">{t('customer.spaceDetail.aboutSpace')}</h2>
        <p className="text-gray-700 leading-relaxed mb-4">{description}</p>
        <p className="text-gray-700 leading-relaxed">{additionalInfo}</p>
      </div>

      {/* Amenities */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">{t('customer.spaceDetail.amenities')}</h2>
        <div className="grid grid-cols-2 gap-4">
          {amenities.map((amenity, index) => {
            const Icon = amenity.icon;
            return (
              <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <Icon className="w-5 h-5 text-red-500" />
                </div>
                <span className="text-gray-700">{amenity.name}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
