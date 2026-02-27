import { AdminLayout } from '../../../layouts/AdminLayout';
import {
    User, Shield, CreditCard, Activity, TrendingUp,
    Calendar, AlertCircle, CheckCircle, ArrowUpRight,
    ArrowDownRight, Users, Building2, Star
} from 'lucide-react';
import { useState, useEffect } from 'react';
import {
    ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
    CartesianGrid, Tooltip, BarChart, Bar, Cell,
    PieChart, Pie, Legend, ComposedChart, Line
} from 'recharts';

interface Log {
    id: string;
    action: string;
    user: string;
    time: string;
    status: 'Success' | 'Warning' | 'Error';
    category: 'Security' | 'Finance' | 'Operations';
}

const REVENUE_DATA = [
    { name: 'Tháng 1', revenue: 32000, users: 120 },
    { name: 'Tháng 2', revenue: 38000, users: 150 },
    { name: 'Tháng 3', revenue: 35000, users: 145 },
    { name: 'Tháng 4', revenue: 42000, users: 180 },
    { name: 'Tháng 5', revenue: 48000, users: 210 },
    { name: 'Tháng 6', revenue: 45230, users: 220 },
];

const SPACE_TYPE_DATA = [
    { name: 'Lớp học', value: 45, color: '#3B82F6' },
    { name: 'Phòng máy', value: 25, color: '#10B981' },
    { name: 'Phòng họp', value: 20, color: '#8B5CF6' },
    { name: 'Hội trường', value: 10, color: '#F59E0B' },
];

export function DashboardPage() {
    const [logs, setLogs] = useState<Log[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate API call
        setTimeout(() => {
            setLogs([
                { id: '1', action: 'Renter đăng nhập', user: 'Nguyễn Văn Minh', time: '2 phút trước', status: 'Success', category: 'Security' },
                { id: '2', action: 'Host gửi listing mới', user: 'Trần Thị Bích Ngọc', time: '15 phút trước', status: 'Success', category: 'Operations' },
                { id: '3', action: 'Admin duyệt KYC', user: 'Lê Hoàng Quân', time: '1 giờ trước', status: 'Success', category: 'Security' },
                { id: '4', action: 'Booking #EDU-0045 thất bại', user: 'Phạm Đức Anh', time: '2 giờ trước', status: 'Warning', category: 'Finance' },
                { id: '5', action: 'Yêu cầu thanh toán mới', user: 'Võ Minh Tuấn', time: '3 giờ trước', status: 'Success', category: 'Finance' },
            ]);
            setLoading(false);
        }, 600);
    }, []);

    const stats = [
        { label: 'Tổng người dùng', value: '1,234', change: '+12.5%', trend: 'up', icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
        { label: 'Host hoạt động', value: '56', change: '+4.2%', trend: 'up', icon: Shield, color: 'text-green-500', bg: 'bg-green-50' },
        { label: 'Tổng doanh thu', value: '$45,230', change: '+8.1%', trend: 'up', icon: CreditCard, color: 'text-purple-500', bg: 'bg-purple-50' },
        { label: 'Tổng lượt đặt', value: '892', change: '+15.3%', trend: 'up', icon: Calendar, color: 'text-indigo-500', bg: 'bg-indigo-50' },
        { label: 'KYC chờ duyệt', value: '3', change: '-2', trend: 'down', icon: AlertCircle, color: 'text-orange-500', bg: 'bg-orange-50' },
        { label: 'Tin đăng mới', value: '12', change: '+5', trend: 'up', icon: Building2, color: 'text-pink-500', bg: 'bg-pink-50' },
        { label: 'Tỷ lệ thành công', value: '98.5%', change: '+0.2%', trend: 'up', icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50' },
        { label: 'Sức khỏe hệ thống', value: 'Tối ưu', change: '99%', trend: 'up', icon: Activity, color: 'text-cyan-500', bg: 'bg-cyan-50' },
    ];

    return (
        <AdminLayout title="Trung tâm Kiểm soát Hệ thống">
            {/* Top Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-2xl ${stat.bg}`}>
                                <stat.icon className={`w-6 h-6 ${stat.color}`} />
                            </div>
                            <div className={`flex items-center gap-1 text-xs font-black px-2.5 py-1 rounded-full ${stat.trend === 'up' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
                                {stat.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                {stat.change}
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <h3 className="text-3xl font-black text-gray-900 tracking-tight mb-1">{stat.value}</h3>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.1em]">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                {/* Main Growth Chart */}
                <div className="lg:col-span-2 bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-black text-gray-900 tracking-tight">Tăng trưởng Nền tảng</h3>
                            <p className="text-sm font-medium text-gray-400">Doanh thu hàng tháng vs Người dùng mới</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-blue-500" />
                                <span className="text-xs font-bold text-gray-500">Doanh thu</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-indigo-500" />
                                <span className="text-xs font-bold text-gray-500">Người dùng</span>
                            </div>
                        </div>
                    </div>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={REVENUE_DATA}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fontWeight: 600, fill: '#94A3B8' }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fontWeight: 600, fill: '#94A3B8' }}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                                <Line type="monotone" dataKey="users" stroke="#6366F1" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Market Composition */}
                <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
                    <h3 className="text-xl font-black text-gray-900 tracking-tight mb-2">Cơ cấu Thị trường</h3>
                    <p className="text-sm font-medium text-gray-400 mb-8">Các loại không gian được niêm yết</p>
                    <div className="h-[250px] w-full mb-6">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={SPACE_TYPE_DATA}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {SPACE_TYPE_DATA.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="space-y-3">
                        {SPACE_TYPE_DATA.map((item, i) => (
                            <div key={i} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                                    <span className="text-sm font-bold text-gray-600">{item.name}</span>
                                </div>
                                <span className="text-sm font-black text-gray-900">{item.value}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Pending Approvals */}
                <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-black text-gray-900 tracking-tight">Yêu cầu xét duyệt</h3>
                            <p className="text-sm font-medium text-gray-400">Duyệt KYC và Listing mới của Host</p>
                        </div>
                        <button className="text-sm font-bold text-blue-600 hover:underline">Tất cả</button>
                    </div>
                    <div className="space-y-4">
                        {[
                            { name: 'Nguyễn Thanh Hằng', type: 'KYC Host', time: '10 phút trước', avatar: 'N' },
                            { name: 'Bùi Anh Tuấn', type: 'Listing: Luxury Lab Q.7', time: '1 giờ trước', avatar: 'B' },
                            { name: 'Hoàng Thùy Linh', type: 'KYC Host', time: '3 giờ trước', avatar: 'H' },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl hover:border-blue-200 transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-gray-900 text-white rounded-xl flex items-center justify-center font-black">{item.avatar}</div>
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-900">{item.name}</h4>
                                        <p className="text-xs font-medium text-gray-400">{item.type} · {item.time}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="px-3 py-1.5 bg-green-500 text-white text-[10px] font-black rounded-lg uppercase tracking-wider hover:bg-green-600">Duyệt</button>
                                    <button className="px-3 py-1.5 bg-gray-100 text-gray-400 text-[10px] font-black rounded-lg uppercase tracking-wider hover:bg-gray-200">Từ chối</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Hosts Leaderboard */}
                <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-black text-gray-900 tracking-tight">Top Host hiệu quả cao</h3>
                            <p className="text-sm font-medium text-gray-400">Dựa trên doanh thu và tỷ lệ lấp đầy</p>
                        </div>
                        <div className="p-2 bg-amber-50 rounded-xl">
                            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                        </div>
                    </div>
                    <div className="space-y-4">
                        {[
                            { name: 'Trần Thị Bích Ngọc', revenue: '$12,450', stats: '92% Lấp đầy', trend: '+12%', color: 'border-blue-500' },
                            { name: 'Lê Hoàng Quân', revenue: '$9,800', stats: '88% Lấp đầy', trend: '+5%', color: 'border-purple-500' },
                            { name: 'Võ Minh Tuấn', revenue: '$8,200', stats: '85% Lấp đầy', trend: '+2%', color: 'border-green-500' },
                            { name: 'Phạm Đức Anh', revenue: '$7,900', stats: '82% Lấp đầy', trend: '+8%', color: 'border-indigo-500' },
                        ].map((host, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-gray-200 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className={`w-1 font-black h-8 bg-blue-500 rounded-full`} />
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-900">{host.name}</h4>
                                        <p className="text-xs font-medium text-gray-500">{host.stats}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-black text-gray-900">{host.revenue}</div>
                                    <div className="text-[10px] font-bold text-green-500">{host.trend} tháng này</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* System Activity Feed */}
            <div className="mt-10 bg-white rounded-[32px] border border-gray-100 shadow-sm p-8">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-black text-gray-900 tracking-tight">Activity Stream</h3>
                    <div className="flex gap-2">
                        {['All', 'Finance', 'Operations', 'Security'].map(cat => (
                            <button key={cat} className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${cat === 'All' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}>
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="space-y-2">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Activity className="w-8 h-8 text-gray-200 animate-pulse" />
                        </div>
                    ) : (
                        logs.map(log => (
                            <div key={log.id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-[20px] transition-all group border border-transparent hover:border-gray-100">
                                <div className="flex items-center gap-6">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${log.category === 'Security' ? 'bg-blue-50 text-blue-500' :
                                        log.category === 'Finance' ? 'bg-purple-50 text-purple-500' :
                                            'bg-green-50 text-green-500'
                                        }`}>
                                        {log.category === 'Security' ? <Shield className="w-5 h-5" /> :
                                            log.category === 'Finance' ? <CreditCard className="w-5 h-5" /> :
                                                <Building2 className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 text-sm flex items-center gap-2">
                                            {log.action}
                                            {log.status === 'Warning' && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />}
                                        </p>
                                        <p className="text-xs text-gray-500 font-medium tracking-tight">User: <span className="text-gray-900 font-bold">{log.user}</span> · {log.category}</p>
                                    </div>
                                </div>
                                <div className="text-right flex flex-col items-end">
                                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest leading-none mb-1">{log.time}</span>
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                        <button className="text-[10px] font-black text-blue-600 hover:underline">Details</button>
                                        <button className="text-[10px] font-black text-gray-400 hover:text-gray-900">Archive</button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
