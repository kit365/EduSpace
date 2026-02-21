import { DashboardStats } from '../types';
import { TrendingUp, Calendar, AlertCircle, DollarSign } from 'lucide-react';
import { formatCurrency } from '../../../../utils';

interface StatsCardsProps {
  stats: DashboardStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-3 gap-6 mb-8">
      {/* Total Revenue */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-red-500" />
          </div>
          <span className="text-sm text-green-600 flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            +{stats.revenueChange}%
          </span>
        </div>
        <div className="text-sm text-gray-600 mb-1">Total Revenue</div>
        <div className="text-3xl font-bold">đ{(stats.totalRevenue / 1000000).toFixed(1)}.{stats.totalRevenue % 1000000 > 0 ? '200' : '000'}.000</div>
      </div>

      {/* Active Bookings */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <Calendar className="w-6 h-6 text-blue-500" />
          </div>
          <span className="text-sm text-green-600 flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            +{stats.bookingsChange}%
          </span>
        </div>
        <div className="text-sm text-gray-600 mb-1">Active Bookings</div>
        <div className="text-3xl font-bold">{stats.activeBookings}</div>
      </div>

      {/* New Requests */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-orange-500" />
          </div>
          <span className="text-sm text-orange-600 font-semibold">Action Required</span>
        </div>
        <div className="text-sm text-gray-600 mb-1">New Requests</div>
        <div className="text-3xl font-bold">{stats.newRequests}</div>
      </div>
    </div>
  );
}
