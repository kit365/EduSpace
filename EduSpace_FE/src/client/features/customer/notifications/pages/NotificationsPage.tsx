import { CustomerLayout } from '../../../../layouts/CustomerLayout';
import { Bell, CheckCircle2, AlertCircle, Info, Settings } from 'lucide-react';
import { useState } from 'react';

const MOCK_NOTIFICATIONS = [
    {
        id: 1,
        title: 'Đặt phòng thành công',
        message: 'Phòng Meeting Room A đã được xác nhận cho ngày mai. Vui lòng đến đúng giờ.',
        time: '5 phút trước',
        date: 'Hôm nay',
        type: 'success',
        isRead: false,
    },
    {
        id: 2,
        title: 'Sắp đến giờ học',
        message: 'Đơn đặt phòng của bạn tại Workshop Space C sẽ bắt đầu sau 30 phút nữa.',
        time: '2 giờ trước',
        date: 'Hôm nay',
        type: 'warning',
        isRead: false,
    },
    {
        id: 3,
        title: 'Đánh giá chuyến đi',
        message: 'Bạn cảm thấy thế nào về không gian vừa trải nghiệm tại Study Hub? Hãy để lại đánh giá nhé!',
        time: '1 ngày trước',
        date: 'Hôm qua',
        type: 'info',
        isRead: true,
    },
    {
        id: 4,
        title: 'Hệ thống bảo trì',
        message: 'Hệ thống sẽ bảo trì từ 00:00 đến 02:00 ngày 28/02. Việc đặt phòng trong khoảng thời gian này có thể bị gián đoạn.',
        time: '2 ngày trước',
        date: 'Hôm qua',
        type: 'info',
        isRead: true,
    }
];

export function NotificationsPage() {
    const [activeTab, setActiveTab] = useState('all');
    const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

    const filterNotifications = () => {
        if (activeTab === 'unread') return notifications.filter(n => !n.isRead);
        return notifications;
    };

    const markAllAsRead = () => {
        setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'success': return <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center"><CheckCircle2 className="w-5 h-5 text-green-600" /></div>;
            case 'warning': return <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center"><AlertCircle className="w-5 h-5 text-amber-600" /></div>;
            default: return <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center"><Info className="w-5 h-5 text-blue-600" /></div>;
        }
    };

    const filtered = filterNotifications();

    return (
        <CustomerLayout>
            <div className="min-h-screen bg-gray-50 py-10 animate-in fade-in duration-700">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                                <Bell className="w-8 h-8 text-indigo-500" /> Thông báo
                            </h1>
                            <p className="text-gray-500 font-medium mt-2">Cập nhật thông tin đặt phòng và tin tức từ hệ thống</p>
                        </div>

                        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors shadow-sm self-start md:self-auto">
                            <Settings className="w-4 h-4" /> Cài đặt
                        </button>
                    </div>

                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                        {/* Header / Tabs */}
                        <div className="flex items-center justify-between border-b border-gray-100 p-4 sm:px-6">
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setActiveTab('all')}
                                    className={`text-sm font-black pb-4 -mb-4 border-b-2 transition-all ${activeTab === 'all' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-400 hover:text-gray-700'}`}
                                >
                                    Tất cả
                                </button>
                                <button
                                    onClick={() => setActiveTab('unread')}
                                    className={`text-sm font-black pb-4 -mb-4 border-b-2 transition-all flex items-center gap-1 ${activeTab === 'unread' ? 'border-indigo-500 text-indigo-500' : 'border-transparent text-gray-400 hover:text-gray-700'}`}
                                >
                                    Chưa đọc
                                    <span className="bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                                        {notifications.filter(n => !n.isRead).length}
                                    </span>
                                </button>
                            </div>
                            <button
                                onClick={markAllAsRead}
                                className="text-xs font-bold text-indigo-500 hover:text-indigo-700"
                            >
                                Đánh dấu tất cả đã đọc
                            </button>
                        </div>

                        {/* List */}
                        <div className="divide-y divide-gray-50">
                            {filtered.length === 0 ? (
                                <div className="p-12 text-center">
                                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Bell className="w-10 h-10 text-gray-300" />
                                    </div>
                                    <h3 className="font-black text-gray-900 mb-2">Không có thông báo nào</h3>
                                    <p className="text-sm font-medium text-gray-500">Bạn đã xem hết tất cả thông báo.</p>
                                </div>
                            ) : (
                                filtered.map((notif) => (
                                    <div
                                        key={notif.id}
                                        className={`flex items-start gap-4 p-4 sm:p-6 transition-colors hover:bg-gray-50 group cursor-pointer ${!notif.isRead ? 'bg-indigo-50/20' : ''}`}
                                    >
                                        <div className="flex-shrink-0 mt-1">
                                            {getIcon(notif.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className={`text-base truncate pr-4 transition-colors group-hover:text-indigo-600 ${!notif.isRead ? 'font-black text-gray-900' : 'font-bold text-gray-700'}`}>
                                                    {notif.title}
                                                </h4>
                                                <span className="text-[11px] font-bold text-gray-400 whitespace-nowrap mt-1">
                                                    {notif.time}
                                                </span>
                                            </div>
                                            <p className={`text-sm tracking-wide leading-relaxed ${!notif.isRead ? 'font-medium text-gray-800' : 'text-gray-500'}`}>
                                                {notif.message}
                                            </p>
                                        </div>
                                        {!notif.isRead && (
                                            <div className="w-3 h-3 bg-indigo-500 rounded-full flex-shrink-0 mt-2 shadow-sm shadow-indigo-200"></div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </CustomerLayout>
    );
}
