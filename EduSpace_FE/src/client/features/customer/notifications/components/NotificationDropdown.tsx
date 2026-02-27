import { Bell, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../../../../../components/ui/dropdown-menu";

const MOCK_NOTIFICATIONS = [
    {
        id: 1,
        title: 'Đặt phòng thành công',
        message: 'Phòng Meeting Room A đã được xác nhận cho ngày mai.',
        time: '5 phút trước',
        type: 'success',
        isRead: false,
    },
    {
        id: 2,
        title: 'Sắp đến giờ học',
        message: 'Đơn đặt phòng của bạn sẽ bắt đầu sau 30 phút nữa.',
        time: '2 giờ trước',
        type: 'warning',
        isRead: false,
    },
    {
        id: 3,
        title: 'Đánh giá chuyến đi',
        message: 'Bạn cảm thấy thế nào về không gian vừa trải nghiệm? Hãy để lại đánh giá nhé!',
        time: '1 ngày trước',
        type: 'info',
        isRead: true,
    }
];

export function NotificationDropdown() {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const markAllAsRead = () => {
        setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'success': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
            case 'warning': return <AlertCircle className="w-5 h-5 text-amber-500" />;
            default: return <Info className="w-5 h-5 text-blue-500" />;
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="w-11 h-11 flex items-center justify-center rounded-xl hover:bg-white hover:shadow-sm transition-all text-gray-400 hover:text-indigo-500 relative focus:outline-none">
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-gray-50 flex items-center justify-center text-[10px] text-white font-bold leading-none"></span>
                    )}
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-80 rounded-2xl align-end bg-white border-gray-100 shadow-xl" align="end">
                <div className="flex items-center justify-between p-4 pb-2">
                    <DropdownMenuLabel className="font-black text-gray-900 m-0 p-0 text-lg">Thông báo</DropdownMenuLabel>
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllAsRead}
                            className="text-xs font-bold text-indigo-500 hover:text-indigo-700 transition-colors"
                        >
                            Đánh dấu đã đọc
                        </button>
                    )}
                </div>

                <DropdownMenuSeparator className="bg-gray-100 mb-2" />

                <DropdownMenuGroup className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="p-6 text-center text-sm text-gray-400 font-medium">Không có thông báo mới</div>
                    ) : (
                        notifications.map((notif) => (
                            <DropdownMenuItem
                                key={notif.id}
                                className={`flex items-start gap-3 p-3 m-2 rounded-xl cursor-pointer transition-colors ${notif.isRead ? 'opacity-70 hover:bg-gray-50' : 'bg-indigo-50/50 hover:bg-indigo-50'}`}
                                onClick={() => navigate('/notifications')}
                            >
                                <div className="mt-0.5 flex-shrink-0">
                                    {getIcon(notif.type)}
                                </div>
                                <div className="flex-1 space-y-1">
                                    <p className={`text-sm tracking-tight ${notif.isRead ? 'font-bold text-gray-700' : 'font-black text-gray-900'}`}>
                                        {notif.title}
                                    </p>
                                    <p className="text-xs font-medium text-gray-500 line-clamp-2">
                                        {notif.message}
                                    </p>
                                    <p className="text-[10px] font-bold text-gray-400">
                                        {notif.time}
                                    </p>
                                </div>
                                {!notif.isRead && (
                                    <div className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0 mt-1.5" />
                                )}
                            </DropdownMenuItem>
                        ))
                    )}
                </DropdownMenuGroup>

                <DropdownMenuSeparator className="bg-gray-100 mt-2" />

                <div className="p-2">
                    <button
                        onClick={() => navigate('/notifications')}
                        className="w-full py-2.5 text-sm font-black text-indigo-500 hover:bg-indigo-50 rounded-xl transition-colors"
                    >
                        Xem tất cả
                    </button>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
