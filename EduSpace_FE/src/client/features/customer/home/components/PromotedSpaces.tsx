import { useTranslation } from 'react-i18next';
import { Zap, TrendingUp, Users, Star } from 'lucide-react';
import { Space } from '../../../../../types/space';
import { formatCurrency } from '../../../../../utils';

interface PromotedSpacesProps {
  onSpaceClick: (space: Space) => void;
}

// Mock promoted spaces
const PROMOTED_SPACES: Space[] = [
  {
    id: 1001,
    name: 'Executive Meeting Room',
    location: 'Quận 1, TP.HCM',
    address: 'Tòa nhà A, 123 Nguyễn Hữu Cảnh',
    capacity: 20,
    size: 60,
    price: 450_000,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=400&fit=crop',
    verified: true,
    instantBook: true,
    type: 'meeting_room',
    amenities: ['WiFi', 'Projector', 'Whiteboard'],
    badge: 'Featured',
  },
  {
    id: 1002,
    name: 'Creative Studio Pro',
    location: 'Quận 3, TP.HCM',
    address: 'Tầng 5, Building B',
    capacity: 15,
    size: 45,
    price: 520_000,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1537462715957-37755b4b4840?w=500&h=400&fit=crop',
    verified: true,
    instantBook: true,
    type: 'studio',
    amenities: ['Lighting', 'Sound System', 'Backdrop'],
    badge: 'Featured',
  },
];

export function PromotedSpaces({ onSpaceClick }: PromotedSpacesProps) {
  const { t } = useTranslation();

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-gradient-to-br from-red-50 via-white to-orange-50 rounded-4xl my-8">
      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl font-black text-gray-900">Không gian nổi bật</h2>
        </div>
        <p className="text-gray-600 text-lg font-medium">Những không gian được quảng cáo - thu hút nhiều khách, booking tăng vọt</p>
      </div>

      {/* Benefits Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {[
          {
            icon: TrendingUp,
            title: 'Tăng lượt xem',
            desc: 'Lên đến +45% lượt xem trong 7 ngày đầu',
          },
          {
            icon: Users,
            title: 'Tăng booking',
            desc: 'Khách hàng ưu tiên nhìn thấy phòng của bạn',
          },
          {
            icon: Star,
            title: 'Xếp hạng cao',
            desc: 'Hiển thị trên trang chủ & vị trí đầu tìm kiếm',
          },
        ].map((benefit, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all">
            <benefit.icon className="w-8 h-8 text-red-500 mb-4" />
            <h4 className="font-black text-gray-900 mb-2">{benefit.title}</h4>
            <p className="text-sm text-gray-600 font-medium">{benefit.desc}</p>
          </div>
        ))}
      </div>

      {/* Promoted Spaces Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {PROMOTED_SPACES.map((space) => (
          <div
            key={space.id}
            onClick={() => onSpaceClick(space)}
            className="group cursor-pointer"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 mb-4">
              <img
                src={space.image}
                alt={space.name}
                className="w-full h-80 object-cover group-hover:scale-110 transition duration-500"
              />
              {/* Badge - Promoted */}
              <div className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest shadow-lg flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Đang quảng cáo
              </div>

              {/* Favorite Button */}
              <button className="absolute top-4 right-4 w-12 h-12 bg-white/95 rounded-full flex items-center justify-center shadow-lg hover:bg-red-500 hover:text-white transition-all text-2xl">
                ♡
              </button>

              {/* Stats Overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/50 to-transparent p-6 text-white">
                <h3 className="text-2xl font-black mb-2">{space.name}</h3>
                <p className="text-sm text-white/80 mb-4 flex items-center gap-1">
                  📍 {space.location}
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-black">{formatCurrency(space.price)}</div>
                    <div className="text-xs text-white/80 font-bold">/giờ</div>
                  </div>
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                    <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                    <span className="font-black text-lg">{space.rating}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card Info */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-bold text-gray-500">
                <Users className="w-4 h-4" />
                <span>{space.capacity} người</span>
                <span>•</span>
                <span>{space.size} m²</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-3xl p-8 text-center">
        <h3 className="text-2xl font-black text-white mb-3">Muốn phòng bạn được nổi bật như vậy?</h3>
        <p className="text-white/90 font-medium mb-6 max-w-2xl mx-auto">
          Đặt gói quảng cáo ngay hôm nay và xem lượt booking tăng vọt. Cảm thấy sự khác biệt trong tuần đầu tiên.
        </p>
        <button className="bg-white text-red-500 font-black px-10 py-4 rounded-2xl hover:shadow-2xl transition-all active:scale-95">
          Khám phá gói quảng cáo →
        </button>
      </div>

      {/* Stats Counter */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-12">
        {[
          { label: 'Phòng được quảng cáo', value: '2,450+' },
          { label: 'Tăng booking trung bình', value: '+42%' },
          { label: 'Chủ phòng hài lòng', value: '98%' },
          { label: 'Tư vấn miễn phí', value: 'Có sẵn' },
        ].map((stat, i) => (
          <div key={i} className="text-center">
            <div className="text-3xl font-black text-red-500 mb-2">{stat.value}</div>
            <p className="text-sm font-semibold text-gray-600">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
