import { RouteObject } from 'react-router-dom';
import { HomePage } from '../features/customer/home';
import { SearchPage } from '../features/customer/search';
import { SpaceDetailPage } from '../features/customer/spaces';
import { AuthPage } from '../features/customer/auth';
import { ProfilePage, EkycPage } from '../features/customer/profile';
import { BookingsPage, BookingDetailPage } from '../features/customer/bookings';
import { CheckoutPage } from '../features/customer/checkout';
import { FavoritesPage } from '../features/customer/favorites';
import { MessagesPage } from '../features/customer/messages';
import { HelpPage } from '../features/customer/help';
import { NotificationsPage } from '../features/customer/notifications/pages/NotificationsPage';
import { TransactionHistoryPage } from '../features/customer/transactions/pages/TransactionHistoryPage';

export const customerRoutes: RouteObject[] = [
    { path: '/', element: <HomePage /> },
    { path: '/search', element: <SearchPage /> },
    { path: '/spaces/:id', element: <SpaceDetailPage /> },
    { path: '/auth', element: <AuthPage /> },
    { path: '/profile', element: <ProfilePage /> },
    { path: '/ekyc', element: <EkycPage /> },           // FR-07: eKYC xác thực danh tính
    { path: '/bookings', element: <BookingsPage /> },
    { path: '/bookings/:id', element: <BookingDetailPage /> }, // FR-09: Chi tiết + QR + Chat
    { path: '/checkout', element: <CheckoutPage /> },    // FR-08: Đặt phòng & Thanh toán
    { path: '/favorites', element: <FavoritesPage /> },
    { path: '/messages', element: <MessagesPage /> },
    { path: '/notifications', element: <NotificationsPage /> },
    { path: '/transactions', element: <TransactionHistoryPage /> },
    { path: '/help', element: <HelpPage /> },
];
