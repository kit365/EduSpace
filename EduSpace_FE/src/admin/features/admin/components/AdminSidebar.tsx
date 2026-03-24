import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { User, Shield, Activity, Settings, LogOut, DollarSign, FileCheck, MessageSquareWarning, Building2, Gift, MessageSquare, Percent } from "lucide-react";

export function AdminSidebar() {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const menuItems = [
        { nameKey: 'admin_sidebar.dashboard', icon: Activity, path: '/admin' },
        { nameKey: 'admin_sidebar.messages', icon: MessageSquare, path: '/admin/messages' },
        { nameKey: 'admin_sidebar.finance', icon: DollarSign, path: '/admin/finance' },
        { nameKey: 'admin_sidebar.approvals', icon: FileCheck, path: '/admin/verification' },
        { nameKey: 'admin_sidebar.disputes', icon: MessageSquareWarning, path: '/admin/disputes' },
        { nameKey: 'admin_sidebar.hosts', icon: Building2, path: '/admin/hosts' },
        { nameKey: 'admin_sidebar.users', icon: User, path: '/admin/users' },
        { nameKey: 'admin_sidebar.roles', icon: Shield, path: '/admin/roles' },
        { nameKey: 'admin_sidebar.points', icon: Gift, path: '/admin/points' },
        { nameKey: 'admin_sidebar.depositPolicies', icon: Percent, path: '/admin/deposit-policies' },
        { nameKey: 'admin_sidebar.settings', icon: Settings, path: '/admin/settings' },
    ];

    return (
        <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col items-stretch shrink-0 h-full">
            <div className="p-6 border-b border-gray-800">
                <div onClick={() => navigate('/')} className="flex items-center gap-3 cursor-pointer group">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center font-black text-white shadow-lg shadow-blue-900/50">
                        A
                    </div>
                    <div>
                        <h1 className="text-white font-bold text-lg tracking-tight">{t('admin_sidebar.adminPortal')}</h1>
                        <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">{t('admin_sidebar.systemControl')}</p>
                    </div>
                </div>
            </div>

            <nav className="flex-1 px-3 py-6 space-y-1">
                {menuItems.map((item) => (
                    <button
                        key={item.path}
                        onClick={() => navigate(item.path)}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-all font-medium text-sm group"
                    >
                        <item.icon className="w-4 h-4 group-hover:text-blue-400 transition-colors" />
                        {t(item.nameKey)}
                    </button>
                ))}
            </nav>

            <div className="p-4 border-t border-gray-800 bg-gray-900/50">
                <button
                    onClick={() => navigate('/auth')}
                    className="w-full flex items-center justify-center gap-2 p-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-all font-bold text-sm"
                >
                    <LogOut className="w-4 h-4" />
                    {t('admin_sidebar.signOut')}
                </button>
            </div>
        </div>
    );
}
