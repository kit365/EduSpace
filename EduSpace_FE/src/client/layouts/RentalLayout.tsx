import { ReactNode } from 'react';
import { RentalSidebar } from '../features/host/components/RentalSidebar';

interface RentalLayoutProps {
    children: ReactNode;
    title?: string;
}

export function RentalLayout({ children, title }: RentalLayoutProps) {
    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            <RentalSidebar />
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                <header className="h-16 bg-white border-b border-gray-200 flex items-center px-8 shrink-0">
                    <h1 className="text-xl font-bold text-gray-800">{title}</h1>
                </header>
                <main className="flex-1 overflow-y-auto p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
