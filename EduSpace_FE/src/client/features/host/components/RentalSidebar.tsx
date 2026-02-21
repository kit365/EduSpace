import { LayoutGrid, List, Calendar, DollarSign, Settings, LogOut, Shield, Users, ClipboardCheck, Clock, Megaphone, Building2 } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';

export function RentalSidebar() {
    const navigate = useNavigate();

    const mainMenu = [
        { path: '/rental/dashboard', label: 'Dashboard', icon: LayoutGrid },
        { path: '/rental/spaces', label: 'Phòng của tôi', icon: List },
        { path: '/rental/room-status', label: 'Trạng thái phòng', icon: Building2 },
        { path: '/rental/schedule', label: 'Lịch & Giờ', icon: Clock },
        { path: '/rental/calendar', label: 'Lịch đặt phòng', icon: Calendar },
    ];

    const managementMenu = [
        { path: '/rental/checkout', label: 'Checkout (Staff)', icon: ClipboardCheck },
        { path: '/rental/staff', label: 'Nhân viên', icon: Users },
        { path: '/rental/finance', label: 'Tài chính', icon: DollarSign },
        { path: '/rental/ads', label: 'Quảng cáo', icon: Megaphone },
        { path: '/rental/kyc', label: 'Xác minh KYC', icon: Shield },
    ];

    const renderMenu = (items: typeof mainMenu) => items.map(item => {
        const Icon = item.icon;
        return (
            <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/rental/dashboard'}
                className={({ isActive }) => `
                    w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-300
                    ${isActive
                        ? 'bg-red-50 text-red-600 shadow-sm translate-x-1'
                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                    }
                `}
            >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
            </NavLink>
        );
    });

    return (
        <div className="w-64 bg-white border-r border-gray-200 h-full flex flex-col items-stretch shrink-0">
            {/* Branding */}
            <div className="p-6 border-b border-gray-100">
                <div onClick={() => navigate('/')} className="flex items-center gap-3 cursor-pointer group">
                    <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center shadow-lg shadow-red-200 group-hover:rotate-12 transition-transform">
                        <span className="text-white font-black text-xl">E</span>
                    </div>
                    <div>
                        <div className="font-black text-gray-900 tracking-tight text-xl">EduSpace</div>
                        <div className="text-[10px] text-red-500 font-bold tracking-[0.2em] uppercase">Partner Portal</div>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
                {/* Main */}
                <div className="mb-2">
                    <div className="px-4 py-2 text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">Quản lý</div>
                    {renderMenu(mainMenu)}
                </div>
                {/* Management */}
                <div className="pt-2 border-t border-gray-100">
                    <div className="px-4 py-2 text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">Vận hành</div>
                    {renderMenu(managementMenu)}
                </div>
            </nav>

            {/* User Section */}
            <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-white border border-gray-100 shadow-sm">
                    <div className="w-10 h-10 bg-gradient-to-br from-gray-800 to-black rounded-lg flex items-center justify-center text-white font-black shadow-md">
                        BN
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="font-bold text-gray-900 truncate">Bích Ngọc</div>
                        <div className="text-xs text-green-500 font-bold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                            Host · Verified
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <button className="flex items-center justify-center gap-2 p-2 rounded-lg text-xs font-bold text-gray-500 hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-100 transition-all">
                        <Settings className="w-4 h-4" /> Cài đặt
                    </button>
                    <button onClick={() => navigate('/auth')} className="flex items-center justify-center gap-2 p-2 rounded-lg text-xs font-bold text-red-500 hover:bg-red-50 border border-transparent transition-all">
                        <LogOut className="w-4 h-4" /> Đăng xuất
                    </button>
                </div>
            </div>
        </div>
    );
}
