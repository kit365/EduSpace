import { ReactNode } from 'react';
import { CustomerHeader } from '../../components/common/CustomerHeader';
import { Footer } from '../../components/common/Footer';

interface CustomerLayoutProps {
    children: ReactNode;
}

export function CustomerLayout({ children }: CustomerLayoutProps) {
    return (
        <div className="min-h-screen bg-white flex flex-col">
            <CustomerHeader />
            <main className="flex-1 transition-all duration-500">
                {children}
            </main>
            <Footer />
        </div>
    );
}
