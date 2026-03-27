import { useState } from 'react';
import { User, Lock, Loader2, ClipboardList } from 'lucide-react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CustomerLayout } from '../../../../layouts/CustomerLayout';
import { PersonalInfoTab, SecurityTab, HostPartnerApplicationTab } from '../components';
import { useProfile } from '../hooks/useProfile';
import { useAuthStore } from '@/stores/authStore';
import { canAccessHostConsole, getRealmRolesFromAccessToken } from '@/utils/keycloakTokenRoles';

export function ProfilePage() {
  const { t } = useTranslation();
  const { profile, loading, updateProfile } = useProfile();
  const navigate = useNavigate();
  const accessToken = useAuthStore((s) => s.accessToken);
  const [activeTab, setActiveTab] = useState('personal');
  const isHostConsoleUser = canAccessHostConsole(getRealmRolesFromAccessToken(accessToken));

  if (isHostConsoleUser) {
    return <Navigate to="/rental/profile" replace />;
  }

  if (loading) {
    return (
      <CustomerLayout>
        <div className="min-h-[70vh] flex items-center justify-center">
          <Loader2 className="w-12 h-12 text-red-500 animate-spin" />
        </div>
      </CustomerLayout>
    );
  }

  if (!profile) {
    return (
      <CustomerLayout>
        <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3 text-center">
          <p className="text-sm font-semibold text-slate-600">Không tải được thông tin hồ sơ.</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold"
          >
            Tải lại trang
          </button>
        </div>
      </CustomerLayout>
    );
  }

  const hasHostPrivileges = ['ADMIN', 'SUPER_ADMIN', 'HOST'].includes(profile.role?.toString().toUpperCase() || '');

  const tabs = [
    { id: 'personal', label: t('customer.profile.sidebar.myProfile'), icon: User },
    ...(!hasHostPrivileges ? [{ id: 'hostPartner', label: t('customer.profile.sidebar.hostApplication', 'Đơn đối tác'), icon: ClipboardList }] : []),
    { id: 'security', label: t('customer.profile.sidebar.security'), icon: Lock },
  ];

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
              </nav>




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
              </div>
            </div>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}
