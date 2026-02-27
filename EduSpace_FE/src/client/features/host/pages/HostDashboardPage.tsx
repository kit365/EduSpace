import { useState } from 'react';
import { Plus, TrendingUp, BarChart3, PieChart as PieChartIcon, Activity } from 'lucide-react';
import { StatsCards, CalendarManagement, PendingRequests } from '../components';
import { DASHBOARD_STATS, BOOKING_REQUESTS, CALENDAR_EVENTS } from '../data/mockData';
import { RentalLayout } from '../../../layouts/RentalLayout';
import { useBranch } from '../context/BranchContext';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';

// --- MOCK CHART DATA ---
const MONTHLY_REVENUE_ALL = [
  { name: 'T1', revenue: 40 }, { name: 'T2', revenue: 30 }, { name: 'T3', revenue: 45 },
  { name: 'T4', revenue: 50 }, { name: 'T5', revenue: 65 }, { name: 'T6', revenue: 55 },
  { name: 'T7', revenue: 80 },
];

const MONTHLY_REVENUE_BRANCH_1 = [
  { name: 'T1', revenue: 25 }, { name: 'T2', revenue: 18 }, { name: 'T3', revenue: 27 },
  { name: 'T4', revenue: 28 }, { name: 'T5', revenue: 45 }, { name: 'T6', revenue: 27 },
  { name: 'T7', revenue: 45 },
];

const MONTHLY_REVENUE_BRANCH_2 = [
  { name: 'T1', revenue: 15 }, { name: 'T2', revenue: 12 }, { name: 'T3', revenue: 18 },
  { name: 'T4', revenue: 22 }, { name: 'T5', revenue: 20 }, { name: 'T6', revenue: 28 },
  { name: 'T7', revenue: 35 },
];

const BRANCH_COMPARISON_DATA = [
  { name: 'CS Quận 1', revenue: 45 },
  { name: 'CS Quận 3', revenue: 32 },
];

const ROOM_USAGE_DATA_1 = [
  { name: 'Classroom', value: 50 },
  { name: 'Meeting', value: 20 },
  { name: 'Hall', value: 25 },
  { name: 'Lab', value: 5 },
];

const ROOM_USAGE_DATA_2 = [
  { name: 'Classroom', value: 25 },
  { name: 'Meeting', value: 45 },
  { name: 'Hall', value: 10 },
  { name: 'Lab', value: 20 },
];
const COLORS = ['#ef4444', '#3b82f6', '#f59e0b', '#10b981'];

export function HostDashboardPage() {
  const { selectedBranch } = useBranch();

  const handleApprove = (id: number) => {
    console.log('Approved booking:', id);
  };

  const handleReject = (id: number) => {
    console.log('Rejected booking:', id);
  };

  const filteredRequests = selectedBranch
    ? BOOKING_REQUESTS.filter(r => r.branchId === selectedBranch.id)
    : BOOKING_REQUESTS;

  const filteredEvents = selectedBranch
    ? CALENDAR_EVENTS.filter(e => e.branchId === selectedBranch.id)
    : CALENDAR_EVENTS;

  // Derive stats dynamically based on selection for demo purposes
  const dynamicStats = selectedBranch ? {
    ...DASHBOARD_STATS,
    totalRevenue: selectedBranch.id === 1 ? 45200000 : 32000000,
    activeBookings: selectedBranch.id === 1 ? 8 : 4,
    newRequests: filteredRequests.length,
    revenueChange: selectedBranch.id === 1 ? 12.5 : 8.2,
    bookingsChange: selectedBranch.id === 1 ? 5 : 2,
  } : {
    ...DASHBOARD_STATS,
    totalRevenue: 77200000,
    activeBookings: 12,
    newRequests: BOOKING_REQUESTS.length,
    revenueChange: 15.2,
    bookingsChange: 8,
  };

  return (
    <RentalLayout title="Dashboard Overview">
      {/* Welcome Message */}
      <div className="flex justify-between items-start mb-10 animate-in slide-in-from-left duration-700">
        <div>
          <h1 className="text-4xl font-black text-gray-900 mb-2 tracking-tight">Chào buổi sáng, Minh! 👋</h1>
          <p className="text-gray-500 font-medium">
            {selectedBranch
              ? `Đang hiển thị dữ liệu chi tiết cho ${selectedBranch.name}.`
              : "Here's what is happening with your training spaces today across all branches."}
          </p>
        </div>
        <button className="flex items-center gap-3 bg-red-500 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-red-200 hover:bg-red-600 transition-all active:scale-95">
          <Plus className="w-5 h-5" />
          Create Listing
        </button>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 animate-in fade-in duration-1000 delay-200">
        <StatsCards stats={dynamicStats} />
      </div>

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8 animate-in slide-in-from-bottom-4 duration-700 delay-300">

        {/* Main Revenue Chart (Spans 2 columns) */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-50 text-green-500 flex items-center justify-center">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-black text-gray-900 text-lg">
                  {selectedBranch ? 'Doanh thu chi nhánh (Tr Triệu VNĐ)' : 'Doanh thu toàn hệ thống (Tr Triệu VNĐ)'}
                </h2>
                <p className="text-xs font-bold text-gray-400">Thống kê 7 tháng gần nhất</p>
              </div>
            </div>
          </div>
          <div className="h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={
                selectedBranch
                  ? (selectedBranch.id === 1 ? MONTHLY_REVENUE_BRANCH_1 : MONTHLY_REVENUE_BRANCH_2)
                  : MONTHLY_REVENUE_ALL
              }>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 600 }} dx={-10} />
                <Tooltip
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                  itemStyle={{ color: '#111827' }}
                  formatter={(value) => [`${value} Tr`, 'Doanh thu']}
                />
                <Line type="monotone" dataKey="revenue" stroke="#ef4444" strokeWidth={4} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 8, strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Secondary Chart (Spans 1 column) */}
        <div className="lg:col-span-1 bg-white rounded-3xl border border-gray-100 p-6 shadow-sm flex flex-col">
          {!selectedBranch ? (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-black text-gray-900 text-lg">Tỷ trọng chi nhánh</h2>
                  <p className="text-xs font-bold text-gray-400">So sánh doanh thu (Tr Triệu VNĐ)</p>
                </div>
              </div>
              <div className="flex-1 min-h-[250px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={BRANCH_COMPARISON_DATA} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#4b5563', fontSize: 12, fontWeight: 700 }} width={80} />
                    <Tooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="revenue" fill="#3b82f6" radius={[0, 8, 8, 0]} barSize={32} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
                  <PieChartIcon className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-black text-gray-900 text-lg">Loại phòng đặt</h2>
                  <p className="text-xs font-bold text-gray-400">Phân bố theo nhu cầu (%)</p>
                </div>
              </div>
              <div className="flex-1 min-h-[250px] w-full mt-4 relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={selectedBranch?.id === 1 ? ROOM_USAGE_DATA_1 : ROOM_USAGE_DATA_2}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {(selectedBranch?.id === 1 ? ROOM_USAGE_DATA_1 : ROOM_USAGE_DATA_2).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Custom Legend */}
                <div className="absolute bottom-0 w-full flex justify-center gap-4 flex-wrap mt-2">
                  {(selectedBranch?.id === 1 ? ROOM_USAGE_DATA_1 : ROOM_USAGE_DATA_2).map((entry, index) => (
                    <div key={entry.name} className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <span className="text-[10px] font-bold text-gray-500">{entry.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Calendar and Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-4 duration-700 delay-500">
        {/* Calendar - 2 columns */}
        <div className="lg:col-span-2">
          <CalendarManagement events={filteredEvents} />
        </div>

        {/* Pending Requests - 1 column */}
        <div className="lg:col-span-1">
          <PendingRequests
            requests={filteredRequests}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        </div>
      </div>
    </RentalLayout>
  );
}
