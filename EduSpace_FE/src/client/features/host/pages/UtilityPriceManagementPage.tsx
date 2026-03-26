import { useEffect, useMemo, useState } from 'react';
import { Pencil, Search, DollarSign, Zap, Droplets, Utensils, Info, CheckCircle, AlertCircle, Trash2 } from 'lucide-react';
import { RentalLayout } from '../../../layouts/RentalLayout';
import { showToast } from '@/utils/toast';
import { roomApiService } from '@/client/features/room/services/roomApiService';
import type { AmenityDto } from '@/client/features/room/types';

export function UtilityPriceManagementPage() {
  const [amenities, setAmenities] = useState<AmenityDto[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [currentAmenity, setCurrentAmenity] = useState<AmenityDto | null>(null);
  const [priceInput, setPriceInput] = useState('');
  const [saving, setSaving] = useState(false);

  const formatPrice = (val: string) => {
    const num = val.replace(/\D/g, '');
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const filteredAmenities = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return amenities;
    return amenities.filter((a) => a.name.toLowerCase().includes(q));
  }, [amenities, searchQuery]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const list = await roomApiService.getAllAmenities();
        if (cancelled) return;
        setAmenities(Array.isArray(list) ? list : []);
      } catch {
        showToast.error('Không tải được danh sách tiện ích.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const activeCount = useMemo(() => amenities.filter((a) => (a.price ?? 0) > 0).length, [amenities]);
  const inactiveCount = Math.max(0, amenities.length - activeCount);

  const getIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('điện')) return <Zap className="w-6 h-6 text-amber-500" />;
    if (n.includes('nước')) return <Droplets className="w-6 h-6 text-blue-500" />;
    if (n.includes('vệ sinh') || n.includes('dọn')) return <Trash2 className="w-6 h-6 text-emerald-500" />;
    if (n.includes('suối') || n.includes('uống') || n.includes('ăn')) return <Utensils className="w-6 h-6 text-rose-500" />;
    return <DollarSign className="w-6 h-6 text-gray-500" />;
  };

  const handleOpenEdit = (amenity: AmenityDto) => {
    setCurrentAmenity(amenity);
    setPriceInput(formatPrice(String(amenity.price ?? 0)));
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!currentAmenity) return;
    const priceNum = Number(String(priceInput ?? '').replace(/\D/g, ''));
    if (!Number.isFinite(priceNum) || priceNum < 0) {
      showToast.error('Giá tiền không hợp lệ.');
      return;
    }

    setSaving(true);
    try {
      const updated = await roomApiService.updateAmenity(currentAmenity.id, { price: priceNum });
      setAmenities((prev) => prev.map((a) => (a.id === currentAmenity.id ? updated : a)));
      showToast.success('Cập nhật thành công!');
      setShowForm(false);
    } catch {
      showToast.error('Không thể cập nhật giá. Thử lại sau.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <RentalLayout title="Quản lý giá tiện ích">
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Quản lý giá tiện ích</h1>
            <p className="text-gray-500 font-medium max-w-2xl">
              Thiết lập và quản lý đơn giá cho các tiện ích phát sinh để tính vào giá cuối cùng khi đặt phòng.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-5">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
              <DollarSign className="w-7 h-7" />
            </div>
            <div>
              <div className="text-sm font-bold text-gray-400 uppercase tracking-widest">Tổng số mục</div>
              <div className="text-2xl font-black text-gray-900">{amenities.length}</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-5">
            <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
              <CheckCircle className="w-7 h-7" />
            </div>
            <div>
              <div className="text-sm font-bold text-gray-400 uppercase tracking-widest">Đang áp dụng</div>
              <div className="text-2xl font-black text-gray-900">{activeCount}</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-5">
            <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
              <AlertCircle className="w-7 h-7" />
            </div>
            <div>
              <div className="text-sm font-bold text-gray-400 uppercase tracking-widest">Tạm ngưng</div>
              <div className="text-2xl font-black text-gray-900">{inactiveCount}</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden min-h-[500px] flex flex-col">
          <div className="p-6 border-b border-gray-50 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên tiện ích..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-2xl font-bold text-gray-900 focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-50 outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                    Dịch vụ / Tiện ích
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                    Đơn giá
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredAmenities.map((amenity) => (
                  <tr key={amenity.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white border border-gray-100 rounded-2xl shadow-sm flex items-center justify-center shrink-0">
                          {getIcon(amenity.name)}
                        </div>
                        <div>
                          <div className="font-black text-gray-900 text-base">{amenity.name}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-8 py-6">
                      <div className="font-black text-red-600 text-lg">
                        {(amenity.price ?? 0).toLocaleString()}{' '}
                        <span className="text-xs font-bold text-gray-400 ml-0.5">VNĐ</span>
                      </div>
                    </td>

                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleOpenEdit(amenity)}
                          className="p-3 bg-white border border-gray-100 rounded-xl text-blue-500 hover:bg-blue-50 hover:border-blue-100 shadow-sm transition-all active:scale-90"
                          title="Sửa giá"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {loading && filteredAmenities.length === 0 && (
                  <tr>
                    <td className="px-8 py-10 text-gray-500 font-bold" colSpan={3}>
                      Đang tải...
                    </td>
                  </tr>
                )}

                {!loading && filteredAmenities.length === 0 && (
                  <tr>
                    <td className="px-8 py-10 text-gray-500 font-bold" colSpan={3}>
                      Không có tiện ích nào phù hợp.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="p-6 bg-gray-50/50 border-t border-gray-100 flex items-center gap-3">
            <Info className="w-5 h-5 text-gray-400 shrink-0" />
            <p className="text-xs font-bold text-gray-500">
              Giá của tiện ích sẽ được cộng vào chi phí phát sinh khi khách hàng sử dụng dịch vụ bổ sung trong quá trình đặt phòng.
            </p>
          </div>
        </div>
      </div>

      {showForm && currentAmenity && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300"
          onClick={() => setShowForm(false)}
        >
          <div
            className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gray-50 px-10 py-8 border-b border-gray-100">
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">Chỉnh sửa giá tiện ích</h2>
              <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-1">Chỉ cập nhật đơn giá</p>
            </div>

            <div className="p-10 space-y-8">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Tên tiện ích</label>
                <div className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl font-bold text-gray-900">
                  {currentAmenity.name}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-8">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                    Đơn giá (VNĐ) *
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={priceInput}
                    onChange={(e) => setPriceInput(formatPrice(e.target.value))}
                    className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl font-black text-red-600 focus:bg-white focus:border-red-500 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-10 flex gap-4">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 py-4 rounded-2xl font-black text-gray-500 border border-gray-200"
                disabled={saving}
              >
                Huỷ
              </button>
              <button
                onClick={() => void handleSave()}
                className="flex-1 py-4 rounded-2xl font-black bg-gray-900 text-white hover:bg-red-500 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={saving}
              >
                {saving ? 'Đang lưu...' : 'Lưu'}
              </button>
            </div>
          </div>
        </div>
      )}
    </RentalLayout>
  );
}

