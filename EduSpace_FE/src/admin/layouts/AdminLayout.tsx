import { ReactNode } from 'react';
import { AdminSidebar } from '../features/admin/components/AdminSidebar';

interface AdminLayoutProps {
    children: ReactNode;
    title?: string;
}

export function AdminLayout({ children, title }: AdminLayoutProps) {
    return (
        <div className="flex h-screen bg-white">
            <AdminSidebar />
            <div className="flex-1 flex flex-col h-full overflow-hidden bg-gray-50">
                <header className="h-16 bg-white border-b border-gray-200 flex items-center px-8 shrink-0 shadow-sm z-10">
                    <h1 className="text-xl font-bold text-gray-900 tracking-tight">{title}</h1>
                </header>
                <main className="flex-1 overflow-y-auto p-10">
                    {children}
                </main>
            </div>
        </div>
    );
}
