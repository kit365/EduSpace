import { useNavigate } from "react-router-dom";
import { User, Shield, Activity, Settings, LogOut, DollarSign, FileCheck, MessageSquareWarning, Building2 } from "lucide-react";

export function AdminSidebar() {
    const navigate = useNavigate();

    const menuItems = [
        { name: 'Dashboard', icon: Activity, path: '/admin' },
        { name: 'Finance & Payouts', icon: DollarSign, path: '/admin/finance' },
        { name: 'Approvals & KYC', icon: FileCheck, path: '/admin/verification' },
        { name: 'Disputes & Reports', icon: MessageSquareWarning, path: '/admin/disputes' },
        { name: 'Host Management', icon: Building2, path: '/admin/hosts' },
        { name: 'User Management', icon: User, path: '/admin/users' },
        { name: 'Role & Perms', icon: Shield, path: '/admin/roles' },
        { name: 'System Settings', icon: Settings, path: '/admin/settings' },
    ];

    return (
        <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col items-stretch shrink-0 h-full">
            <div className="p-6 border-b border-gray-800">
                <div onClick={() => navigate('/')} className="flex items-center gap-3 cursor-pointer group">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center font-black text-white shadow-lg shadow-blue-900/50">
                        A
                    </div>
                    <div>
                        <h1 className="text-white font-bold text-lg tracking-tight">Admin Portal</h1>
                        <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">System Control</p>
                    </div>
                </div>
            </div>

            <nav className="flex-1 px-3 py-6 space-y-1">
                {menuItems.map((item) => (
                    <button
                        key={item.name}
                        onClick={() => navigate(item.path)}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-all font-medium text-sm group"
                    >
                        <item.icon className="w-4 h-4 group-hover:text-blue-400 transition-colors" />
                        {item.name}
                    </button>
                ))}
            </nav>

            <div className="p-4 border-t border-gray-800 bg-gray-900/50">
                <button
                    onClick={() => navigate('/auth')}
                    className="w-full flex items-center justify-center gap-2 p-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-all font-bold text-sm"
                >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                </button>
            </div>
        </div>
    );
}
