import { ReactNode, useState } from 'react';
import { HostSidebar } from '../features/host/components/HostSidebar';
import { HostHeader } from '../features/host/components/HostHeader';

interface HostLayoutProps {
    children: ReactNode;
    title?: string;
}

export function HostLayout({ children, title = 'Host Management' }: HostLayoutProps) {
    const [activeSection, setActiveSection] = useState('overview');

    return (
        <div className="flex min-h-screen bg-slate-50">
            <HostSidebar activeSection={activeSection} onSectionChange={setActiveSection} />

            <div className="flex-1 flex flex-col">
                <HostHeader title={title} />
                <main className="flex-1 p-8 animate-in fade-in duration-700">
                    {children}
                </main>
            </div>
        </div>
    );
}
