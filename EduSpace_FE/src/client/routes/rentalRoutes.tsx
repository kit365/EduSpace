import { useEffect, useState } from "react";
import { Navigate, RouteObject } from "react-router-dom";
import { HostDashboardPage } from "../features/host/pages/HostDashboardPage";
import { SpacesPage } from "../features/host/pages/SpacesPage";
import { BranchesPage } from "../features/host/pages/BranchesPage";
import { ListSpacePage } from "../features/host/pages/ListSpacePage";
import { RentalSpacesNewRedirect } from "../features/host/pages/RentalSpacesNewRedirect";
import { CalendarPage } from "../features/host/pages/CalendarPage";
import { FinancePage } from "../features/host/pages/FinancePage";
import { KycPage } from "../features/host/pages/KycPage";
import { StaffManagementPage } from "../features/host/pages/StaffManagementPage";
import { RoomStatusPage } from "../features/host/pages/RoomStatusPage";
import { RoomLockPage } from "../features/host/pages/RoomLockPage";
import { SchedulePage } from "../features/host/pages/SchedulePage";
import { StaffCheckoutPage } from "../features/host/pages/StaffCheckoutPage";
import { HostRegistrationPage } from "../features/host/pages/HostRegistrationPage";
import { HostMessagesPage } from "../features/host/pages/HostMessagesPage";
import { HostProfilePage } from "../features/host/profile/pages/HostProfilePage";
import { HostSettingsPage } from "../features/host/settings/pages/HostSettingsPage";
import { RoomTypesPage } from "../features/host/pages/RoomTypesPage";
import { RoomTypeFormPage } from "../features/host/pages/RoomTypeFormPage";
import { HostSpaceDetailsPage } from "../features/host/pages/HostSpaceDetailsPage";
import { UtilityPriceManagementPage } from "../features/host/pages/UtilityPriceManagementPage";
import { DepositRefundPolicyManagementPage } from "../features/host/pages/DepositRefundPolicyManagementPage";
import { useAuthStore } from "@/stores/authStore";
import { canAccessHostConsole, getRealmRolesFromAccessToken, hasHostPermission } from "@/utils/keycloakTokenRoles";
import { refreshHostPermissionsFromAccount } from "@/utils/refreshHostPermissionsFromAccount";
import { hostMenuPermissions } from "../features/host/permissions/hostPermissions";
import { hostPermissions } from "../features/host/permissions/hostPermissions";

const hostHomeCandidates = [
    { path: '/rental/dashboard', permission: hostMenuPermissions.dashboard },
    { path: '/rental/spaces', permission: hostMenuPermissions.spaces },
    { path: '/rental/branches', permission: hostMenuPermissions.branches },
    { path: '/rental/messages', permission: hostMenuPermissions.messages },
    { path: '/rental/utility-prices', permission: hostMenuPermissions.utility },
    { path: '/rental/deposit-policy', permission: hostMenuPermissions.depositPolicy },
    { path: '/rental/finance', permission: hostMenuPermissions.finance },
] as const;

function resolveHostHomePath(accessToken: string | null, hostPermissionsFromAccount?: string[] | null): string {
    for (const item of hostHomeCandidates) {
        if (hasHostPermission(accessToken, item.permission, hostPermissionsFromAccount)) {
            return item.path;
        }
    }
    const roles = getRealmRolesFromAccessToken(accessToken);
    if (canAccessHostConsole(roles)) {
        return '/rental/dashboard';
    }
    return '/rental/register';
}

function PermissionGate({
    permission,
    element,
}: {
    permission: string;
    element: JSX.Element;
}) {
    const accessToken = useAuthStore((s) => s.accessToken);
    const hostPermissionsFromAccount = useAuthStore((s) => s.hostPermissionsFromAccount);
    const [ready, setReady] = useState(() => !useAuthStore.getState().accessToken);

    useEffect(() => {
        let cancelled = false;
        const ensure = async () => {
            if (!accessToken) {
                setReady(true);
                return;
            }
            await refreshHostPermissionsFromAccount();
            if (!cancelled) setReady(true);
        };

        void ensure();
        return () => {
            cancelled = true;
        };
    }, [accessToken]);

    if (!ready) {
        return <div className="p-6 text-sm text-gray-500">Đang tải quyền...</div>;
    }

    if (!hasHostPermission(accessToken, permission, hostPermissionsFromAccount)) {
        return <Navigate to={resolveHostHomePath(accessToken, hostPermissionsFromAccount)} replace />;
    }
    return element;
}

function HostConsoleGate({ element }: { element: JSX.Element }) {
    const accessToken = useAuthStore((s) => s.accessToken);
    const roles = getRealmRolesFromAccessToken(accessToken);
    if (!canAccessHostConsole(roles)) {
        return <Navigate to="/rental/register" replace />;
    }
    return element;
}

function HostConsoleHomeRedirect() {
    const accessToken = useAuthStore((s) => s.accessToken);
    const hostPermissionsFromAccount = useAuthStore((s) => s.hostPermissionsFromAccount);
    const [ready, setReady] = useState(() => !useAuthStore.getState().accessToken);

    useEffect(() => {
        let cancelled = false;
        const ensure = async () => {
            if (!accessToken) {
                setReady(true);
                return;
            }
            await refreshHostPermissionsFromAccount();
            if (!cancelled) setReady(true);
        };

        void ensure();
        return () => {
            cancelled = true;
        };
    }, [accessToken]);

    if (!ready) {
        return <div className="p-6 text-sm text-gray-500">Đang tải quyền...</div>;
    }

    return <Navigate to={resolveHostHomePath(accessToken, hostPermissionsFromAccount)} replace />;
}

export const rentalRoutes: RouteObject[] = [
    {
        path: '/rental',
        children: [
            { path: 'register', element: <HostRegistrationPage /> },
            { path: '', element: <HostConsoleGate element={<HostConsoleHomeRedirect />} /> },
            {
                path: 'dashboard',
                element: <HostConsoleGate element={<PermissionGate permission={hostMenuPermissions.dashboard} element={<HostDashboardPage />} />} />,
            },
            {
                path: 'branches',
                element: <HostConsoleGate element={<PermissionGate permission={hostMenuPermissions.branches} element={<BranchesPage />} />} />,
            },
            {
                path: 'spaces',
                element: <HostConsoleGate element={<PermissionGate permission={hostMenuPermissions.spaces} element={<SpacesPage />} />} />,
            },
            { path: 'room-types', element: <HostConsoleGate element={<RoomTypesPage />} /> },
            { path: 'room-types/new', element: <HostConsoleGate element={<RoomTypeFormPage />} /> },
            { path: 'room-types/edit/:id', element: <HostConsoleGate element={<RoomTypeFormPage />} /> },
            {
                path: 'spaces/new',
                element: <HostConsoleGate element={<PermissionGate permission={hostPermissions.room.create} element={<RentalSpacesNewRedirect />} />} />,
            },
            {
                path: 'spaces/edit/:id',
                element: <HostConsoleGate element={<PermissionGate permission={hostPermissions.room.edit} element={<ListSpacePage />} />} />,
            },
            {
                path: 'spaces/:id',
                element: <HostConsoleGate element={<PermissionGate permission={hostPermissions.room.view} element={<HostSpaceDetailsPage />} />} />,
            },
            {
                path: 'calendar',
                element: <HostConsoleGate element={<PermissionGate permission={hostMenuPermissions.calendar} element={<CalendarPage />} />} />,
            },
            {
                path: 'messages',
                element: (
                    <HostConsoleGate
                        element={<PermissionGate permission={hostPermissions.messages.view} element={<HostMessagesPage />} />}
                    />
                ),
            },
            {
                path: 'finance',
                element: (
                    <HostConsoleGate
                        element={<PermissionGate permission={hostMenuPermissions.finance} element={<FinancePage />} />}
                    />
                ),
            },
            {
                path: 'utility-prices',
                element: (
                    <HostConsoleGate
                        element={<PermissionGate permission={hostMenuPermissions.utility} element={<UtilityPriceManagementPage />} />}
                    />
                ),
            },
            {
                path: 'deposit-policy',
                element: (
                    <HostConsoleGate
                        element={<PermissionGate permission={hostMenuPermissions.depositPolicy} element={<DepositRefundPolicyManagementPage />} />}
                    />
                ),
            },
            {
                path: 'kyc',
                element: <HostConsoleGate element={<PermissionGate permission={hostMenuPermissions.kyc} element={<KycPage />} />} />,
            },
            {
                path: 'staff',
                element: <HostConsoleGate element={<PermissionGate permission={hostMenuPermissions.staff} element={<StaffManagementPage />} />} />,
            },
            {
                path: 'schedule',
                element: <HostConsoleGate element={<PermissionGate permission={hostMenuPermissions.schedule} element={<SchedulePage />} />} />,
            },
            {
                path: 'checkout',
                element: (
                    <HostConsoleGate
                        element={<PermissionGate permission={hostMenuPermissions.checkout} element={<StaffCheckoutPage />} />}
                    />
                ),
            },
            {
                path: 'room-status',
                element: <HostConsoleGate element={<PermissionGate permission={hostMenuPermissions.roomStatus} element={<RoomStatusPage />} />} />,
            },
            { path: 'room-lock', element: <HostConsoleGate element={<RoomLockPage />} /> },
            { path: 'profile', element: <HostConsoleGate element={<HostProfilePage />} /> },
            { path: 'settings', element: <HostConsoleGate element={<HostSettingsPage />} /> },
        ]
    }
];
