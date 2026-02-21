import { RouteObject } from "react-router-dom";
import { HostDashboardPage } from "../features/host/pages/HostDashboardPage";
import { SpacesPage } from "../features/host/pages/SpacesPage";
import { ListSpacePage } from "../features/host/pages/ListSpacePage";
import { CalendarPage } from "../features/host/pages/CalendarPage";
import { FinancePage } from "../features/host/pages/FinancePage";
import { KycPage } from "../features/host/pages/KycPage";
import { StaffManagementPage } from "../features/host/pages/StaffManagementPage";
import { RoomStatusPage } from "../features/host/pages/RoomStatusPage";
import { SchedulePage } from "../features/host/pages/SchedulePage";
import { StaffCheckoutPage } from "../features/host/pages/StaffCheckoutPage";
import { AdsPage } from "../features/host/pages/AdsPage";
import { HostRegistrationPage } from "../features/host/pages/HostRegistrationPage";

export const rentalRoutes: RouteObject[] = [
    {
        path: '/rental',
        children: [
            { path: 'register', element: <HostRegistrationPage /> },
            { path: '', element: <HostDashboardPage /> },
            { path: 'dashboard', element: <HostDashboardPage /> },
            { path: 'spaces', element: <SpacesPage /> },
            { path: 'spaces/new', element: <ListSpacePage /> },
            { path: 'calendar', element: <CalendarPage /> },
            { path: 'finance', element: <FinancePage /> },
            // FR-01: KYC & Staff
            { path: 'kyc', element: <KycPage /> },
            { path: 'staff', element: <StaffManagementPage /> },
            // FR-03: Smart Scheduling
            { path: 'schedule', element: <SchedulePage /> },
            // FR-04: Staff Checkout
            { path: 'checkout', element: <StaffCheckoutPage /> },
            // FR-05: Ads
            { path: 'ads', element: <AdsPage /> },
            // FR-15: Room Status
            { path: 'room-status', element: <RoomStatusPage /> },
        ]
    }
];
