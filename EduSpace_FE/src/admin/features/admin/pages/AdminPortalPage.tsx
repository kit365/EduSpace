import { AdminLayout } from "../../../layouts/AdminLayout";
import { User, Shield, CreditCard, Activity } from 'lucide-react';
import { useLogs } from '../hooks/useAdmin';

export function AdminPortalPage() {
  const { logs, loading } = useLogs();

  return (
    <AdminLayout title="Dashboard Overview">
      <div className="grid grid-cols-4 gap-6 mb-10">
        {[
          { label: 'Total Users', value: '1,234', change: '+12%', icon: User, color: 'text-blue-500', bg: 'bg-blue-50' },
          { label: 'Active Helpers', value: '56', change: '+5%', icon: Shield, color: 'text-green-500', bg: 'bg-green-50' },
          { label: 'Total Revenue', value: '$45,230', change: '+8%', icon: CreditCard, color: 'text-purple-500', bg: 'bg-purple-50' },
          { label: 'System Health', value: '98%', change: 'Stable', icon: Activity, color: 'text-orange-500', bg: 'bg-orange-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">{stat.change}</span>
            </div>
            <h3 className="text-3xl font-black text-gray-900 mb-1 tracking-tight">{stat.value}</h3>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
        <h3 className="font-bold text-lg mb-6">Recent System Activity</h3>
        <div className="space-y-4">
          {loading ? (
            <p className="text-gray-400">Loading logs...</p>
          ) : (
            logs.map(log => (
              <div key={log.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-center gap-4">
                  <div className={`w-2 h-2 rounded-full ${log.status === 'Success' ? 'bg-green-500' : 'bg-amber-500'}`} />
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{log.action}</p>
                    <p className="text-xs text-gray-500 font-medium">by {log.user}</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-gray-400">{log.time}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
