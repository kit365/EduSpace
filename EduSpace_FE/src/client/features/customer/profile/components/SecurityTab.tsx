import { Lock, Shield } from 'lucide-react';

export function SecurityTab() {
  return (
    <div className="space-y-6">
      {/* Change Password */}
      <div>
        <h3 className="font-semibold mb-4">Change Password</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Current Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-red-500"
                placeholder="Enter current password"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">New Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-red-500"
                placeholder="At least 8 characters"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Confirm New Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-red-500"
                placeholder="Re-enter new password"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Two-Factor Authentication */}
      <div className="border-t border-gray-200 pt-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Shield className="w-6 h-6 text-blue-500" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold mb-1">Two-Factor Authentication</h3>
            <p className="text-sm text-gray-600 mb-3">
              Add an extra layer of security to your account
            </p>
            <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold">
              Enable 2FA
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-semibold">
          Update Password
        </button>
      </div>
    </div>
  );
}
