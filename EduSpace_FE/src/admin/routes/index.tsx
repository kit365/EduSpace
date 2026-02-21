import { RouteObject } from 'react-router-dom';

// ─── Feature Imports (Feature-Based Architecture) ─────────────────────
import { DashboardPage } from '../features/dashboard';
import { UserManagementPage, RoleManagementPage } from '../features/user-management';
import { HostManagementPage } from '../features/host-management';
import { VerificationPage } from '../features/host-approvals';
import { FinancePayoutsPage, TransactionManagementPage } from '../features/finance';
import { DisputesPage } from '../features/disputes';
import { SystemSettingsPage, SystemLogsPage } from '../features/system';
import { RoomManagementPage } from '../features/room-management';
import { BookingManagementPage } from '../features/bookings';
import { ReviewManagementPage } from '../features/reviews';
import { AdsManagementPage } from '../features/ads';
import { FacilityManagementPage } from '../features/facilities';
import { PointManagementPage } from '../features/points';

export const adminRoutes: RouteObject[] = [
    {
        path: '/admin',
        children: [
            // ─── Dashboard ────────────────────────────────────
            { path: '', element: <DashboardPage /> },
            { path: 'dashboard', element: <DashboardPage /> },

            // ─── Host Management ──────────────────────────────
            { path: 'hosts', element: <HostManagementPage /> },
            { path: 'verification', element: <VerificationPage /> },

            // ─── Finance ──────────────────────────────────────
            { path: 'finance', element: <FinancePayoutsPage /> },
            { path: 'transactions', element: <TransactionManagementPage /> },

            // ─── Operations ───────────────────────────────────
            { path: 'disputes', element: <DisputesPage /> },
            { path: 'bookings', element: <BookingManagementPage /> },
            { path: 'rooms', element: <RoomManagementPage /> },
            { path: 'reviews', element: <ReviewManagementPage /> },

            // ─── Users & Access ───────────────────────────────
            { path: 'users', element: <UserManagementPage /> },
            { path: 'roles', element: <RoleManagementPage /> },

            // ─── Platform ─────────────────────────────────────
            { path: 'facilities', element: <FacilityManagementPage /> },
            { path: 'ads', element: <AdsManagementPage /> },
            { path: 'points', element: <PointManagementPage /> },

            // ─── System ───────────────────────────────────────
            { path: 'settings', element: <SystemSettingsPage /> },
            { path: 'logs', element: <SystemLogsPage /> },
        ]
    }
];
