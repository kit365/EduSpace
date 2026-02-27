import { useState, useEffect } from 'react';
import { CheckCircle, Users, Sparkles, Wrench, RefreshCw } from 'lucide-react';
import { RentalLayout } from '../../../layouts/RentalLayout';
import { ROOM_STATUSES } from '../data/mockData';
import { RoomStatusInfo, RoomStatus } from '../types';
import { useBranch } from '../context/BranchContext';

const STATUS_CONFIG: Record<RoomStatus, { label: string; labelVi: string; icon: React.ReactNode; color: string; bg: string; border: string }> = {
    available: { label: 'Available', labelVi: 'Sẵn sàng', icon: <CheckCircle className="w-5 h-5" />, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
    occupied: { label: 'Occupied', labelVi: 'Đang có khách', icon: <Users className="w-5 h-5" />, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
    cleaning: { label: 'Cleaning', labelVi: 'Đang dọn', icon: <Sparkles className="w-5 h-5" />, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
    maintenance: { label: 'Maintenance', labelVi: 'Bảo trì', icon: <Wrench className="w-5 h-5" />, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
};

const ALL_STATUSES: RoomStatus[] = ['available', 'occupied', 'cleaning', 'maintenance'];

export function RoomStatusPage() {
    const { selectedBranch } = useBranch();
    const [rooms, setRooms] = useState<RoomStatusInfo[]>(ROOM_STATUSES);
    const [filter, setFilter] = useState<RoomStatus | 'all'>('all');

    const updateStatus = (spaceId: number, newStatus: RoomStatus) => {
        setRooms(prev => prev.map(r => r.spaceId === spaceId ? { ...r, status: newStatus, lastUpdated: new Date().toISOString(), updatedBy: 'Bạn' } : r));
    };

    useEffect(() => {
        setRooms(ROOM_STATUSES);
    }, [selectedBranch]); // Re-sync when branch changes to pick up fresh mock data (useful for HMR)

    const branchFilteredRooms = selectedBranch
        ? rooms.filter(r => r.branchId === selectedBranch.id)
        : rooms;

    const filtered = filter === 'all' ? branchFilteredRooms : branchFilteredRooms.filter(r => r.status === filter);

    const counts = {
        all: branchFilteredRooms.length,
        available: branchFilteredRooms.filter(r => r.status === 'available').length,
        occupied: branchFilteredRooms.filter(r => r.status === 'occupied').length,
        cleaning: branchFilteredRooms.filter(r => r.status === 'cleaning').length,
        maintenance: branchFilteredRooms.filter(r => r.status === 'maintenance').length,
    };

    return (
        <RentalLayout title="Trạng thái phòng">
            <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Trạng thái phòng</h1>
                        <p className="text-gray-500 font-medium">Cập nhật trạng thái thực tế của từng phòng cho Staff và khách biết.</p>
                    </div>
                    <button className="flex items-center gap-2 px-6 py-3 bg-gray-100 rounded-xl font-bold text-gray-600 hover:bg-gray-200 transition-all">
                        <RefreshCw className="w-4 h-4" /> Làm mới
                    </button>
                </div>

                {/* Overview Stats */}
                <div className="grid grid-cols-5 gap-4 mb-8">
                    {[{ key: 'all' as const, label: 'Tất cả', color: 'text-gray-600', bg: 'bg-gray-50' }, ...ALL_STATUSES.map(s => ({ key: s, label: STATUS_CONFIG[s].labelVi, color: STATUS_CONFIG[s].color, bg: STATUS_CONFIG[s].bg }))].map(item => (
                        <button key={item.key} onClick={() => setFilter(item.key as any)} className={`p-4 rounded-2xl transition-all text-center ${filter === item.key ? 'ring-2 ring-gray-900 shadow-lg' : 'hover:shadow-md'} ${item.bg}`}>
                            <div className={`text-2xl font-black ${item.color}`}>{counts[item.key as keyof typeof counts]}</div>
                            <div className="text-xs font-bold text-gray-500 mt-1">{item.label}</div>
                        </button>
                    ))}
                </div>

                {/* Room Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map(room => {
                        const cfg = STATUS_CONFIG[room.status];
                        return (
                            <div key={room.spaceId} className={`bg-white rounded-3xl border ${cfg.border} overflow-hidden shadow-sm hover:shadow-lg transition-all group`}>
                                {/* Image */}
                                <div className="relative aspect-video overflow-hidden">
                                    <img src={room.spaceImage} alt={room.spaceName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    <div className={`absolute top-4 left-4 ${cfg.bg} ${cfg.color} px-4 py-2 rounded-xl`}>
                                        <div className="flex items-center gap-2 font-black text-sm">{cfg.icon}{cfg.labelVi}</div>
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="p-6">
                                    <h3 className="text-lg font-black text-gray-900 mb-2">{room.spaceName}</h3>

                                    {room.currentBooking && (
                                        <div className="bg-blue-50 rounded-xl p-3 mb-4">
                                            <p className="text-xs font-bold text-blue-600">👤 {room.currentBooking.guestName}</p>
                                            <p className="text-xs font-medium text-blue-500 mt-1">{room.currentBooking.checkInTime} - {room.currentBooking.checkOutTime} · {room.currentBooking.bookingCode}</p>
                                        </div>
                                    )}

                                    {room.note && (
                                        <p className="text-xs font-medium text-gray-400 mb-4 italic">📝 {room.note}</p>
                                    )}

                                    <div className="text-[10px] font-bold text-gray-300 mb-4">
                                        Cập nhật: {new Date(room.lastUpdated).toLocaleString('vi-VN')} bởi {room.updatedBy}
                                    </div>

                                    {/* Status Buttons */}
                                    <div className="grid grid-cols-2 gap-2">
                                        {ALL_STATUSES.map(s => {
                                            const sc = STATUS_CONFIG[s];
                                            const isActive = room.status === s;
                                            return (
                                                <button
                                                    key={s}
                                                    onClick={() => updateStatus(room.spaceId, s)}
                                                    disabled={isActive}
                                                    className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${isActive ? `${sc.bg} ${sc.color} ring-2 ring-current` : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                                                >
                                                    {sc.icon}
                                                    {sc.labelVi}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </RentalLayout>
    );
}
