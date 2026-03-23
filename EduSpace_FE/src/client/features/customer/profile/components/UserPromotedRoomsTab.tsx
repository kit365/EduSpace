import { Star, TrendingUp, Eye, Zap, Calendar, MapPin } from 'lucide-react';
import { formatCurrency } from '../../../../../utils';

interface PromotedRoom {
  id: number;
  name: string;
  location: string;
  image: string;
  price: number;
  rating: number;
  packageTier: 'silver' | 'gold';
  startDate: string;
  endDate: string;
  views: number;
  clicks: number;
  bookings: number;
}

// Mock promoted rooms data
const USER_PROMOTED_ROOMS: PromotedRoom[] = [
  {
    id: 1,
    name: 'Executive Meeting Room',
    location: 'Quận 1, TP.HCM',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop',
    price: 450_000,
    rating: 4.8,
    packageTier: 'gold',
    startDate: '2026-03-01',
    endDate: '2026-03-31',
    views: 2450,
    clicks: 186,
    bookings: 12,
  },
  {
    id: 2,
    name: 'Creative Studio Pro',
    location: 'Quận 3, TP.HCM',
    image: 'https://images.unsplash.com/photo-1537462715957-37755b4b4840?w=400&h=300&fit=crop',
    price: 520_000,
    rating: 4.9,
    packageTier: 'silver',
    startDate: '2026-03-10',
    endDate: '2026-04-10',
    views: 1650,
    clicks: 132,
    bookings: 8,
  },
];

export function UserPromotedRoomsTab() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-black text-gray-900 mb-2 flex items-center gap-2">
          <Zap className="w-6 h-6 text-red-500" />
          Phòng được quảng cáo
        </h2>
        <p className="text-gray-600 font-medium">Theo dõi hiệu quả các gói quảng cáo đang kích hoạt</p>
      </div>

      {/* Empty State */}
      {USER_PROMOTED_ROOMS.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Zap className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-black text-gray-900 mb-2">Chưa có phòng nào được quảng cáo</h3>
          <p className="text-gray-600 font-medium mb-6">Mua gói quảng cáo để tăng lượt xem và booking cho phòng của bạn</p>
          <button className="bg-red-500 text-white font-black px-8 py-3 rounded-xl hover:bg-red-600 transition-all">
            Khám phá gói quảng cáo →
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {USER_PROMOTED_ROOMS.map((room) => (
            <div
              key={room.id}
              className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all"
            >
              {/* Room Header with Image */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
                <div className="md:col-span-1">
                  <div className="relative rounded-xl overflow-hidden">
                    <img
                      src={room.image}
                      alt={room.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className={`absolute top-3 left-3 px-3 py-1.5 rounded-full text-xs font-black uppercase text-white ${
                      room.packageTier === 'gold'
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                        : 'bg-gray-400'
                    }`}>
                      {room.packageTier === 'gold' ? '👑 Gói Vàng' : '⭐ Gói Bạc'}
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2">
                  {/* Room Info */}
                  <div className="mb-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-xl font-black text-gray-900">{room.name}</h3>
                        <p className="text-sm text-gray-600 font-medium flex items-center gap-1 mt-1">
                          <MapPin className="w-4 h-4" />
                          {room.location}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 bg-gray-900 text-white px-3 py-1.5 rounded-full">
                        <Star className="w-4 h-4 fill-red-500 text-red-500" />
                        <span className="font-black">{room.rating}</span>
                      </div>
                    </div>
                    <div className="text-2xl font-black text-gray-900">{formatCurrency(room.price)}<span className="text-lg text-gray-500 font-bold">/giờ</span></div>
                  </div>

                  {/* Duration */}
                  <div className="flex items-center gap-2 bg-blue-50 px-4 py-3 rounded-xl mb-4">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-semibold text-blue-900">
                      {new Date(room.startDate).toLocaleDateString('vi-VN')} - {new Date(room.endDate).toLocaleDateString('vi-VN')}
                    </span>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5 mb-1">
                        <Eye className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-black text-blue-900">{room.views.toLocaleString()}</span>
                      </div>
                      <div className="text-xs font-bold text-blue-700">Lượt xem</div>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5 mb-1">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-black text-green-900">{room.clicks}</span>
                      </div>
                      <div className="text-xs font-bold text-green-700">Lượt click</div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5 mb-1">
                        <Zap className="w-4 h-4 text-purple-500" />
                        <span className="text-sm font-black text-purple-900">{room.bookings}</span>
                      </div>
                      <div className="text-xs font-bold text-purple-700">Booking</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between bg-gray-50">
                <div className="flex items-center gap-4">
                  <button className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                    Xem chi tiết
                  </button>
                  <button className="text-sm font-semibold text-gray-600 hover:text-gray-700 transition-colors">
                    Quản lý quảng cáo
                  </button>
                </div>
                <button className="text-sm font-semibold text-red-600 hover:text-red-700 transition-colors">
                  Gia hạn gói
                </button>
              </div>
            </div>
          ))}

          {/* Additional Info */}
          <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl border border-red-200 p-6">
            <h3 className="font-black text-gray-900 mb-3">Mẹo tối ưu hiệu quả quảng cáo</h3>
            <ul className="space-y-2 text-sm font-medium text-gray-700">
              <li>✓ Cập nhật ảnh chất lượng cao để tăng lượt xem</li>
              <li>✓ Giữ giá cạnh tranh để tăng conversion rate</li>
              <li>✓ Trả lời nhanh yêu cầu của khách để tăng booking</li>
              <li>✓ Duy trì rating cao bằng dịch vụ tốt</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
