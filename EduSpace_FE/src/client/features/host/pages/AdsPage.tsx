import { useState } from 'react';
import { Megaphone, Star, Crown, Check, Zap, Eye, BarChart3 } from 'lucide-react';
import { RentalLayout } from '../../../layouts/RentalLayout';
import { ADS_PACKAGES, HOST_ADS_SUBSCRIPTIONS } from '../data/mockData';
import { formatCurrency } from '../../../../utils';

export function AdsPage() {
    const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
    const [subscriptions] = useState(HOST_ADS_SUBSCRIPTIONS);

    const handlePurchase = () => {
        if (!selectedPackage) return;
        alert('Chuyển đến trang thanh toán cho gói ' + ADS_PACKAGES.find(p => p.id === selectedPackage)?.name);
    };

    return (
        <RentalLayout title="Mua Quảng cáo">
            <div className="p-8">
                <div className="mb-10">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Quảng cáo & Đẩy tin</h1>
                    <p className="text-gray-500 font-medium">Tăng lượt hiển thị và thu hút nhiều khách hơn với các gói quảng cáo.</p>
                </div>

                {/* Active Subscriptions */}
                {subscriptions.length > 0 && (
                    <div className="mb-10">
                        <h2 className="text-lg font-black text-gray-900 mb-4">Gói đang kích hoạt</h2>
                        <div className="space-y-3">
                            {subscriptions.map(sub => (
                                <div key={sub.id} className={`flex items-center justify-between p-5 rounded-2xl border shadow-sm ${sub.tier === 'gold' ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-200'}`}>
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${sub.tier === 'gold' ? 'bg-amber-500 text-white' : 'bg-gray-400 text-white'}`}>
                                            {sub.tier === 'gold' ? <Crown className="w-6 h-6" /> : <Star className="w-6 h-6" />}
                                        </div>
                                        <div>
                                            <h4 className="font-black text-gray-900">{sub.packageName}</h4>
                                            <p className="text-sm text-gray-500 font-medium">Phòng: {sub.spaceName} · Hết hạn: {new Date(sub.endDate).toLocaleDateString('vi-VN')}</p>
                                        </div>
                                    </div>
                                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg ${sub.status === 'active' ? 'text-green-600 bg-green-50' : 'text-gray-400 bg-gray-100'}`}>
                                        {sub.status === 'active' ? '✓ Đang hoạt động' : sub.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Pricing Cards */}
                <h2 className="text-lg font-black text-gray-900 mb-6">Chọn gói quảng cáo</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                    {ADS_PACKAGES.map(pkg => {
                        const isGold = pkg.tier === 'gold';
                        const isSelected = selectedPackage === pkg.id;
                        return (
                            <div
                                key={pkg.id}
                                onClick={() => setSelectedPackage(pkg.id)}
                                className={`relative rounded-3xl border-2 p-8 cursor-pointer transition-all hover:shadow-xl ${isSelected ? (isGold ? 'border-amber-500 shadow-xl shadow-amber-100' : 'border-gray-900 shadow-xl') :
                                        isGold ? 'border-amber-200 hover:border-amber-400 bg-gradient-to-br from-amber-50 to-orange-50' : 'border-gray-200 hover:border-gray-400 bg-white'
                                    }`}
                            >
                                {isGold && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-1.5 rounded-full font-black text-xs tracking-widest uppercase shadow-lg">
                                        🔥 PHỔ BIẾN NHẤT
                                    </div>
                                )}

                                <div className="flex items-center gap-4 mb-6">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${isGold ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white' : 'bg-gradient-to-br from-gray-400 to-gray-600 text-white'}`}>
                                        {isGold ? <Crown className="w-7 h-7" /> : <Star className="w-7 h-7" />}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-gray-900">{pkg.name}</h3>
                                        <p className="text-sm font-bold text-gray-400">{pkg.duration} ngày</p>
                                    </div>
                                </div>

                                <div className="mb-8">
                                    <div className="text-4xl font-black text-gray-900">{formatCurrency(pkg.price)}</div>
                                    <p className="text-sm font-bold text-gray-400 mt-1">/ {pkg.duration} ngày</p>
                                </div>

                                {/* Boost indicator */}
                                <div className={`flex items-center gap-2 px-4 py-3 rounded-xl mb-6 ${isGold ? 'bg-amber-100/50 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>
                                    <Zap className="w-4 h-4" />
                                    <span className="font-black text-sm">+{pkg.priorityBoost}% ưu tiên hiển thị</span>
                                </div>

                                {/* Features */}
                                <ul className="space-y-3">
                                    {pkg.features.map((feature, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${isGold ? 'bg-amber-500 text-white' : 'bg-gray-900 text-white'}`}>
                                                <Check className="w-3 h-3" />
                                            </div>
                                            <span className="text-sm font-medium text-gray-700">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                {/* Select indicator */}
                                {isSelected && (
                                    <div className={`mt-8 text-center py-3 rounded-xl font-black text-sm ${isGold ? 'bg-amber-500 text-white' : 'bg-gray-900 text-white'}`}>
                                        ✓ Đã chọn
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Purchase Button */}
                {selectedPackage && (
                    <div className="bg-gray-900 rounded-3xl p-8 flex items-center justify-between animate-in slide-in-from-bottom duration-500">
                        <div className="text-white">
                            <h3 className="font-black text-lg mb-1">Sẵn sàng kích hoạt?</h3>
                            <p className="text-gray-400 font-medium text-sm">Tin đăng sẽ được gắn nhãn và ưu tiên hiển thị ngay sau thanh toán.</p>
                        </div>
                        <button onClick={handlePurchase} className="flex items-center gap-3 bg-gradient-to-r from-red-500 to-rose-600 text-white px-10 py-4 rounded-2xl font-black shadow-xl hover:shadow-2xl transition-all active:scale-95">
                            <Megaphone className="w-5 h-5" /> Thanh toán & Kích hoạt
                        </button>
                    </div>
                )}

                {/* Stats Preview (mockup) */}
                <div className="mt-10 bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
                    <h3 className="font-black text-gray-900 text-lg mb-6 flex items-center gap-3">
                        <BarChart3 className="w-5 h-5 text-gray-400" /> Hiệu quả quảng cáo (Demo)
                    </h3>
                    <div className="grid grid-cols-3 gap-6">
                        {[
                            { label: 'Lượt xem', value: '2,450', change: '+45%', icon: Eye },
                            { label: 'Lượt click', value: '186', change: '+32%', icon: Zap },
                            { label: 'Booking từ QC', value: '12', change: '+20%', icon: Check },
                        ].map((stat, i) => (
                            <div key={i} className="bg-gray-50 rounded-2xl p-6 text-center">
                                <stat.icon className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                                <div className="text-2xl font-black text-gray-900">{stat.value}</div>
                                <div className="text-xs font-bold text-gray-400 mt-1">{stat.label}</div>
                                <div className="text-xs font-black text-green-500 mt-2">{stat.change}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </RentalLayout>
    );
}
