import { useState } from 'react';
import { LayoutGrid, List, Calendar, DollarSign, Settings, LogOut, Shield, Users, ClipboardCheck, Clock, Megaphone, Building2 } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';

interface RentalSidebarProps {
    isCollapsed?: boolean;
}

export function RentalSidebar({ isCollapsed = false }: RentalSidebarProps) {
    const navigate = useNavigate();
    const [hoverTooltip, setHoverTooltip] = useState<{ label: string; x: number; y: number } | null>(null);

    const mainMenu = [
        { path: '/rental/dashboard', label: 'Dashboard', icon: LayoutGrid },
        { path: '/rental/spaces', label: 'Phòng của tôi', icon: List },
        { path: '/rental/branches', label: 'Chi nhánh', icon: Building2 },
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
                onMouseEnter={(e) => {
                    if (!isCollapsed) return;
                    const rect = e.currentTarget.getBoundingClientRect();
                    setHoverTooltip({
                        label: item.label,
                        x: rect.right + 10,
                        y: rect.top + rect.height / 2,
                    });
                }}
                onMouseLeave={() => {
                    if (isCollapsed) setHoverTooltip(null);
                }}
                className={({ isActive }) => `
                    w-full flex items-center font-bold transition-all duration-300 group relative
                    ${isCollapsed ? 'justify-center px-2 py-2 rounded-lg text-xs' : 'gap-3 px-4 py-3 rounded-xl text-sm'}
                    ${isActive
                        ? 'bg-red-50 text-red-600 shadow-sm translate-x-1'
                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                    }
                `}
            >
                <Icon className={`${isCollapsed ? 'w-4 h-4' : 'w-5 h-5'} shrink-0`} />
                {!isCollapsed && <span>{item.label}</span>}
            </NavLink>
        );
    });

    return (
        <div className={`bg-white border-r border-gray-200 h-full flex flex-col items-stretch shrink-0 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
            {/* Branding */}
            <div className={`${isCollapsed ? 'p-3' : 'p-6'} border-b border-gray-100 flex justify-center ${isCollapsed ? 'px-3' : ''}`}>
                <div onClick={() => navigate('/')} className={`flex items-center gap-3 cursor-pointer group ${isCollapsed ? 'justify-center' : ''} w-full`}>
                    <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center shadow-lg shadow-red-200 group-hover:rotate-12 transition-transform shrink-0">
                        <span className="text-white font-black text-xl">E</span>
                    </div>
                    {!isCollapsed && (
                        <div>
                            <div className="font-black text-gray-900 tracking-tight text-xl">EduSpace</div>
                            <div className="text-[10px] text-red-500 font-bold tracking-[0.2em] uppercase">Partner Portal</div>
                        </div>
                    )}
                </div>
            </div>

            {/* Navigation */}
            <nav className={`${isCollapsed ? 'px-2 py-2 space-y-0.5' : 'px-4 py-4 space-y-1'} flex-1 overflow-y-auto`}>
                {/* Main */}
                <div className={isCollapsed ? 'mb-1' : 'mb-2'}>
                    {!isCollapsed && <div className="px-4 py-2 text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">Quản lý</div>}
                    {renderMenu(mainMenu)}
                </div>
                {/* Management */}
                <div className={`${isCollapsed ? 'pt-1' : 'pt-2'} border-t border-gray-100`}>
                    {!isCollapsed && <div className="px-4 py-2 text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">Vận hành</div>}
                    {renderMenu(managementMenu)}
                </div>
            </nav>

            {/* User Section */}
            <div className={`${isCollapsed ? 'p-2' : 'p-4'} border-t border-gray-100 bg-gray-50/50`}>
                <div
                    onClick={() => navigate('/rental/profile')}
                    className={`flex items-center gap-3 ${isCollapsed ? 'mb-2 p-2 rounded-lg' : 'mb-4 p-3 rounded-xl'} bg-white border border-gray-100 shadow-sm cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all ${isCollapsed ? 'justify-center' : ''}`}
                >
                    <div className={`${isCollapsed ? 'w-9 h-9' : 'w-10 h-10'} bg-gradient-to-br from-gray-800 to-black rounded-lg flex items-center justify-center text-white font-black shadow-md shrink-0`}>
                        BN
                    </div>
                    {!isCollapsed && (
                        <div className="flex flex-col flex-1 min-w-0">
                            <div className="font-bold text-gray-900 truncate group-hover:text-red-500 transition-colors">Bích Ngọc</div>
                            <div className="text-xs text-green-500 font-bold flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                                Host · Verified
                            </div>
                        </div>
                    )}
                </div>

                <div className={`gap-2 ${isCollapsed ? 'flex flex-col' : 'grid grid-cols-2'}`}>
                    <button
                        onClick={() => navigate('/rental/settings')}
                        onMouseEnter={(e) => {
                            if (!isCollapsed) return;
                            const rect = e.currentTarget.getBoundingClientRect();
                            setHoverTooltip({
                                label: 'Cài đặt',
                                x: rect.right + 10,
                                y: rect.top + rect.height / 2,
                            });
                        }}
                        onMouseLeave={() => {
                            if (isCollapsed) setHoverTooltip(null);
                        }}
                        className={`flex items-center justify-center gap-2 ${isCollapsed ? 'p-1.5' : 'p-2'} rounded-lg text-xs font-bold text-gray-500 hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-100 transition-all group relative`}
                    >
                        <Settings className={`${isCollapsed ? 'w-3.5 h-3.5' : 'w-4 h-4'} shrink-0`} />
                        {!isCollapsed && <span>Cài đặt</span>}
                    </button>
                    <button
                        onClick={() => navigate('/auth')}
                        onMouseEnter={(e) => {
                            if (!isCollapsed) return;
                            const rect = e.currentTarget.getBoundingClientRect();
                            setHoverTooltip({
                                label: 'Đăng xuất',
                                x: rect.right + 10,
                                y: rect.top + rect.height / 2,
                            });
                        }}
                        onMouseLeave={() => {
                            if (isCollapsed) setHoverTooltip(null);
                        }}
                        className={`flex items-center justify-center gap-2 ${isCollapsed ? 'p-1.5' : 'p-2'} rounded-lg text-xs font-bold text-red-500 hover:bg-red-50 border border-transparent transition-all group relative`}
                    >
                        <LogOut className={`${isCollapsed ? 'w-3.5 h-3.5' : 'w-4 h-4'} shrink-0`} />
                        {!isCollapsed && <span>Đăng xuất</span>}
                    </button>
                </div>
            </div>

            {isCollapsed && hoverTooltip && (
                <div
                    className="fixed z-50 pointer-events-none"
                    style={{ left: hoverTooltip.x, top: hoverTooltip.y, transform: 'translateY(-50%)' }}
                >
                    <div className="bg-gray-900 text-white text-sm font-bold rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
                        {hoverTooltip.label}
                    </div>
                </div>
            )}
        </div>
    );
}
