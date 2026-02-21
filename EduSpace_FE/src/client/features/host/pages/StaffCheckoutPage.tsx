import { useState } from 'react';
import { Search, CheckCircle, AlertTriangle, ClipboardCheck, Package, Users, Clock } from 'lucide-react';
import { RentalLayout } from '../../../layouts/RentalLayout';
import { BOOKING_REQUESTS } from '../data/mockData';

type CheckoutStep = 'search' | 'verify' | 'inspect' | 'complete';

interface CheckoutBooking {
    bookingCode: string;
    guestName: string;
    guestAvatar: string;
    spaceName: string;
    date: string;
    time: string;
    guests: number;
    status: string;
}

export function StaffCheckoutPage() {
    const [step, setStep] = useState<CheckoutStep>('search');
    const [searchCode, setSearchCode] = useState('');
    const [booking, setBooking] = useState<CheckoutBooking | null>(null);
    const [inspectionChecks, setInspectionChecks] = useState({
        roomClean: false,
        equipmentOk: false,
        noIssues: false,
    });
    const [notes, setNotes] = useState('');

    const handleSearch = () => {
        // Mock: find booking by code
        const found = BOOKING_REQUESTS.find(b => b.bookingCode === searchCode || b.bookingCode === 'EDU-2024-0013');
        if (found) {
            setBooking({
                bookingCode: found.bookingCode || 'EDU-2024-0013',
                guestName: found.guestName,
                guestAvatar: found.guestAvatar,
                spaceName: found.spaceName,
                date: found.date,
                time: found.time,
                guests: found.guests || 0,
                status: found.status,
            });
            setStep('verify');
        }
    };

    const allChecked = Object.values(inspectionChecks).every(Boolean);

    const handleComplete = () => {
        setStep('complete');
    };

    const handleReset = () => {
        setStep('search');
        setSearchCode('');
        setBooking(null);
        setInspectionChecks({ roomClean: false, equipmentOk: false, noIssues: false });
        setNotes('');
    };

    const stepIndicators = [
        { key: 'search', label: 'Tìm đơn', num: 1 },
        { key: 'verify', label: 'Xác nhận', num: 2 },
        { key: 'inspect', label: 'Kiểm tra', num: 3 },
        { key: 'complete', label: 'Hoàn tất', num: 4 },
    ];

    const currentIdx = stepIndicators.findIndex(s => s.key === step);

    return (
        <RentalLayout title="Checkout (Staff)">
            <div className="max-w-3xl mx-auto p-8">
                <div className="mb-10">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Staff Checkout</h1>
                    <p className="text-gray-500 font-medium">Quy trình xác nhận hoàn tất đơn đặt phòng tại quầy lễ tân.</p>
                </div>

                {/* Step Indicator */}
                <div className="flex items-center gap-2 mb-10">
                    {stepIndicators.map((s, i) => (
                        <div key={s.key} className="flex items-center gap-2">
                            <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${i <= currentIdx ? 'bg-gray-900 text-white' : i === currentIdx + 1 ? 'bg-gray-100 text-gray-600' : 'bg-gray-50 text-gray-300'}`}>
                                <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black ${i < currentIdx ? 'bg-green-500 text-white' : i === currentIdx ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                                    {i < currentIdx ? '✓' : s.num}
                                </span>
                                <span className="font-bold text-sm">{s.label}</span>
                            </div>
                            {i < stepIndicators.length - 1 && <div className={`w-6 h-px ${i < currentIdx ? 'bg-green-400' : 'bg-gray-200'}`} />}
                        </div>
                    ))}
                </div>

                {/* Step 1: Search */}
                {step === 'search' && (
                    <div className="bg-white rounded-3xl border border-gray-100 p-10 shadow-sm text-center animate-in fade-in duration-500">
                        <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6"><Search className="w-10 h-10 text-gray-300" /></div>
                        <h2 className="text-2xl font-black text-gray-900 mb-2">Nhập mã đặt phòng</h2>
                        <p className="text-gray-400 font-medium mb-8 max-w-md mx-auto">Nhập mã booking (VD: EDU-2024-0013) để bắt đầu quy trình checkout.</p>
                        <div className="flex items-center gap-3 max-w-md mx-auto">
                            <input type="text" value={searchCode} onChange={e => setSearchCode(e.target.value.toUpperCase())} placeholder="EDU-2024-XXXX" className="flex-1 px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl font-black text-lg text-center text-gray-900 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none tracking-widest" onKeyDown={e => e.key === 'Enter' && handleSearch()} />
                            <button onClick={handleSearch} className="px-8 py-4 bg-gray-900 text-white rounded-2xl font-black hover:bg-red-500 shadow-lg transition-all active:scale-95">Tìm</button>
                        </div>
                        <button onClick={() => { setSearchCode('EDU-2024-0013'); handleSearch(); }} className="mt-4 text-xs text-gray-400 hover:text-red-500 font-bold transition-all">Demo: Nhấn để thử mã mẫu</button>
                    </div>
                )}

                {/* Step 2: Verify Booking */}
                {step === 'verify' && booking && (
                    <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm animate-in fade-in duration-500">
                        <div className="flex items-center gap-3 mb-6">
                            <ClipboardCheck className="w-6 h-6 text-blue-500" />
                            <h2 className="text-xl font-black text-gray-900">Xác nhận thông tin đặt phòng</h2>
                        </div>

                        <div className="bg-gray-50 rounded-2xl p-6 mb-6">
                            <div className="flex items-center gap-4 mb-6">
                                <img src={booking.guestAvatar} alt="" className="w-16 h-16 rounded-2xl object-cover shadow-md" />
                                <div>
                                    <h3 className="font-black text-gray-900 text-lg">{booking.guestName}</h3>
                                    <p className="text-sm font-bold text-gray-400">{booking.bookingCode}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { icon: <Package className="w-4 h-4" />, label: 'Phòng', value: booking.spaceName },
                                    { icon: <Clock className="w-4 h-4" />, label: 'Thời gian', value: `${booking.date} · ${booking.time}` },
                                    { icon: <Users className="w-4 h-4" />, label: 'Số khách', value: `${booking.guests} người` },
                                    { icon: <CheckCircle className="w-4 h-4" />, label: 'Trạng thái', value: booking.status === 'checked_in' ? 'Đã check-in' : 'Đã xác nhận' },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-xl">
                                        <div className="text-gray-300">{item.icon}</div>
                                        <div>
                                            <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{item.label}</div>
                                            <div className="font-bold text-gray-900 text-sm">{item.value}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button onClick={() => setStep('search')} className="px-6 py-3 rounded-xl font-bold text-gray-500 border border-gray-200 hover:bg-gray-50 transition-all">← Quay lại</button>
                            <button onClick={() => setStep('inspect')} className="flex-1 bg-gray-900 text-white py-4 rounded-2xl font-black hover:bg-blue-600 shadow-lg transition-all active:scale-95">Tiếp: Kiểm tra phòng →</button>
                        </div>
                    </div>
                )}

                {/* Step 3: Inspect */}
                {step === 'inspect' && (
                    <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm animate-in fade-in duration-500">
                        <div className="flex items-center gap-3 mb-6">
                            <AlertTriangle className="w-6 h-6 text-amber-500" />
                            <h2 className="text-xl font-black text-gray-900">Kiểm tra phòng & thiết bị</h2>
                        </div>

                        <div className="space-y-4 mb-6">
                            {[
                                { key: 'roomClean' as const, label: 'Phòng sạch sẽ, gọn gàng', desc: 'Kiểm tra bàn ghế, sàn nhà, vệ sinh chung' },
                                { key: 'equipmentOk' as const, label: 'Thiết bị hoạt động tốt', desc: 'Máy chiếu, bảng, điều hòa, loa, micro...' },
                                { key: 'noIssues' as const, label: 'Không có hư hỏng / mất mát', desc: 'Kiểm tra tài sản trong phòng' },
                            ].map(item => (
                                <button
                                    key={item.key}
                                    onClick={() => setInspectionChecks(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                                    className={`w-full flex items-center gap-4 p-5 rounded-2xl border transition-all text-left ${inspectionChecks[item.key] ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200 hover:border-gray-300'}`}
                                >
                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm transition-all ${inspectionChecks[item.key] ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-300'}`}>
                                        {inspectionChecks[item.key] ? '✓' : '○'}
                                    </div>
                                    <div>
                                        <h4 className={`font-black ${inspectionChecks[item.key] ? 'text-green-700' : 'text-gray-900'}`}>{item.label}</h4>
                                        <p className="text-xs text-gray-400 font-medium">{item.desc}</p>
                                    </div>
                                </button>
                            ))}
                        </div>

                        <div className="mb-6">
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Ghi chú (tuỳ chọn)</label>
                            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="VD: Khách phản hồi máy chiếu hơi mờ..." className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-900 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none resize-none" />
                        </div>

                        <div className="bg-amber-50 rounded-xl p-4 mb-6">
                            <p className="text-xs font-bold text-amber-700">⚠️ Lưu ý: Các khoản phí phát sinh (nếu có) được tính toán và thu bên ngoài hệ thống EduSpace.</p>
                        </div>

                        <div className="flex gap-3">
                            <button onClick={() => setStep('verify')} className="px-6 py-3 rounded-xl font-bold text-gray-500 border border-gray-200 hover:bg-gray-50 transition-all">← Quay lại</button>
                            <button onClick={handleComplete} disabled={!allChecked} className={`flex-1 py-4 rounded-2xl font-black shadow-lg transition-all active:scale-95 ${allChecked ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
                                ✓ Xác nhận hoàn tất
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 4: Complete */}
                {step === 'complete' && (
                    <div className="bg-white rounded-3xl border border-gray-100 p-12 shadow-sm text-center animate-in fade-in duration-500">
                        <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8">
                            <CheckCircle className="w-14 h-14 text-green-500" />
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 mb-3">Checkout thành công! 🎉</h2>
                        <p className="text-gray-500 font-medium mb-2 max-w-md mx-auto">Đơn đặt phòng <span className="font-black text-gray-900">{booking?.bookingCode}</span> đã được xác nhận hoàn tất.</p>
                        <p className="text-sm text-gray-400 font-medium mb-10">Trạng thái phòng đã được cập nhật thành "Đang dọn dẹp".</p>
                        <button onClick={handleReset} className="bg-gray-900 text-white px-12 py-4 rounded-2xl font-black hover:bg-red-500 shadow-xl transition-all active:scale-95">Checkout đơn tiếp theo</button>
                    </div>
                )}
            </div>
        </RentalLayout>
    );
}
