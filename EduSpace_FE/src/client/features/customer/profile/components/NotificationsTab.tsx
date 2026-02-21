import { NotificationSettings } from '../types';

interface NotificationsTabProps {
  settings: NotificationSettings;
  onUpdate: (settings: NotificationSettings) => void;
}

export function NotificationsTab({ settings, onUpdate }: NotificationsTabProps) {
  const handleToggle = (key: keyof NotificationSettings) => {
    onUpdate({ ...settings, [key]: !settings[key] });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-4">Email Notifications</h3>
        <div className="space-y-4">
          <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
            <div>
              <div className="font-semibold mb-1">Booking Confirmations</div>
              <div className="text-sm text-gray-600">Receive emails when bookings are confirmed</div>
            </div>
            <input
              type="checkbox"
              checked={settings.emailBookingConfirm}
              onChange={() => handleToggle('emailBookingConfirm')}
              className="w-5 h-5 accent-red-500"
            />
          </label>

          <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
            <div>
              <div className="font-semibold mb-1">Messages</div>
              <div className="text-sm text-gray-600">Get notified when you receive new messages</div>
            </div>
            <input
              type="checkbox"
              checked={settings.emailMessages}
              onChange={() => handleToggle('emailMessages')}
              className="w-5 h-5 accent-red-500"
            />
          </label>

          <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
            <div>
              <div className="font-semibold mb-1">Promotions & Tips</div>
              <div className="text-sm text-gray-600">Receive special offers and learning space tips</div>
            </div>
            <input
              type="checkbox"
              checked={settings.emailPromotions}
              onChange={() => handleToggle('emailPromotions')}
              className="w-5 h-5 accent-red-500"
            />
          </label>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h3 className="font-semibold mb-4">Push Notifications</h3>
        <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
          <div>
            <div className="font-semibold mb-1">Enable Push Notifications</div>
            <div className="text-sm text-gray-600">Get instant updates on your device</div>
          </div>
          <input
            type="checkbox"
            checked={settings.pushNotifications}
            onChange={() => handleToggle('pushNotifications')}
            className="w-5 h-5 accent-red-500"
          />
        </label>
      </div>

      <div className="flex justify-end">
        <button className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-semibold">
          Save Preferences
        </button>
      </div>
    </div>
  );
}
