import { ReactNode } from 'react';
import { AdminSidebar } from '../features/admin/components/AdminSidebar';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

interface AdminLayoutProps {
    children: ReactNode;
    title?: string;
}

export function AdminLayout({ children, title }: AdminLayoutProps) {
    const { i18n } = useTranslation();

    const toggleLanguage = () => {
        const nextLang = i18n.language === 'vi' ? 'en' : 'vi';
        i18n.changeLanguage(nextLang);
    };

    return (
        <div className="flex h-screen bg-white">
            <AdminSidebar />
            <div className="flex-1 flex flex-col h-full overflow-hidden bg-gray-50">
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shrink-0 shadow-sm z-10 transition-all">
                    <h1 className="text-xl font-bold text-gray-900 tracking-tight">{title}</h1>
                    
                    <div className="flex items-center gap-4">
                        {/* Simplified Language Toggle */}
                        <button 
                            onClick={toggleLanguage}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-100 rounded-2xl hover:bg-gray-100 hover:border-gray-200 transition-all active:scale-95 group"
                        >
                            <Globe className="w-4 h-4 text-blue-600 group-hover:rotate-12 transition-transform" />
                            <span className="text-xs font-black text-gray-900 uppercase tracking-widest">
                                {i18n.language === 'vi' ? 'VI' : 'EN'}
                            </span>
                        </button>

                        <div className="h-6 w-px bg-gray-100" />
                        
                        {/* Placeholder for other header actions if any */}
                    </div>
                </header>
                <main className="flex-1 overflow-y-auto p-10">
                    {children}
                </main>
            </div>
        </div>
    );
}
