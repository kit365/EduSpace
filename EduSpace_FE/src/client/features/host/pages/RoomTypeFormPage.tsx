import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { RentalLayout } from '../../../layouts/RentalLayout';
import { MOCK_ROOM_TYPES } from '../data/mockData';
import { RoomType } from '../types';
import {
    ArrowLeft,
    Save,
    BookOpen,
    Monitor,
    Users,
    Mic,
    Palette,
    Info,
    CheckCircle2
} from 'lucide-react';

const icons = [
    { id: 'BookOpen', icon: BookOpen, label: 'Giáo dục' },
    { id: 'Monitor', icon: Monitor, label: 'Công nghệ' },
    { id: 'Users', icon: Users, label: 'Hội họp' },
    { id: 'Mic', icon: Mic, label: 'Sự kiện' },
    { id: 'Palette', icon: Palette, label: 'Sáng tạo' },
];

export function RoomTypeFormPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);

    const [formData, setFormData] = useState<Omit<RoomType, 'id'>>({
        name: '',
        description: '',
        icon: 'BookOpen',
        basePrice: 0,
        status: 'active'
    });

    useEffect(() => {
        if (isEdit && id) {
            const existing = MOCK_ROOM_TYPES.find(rt => rt.id === id);
            if (existing) {
                setFormData({
                    name: existing.name,
                    description: existing.description,
                    icon: existing.icon,
                    basePrice: existing.basePrice,
                    status: existing.status
                });
            }
        }
    }, [id, isEdit]);

    const handleSave = () => {
        // In a real app, we would call an API here
        console.log('Saving room type:', formData);
        navigate('/rental/room-types');
    };

    return (
        <RentalLayout title={isEdit ? "Chỉnh sửa Loại phòng" : "Thêm Loại phòng mới"}>
            <div className="p-8 max-w-4xl mx-auto">
                <button
                    onClick={() => navigate('/rental/room-types')}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-bold mb-8 transition-colors group"
                >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    Quay lại danh sách
                </button>

                <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-8 border-b border-gray-50 bg-gray-50/50">
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                            {isEdit ? "Chỉnh sửa Loại phòng" : "Tạo Loại phòng mới"}
                        </h1>
                        <p className="text-gray-500 font-medium">Cung cấp các thông tin cơ bản cho loại không gian này.</p>
                    </div>

                    <div className="p-8 space-y-8">
                        {/* Basic Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Tên loại phòng</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Ví dụ: Phòng máy HP, Hội trường A..."
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all font-bold text-gray-900"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Giá cơ bản (VNĐ/giờ)</label>
                                <input
                                    type="number"
                                    value={formData.basePrice || ''}
                                    onChange={e => setFormData({ ...formData, basePrice: parseInt(e.target.value) })}
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all font-bold text-gray-900"
                                />
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-3">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Mô tả</label>
                            <textarea
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                rows={4}
                                placeholder="Mô tả đặc điểm hoặc mục đích sử dụng của loại phòng này..."
                                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all font-medium text-gray-900 resize-none"
                            />
                        </div>

                        {/* Icon Selection */}
                        <div className="space-y-4">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Biểu tượng đại diện</label>
                            <div className="grid grid-cols-5 gap-4">
                                {icons.map(item => {
                                    const Icon = item.icon;
                                    const isSelected = formData.icon === item.id;
                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => setFormData({ ...formData, icon: item.id })}
                                            className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${isSelected
                                                    ? 'bg-red-500 border-red-500 text-white shadow-lg shadow-red-100'
                                                    : 'bg-white border-gray-100 text-gray-400 hover:border-red-200 hover:text-red-500'
                                                }`}
                                        >
                                            <Icon className="w-6 h-6" />
                                            <span className="text-[10px] font-black uppercase tracking-wider">{item.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Status */}
                        <div className="pt-8 border-t border-gray-50">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 mb-4 block">Trạng thái hiển thị</label>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setFormData({ ...formData, status: 'active' })}
                                    className={`flex-1 p-4 rounded-2xl border flex items-center gap-3 transition-all ${formData.status === 'active'
                                            ? 'bg-green-50 border-green-200 text-green-700 shadow-sm'
                                            : 'bg-white border-gray-100 text-gray-400'
                                        }`}
                                >
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${formData.status === 'active' ? 'bg-green-500 text-white' : 'bg-gray-100'}`}>
                                        <CheckCircle2 className="w-4 h-4" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-bold text-sm">Hoạt động</p>
                                        <p className="text-[10px] uppercase font-black tracking-wider opacity-60">Sẵn sàng cho thuê</p>
                                    </div>
                                </button>
                                <button
                                    onClick={() => setFormData({ ...formData, status: 'inactive' })}
                                    className={`flex-1 p-4 rounded-2xl border flex items-center gap-3 transition-all ${formData.status === 'inactive'
                                            ? 'bg-gray-50 border-gray-200 text-gray-700 shadow-sm'
                                            : 'bg-white border-gray-100 text-gray-400'
                                        }`}
                                >
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${formData.status === 'inactive' ? 'bg-gray-400 text-white' : 'bg-gray-100'}`}>
                                        <CheckCircle2 className="w-4 h-4" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-bold text-sm">Tạm ẩn</p>
                                        <p className="text-[10px] uppercase font-black tracking-wider opacity-60">Không hiển thị công khai</p>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-3 text-gray-400">
                            <Info className="w-5 h-5" />
                            <p className="text-sm font-medium">Bản nháp sẽ được lưu tự động</p>
                        </div>
                        <button
                            onClick={handleSave}
                            className="bg-red-500 text-white px-10 py-4 rounded-2xl font-black shadow-xl shadow-red-100 hover:bg-red-600 active:scale-95 transition-all flex items-center gap-2"
                        >
                            <Save className="w-5 h-5" />
                            {isEdit ? "Cập nhật" : "Lưu loại phòng"}
                        </button>
                    </div>
                </div>
            </div>
        </RentalLayout>
    );
}
