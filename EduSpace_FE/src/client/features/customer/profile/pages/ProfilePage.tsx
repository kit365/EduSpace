import { useState } from 'react';
import { User, Lock, Bell, CreditCard, Loader2 } from 'lucide-react';
import { CustomerLayout } from '../../../../layouts/CustomerLayout';
import { ProfileHeader, PersonalInfoTab, SecurityTab, NotificationsTab, PaymentMethodsTab } from '../components';
import { NOTIFICATION_SETTINGS, PAYMENT_METHODS } from '../data/mockData';
import { NotificationSettings } from '../types';
import { useProfile } from '../hooks/useProfile';

export function ProfilePage() {
  const { profile, loading, updateProfile } = useProfile();
  const [activeTab, setActiveTab] = useState('personal');
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(NOTIFICATION_SETTINGS);

  const tabs = [
    { id: 'personal', label: 'Identity', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'notifications', label: 'Alerts', icon: Bell },
    { id: 'payment', label: 'Billing', icon: CreditCard }
  ];

  if (loading || !profile) {
    return (
      <CustomerLayout>
        <div className="min-h-[70vh] flex items-center justify-center">
          <Loader2 className="w-12 h-12 text-red-500 animate-spin" />
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <div className="bg-slate-50 min-h-screen py-12 animate-in fade-in duration-700">
        <div className="max-w-6xl mx-auto px-4">

          {/* Profile Header */}
          <div className="mb-12">
            <ProfileHeader profile={profile} />
          </div>

          <div className="flex gap-8">
            {/* Sidebar Tabs */}
            <div className="w-72 space-y-3 shrink-0">
              <div className="bg-white p-4 rounded-[32px] border border-slate-100 shadow-sm">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 font-black text-sm uppercase tracking-widest ${isActive
                        ? 'bg-gray-900 text-white shadow-2xl shadow-gray-200 translate-x-2'
                        : 'text-gray-400 hover:text-gray-900 hover:bg-slate-50'
                        }`}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? 'text-red-500' : ''}`} />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              <div className="bg-gradient-to-br from-red-500 to-orange-600 p-8 rounded-[32px] text-white shadow-xl shadow-red-100 overflow-hidden relative group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
                <h3 className="text-xl font-black mb-2 relative z-10">Premium Host</h3>
                <p className="text-xs font-bold text-red-100 mb-6 relative z-10 opacity-80 uppercase tracking-tighter leading-relaxed">Unlock advanced analytics and top-tier placement for your classrooms.</p>
                <button className="w-full bg-white text-gray-900 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-gray-100 transition-all shadow-lg active:scale-95 relative z-10">Upgrade Now</button>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 bg-white rounded-[40px] border border-slate-100 shadow-2xl shadow-slate-200/50 p-12 min-h-[600px]">
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                {activeTab === 'personal' && (
                  <PersonalInfoTab
                    profile={profile}
                    onUpdate={updateProfile}
                  />
                )}
                {activeTab === 'security' && <SecurityTab />}
                {activeTab === 'notifications' && (
                  <NotificationsTab
                    settings={notificationSettings}
                    onUpdate={setNotificationSettings}
                  />
                )}
                {activeTab === 'payment' && <PaymentMethodsTab methods={PAYMENT_METHODS} />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}
