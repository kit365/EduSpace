import { ReactNode } from 'react';
import { CustomerHeader } from '../../components/common/CustomerHeader';
import { Footer } from '../../components/common/Footer';
import { ChatWidget } from '../../components/common/ChatWidget';

interface CustomerLayoutProps {
    children: ReactNode;
}

export function CustomerLayout({ children }: CustomerLayoutProps) {
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
