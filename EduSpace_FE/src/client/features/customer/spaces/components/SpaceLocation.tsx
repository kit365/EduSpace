import { useTranslation } from 'react-i18next';
import { MapPin } from 'lucide-react';

interface SpaceLocationProps {
  address: string;
}

export function SpaceLocation({ address }: SpaceLocationProps) {
  const { t } = useTranslation();

  // Create the embed URL using the address
  const encodedAddress = encodeURIComponent(address);
  // We use standard Google Maps embed URL
  const mapUrl = `https://maps.google.com/maps?q=${encodedAddress}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">{t('customer.spaceDetail.location')}</h2>
      <div className="bg-gray-100 h-[400px] rounded-2xl overflow-hidden shadow-sm border border-gray-100 relative group">
        <iframe
          src={mapUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen={false}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="grayscale-[30%] contrast-125 opacity-90 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
        />

        {/* Decorative Overlay for better UI integration */}
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-4 py-3 rounded-xl shadow-lg border border-white/50 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
              <MapPin className="w-4 h-4 text-red-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-0.5">Địa chỉ</p>
              <p className="text-sm font-bold text-gray-900 line-clamp-2 max-w-[250px]">{address}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
