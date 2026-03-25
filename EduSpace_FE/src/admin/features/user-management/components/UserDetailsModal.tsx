import { X, CheckCircle, AlertCircle } from 'lucide-react';
import { User } from '@/types';
import { useTranslation } from 'react-i18next';

interface UserDetailsModalProps {
    user: User | null;
    onClose: () => void;
}

export function UserDetailsModal({ user, onClose }: UserDetailsModalProps) {
    const { t } = useTranslation();

    if (!user) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-[2rem] w-full max-w-xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 border border-slate-100">
                {/* Header Section (Clean & Minimal) */}
                <div className="relative pt-12 pb-6 px-10 bg-slate-50/50 border-b border-slate-100">
                    <button 
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-all cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-3xl font-black shadow-lg shadow-slate-200">
                            {user.name?.charAt(0)}
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">{user.name}</h2>
                            <div className="flex items-center gap-2 mt-1 px-3 py-1 bg-green-50 text-green-600 rounded-full w-fit">
                                <CheckCircle className="w-3.5 h-3.5" />
                                <span className="text-[10px] font-black uppercase tracking-widest leading-none">
                                    {t(`admin_management.status.${user.accountStatus}`)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="p-10 space-y-8">
                    <div className="grid grid-cols-2 gap-8">
                        {/* Info Column 1 */}
                        <div className="space-y-6">
                            <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest pl-1 opacity-40">Thông tin liên hệ</h3>
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="block text-[13px] font-semibold text-[#374151] ml-1">Email</label>
                                    <div className="h-[48px] flex items-center px-4 rounded-[12px] border border-[#d1d5db] bg-white text-sm font-bold text-slate-900 truncate">
                                        {user.email}
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-[13px] font-semibold text-[#374151] ml-1">Số điện thoại</label>
                                    <div className="h-[48px] flex items-center px-4 rounded-[12px] border border-[#d1d5db] bg-white text-sm font-bold text-slate-900">
                                        {user.phone || 'Chưa cập nhật'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Info Column 2 */}
                        <div className="space-y-6">
                            <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest pl-1 opacity-40">Phân quyền & Ngày tạo</h3>
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="block text-[13px] font-semibold text-[#374151] ml-1">Vai trò</label>
                                    <div className="h-[48px] flex items-center px-4 rounded-[12px] border border-[#d1d5db] bg-white text-sm font-bold text-slate-900 uppercase tracking-wide">
                                        {t(`admin_management.roles.${user.role}`)}
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-[13px] font-semibold text-[#374151] ml-1">Ngày tham gia</label>
                                    <div className="h-[48px] flex items-center px-4 rounded-[12px] border border-[#d1d5db] bg-white text-sm font-bold text-slate-900">
                                        {user.joinedAt ? new Date(user.joinedAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Verification Status Card */}
                    <div className="bg-slate-50 rounded-2xl p-6 flex items-start gap-5 border border-slate-100">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${
                            user.kycStatus === 'verified' ? 'bg-white text-green-600' : 'bg-white text-amber-500'
                        }`}>
                            {user.kycStatus === 'verified' ? <CheckCircle className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                        </div>
                        <div className="flex-1">
                            <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-1 opacity-40">Trạng thái xác thực KYC</h3>
                            <div className="font-bold text-slate-900">{user.kycStatus === 'verified' ? 'Đã xác định danh tính' : 'Chưa hoàn tất xác thực'}</div>
                            <div className="mt-2 flex items-start gap-2 text-slate-400 bg-white/50 p-2 rounded-lg">
                                <div className="text-[10px] font-bold leading-normal">
                                    {user.location || 'Địa chỉ chưa được cung cấp trong hồ sơ người dùng.'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 pt-2">
                        <button className="flex-1 h-12 bg-slate-900 text-white text-sm font-black rounded-xl hover:bg-black transition-all shadow-lg shadow-slate-200 active:scale-95 cursor-pointer">
                            Chỉnh sửa hồ sơ
                        </button>
                        <button className="flex-1 h-12 border border-rose-100 bg-rose-50 text-rose-600 text-sm font-black rounded-xl hover:bg-rose-100 transition-all active:scale-95 cursor-pointer">
                            Khóa tài khoản
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
