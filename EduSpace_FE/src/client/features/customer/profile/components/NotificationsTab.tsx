import { useTranslation } from 'react-i18next';
import { Bell, Mail, Smartphone, Save } from 'lucide-react';
import { NotificationSettings } from '../types';

interface NotificationsTabProps {
  settings: NotificationSettings;
  onUpdate: (settings: NotificationSettings) => void;
}

export function NotificationsTab({ settings, onUpdate }: NotificationsTabProps) {
  const { t } = useTranslation();

  const handleToggle = (key: keyof NotificationSettings) => {
    onUpdate({ ...settings, [key]: !settings[key] });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-black text-gray-900 tracking-tight">
          {t('customer.profile.alerts.title')}
        </h3>
      </div>

      <div className="space-y-8">
        <div>
          <div className="flex items-center gap-2 mb-4 text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
            <Mail className="w-4 h-4" />
            {t('customer.profile.alerts.emailSection')}
          </div>
          <div className="grid grid-cols-1 gap-4">
            <label className="flex items-center justify-between p-6 bg-slate-50 border border-slate-100 rounded-[28px] cursor-pointer hover:bg-white hover:shadow-xl hover:shadow-slate-100 transition-all group">
              <div className="flex-1">
                <div className="font-black text-gray-900 mb-1 group-hover:text-red-500 transition-colors uppercase text-xs tracking-wider">{t('customer.profile.alerts.bookingConfirm.title')}</div>
                <div className="text-sm font-medium text-gray-500">{t('customer.profile.alerts.bookingConfirm.desc')}</div>
              </div>
              <div className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.emailBookingConfirm}
                  onChange={() => handleToggle('emailBookingConfirm')}
                  className="sr-only peer"
                />
                <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-red-500"></div>
              </div>
            </label>

            <label className="flex items-center justify-between p-6 bg-slate-50 border border-slate-100 rounded-[28px] cursor-pointer hover:bg-white hover:shadow-xl hover:shadow-slate-100 transition-all group">
              <div className="flex-1">
                <div className="font-black text-gray-900 mb-1 group-hover:text-red-500 transition-colors uppercase text-xs tracking-wider">{t('customer.profile.alerts.messages.title')}</div>
                <div className="text-sm font-medium text-gray-500">{t('customer.profile.alerts.messages.desc')}</div>
              </div>
              <div className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.emailMessages}
                  onChange={() => handleToggle('emailMessages')}
                  className="sr-only peer"
                />
                <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-red-500"></div>
              </div>
            </label>

            <label className="flex items-center justify-between p-6 bg-slate-50 border border-slate-100 rounded-[28px] cursor-pointer hover:bg-white hover:shadow-xl hover:shadow-slate-100 transition-all group">
              <div className="flex-1">
                <div className="font-black text-gray-900 mb-1 group-hover:text-red-500 transition-colors uppercase text-xs tracking-wider">{t('customer.profile.alerts.promotions.title')}</div>
                <div className="text-sm font-medium text-gray-500">{t('customer.profile.alerts.promotions.desc')}</div>
              </div>
              <div className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.emailPromotions}
                  onChange={() => handleToggle('emailPromotions')}
                  className="sr-only peer"
                />
                <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-red-500"></div>
              </div>
            </label>
          </div>
        </div>

        <div className="border-t border-slate-50 pt-8">
          <div className="flex items-center gap-2 mb-4 text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
            <Smartphone className="w-4 h-4" />
            {t('customer.profile.alerts.pushSection')}
          </div>
          <label className="flex items-center justify-between p-6 bg-slate-50 border border-slate-100 rounded-[28px] cursor-pointer hover:bg-white hover:shadow-xl hover:shadow-slate-100 transition-all group">
            <div className="flex-1">
              <div className="font-black text-gray-900 mb-1 group-hover:text-red-500 transition-colors uppercase text-xs tracking-wider">{t('customer.profile.alerts.pushEnable.title')}</div>
              <div className="text-sm font-medium text-gray-500">{t('customer.profile.alerts.pushEnable.desc')}</div>
            </div>
            <div className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.pushNotifications}
                onChange={() => handleToggle('pushNotifications')}
                className="sr-only peer"
              />
              <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-red-500"></div>
            </div>
          </label>
        </div>
      </div>

      <div className="flex justify-end pt-6">
        <button className="flex items-center gap-2 px-10 py-4 bg-gray-900 text-white rounded-2xl hover:bg-black transition-all font-black shadow-xl shadow-gray-200 active:scale-95">
          <Save className="w-5 h-5 text-red-500" />
          {t('customer.profile.alerts.save')}
        </button>
      </div>
    </div>
  );
}
