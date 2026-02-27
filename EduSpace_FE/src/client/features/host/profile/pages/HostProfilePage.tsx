import { useState } from 'react';
import { Camera, CheckCircle, Save, User, MapPin, Mail, Phone, Building2 } from 'lucide-react';
import { RentalLayout } from '../../../../layouts/RentalLayout';

export function HostProfilePage() {
    const [isEditing, setIsEditing] = useState(false);

    // Mock data for Host
    const [profile, setProfile] = useState({
        name: 'Bích Ngọc',
        email: 'ngoc.bich@example.com',
        phone: '+84 987 654 321',
        bio: 'Chuyên cung cấp phòng học chất lượng cao khu vực Cầu Giấy. Hơn 5 năm kinh nghiệm quản lý giáo dục.',
        location: 'Cầu Giấy, Hà Nội',
        company: 'EduSpace Premium Partner',
        joinedAt: 'Tháng 5, 2022',
    });

    const handleSave = () => {
        setIsEditing(false);
        // In real app, call API to save
    };

    return (
        <RentalLayout title="Cài đặt Profile Host">
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">

                {/* Header Section */}
                <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex items-start gap-8">
                    <div className="relative shrink-0">
                        <div className="w-32 h-32 bg-gradient-to-br from-gray-800 to-black rounded-full flex items-center justify-center text-white font-black text-4xl shadow-xl">
                            BN
                        </div>
                        <button className="absolute bottom-0 right-0 w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition shadow-lg border-4 border-white">
                            <Camera className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="flex-1 pt-2">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-black text-gray-900 tracking-tight">{profile.name}</h1>
                                <CheckCircle className="w-6 h-6 text-green-500" />
                                <span className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-black uppercase tracking-wider border border-amber-100 flex items-center gap-1.5">
                                    <Building2 className="w-3.5 h-3.5" /> Hoster
                                </span>
                            </div>

                            {!isEditing ? (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="px-6 py-2.5 bg-gray-50 text-gray-900 rounded-xl font-bold text-sm tracking-wide hover:bg-gray-100 transition-all border border-gray-200"
                                >
                                    Chỉnh sửa
                                </button>
                            ) : (
                                <button
                                    onClick={handleSave}
                                    className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm tracking-wide hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200 flex items-center gap-2"
                                >
                                    <Save className="w-4 h-4" /> Lưu thay đổi
                                </button>
                            )}
                        </div>

                        <p className="text-gray-500 font-medium mb-6 max-w-2xl leading-relaxed">
                            {profile.bio}
                        </p>

                        <div className="flex items-center gap-6 text-sm">
                            <div className="flex items-center gap-2 text-gray-500 font-medium pb-2 border-b-2 border-transparent">
                                Ngày tham gia: <span className="text-gray-900 font-bold">{profile.joinedAt}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Details Form Area */}
                <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                    <h2 className="text-xl font-black mb-6">Thông tin chi tiết</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <User className="w-3 h-3" /> Họ & Tên
                            </label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={profile.name}
                                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                                />
                            ) : (
                                <div className="px-4 py-3 bg-gray-50/50 border border-transparent rounded-xl font-semibold text-gray-900">
                                    {profile.name}
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Building2 className="w-3 h-3" /> Tên Doanh nghiệp / Tổ chức
                            </label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={profile.company}
                                    onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                                />
                            ) : (
                                <div className="px-4 py-3 bg-gray-50/50 border border-transparent rounded-xl font-semibold text-gray-900">
                                    {profile.company}
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Mail className="w-3 h-3" /> Email
                            </label>
                            {isEditing ? (
                                <input
                                    type="email"
                                    value={profile.email}
                                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                                />
                            ) : (
                                <div className="px-4 py-3 bg-gray-50/50 border border-transparent rounded-xl font-semibold text-gray-900">
                                    {profile.email}
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Phone className="w-3 h-3" /> Số điện thoại
                            </label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={profile.phone}
                                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                                />
                            ) : (
                                <div className="px-4 py-3 bg-gray-50/50 border border-transparent rounded-xl font-semibold text-gray-900">
                                    {profile.phone}
                                </div>
                            )}
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <MapPin className="w-3 h-3" /> Khu vực hoạt động
                            </label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={profile.location}
                                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                                />
                            ) : (
                                <div className="px-4 py-3 bg-gray-50/50 border border-transparent rounded-xl font-semibold text-gray-900">
                                    {profile.location}
                                </div>
                            )}
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                Giới thiệu ngắn (Bio)
                            </label>
                            {isEditing ? (
                                <textarea
                                    value={profile.bio}
                                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                                    rows={4}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all resize-none"
                                />
                            ) : (
                                <div className="px-4 py-3 bg-gray-50/50 border border-transparent rounded-xl font-semibold text-gray-900 leading-relaxed min-h-[100px]">
                                    {profile.bio}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </RentalLayout>
    );
}
