import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  AlertCircle,
  Banknote,
  BookOpen,
  Brush,
  Building2,
  Camera,
  Car,
  CheckCircle,
  ChevronDown,
  Coffee,
  DollarSign,
  Eye,
  FileText,
  Gift,
  Globe,
  Info,
  KeyRound,
  Lock,
  Maximize2,
  Mic,
  Monitor,
  Pencil,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  Smartphone,
  Tag,
  Trash2,
  User,
  Users,
  Video,
  Wind,
  Wifi,
  X,
  Zap,
} from 'lucide-react';
import { RentalLayout } from '../../../layouts/RentalLayout';
import { showToast } from '@/utils/toast';
import { roomApiService } from '@/client/features/room/services/roomApiService';
import type { AmenityCreateRequest, AmenityDto } from '@/client/features/room/types';
import { useAuthStore } from '@/stores/authStore';
import { hasHostPermission } from '@/utils/keycloakTokenRoles';
import { hostPermissions } from '../permissions/hostPermissions';
import { refreshHostPermissionsFromAccount } from '@/utils/refreshHostPermissionsFromAccount';

type AmenityTypeFilter = 'ALL' | 'BASIC' | 'SERVICE' | 'EQUIPMENT' | 'FEATURE' | 'POLICY';
type FormMode = 'create' | 'edit';

const TYPE_LABEL: Record<AmenityTypeFilter, string> = {
  ALL: 'Tất cả',
  BASIC: 'Cơ bản',
  SERVICE: 'Dịch vụ',
  EQUIPMENT: 'Thiết bị',
  FEATURE: 'Tiện nghi',
  POLICY: 'Chính sách',
};

const ICON_COMPONENT_MAP: Record<string, LucideIcon> = {
  wifi: Wifi,
  presentation: Video,
  board: Building2,
  ac: Wind,
  wind: Wind,
  water: Coffee,
  coffee: Coffee,
  support: ShieldCheck,
  projectors: Video,
  whiteboard: Building2,
  sound: Maximize2,
  zap: Zap,
  shield: ShieldCheck,
  'support-247': ShieldCheck,
  parking: Car,
  cleaning: Brush,
  phone: Phone,
  globe: Globe,
  mobile: Smartphone,
  users: Users,
  user: User,
  lock: Lock,
  key: KeyRound,
  camera: Camera,
  mic: Mic,
  monitor: Monitor,
  gift: Gift,
  book: BookOpen,
  building: Building2,
  banknote: Banknote,
  file: FileText,
  eye: Eye,
};

const ICON_OPTIONS = [
  { key: 'wifi', label: 'Wi-Fi' },
  { key: 'presentation', label: 'Máy chiếu / Màn hình' },
  { key: 'board', label: 'Bảng viết' },
  { key: 'monitor', label: 'Màn hình rời' },
  { key: 'camera', label: 'Camera' },
  { key: 'mic', label: 'Micro' },
  { key: 'sound', label: 'Âm thanh' },
  { key: 'ac', label: 'Điều hòa' },
  { key: 'water', label: 'Nước uống' },
  { key: 'support', label: 'Hỗ trợ kỹ thuật' },
  { key: 'support-247', label: 'Hỗ trợ 24/7' },
  { key: 'parking', label: 'Bãi xe' },
  { key: 'cleaning', label: 'Vệ sinh' },
  { key: 'phone', label: 'Liên hệ điện thoại' },
  { key: 'globe', label: 'Internet' },
  { key: 'mobile', label: 'Ứng dụng di động' },
  { key: 'users', label: 'Nhóm' },
  { key: 'lock', label: 'Bảo mật' },
  { key: 'book', label: 'Học tập' },
  { key: 'building', label: 'Tiện ích tòa nhà' },
  { key: 'banknote', label: 'Thanh toán' },
  { key: 'zap', label: 'Khác' },
];

export function UtilityPriceManagementPage() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const hostPermissionsFromAccount = useAuthStore((s) => s.hostPermissionsFromAccount);
  const [amenities, setAmenities] = useState<AmenityDto[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeType, setActiveType] = useState<AmenityTypeFilter>('ALL');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>('create');
  const [currentAmenity, setCurrentAmenity] = useState<AmenityDto | null>(null);
  const [form, setForm] = useState({
    nameVi: '',
    icon: 'zap',
    type: 'SERVICE' as AmenityCreateRequest['type'],
    price: '0',
  });

  const formatPrice = (val: string) => val.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  const loadAmenities = async () => {
    setLoading(true);
    try {
      const list = await roomApiService.getAllAmenities();
      setAmenities(Array.isArray(list) ? list : []);
    } catch {
      showToast.error('Không tải được danh sách tiện ích.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refreshHostPermissionsFromAccount();
  }, [accessToken]);

  const canViewUtility = hasHostPermission(accessToken, hostPermissions.utility.view, hostPermissionsFromAccount);
  const canCreateUtility = hasHostPermission(accessToken, hostPermissions.utility.create, hostPermissionsFromAccount);
  const canEditUtility = hasHostPermission(accessToken, hostPermissions.utility.edit, hostPermissionsFromAccount);
  const canDeleteUtility = hasHostPermission(accessToken, hostPermissions.utility.delete, hostPermissionsFromAccount);

  useEffect(() => {
    if (!canViewUtility) return;
    void loadAmenities();
  }, [canViewUtility]);

  const availableTypes = useMemo(() => {
    const set = new Set<AmenityTypeFilter>(['ALL']);
    for (const a of amenities) {
      const t = String(a.type || '').toUpperCase() as AmenityTypeFilter;
      if (TYPE_LABEL[t]) set.add(t);
    }
    return Array.from(set);
  }, [amenities]);

  const filteredAmenities = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return amenities.filter((a) => {
      const sameType = activeType === 'ALL' || String(a.type || '').toUpperCase() === activeType;
      const hit = !q || a.name.toLowerCase().includes(q);
      return sameType && hit;
    });
  }, [amenities, searchQuery, activeType]);

  const activeCount = useMemo(() => amenities.filter((a) => (a.price ?? 0) > 0).length, [amenities]);
  const inactiveCount = Math.max(0, amenities.length - activeCount);

  const renderIcon = (iconKey: string) => {
    const Icon = ICON_COMPONENT_MAP[String(iconKey || '').toLowerCase()] || DollarSign;
    return <Icon className="w-6 h-6 text-gray-700" />;
  };

  const openCreateForm = () => {
    if (!canCreateUtility) {
      showToast.error('Bạn không có quyền tạo tiện ích.');
      return;
    }
    setFormMode('create');
    setCurrentAmenity(null);
    setForm({ nameVi: '', icon: 'zap', type: 'SERVICE', price: '0' });
    setShowForm(true);
  };

  const openEditForm = (amenity: AmenityDto) => {
    if (!canEditUtility) {
      showToast.error('Bạn không có quyền sửa tiện ích.');
      return;
    }
    setFormMode('edit');
    setCurrentAmenity(amenity);
    setForm({
      nameVi: amenity.name,
      icon: amenity.icon || 'zap',
      type: (String(amenity.type || 'SERVICE').toUpperCase() as AmenityCreateRequest['type']) || 'SERVICE',
      price: formatPrice(String(amenity.price ?? 0)),
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    const cleanName = form.nameVi.trim();
    const priceNum = Number(String(form.price || '').replace(/\D/g, ''));
    if (!cleanName) return showToast.error('Tên tiện ích không được để trống.');
    if (!Number.isFinite(priceNum) || priceNum < 0) return showToast.error('Giá tiền không hợp lệ.');

    setSaving(true);
    try {
      if (formMode === 'create') {
        if (!canCreateUtility) {
          showToast.error('Bạn không có quyền tạo tiện ích.');
          return;
        }
        const created = await roomApiService.createAmenity({
          nameVi: cleanName,
          nameEn: cleanName,
          icon: form.icon,
          type: form.type,
          price: priceNum,
        });
        setAmenities((prev) => [created, ...prev]);
        showToast.success('Đã tạo tiện ích mới.');
      } else if (currentAmenity) {
        if (!canEditUtility) {
          showToast.error('Bạn không có quyền sửa tiện ích.');
          return;
        }
        const updated = await roomApiService.updateAmenity(currentAmenity.id, {
          nameVi: cleanName,
          nameEn: cleanName,
          icon: form.icon,
          type: form.type,
          price: priceNum,
        });
        setAmenities((prev) => prev.map((a) => (a.id === currentAmenity.id ? updated : a)));
        showToast.success('Đã cập nhật tiện ích.');
      }
      setShowForm(false);
    } catch {
      showToast.error('Không thể lưu tiện ích. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (amenity: AmenityDto) => {
    if (!canDeleteUtility) {
      showToast.error('Bạn không có quyền xóa tiện ích.');
      return;
    }
    if (!window.confirm(`Xóa tiện ích "${amenity.name}"?`)) return;
    try {
      await roomApiService.deleteAmenity(amenity.id);
      setAmenities((prev) => prev.filter((a) => a.id !== amenity.id));
      showToast.success('Đã xóa tiện ích.');
    } catch {
      showToast.error('Không thể xóa tiện ích. Có thể tiện ích đang được sử dụng.');
    }
  };

  if (!canViewUtility) {
    return (
      <RentalLayout title="Quản lý tiện ích">
        <div className="mx-auto max-w-lg p-8 text-center text-gray-600">Bạn không có quyền xem module tiện ích.</div>
      </RentalLayout>
    );
  }

  return (
    <RentalLayout title="Quản lý tiện ích">
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Quản lý dịch vụ & tiện ích</h1>
            <p className="text-gray-500 font-medium max-w-2xl">Hiển thị icon đúng từ DB, lọc theo type và quản lý tạo/sửa/xóa tiện ích.</p>
          </div>
          {canCreateUtility && (
            <button
              onClick={openCreateForm}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gray-900 text-white font-bold hover:bg-red-500 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Thêm tiện ích
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard icon={<DollarSign className="w-7 h-7" />} color="blue" label="Tổng số mục" value={amenities.length} />
          <StatCard icon={<CheckCircle className="w-7 h-7" />} color="green" label="Đang áp dụng" value={activeCount} />
          <StatCard icon={<AlertCircle className="w-7 h-7" />} color="amber" label="Tạm ngưng" value={inactiveCount} />
        </div>

        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden min-h-[500px] flex flex-col">
          <div className="p-6 border-b border-gray-50 flex flex-col gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên tiện ích..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-2xl font-bold text-gray-900 focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-50 outline-none transition-all"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {availableTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setActiveType(type)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold border transition-colors ${
                    activeType === type ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {TYPE_LABEL[type] ?? type}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Dịch vụ / Tiện ích</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Type</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Đơn giá</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredAmenities.map((amenity) => (
                  <tr key={amenity.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white border border-gray-100 rounded-2xl shadow-sm flex items-center justify-center shrink-0">
                          {renderIcon(amenity.icon)}
                        </div>
                        <div>
                          <div className="font-black text-gray-900 text-base">{amenity.name}</div>
                          <div className="text-xs text-gray-400 font-semibold">icon: {amenity.icon || 'zap'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 font-bold text-gray-600">{TYPE_LABEL[(String(amenity.type || '').toUpperCase() as AmenityTypeFilter)] || amenity.type}</td>
                    <td className="px-8 py-6">
                      <div className="font-black text-red-600 text-lg">
                        {(amenity.price ?? 0).toLocaleString()} <span className="text-xs font-bold text-gray-400 ml-0.5">VNĐ</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {canEditUtility && (
                          <button
                            onClick={() => openEditForm(amenity)}
                            className="p-3 bg-white border border-gray-100 rounded-xl text-blue-500 hover:bg-blue-50 hover:border-blue-100 shadow-sm transition-all active:scale-90"
                            title="Sửa tiện ích"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                        )}
                        {canDeleteUtility && (
                          <button
                            onClick={() => void handleDelete(amenity)}
                            className="p-3 bg-white border border-gray-100 rounded-xl text-red-500 hover:bg-red-50 hover:border-red-100 shadow-sm transition-all active:scale-90"
                            title="Xóa tiện ích"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {loading && filteredAmenities.length === 0 && (
                  <tr><td className="px-8 py-10 text-gray-500 font-bold" colSpan={4}>Đang tải...</td></tr>
                )}
                {!loading && filteredAmenities.length === 0 && (
                  <tr><td className="px-8 py-10 text-gray-500 font-bold" colSpan={4}>Không có tiện ích nào phù hợp.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="p-6 bg-gray-50/50 border-t border-gray-100 flex items-center gap-3">
            <Info className="w-5 h-5 text-gray-400 shrink-0" />
            <p className="text-xs font-bold text-gray-500">Giá tiện ích được cộng vào chi phí phát sinh khi khách sử dụng dịch vụ bổ sung.</p>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-md transition-all duration-300 animate-in fade-in" onClick={() => setShowForm(false)}>
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="px-10 py-8 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-10">
              <div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight leading-none mb-1.5">{formMode === 'create' ? 'Tạo tiện ích mới' : 'Chỉnh sửa tiện ích'}</h2>
                <p className="text-sm font-medium text-gray-400">Thiết lập thông tin và đơn giá cho dịch vụ này.</p>
              </div>
              <button 
                onClick={() => setShowForm(false)}
                className="p-3 hover:bg-gray-100 rounded-2xl text-gray-400 hover:text-gray-900 transition-colors"
                title="Đóng"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-10 space-y-8 overflow-y-auto scrollbar-hide">
              <Field label="Tên tiện ích / Dịch vụ" icon={<Tag className="w-3.5 h-3.5" />}>
                <div className="relative group">
                  <input
                    value={form.nameVi}
                    onChange={(e) => setForm((prev) => ({ ...prev, nameVi: e.target.value }))}
                    className="w-full px-6 py-4.5 bg-gray-50/50 border border-gray-100 rounded-2xl font-bold text-gray-900 focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-50 outline-none transition-all placeholder:text-gray-300"
                    placeholder="Ví dụ: Nước uống miễn phí, Máy chiếu..."
                  />
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-focus-within:opacity-100 transition-opacity">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  </div>
                </div>
              </Field>

              <div className="grid grid-cols-2 gap-6">
                <Field label="Loại tiện ích" icon={<Building2 className="w-3.5 h-3.5" />}>
                  <div className="relative group">
                    <select
                      value={form.type}
                      onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value as AmenityCreateRequest['type'] }))}
                      className="w-full appearance-none px-6 py-4.5 bg-gray-50/50 border border-gray-100 rounded-2xl font-bold text-gray-900 focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-50 outline-none transition-all cursor-pointer"
                    >
                      {(['BASIC', 'SERVICE', 'EQUIPMENT', 'FEATURE', 'POLICY'] as AmenityCreateRequest['type'][]).map((t) => (
                        <option key={t} value={t}>{TYPE_LABEL[t]}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-5 h-5 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none group-focus-within:text-red-500 transition-colors" />
                  </div>
                </Field>

                <Field label="Đơn giá (VNĐ)" icon={<DollarSign className="w-3.5 h-3.5" />}>
                  <div className="relative group">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={form.price}
                      onChange={(e) => setForm((prev) => ({ ...prev, price: formatPrice(e.target.value) }))}
                      className="w-full px-6 py-4.5 bg-gray-50/50 border border-gray-100 rounded-2xl font-black text-red-600 focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-50 outline-none transition-all"
                    />
                    <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-300 group-focus-within:text-red-300 transition-colors">VND</span>
                  </div>
                </Field>
              </div>

              <Field label="Chọn Icon đại diện" icon={<Search className="w-3.5 h-3.5" />}>
                <div className="p-4 bg-gray-50/50 rounded-3xl border border-gray-100">
                  <div className="grid grid-cols-4 gap-3 max-h-64 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200">
                    {ICON_OPTIONS.map((opt) => {
                      const Icon = ICON_COMPONENT_MAP[opt.key] || DollarSign;
                      const active = form.icon === opt.key;
                      return (
                        <button
                          key={opt.key}
                          type="button"
                          onClick={() => setForm((prev) => ({ ...prev, icon: opt.key }))}
                          className={`group relative p-3 rounded-2xl transition-all aspect-square flex flex-col items-center justify-center gap-2 ${
                            active 
                              ? 'bg-red-500 border-none shadow-lg shadow-red-100 scale-105 z-10' 
                              : 'bg-white border border-gray-100 hover:border-red-200 hover:shadow-md hover:-translate-y-0.5'
                          }`}
                        >
                          <Icon className={`w-6 h-6 transition-colors ${active ? 'text-white' : 'text-gray-400 group-hover:text-red-500'}`} />
                          <span className={`text-[9px] font-bold text-center leading-tight transition-colors ${active ? 'text-white' : 'text-gray-400 group-hover:text-gray-600 hidden'}`}>
                            {opt.label}
                          </span>
                          {/* Tooltip on hover if not active */}
                          {!active && (
                             <div className="absolute -top-8 bg-gray-900 text-white text-[9px] px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-20">
                               {opt.label}
                             </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </Field>
            </div>

            {/* Modal Footer */}
            <div className="px-10 py-8 bg-gray-50/50 border-t border-gray-100 flex gap-4 sticky bottom-0 backdrop-blur-sm">
              <button 
                onClick={() => setShowForm(false)} 
                className="flex-1 py-4.5 rounded-2xl font-black text-gray-500 bg-white border border-gray-200 hover:bg-gray-100 transition-all active:scale-95 disabled:opacity-50" 
                disabled={saving}
              >
                Hủy bỏ
              </button>
              <button 
                onClick={() => void handleSave()} 
                className="flex-[1.5] py-4.5 rounded-2xl font-black bg-gray-900 text-white hover:bg-red-500 shadow-xl shadow-gray-200 hover:shadow-red-50 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2" 
                disabled={saving}
              >
                {saving ? (
                  <>
                    <div className="w-5 h-5 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Đang xử lý...</span>
                  </>
                ) : (
                  <>
                    {formMode === 'create' ? <Plus className="w-5 h-5" /> : <Pencil className="w-4 h-4" />}
                    <span>{formMode === 'create' ? 'Tạo mới tiện ích' : 'Cập nhật thay đổi'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </RentalLayout>
  );
}

function Field({ label, icon, children }: { label: string; icon?: ReactNode; children: ReactNode }) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2 ml-1">
        {icon && <span className="text-gray-400">{icon}</span>}
        <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.15em]">{label}</label>
      </div>
      {children}
    </div>
  );
}

function StatCard({ icon, color, label, value }: { icon: ReactNode; color: 'blue' | 'green' | 'amber'; label: string; value: number }) {
  const colorClass =
    color === 'blue'
      ? 'bg-blue-50 text-blue-600'
      : color === 'green'
      ? 'bg-green-50 text-green-600'
      : 'bg-amber-50 text-amber-600';
  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-5">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${colorClass}`}>{icon}</div>
      <div>
        <div className="text-sm font-bold text-gray-400 uppercase tracking-widest">{label}</div>
        <div className="text-2xl font-black text-gray-900">{value}</div>
      </div>
    </div>
  );
}
