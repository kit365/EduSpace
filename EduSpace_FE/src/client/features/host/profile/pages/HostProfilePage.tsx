import { useState, useEffect } from 'react';
import { Camera, CheckCircle, Save, User, MapPin, Mail, Phone, Building2, Loader2 } from 'lucide-react';
import { RentalLayout } from '../../../../layouts/RentalLayout';
import { useProfile } from '../../../customer/profile/hooks/useProfile';
import { formatJoinDate } from '@/utils/format';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/authStore';
import { getRealmRolesFromAccessToken, normalizeRoleName } from '@/utils/keycloakTokenRoles';

export function HostProfilePage() {
    const { profile, loading, updateProfile } = useProfile();
    const accessToken = useAuthStore((s) => s.accessToken);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        organizationName: '',
        email: '',
        phone: '',
        location: '',
        bio: ''
    });

    useEffect(() => {
        if (profile) {
            setFormData({
                name: profile.name || '',
                organizationName: profile.organizationName || '',
                email: profile.email || '',
                phone: profile.phone || '',
                location: profile.location || '',
                bio: profile.bio || ''
            });
        }
    }, [profile]);

    if (loading) {
        return (
            <RentalLayout title="Cài đặt Profile Host">
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 className="w-8 h-8 animate-spin text-red-500" />
                </div>
            </RentalLayout>
        );
    }

    if (!profile) return null;

    const handleSave = async () => {
        try {
            await updateProfile({
                name: formData.name,
                organizationName: formData.organizationName,
                email: formData.email,
                phone: formData.phone,
                location: formData.location,
                bio: formData.bio
            });
            setIsEditing(false);
            toast.success('Cập nhật profile thành công!');
        } catch (error) {
            toast.error('Cập nhật profile thất bại');
        }
    };

    const initials = profile.name
        ? profile.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
        : 'H';
    const normalizedRoles = getRealmRolesFromAccessToken(accessToken).map(normalizeRoleName);
    const isManagerOnly = normalizedRoles.includes('MANAGER') && !normalizedRoles.includes('HOST');
    const roleLabel = isManagerOnly ? 'Manager' : 'Host';

    return (
        <RentalLayout title="Cài đặt Profile Host">
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">

                {/* Header Section */}
                <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex items-start gap-8">
                    <div className="relative shrink-0">
                        {profile.avatar ? (
                            <img
                                src={profile.avatar}
                                alt={profile.name}
                                className="w-32 h-32 rounded-full object-cover shadow-xl"
                            />
                        ) : (
                            <div className="w-32 h-32 bg-gradient-to-br from-gray-800 to-black rounded-full flex items-center justify-center text-white font-black text-4xl shadow-xl">
                                {initials}
                            </div>
                        )}
                        <button className="absolute bottom-0 right-0 w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition shadow-lg border-4 border-white">
                            <Camera className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="flex-1 pt-2">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-black text-gray-900 tracking-tight">{profile.name}</h1>
                                {profile.verified && <CheckCircle className="w-6 h-6 text-green-500" />}
                                <span className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-black uppercase tracking-wider border border-amber-100 flex items-center gap-1.5">
                                    <Building2 className="w-3.5 h-3.5" /> {roleLabel}
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
                            {profile.bio || 'Chưa có giới thiệu.'}
                        </p>

                        <div className="flex items-center gap-6 text-sm">
                            <div className="flex items-center gap-2 text-gray-500 font-medium pb-2 border-b-2 border-transparent">
                                Ngày tham gia: <span className="text-gray-900 font-bold">{formatJoinDate(profile.memberSince)}</span>
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
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                                    value={formData.organizationName}
                                    onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                                />
                            ) : (
                                <div className="px-4 py-3 bg-gray-50/50 border border-transparent rounded-xl font-semibold text-gray-900">
                                    {profile.organizationName || 'N/A'}
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
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                                />
                            ) : (
                                <div className="px-4 py-3 bg-gray-50/50 border border-transparent rounded-xl font-semibold text-gray-900">
                                    {profile.location || 'Chưa cập nhật'}
                                </div>
                            )}
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                Giới thiệu ngắn (Bio)
                            </label>
                            {isEditing ? (
                                <textarea
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                    rows={4}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all resize-none"
                                />
                            ) : (
                                <div className="px-4 py-3 bg-gray-50/50 border border-transparent rounded-xl font-semibold text-gray-900 leading-relaxed min-h-[100px]">
                                    {profile.bio || 'Chưa có giới thiệu.'}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </RentalLayout>
    );
}
