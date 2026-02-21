import { useState } from 'react';
import { Clock, CalendarOff, Plus, Trash2, Save, AlertCircle } from 'lucide-react';
import { RentalLayout } from '../../../layouts/RentalLayout';
import { DEFAULT_OPERATING_HOURS, BLOCKED_SLOTS } from '../data/mockData';
import { OperatingHour, BlockedSlot, DayOfWeek } from '../types';

const DAY_LABELS: Record<DayOfWeek, string> = {
    monday: 'Thứ 2', tuesday: 'Thứ 3', wednesday: 'Thứ 4',
    thursday: 'Thứ 5', friday: 'Thứ 6', saturday: 'Thứ 7', sunday: 'Chủ nhật',
};

export function SchedulePage() {
    const [hours, setHours] = useState<OperatingHour[]>(DEFAULT_OPERATING_HOURS);
    const [blocked, setBlocked] = useState<BlockedSlot[]>(BLOCKED_SLOTS);
    const [showBlockForm, setShowBlockForm] = useState(false);
    const [newBlock, setNewBlock] = useState({ date: '', startTime: '', endTime: '', reason: '' });
    const [saved, setSaved] = useState(false);

    const toggleDay = (day: DayOfWeek) => {
        setHours(prev => prev.map(h => h.day === day ? { ...h, isOpen: !h.isOpen } : h));
        setSaved(false);
    };

    const updateTime = (day: DayOfWeek, field: 'openTime' | 'closeTime', value: string) => {
        setHours(prev => prev.map(h => h.day === day ? { ...h, [field]: value } : h));
        setSaved(false);
    };

    const addBlock = () => {
        if (!newBlock.date || !newBlock.startTime || !newBlock.endTime) return;
        setBlocked(prev => [...prev, { id: `BLK-${Date.now()}`, ...newBlock }]);
        setNewBlock({ date: '', startTime: '', endTime: '', reason: '' });
        setShowBlockForm(false);
    };

    const removeBlock = (id: string) => setBlocked(prev => prev.filter(b => b.id !== id));

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <RentalLayout title="Lịch & Giờ hoạt động">
            <div className="p-8 max-w-5xl">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Smart Scheduling</h1>
                        <p className="text-gray-500 font-medium">Cài đặt giờ mở cửa và chặn lịch cho từng phòng.</p>
                    </div>
                    <button onClick={handleSave} className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black shadow-lg transition-all active:scale-95 ${saved ? 'bg-green-500 text-white' : 'bg-gray-900 text-white hover:bg-red-500'}`}>
                        <Save className="w-5 h-5" /> {saved ? 'Đã lưu ✓' : 'Lưu thay đổi'}
                    </button>
                </div>

                {/* Operating Hours */}
                <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm mb-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500"><Clock className="w-5 h-5" /></div>
                        <div>
                            <h2 className="font-black text-gray-900 text-lg">Giờ mở cửa</h2>
                            <p className="text-xs text-gray-400 font-medium">Thiết lập giờ Bắt đầu – Kết thúc cho từng ngày (T2–CN)</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {hours.map(h => (
                            <div key={h.day} className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${h.isOpen ? 'bg-white border border-gray-100' : 'bg-gray-50 border border-gray-50'}`}>
                                {/* Toggle */}
                                <button onClick={() => toggleDay(h.day)} className={`relative w-12 h-7 rounded-full transition-all ${h.isOpen ? 'bg-green-500' : 'bg-gray-300'}`}>
                                    <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-all ${h.isOpen ? 'left-6' : 'left-1'}`} />
                                </button>

                                {/* Day Label */}
                                <div className={`w-28 font-black text-sm ${h.isOpen ? 'text-gray-900' : 'text-gray-400'}`}>{DAY_LABELS[h.day]}</div>

                                {h.isOpen ? (
                                    <div className="flex items-center gap-3 flex-1">
                                        <input type="time" value={h.openTime} onChange={e => updateTime(h.day, 'openTime', e.target.value)} className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition-all" />
                                        <span className="text-gray-300 font-bold">→</span>
                                        <input type="time" value={h.closeTime} onChange={e => updateTime(h.day, 'closeTime', e.target.value)} className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition-all" />
                                        <span className="text-xs font-bold text-gray-300 ml-2">
                                            {(() => { const [oh, om] = h.openTime.split(':').map(Number); const [ch, cm] = h.closeTime.split(':').map(Number); return `${ch - oh}h${cm - om > 0 ? cm - om + 'p' : ''}`; })()}
                                        </span>
                                    </div>
                                ) : (
                                    <div className="flex-1 flex items-center gap-2">
                                        <span className="text-sm font-bold text-red-400 bg-red-50 px-3 py-1.5 rounded-lg">Đóng cửa</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Blocked Slots */}
                <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-500"><CalendarOff className="w-5 h-5" /></div>
                            <div>
                                <h2 className="font-black text-gray-900 text-lg">Chặn lịch</h2>
                                <p className="text-xs text-gray-400 font-medium">Chặn thủ công những ngày bận, bảo trì hoặc sự kiện riêng</p>
                            </div>
                        </div>
                        <button onClick={() => setShowBlockForm(!showBlockForm)} className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-500 rounded-xl font-bold hover:bg-red-100 transition-all active:scale-95">
                            <Plus className="w-4 h-4" /> Thêm ngày chặn
                        </button>
                    </div>

                    {/* Add Block Form */}
                    {showBlockForm && (
                        <div className="bg-gray-50 rounded-2xl p-6 mb-6 animate-in slide-in-from-top duration-300">
                            <div className="grid grid-cols-4 gap-4 mb-4">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Ngày</label>
                                    <input type="date" value={newBlock.date} onChange={e => setNewBlock(p => ({ ...p, date: e.target.value }))} className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl font-bold text-sm text-gray-900 focus:border-red-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Từ</label>
                                    <input type="time" value={newBlock.startTime} onChange={e => setNewBlock(p => ({ ...p, startTime: e.target.value }))} className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl font-bold text-sm text-gray-900 focus:border-red-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Đến</label>
                                    <input type="time" value={newBlock.endTime} onChange={e => setNewBlock(p => ({ ...p, endTime: e.target.value }))} className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl font-bold text-sm text-gray-900 focus:border-red-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Lý do</label>
                                    <input type="text" value={newBlock.reason} onChange={e => setNewBlock(p => ({ ...p, reason: e.target.value }))} placeholder="VD: Bảo trì" className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl font-bold text-sm text-gray-900 focus:border-red-500 outline-none" />
                                </div>
                            </div>
                            <button onClick={addBlock} className="px-6 py-2.5 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-red-500 transition-all active:scale-95">Xác nhận</button>
                        </div>
                    )}

                    {/* Block List */}
                    <div className="space-y-3">
                        {blocked.map(b => (
                            <div key={b.id} className="flex items-center justify-between p-4 bg-red-50/50 border border-red-100 rounded-2xl group">
                                <div className="flex items-center gap-4">
                                    <AlertCircle className="w-5 h-5 text-red-400" />
                                    <div>
                                        <p className="font-bold text-gray-900 text-sm">{new Date(b.date).toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                        <p className="text-xs text-gray-500 font-medium">{b.startTime} - {b.endTime} · {b.reason}</p>
                                    </div>
                                </div>
                                <button onClick={() => removeBlock(b.id)} className="p-2 rounded-lg text-red-400 hover:bg-red-100 opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="w-4 h-4" /></button>
                            </div>
                        ))}
                        {blocked.length === 0 && (
                            <div className="text-center py-8 text-gray-400 font-medium">Chưa có ngày nào bị chặn</div>
                        )}
                    </div>
                </div>
            </div>
        </RentalLayout>
    );
}
