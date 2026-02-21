import { useTranslation } from 'react-i18next';
import { MapPin } from 'lucide-react';

export function SpaceLocation() {
  const { t } = useTranslation();

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">{t('customer.spaceDetail.location')}</h2>
      <div className="bg-gray-200 h-64 rounded-xl flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-300 to-gray-400">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="bg-red-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              <span className="font-semibold">EduSpace District 1</span>
            </div>
          </div>
          {/* Decorative map lines */}
          <svg className="absolute inset-0 w-full h-full opacity-20">
            <line x1="0" y1="50%" x2="100%" y2="50%" stroke="white" strokeWidth="2" />
            <line x1="50%" y1="0" x2="50%" y2="100%" stroke="white" strokeWidth="2" />
            <line x1="0" y1="30%" x2="100%" y2="30%" stroke="white" strokeWidth="1" />
            <line x1="0" y1="70%" x2="100%" y2="70%" stroke="white" strokeWidth="1" />
            <line x1="30%" y1="0" x2="30%" y2="100%" stroke="white" strokeWidth="1" />
            <line x1="70%" y1="0" x2="70%" y2="100%" stroke="white" strokeWidth="1" />
          </svg>
        </div>
      </div>
    </div>
  );
}
