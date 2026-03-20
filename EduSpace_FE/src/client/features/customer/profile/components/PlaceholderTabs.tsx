import { Users, UserPlus, Download, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function TeamsTab() {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-[#333333]">{t('customer.profile.sidebar.teams')}</h2>
      <p className="text-sm text-[#666666] leading-relaxed">
        Manage your teams and workspace. This section is coming soon.
      </p>
      <div className="py-12 rounded-xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center gap-3">
        <Users className="w-12 h-12 text-gray-300" />
        <span className="text-sm font-medium text-gray-400">Teams</span>
      </div>
    </div>
  );
}

export function TeamMemberTab() {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-[#333333]">{t('customer.profile.sidebar.teamMember')}</h2>
      <p className="text-sm text-[#666666] leading-relaxed">
        Invite and manage team members. This section is coming soon.
      </p>
      <div className="py-12 rounded-xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center gap-3">
        <UserPlus className="w-12 h-12 text-gray-300" />
        <span className="text-sm font-medium text-gray-400">Team Member</span>
      </div>
    </div>
  );
}

export function DataExportTab() {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-[#333333]">{t('customer.profile.sidebar.dataExport')}</h2>
      <p className="text-sm text-[#666666] leading-relaxed">
        Download a copy of your data. This section is coming soon.
      </p>
      <div className="py-12 rounded-xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center gap-3">
        <Download className="w-12 h-12 text-gray-300" />
        <span className="text-sm font-medium text-gray-400">Data Export</span>
      </div>
    </div>
  );
}

export function DeleteAccountTab() {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-red-600">{t('customer.profile.sidebar.deleteAccount')}</h2>
      <p className="text-sm text-[#666666] leading-relaxed">
        Permanently delete your account and all associated data. This action cannot be undone.
      </p>
      <div className="py-12 rounded-xl border-2 border-dashed border-red-100 bg-red-50/50 flex flex-col items-center justify-center gap-3">
        <Trash2 className="w-12 h-12 text-red-300" />
        <span className="text-sm font-medium text-red-600">Delete Account</span>
        <button className="mt-2 px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors">
          Request account deletion
        </button>
      </div>
    </div>
  );
}
