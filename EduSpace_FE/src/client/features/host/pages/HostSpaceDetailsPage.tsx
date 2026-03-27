import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
    MapPin, ArrowLeft, Edit2, Loader2, Share2, Heart, 
    Maximize2, Users, Building2, Info, CheckCircle, 
    Zap, Droplets, Trash2, ShieldCheck, CigaretteOff, 
    Clock, Layout, Hash, Layers, Navigation, Star,
    ChevronRight, X, DollarSign, Calendar, AlertCircle
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { RentalLayout } from '../../../layouts/RentalLayout';
import { useSpaceDetails } from '../../customer/spaces/hooks/useSpaces';
import { SpaceDetails, RoomPriceRule } from '@/types/space';
import { BookingPanel } from '../../customer/spaces/components';

const SPACE_TYPE_LABELS: Record<string, string> = {
    'classroom': 'Phòng học',
    'meeting_room': 'Phòng họp',
    'lab': 'Phòng Lab',
    'workshop': 'Xưởng Workshop',
    'seminar_hall': 'Hội trường',
    'studio': 'Phòng Studio',
    'co_working': 'Chỗ ngồi làm việc',
    'other': 'Không gian khác'
};

function HostSpaceGallery({ images, name }: { images: string[], name: string }) {
    const { t } = useTranslation();
    const [isViewerOpen, setIsViewerOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(0);

    const safeImages = images.filter(Boolean);
    const mainImage = safeImages[0] || 'https://via.placeholder.com/1200x800?text=No+Image';
    // Max 5 side images to fill a 6-slot grid (1 main + 5 side)
    const sideImages = safeImages.slice(1, 6);
    const extraCount = safeImages.length - 6;

    return (
        <div className="mb-12">
            <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4 h-auto md:h-[480px]">
                {/* Main Large Image */}
                <div className="md:col-span-2 md:row-span-2 relative group overflow-hidden rounded-[2.5rem] shadow-lg">
                    <img src={mainImage} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* Side Images Grid */}
                {sideImages.map((img, idx) => {
                    const isLast = idx === sideImages.length - 1 && idx === 4; // 5th side image (6th total)
                    return (
                        <div 
                            key={idx} 
                            className="relative group overflow-hidden rounded-[1.5rem] shadow-sm cursor-pointer"
                            onClick={() => {
                                setSelectedImage(idx + 1);
                                setIsViewerOpen(true);
                            }}
                        >
                            <img src={img} alt={`${name} ${idx + 2}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            {isLast && extraCount > 0 && (
                                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
                                    <div className="text-white text-center">
                                        <div className="text-2xl font-black">+{extraCount}</div>
                                        <div className="text-[10px] font-black uppercase tracking-widest">Xem thêm</div>
                                    </div>
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    );
                })}

                {/* Empty Slots placeholder (only if less than 2 images to show basic structure, but user said "đừng hiển thị bù" - so I just won't render anything if not enough images) */}
            </div>

            {/* Lightbox Viewer */}
            {isViewerOpen && (
                <div className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur-xl flex flex-col p-8">
                    <button 
                        onClick={() => setIsViewerOpen(false)}
                        className="absolute top-8 right-8 w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-all"
                    >
                        <X className="w-6 h-6" />
                    </button>
                    <div className="flex-1 flex items-center justify-center">
                        <img src={safeImages[selectedImage]} alt="Viewer" className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl" />
                    </div>
                    <div className="flex justify-center gap-3 mt-8 overflow-x-auto pb-4">
                        {safeImages.map((img, idx) => (
                            <button 
                                key={idx} 
                                onClick={() => setSelectedImage(idx)}
                                className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${selectedImage === idx ? 'border-red-500 scale-110 shadow-lg' : 'border-transparent opacity-50'}`}
                            >
                                <img src={img} className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function PricingRulesSection({ space }: { space: SpaceDetails }) {
    const rules = space.priceRules || [];
    
    return (
        <section className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm mb-12">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-500">
                    <DollarSign className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">Cấu hình giá & Quy tắc</h2>
                    <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-0.5">Giá thuê và các ưu đãi theo thời lượng</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Giá cơ bản</div>
                    <div className="text-2xl font-black text-red-600">{(space.price || 0).toLocaleString()} <span className="text-sm">đ/{space.stepUnit || 60}p</span></div>
                    <div className="mt-4 flex items-center gap-2 text-xs font-bold text-slate-500">
                        <Clock className="w-3 h-3" /> Thuê tối thiểu: {space.minDuration || 1} giờ
                    </div>
                </div>
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Đơn vị bước nhảy</div>
                    <div className="text-2xl font-black text-slate-900">{space.stepUnit || 30} <span className="text-sm">phút</span></div>
                    <p className="text-[10px] text-slate-400 font-bold mt-2 italic">Hệ thống sẽ tính giá dựa trên mỗi {space.stepUnit || 30}p</p>
                </div>
                {space.weekendSurchargeEnabled && (
                    <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100">
                        <div className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-2">Phụ thu cuối tuần</div>
                        <div className="text-2xl font-black text-amber-700">+{space.weekendSurchargePercent}%</div>
                        <div className="mt-4 flex flex-wrap gap-2">
                            {space.weekendApplySaturday && <span className="px-2 py-1 bg-white rounded-lg text-[9px] font-black text-amber-600 uppercase border border-amber-200">Thứ 7</span>}
                            {space.weekendApplySunday && <span className="px-2 py-1 bg-white rounded-lg text-[9px] font-black text-amber-600 uppercase border border-amber-200">Chủ Nhật</span>}
                        </div>
                    </div>
                )}
            </div>

            {rules.length > 0 && (
                <div>
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" /> Quy tắc giá ưu đãi
                    </h3>
                    <div className="space-y-3">
                        {rules.map((rule, idx) => (
                            <div key={idx} className="flex items-center justify-between p-5 bg-white border border-gray-100 rounded-[1.5rem] hover:shadow-md transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-red-50 group-hover:text-red-500 transition-colors">
                                        <Layers className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="font-black text-gray-900">{rule.label || `Quy tắc ${idx + 1}`}</div>
                                        <div className="text-xs font-bold text-gray-400">
                                            Thời lượng: {rule.minHours}{rule.maxHours ? ` - ${rule.maxHours}` : '+'} giờ
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-black text-gray-900">
                                        {rule.flatPrice 
                                            ? `${rule.flatPrice.toLocaleString()} đ` 
                                            : `${(rule.pricePerHour || 0).toLocaleString()} đ/giờ`
                                        }
                                    </div>
                                    <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                                        {rule.flatPrice ? 'Giá trọn gói' : 'Giá theo giờ'}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </section>
    );
}

export function HostSpaceDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { t } = useTranslation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    const spaceId = id ? parseInt(id) : 1;
    const { data: space, loading, error } = useSpaceDetails(String(spaceId));

    const onBack = () => navigate('/rental/spaces');
    const onEdit = () => navigate(`/rental/spaces/edit/${spaceId}`);

    if (loading) {
        return (
            <RentalLayout title="Chi tiết không gian">
                <div className="min-h-[70vh] flex flex-col items-center justify-center gap-6">
                    <Loader2 className="w-16 h-16 text-red-500 animate-spin" />
                    <p className="font-black text-gray-400 uppercase tracking-widest text-sm">Đang tải thông tin...</p>
                </div>
            </RentalLayout>
        );
    }

    if (error || !space) {
        return (
            <RentalLayout title="Không tìm thấy">
                <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-8">
                    <div className="w-24 h-24 bg-red-50 rounded-[32px] flex items-center justify-center mb-8">
                        <MapPin className="w-10 h-10 text-red-200" />
                    </div>
                    <h2 className="text-3xl font-black text-gray-900 mb-2">Không tìm thấy không gian</h2>
                    <p className="text-gray-500 mb-8 max-w-sm font-bold">Không tìm thấy dữ liệu cho phòng này. Vui lòng kiểm tra lại ID.</p>
                    <button onClick={onBack} className="bg-gray-900 text-white px-10 py-4 rounded-2xl font-black shadow-xl active:scale-95">Quay lại</button>
                </div>
            </RentalLayout>
        );
    }

    return (
        <RentalLayout title={space.name}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-in fade-in duration-700 relative">

                {/* Header Actions */}
                <div className="flex justify-between items-center mb-10">
                    <button
                        onClick={onBack}
                        className="group flex items-center gap-3 text-gray-400 hover:text-gray-900 transition-all font-black text-xs uppercase tracking-widest"
                    >
                        <div className="w-10 h-10 bg-white border border-gray-100 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:-translate-x-1 transition-all">
                            <ArrowLeft className="w-5 h-5" />
                        </div>
                        Thoát xem chi tiết
                    </button>
                    <div className="flex gap-3">
                        <button className="flex items-center gap-3 px-6 py-3 bg-white border border-gray-100 rounded-2xl font-black text-xs uppercase tracking-widest hover:shadow-xl hover:-translate-y-1 transition-all text-gray-500 hover:text-gray-900">
                            <Share2 className="w-4 h-4 text-blue-500" /> Chia sẻ
                        </button>
                    </div>
                </div>

                {/* Space Branding & Location */}
                <div className="mb-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 text-red-500 rounded-lg text-[10px] font-black uppercase tracking-widest mb-4">
                        <Layout className="w-3 h-3" /> {SPACE_TYPE_LABELS[space.type] || space.type}
                    </div>
                    <h1 className="text-6xl font-black text-gray-900 mb-6 tracking-tighter leading-tight max-w-4xl">{space.name}</h1>
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2 bg-slate-50 px-5 py-3 rounded-2xl border border-slate-100 shadow-sm">
                            <MapPin className="w-5 h-5 text-red-500 shrink-0" />
                            <span className="text-sm font-black text-gray-600 uppercase tracking-tight">{space.address || space.location}</span>
                        </div>
                        {space.verified && (
                            <div className="bg-blue-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-blue-200 flex items-center gap-2">
                                <CheckCircle className="w-3.5 h-3.5 fill-white text-blue-500" />
                                Đã xác thực
                            </div>
                        )}
                    </div>
                </div>

                {/* Image Gallery */}
                <HostSpaceGallery images={space.images || [space.image]} name={space.name} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                    {/* Left Column: Details & Rules */}
                    <div className="lg:col-span-2 space-y-20">
                        
                        {/* 1. Core Info Grid */}
                        <section>
                            <div className="inline-block px-4 py-2 bg-gray-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest mb-8">Thông tin cơ bản</div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                                <div className="p-6 bg-white border border-gray-100 rounded-[2rem] shadow-sm hover:shadow-md transition-all">
                                    <Layout className="w-6 h-6 text-indigo-500 mb-4" />
                                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Loại không gian</div>
                                    <div className="font-black text-gray-900">{SPACE_TYPE_LABELS[space.type] || 'Khác'}</div>
                                </div>
                                <div className="p-6 bg-white border border-gray-100 rounded-[2rem] shadow-sm hover:shadow-md transition-all">
                                    <Hash className="w-6 h-6 text-amber-500 mb-4" />
                                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Số / Mã phòng</div>
                                    <div className="font-black text-gray-900">{space.roomId || `#${space.id}`}</div>
                                </div>
                                <div className="p-6 bg-white border border-gray-100 rounded-[2rem] shadow-sm hover:shadow-md transition-all">
                                    <Layers className="w-6 h-6 text-emerald-500 mb-4" />
                                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Tầng số</div>
                                    <div className="font-black text-gray-900">{space.floorNumber || 'Tầng trệt'}</div>
                                </div>
                                <div className="p-6 bg-white border border-gray-100 rounded-[2rem] shadow-sm hover:shadow-md transition-all">
                                    <Maximize2 className="w-6 h-6 text-blue-500 mb-4" />
                                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Diện tích</div>
                                    <div className="font-black text-gray-900">{space.size || 0} m²</div>
                                </div>
                                <div className="p-6 bg-white border border-gray-100 rounded-[2rem] shadow-sm hover:shadow-md transition-all">
                                    <Users className="w-6 h-6 text-rose-500 mb-4" />
                                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Sức chứa tối đa</div>
                                    <div className="font-black text-gray-900">{space.capacity} người</div>
                                </div>
                                <div className="p-6 bg-white border border-gray-100 rounded-[2rem] shadow-sm hover:shadow-md transition-all">
                                    <Navigation className="w-6 h-6 text-violet-500 mb-4" />
                                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Vị trí cụ thể</div>
                                    <div className="font-black text-gray-900 line-clamp-1">{space.roomLocationHint || 'Chưa cập nhật'}</div>
                                </div>
                            </div>
                        </section>

                        {/* 2. Amenities & Equipment */}
                        <section>
                            <h3 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-3">
                                <div className="w-8 h-8 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500">
                                    <Zap className="w-4 h-4" />
                                </div>
                                TIỆN ÍCH & TRANG THIẾT BỊ
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {(space.amenitiesDetailed || []).map((amenity, idx) => {
                                    const Icon = amenity.icon;
                                    return (
                                        <div key={idx} className="flex items-center gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-md transition-all group">
                                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 group-hover:text-emerald-500 transition-colors shadow-sm">
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            <span className="font-bold text-gray-600 group-hover:text-gray-900 transition-colors">{amenity.name}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>

                        {/* 3. Room Policies */}
                        {space.policies && space.policies.length > 0 && (
                            <section>
                                <h3 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-3">
                                    <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500">
                                        <ShieldCheck className="w-4 h-4" />
                                    </div>
                                    CHÍNH SÁCH CHO PHÒNG
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {space.policies.map(policy => (
                                        <div key={policy.id} className="p-6 bg-white border border-gray-100 rounded-3xl shadow-sm flex items-start gap-4">
                                            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 shrink-0">
                                                <Info className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h4 className="font-black text-gray-900 mb-1">{policy.name}</h4>
                                                <p className="text-sm text-gray-500 font-medium leading-relaxed">{policy.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* 4. Pricing Configuration */}
                        <PricingRulesSection space={space} />

                        {/* 5. About & Description */}
                        <section className="prose prose-slate max-w-none pb-20">
                            <h3 className="text-xl font-black text-gray-900 mb-6 uppercase tracking-widest text-xs">Mô tả chi tiết</h3>
                            <p className="text-lg text-gray-600 leading-relaxed font-medium">{space.description}</p>
                            {space.additionalInfo && (
                                <div className="mt-8 p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 relative">
                                    <div className="absolute top-0 right-10 -translate-y-1/2 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg text-slate-300">
                                        <Info className="w-6 h-6" />
                                    </div>
                                    <p className="text-gray-500 text-sm leading-relaxed italic font-medium">"{space.additionalInfo}"</p>
                                </div>
                            )}
                        </section>
                    </div>

                    {/* Right Column: Mini Preview & Quick Stats */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-32 space-y-8">
                            {/* Reusing BookingPanel as a Preview tool */}
                            <BookingPanel
                                roomId={space.roomId ?? space.id}
                                price={space.price}
                                rating={space.rating}
                                reviewCount={space.reviewCount || 0}
                                spaceName={space.name}
                                spaceImage={space.image}
                                minDuration={space.minDuration}
                                stepUnit={space.stepUnit}
                            />
                            
                            <div className="bg-gray-900 rounded-[2.5rem] p-8 text-white shadow-2xl">
                                <h4 className="text-sm font-black uppercase tracking-[0.2em] mb-6 text-gray-400">Trạng thái hiện tại</h4>
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-400 font-bold">Trạng thái duyệt</span>
                                        <span className="px-3 py-1 bg-emerald-500 text-[10px] font-black uppercase tracking-widest rounded-lg">Đã duyệt</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-400 font-bold">Hiển thị</span>
                                        <span className="px-3 py-1 bg-white/10 text-[10px] font-black uppercase tracking-widest rounded-lg">Công khai</span>
                                    </div>
                                    <div className="pt-6 border-t border-white/10">
                                        <button 
                                            onClick={onEdit} 
                                            className="w-full py-4 bg-white text-gray-900 rounded-2xl font-black hover:bg-red-500 hover:text-white transition-all active:scale-95 flex items-center justify-center gap-3"
                                        >
                                            <Edit2 className="w-5 h-5" /> Chỉnh sửa phòng
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </RentalLayout>
    );
}
