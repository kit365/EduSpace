import { RouteObject } from "react-router-dom";
import { HostDashboardPage } from "../features/host/pages/HostDashboardPage";
import { SpacesPage } from "../features/host/pages/SpacesPage";
import { BranchesPage } from "../features/host/pages/BranchesPage";
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
import { HostProfilePage } from "../features/host/profile/pages/HostProfilePage";
import { HostSettingsPage } from "../features/host/settings/pages/HostSettingsPage";
import { RoomTypesPage } from "../features/host/pages/RoomTypesPage";
import { RoomTypeFormPage } from "../features/host/pages/RoomTypeFormPage";
import { HostSpaceDetailsPage } from "../features/host/pages/HostSpaceDetailsPage";

export const rentalRoutes: RouteObject[] = [
    {
        path: '/rental',
        children: [
            { path: 'register', element: <HostRegistrationPage /> },
            { path: '', element: <HostDashboardPage /> },
            { path: 'dashboard', element: <HostDashboardPage /> },
            { path: 'branches', element: <BranchesPage /> },
            { path: 'spaces', element: <SpacesPage /> },
            { path: 'room-types', element: <RoomTypesPage /> },
            { path: 'room-types/new', element: <RoomTypeFormPage /> },
            { path: 'room-types/edit/:id', element: <RoomTypeFormPage /> },
            { path: 'spaces/new', element: <ListSpacePage /> },
            { path: 'spaces/edit/:id', element: <ListSpacePage /> },
            { path: 'spaces/:id', element: <HostSpaceDetailsPage /> },
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
            // Host Profile
            { path: 'profile', element: <HostProfilePage /> },
            // Host Settings
            { path: 'settings', element: <HostSettingsPage /> },
        ]
    }
];
