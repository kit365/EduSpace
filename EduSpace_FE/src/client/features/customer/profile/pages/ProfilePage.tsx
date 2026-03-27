import { useState } from 'react';
import { User, Lock, Bell, CreditCard, Loader2, FileText, Users, UserPlus, Download, Trash2, ClipboardList } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CustomerLayout } from '../../../../layouts/CustomerLayout';
import { PersonalInfoTab, SecurityTab, NotificationsTab, PaymentMethodsTab, HostPartnerApplicationTab } from '../components';
import { TeamsTab, TeamMemberTab, DataExportTab, DeleteAccountTab } from '../components/PlaceholderTabs';
import { NOTIFICATION_SETTINGS, PAYMENT_METHODS } from '../data/mockData';
import { NotificationSettings } from '../types';
import { useProfile } from '../hooks/useProfile';

export function ProfilePage() {
  const { t } = useTranslation();
  const { profile, loading, updateProfile } = useProfile();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('personal');
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(NOTIFICATION_SETTINGS);

  if (loading || !profile) {
    return (
      <CustomerLayout>
        <div className="min-h-[70vh] flex items-center justify-center">
          <Loader2 className="w-12 h-12 text-red-500 animate-spin" />
        </div>
      </CustomerLayout>
    );
  }

  const hasHostPrivileges = ['ADMIN', 'SUPER_ADMIN', 'HOST'].includes(profile.role?.toString().toUpperCase() || '');

  const tabs = [
    { id: 'personal', label: t('customer.profile.sidebar.myProfile'), icon: User },
    ...(!hasHostPrivileges ? [{ id: 'hostPartner', label: t('customer.profile.sidebar.hostApplication', 'Đơn đối tác'), icon: ClipboardList }] : []),
    { id: 'security', label: t('customer.profile.sidebar.security'), icon: Lock },
    { id: 'teams', label: t('customer.profile.sidebar.teams'), icon: Users },
    { id: 'teamMember', label: t('customer.profile.sidebar.teamMember'), icon: UserPlus },
    { id: 'notifications', label: t('customer.profile.sidebar.alerts'), icon: Bell },
    { id: 'payment', label: t('customer.profile.sidebar.billing'), icon: CreditCard },
    { id: 'dataExport', label: t('customer.profile.sidebar.dataExport'), icon: Download },
  ];
  const deleteAccountLabel = t('customer.profile.sidebar.deleteAccount');

  return (
    <CustomerLayout>
      <div className="bg-[#F8F8F8] min-h-screen py-8 animate-in fade-in duration-700">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-2xl font-bold text-[#333333] mb-8">
            {t('customer.profile.accountSettings')}
          </h1>

          <div className="flex gap-8">
            {/* Sidebar Tabs - fixed 14px font, min-height, visible hover */}
            <div className="w-56 space-y-1 shrink-0">
              <nav className="bg-white rounded-xl border border-gray-100 shadow-sm p-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      type="button"
                      data-active={isActive ? 'true' : 'false'}
                      className={`profile-tab w-full flex items-center gap-3 px-4 min-h-[44px] rounded-lg text-left cursor-pointer select-none transition-colors duration-150 ${isActive
                        ? 'bg-[#E8F4FD] text-[#0056B3]'
                        : 'text-[#666666]'
                        }`}
                    >
                      <Icon className={`w-5 h-5 shrink-0 flex-shrink-0 ${isActive ? 'text-[#0056B3]' : 'text-gray-400'}`} />
                      <span className="truncate">{tab.label}</span>
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => setActiveTab('deleteAccount')}
                  data-delete
                  data-active={activeTab === 'deleteAccount' ? 'true' : 'false'}
                  className={`profile-tab w-full flex items-center gap-3 px-4 min-h-[44px] rounded-lg text-left cursor-pointer select-none transition-colors duration-150 mt-1 ${activeTab === 'deleteAccount' ? 'bg-red-50 text-red-600' : 'text-red-600'}`}
                >
                  <Trash2 className="w-5 h-5 shrink-0 flex-shrink-0" />
                  <span className="truncate">{deleteAccountLabel}</span>
                </button>
              </nav>

              <button
                type="button"
                onClick={() => navigate('/transactions')}
                data-transactions
                className="profile-tab w-full flex items-center gap-3 px-4 min-h-[44px] rounded-xl cursor-pointer select-none text-[#666666] border border-gray-100 transition-colors duration-150"
              >
                <FileText className="w-5 h-5 shrink-0 flex-shrink-0 text-gray-400" />
                <span className="truncate">{t('customer.profile.sidebar.transactions')}</span>
              </button>

              <div className="bg-gradient-to-br from-red-500 to-orange-600 p-6 rounded-xl text-white shadow-sm">
                <h3 className="text-lg font-bold mb-2">{t('customer.profile.premium.title')}</h3>
                <p className="text-xs text-white/90 mb-4 leading-relaxed">
                  {t('customer.profile.premium.description')}
                </p>
                <button className="w-full bg-white text-gray-900 py-2.5 rounded-lg font-semibold text-sm hover:bg-gray-100 transition-all">
                  {t('customer.profile.premium.upgrade')}
                </button>
              </div>
            </div>

            {/* Main Content Area - no animation on wrapper to avoid re-trigger when profile updates */}
            <div className="flex-1 bg-white rounded-xl border border-gray-100 shadow-sm p-10 min-h-[600px]">
              <div key={activeTab}>
                {activeTab === 'personal' && (
                  <PersonalInfoTab
                    profile={profile}
                    onUpdate={updateProfile}
                  />
                )}
                {activeTab === 'hostPartner' && <HostPartnerApplicationTab />}
                {activeTab === 'security' && <SecurityTab />}
                {activeTab === 'teams' && <TeamsTab />}
                {activeTab === 'teamMember' && <TeamMemberTab />}
                {activeTab === 'notifications' && (
                  <NotificationsTab
                    settings={notificationSettings}
                    onUpdate={setNotificationSettings}
                  />
                )}
                {activeTab === 'payment' && <PaymentMethodsTab methods={PAYMENT_METHODS} />}
                {activeTab === 'dataExport' && <DataExportTab />}
                {activeTab === 'deleteAccount' && <DeleteAccountTab />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}
