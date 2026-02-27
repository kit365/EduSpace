import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RentalLayout } from '../../../layouts/RentalLayout';
import { MOCK_ROOM_TYPES } from '../data/mockData';
import { RoomType } from '../types';
import { Plus, Search, Edit2, Trash2, BookOpen, Monitor, Users, Mic, Palette } from 'lucide-react';

const iconMap: Record<string, React.ReactNode> = {
    BookOpen: <BookOpen className="w-5 h-5" />,
    Monitor: <Monitor className="w-5 h-5" />,
    Users: <Users className="w-5 h-5" />,
    Mic: <Mic className="w-5 h-5" />,
    Palette: <Palette className="w-5 h-5" />
};

export function RoomTypesPage() {
    const navigate = useNavigate();
    const [roomTypes, setRoomTypes] = useState<RoomType[]>(MOCK_ROOM_TYPES);
    const [searchQuery, setSearchQuery] = useState('');

    const filtered = roomTypes.filter(rt =>
        rt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rt.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <RentalLayout title="Quản lý Loại phòng">
            <div className="p-8 max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Loại phòng</h1>
                        <p className="text-gray-500 font-medium">Định nghĩa và quản lý các loại không gian cho thuê của bạn.</p>
                    </div>
                    <button
                        onClick={() => navigate('/rental/room-types/new')}
                        className="flex items-center gap-2 bg-red-500 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-red-600 transition-all shadow-md active:scale-95"
                    >
                        <Plus className="w-4 h-4" /> Thêm loại phòng mới
                    </button>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-8 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm loại phòng..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-red-500/20 text-sm font-medium outline-none transition-all"
                        />
                    </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map(rt => (
                        <div key={rt.id} className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col hover:shadow-lg transition-all group">
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-12 h-12 bg-red-50 text-red-500 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-red-500 group-hover:text-white transition-colors">
                                    {iconMap[rt.icon] || <BookOpen className="w-5 h-5" />}
                                </div>
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${rt.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                                    {rt.status === 'active' ? 'Hoạt động' : 'Tạm ẩn'}
                                </span>
                            </div>

                            <h3 className="text-xl font-black text-gray-900 mb-2">{rt.name}</h3>
                            <p className="text-sm text-gray-500 font-medium mb-6 flex-1 line-clamp-2">{rt.description}</p>

                            <div className="flex items-end justify-between pt-4 border-t border-gray-50">
                                <div>
                                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Giá cơ bản từ</div>
                                    <div className="text-lg font-black text-red-500">{rt.basePrice.toLocaleString('vi-VN')}đ<span className="text-xs text-gray-400 font-medium">/giờ</span></div>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => navigate(`/rental/room-types/edit/${rt.id}`)}
                                        className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="Chỉnh sửa"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Xóa">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filtered.length === 0 && (
                    <div className="py-16 text-center bg-white rounded-2xl border-2 border-dashed border-gray-200">
                        <div className="text-gray-400 mb-2 font-medium">Không tìm thấy loại phòng nào.</div>
                    </div>
                )}
            </div>
        </RentalLayout>
    );
}
