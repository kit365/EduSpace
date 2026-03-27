import { ReactNode, useEffect } from 'react';
import { CustomerHeader } from '../../components/common/CustomerHeader';
import { Footer } from '../../components/common/Footer';
import { ChatWidget } from '../../components/common/ChatWidget';
import { useAuthStore } from '@/stores/authStore';
import { refreshHostPermissionsFromAccount } from '@/utils/refreshHostPermissionsFromAccount';

interface CustomerLayoutProps {
    children: ReactNode;
}

export function CustomerLayout({ children }: CustomerLayoutProps) {
    const accessToken = useAuthStore((s) => s.accessToken);

    useEffect(() => {
        if (!accessToken) return;
        void refreshHostPermissionsFromAccount();
    }, [accessToken]);

    return (
        <div className="min-h-screen bg-white flex flex-col relative">
            <CustomerHeader />
            <main className="flex-1 transition-all duration-500">
                {children}
            </main>
            <Footer />
            
            {/* Floating Support Chat Widget (Hidden on /messages route) */}
            {window.location.pathname !== '/messages' && <ChatWidget />}
        </div>
    );
}
