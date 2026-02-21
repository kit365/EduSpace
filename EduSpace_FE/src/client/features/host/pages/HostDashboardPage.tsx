import { useState } from 'react';
import { Plus } from 'lucide-react';
import { StatsCards, CalendarManagement, PendingRequests } from '../components';
import { DASHBOARD_STATS, BOOKING_REQUESTS, CALENDAR_EVENTS } from '../data/mockData';
import { RentalLayout } from '../../../layouts/RentalLayout';

export function HostDashboardPage() {
  const handleApprove = (id: number) => {
    console.log('Approved booking:', id);
  };

  const handleReject = (id: number) => {
    console.log('Rejected booking:', id);
  };

  return (
    <RentalLayout title="Dashboard Overview">
      {/* Welcome Message */}
      <div className="flex justify-between items-start mb-10 animate-in slide-in-from-left duration-700">
        <div>
          <h1 className="text-4xl font-black text-gray-900 mb-2 tracking-tight">Chào buổi sáng, Minh! 👋</h1>
          <p className="text-gray-500 font-medium">Here's what is happening with your training spaces today.</p>
        </div>
        <button className="flex items-center gap-3 bg-red-500 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-red-200 hover:bg-red-600 transition-all active:scale-95">
          <Plus className="w-5 h-5" />
          Create Listing
        </button>
      </div>

      {/* Stats Cards */}
      <div className="mb-10 animate-in fade-in duration-1000 delay-200">
        <StatsCards stats={DASHBOARD_STATS} />
      </div>

      {/* Calendar and Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-4 duration-700 delay-300">
        {/* Calendar - 2 columns */}
        <div className="lg:col-span-2">
          <CalendarManagement events={CALENDAR_EVENTS} />
        </div>

        {/* Pending Requests - 1 column */}
        <div className="lg:col-span-1">
          <PendingRequests
            requests={BOOKING_REQUESTS}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        </div>
      </div>
    </RentalLayout>
  );
}
