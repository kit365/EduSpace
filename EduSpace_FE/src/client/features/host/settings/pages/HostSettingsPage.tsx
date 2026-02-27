import { useState } from 'react';
import { Bell, Lock, Globe, CreditCard, Shield, Smartphone } from 'lucide-react';
import { RentalLayout } from '../../../../layouts/RentalLayout';

export function HostSettingsPage() {
    const [activeTab, setActiveTab] = useState('notifications');

    return (
        <RentalLayout title="Cài đặt hệ thống">
            <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-8 animate-in fade-in duration-700">

                {/* Sidebar Settings Menu */}
                <div className="w-full md:w-64 shrink-0">
                    <div className="bg-white rounded-3xl p-4 border border-gray-100 shadow-sm space-y-2 sticky top-24">
                        <button
                            onClick={() => setActiveTab('notifications')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'notifications'
                                    ? 'bg-red-50 text-red-600'
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            <Bell className="w-4 h-4" /> Thông báo
                        </button>
                        <button
                            onClick={() => setActiveTab('security')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'security'
                                    ? 'bg-red-50 text-red-600'
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            <Lock className="w-4 h-4" /> Bảo mật & Đăng nhập
                        </button>
                        <button
                            onClick={() => setActiveTab('preferences')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'preferences'
                                    ? 'bg-red-50 text-red-600'
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            <Globe className="w-4 h-4" /> Ngôn ngữ & Khu vực
                        </button>
                        <button
                            onClick={() => setActiveTab('payouts')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'payouts'
                                    ? 'bg-red-50 text-red-600'
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            <CreditCard className="w-4 h-4" /> Phương thức nhận tiền
                        </button>
                    </div>
                </div>

                {/* Settings Content Area */}
                <div className="flex-1 bg-white rounded-3xl p-8 border border-gray-100 shadow-sm min-h-[500px]">

                    {activeTab === 'notifications' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div>
                                <h2 className="text-xl font-black text-gray-900 mb-2">Cài đặt Thông báo</h2>
                                <p className="text-gray-500 text-sm">Quản lý cách bạn nhận thông báo về đặt phòng và hệ thống.</p>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 border border-gray-100 rounded-2xl hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center">
                                            <MailIcon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900">Email Updates</h4>
                                            <p className="text-xs text-gray-500 mt-0.5">Nhận email khi có booking mới hoặc thay đổi</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" defaultChecked />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                                    </label>
                                </div>

                                <div className="flex items-center justify-between p-4 border border-gray-100 rounded-2xl hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-green-50 text-green-500 rounded-full flex items-center justify-center">
                                            <Smartphone className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900">Push Notifications</h4>
                                            <p className="text-xs text-gray-500 mt-0.5">Thông báo đẩy trên trình duyệt</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" defaultChecked />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div>
                                <h2 className="text-xl font-black text-gray-900 mb-2">Bảo mật & Đăng nhập</h2>
                                <p className="text-gray-500 text-sm">Bảo vệ tài khoản Host của bạn.</p>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 border border-gray-100 rounded-2xl">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-purple-50 text-purple-500 rounded-full flex items-center justify-center">
                                            <Shield className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900">Xác thực 2 bước (2FA)</h4>
                                            <p className="text-xs text-gray-500 mt-0.5">Tăng cường bảo mật với mã OTP qua ứng dụng</p>
                                        </div>
                                    </div>
                                    <button className="px-4 py-2 bg-gray-900 text-white rounded-lg text-xs font-bold hover:bg-gray-800 transition-colors">
                                        Bật 2FA
                                    </button>
                                </div>

                                <div className="flex items-center justify-between p-4 border border-gray-100 rounded-2xl">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-gray-100 text-gray-500 rounded-full flex items-center justify-center">
                                            <Lock className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900">Mật khẩu</h4>
                                            <p className="text-xs text-gray-500 mt-0.5">Cập nhật lần cuối 3 tháng trước</p>
                                        </div>
                                    </div>
                                    <button className="px-4 py-2 border border-gray-200 text-gray-900 rounded-lg text-xs font-bold hover:bg-gray-50 transition-colors">
                                        Đổi mật khẩu
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {(activeTab === 'preferences' || activeTab === 'payouts') && (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in duration-500">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center">
                                <SettingsIcon className="w-8 h-8 text-gray-300" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-gray-900">Chưa có dữ liệu</h3>
                                <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">Các cài đặt này đang được cập nhật trong phiên bản tiếp theo.</p>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </RentalLayout>
    );
}

// Helper icons
function MailIcon(props: any) {
    return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
}

function SettingsIcon(props: any) {
    return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>
}
