import { ReactNode } from 'react';
import { CustomerHeader } from '../../components/common/CustomerHeader';
import { Footer } from '../../components/common/Footer';
import { ChatWidget } from '../../components/common/ChatWidget';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <CustomerHeader />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <ChatWidget />
    </div>
  );
}
