import { createBrowserRouter, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { customerRoutes, rentalRoutes } from '../client/routes';
import { SpaceDetailPage } from '../client/features/customer/spaces';
import { adminRoutes } from '../admin/routes';
import { RoleSwitcher, type UserRole } from '../components/common/RoleSwitcher';
import { useMemo } from 'react';
import { useAuthStore } from '../stores/authStore';
import {
    canAccessAdminPortal,
    canAccessHostConsole,
    getRealmRolesFromAccessToken,
} from '../utils/keycloakTokenRoles';
import { ChatInboxNotificationBridge } from '../components/chat/ChatInboxNotificationBridge';

const RootLayout = () => {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const accessToken = useAuthStore((s) => s.accessToken);
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

    const realmRoles = useMemo(() => getRealmRolesFromAccessToken(accessToken), [accessToken]);
    const allowedModes = useMemo((): UserRole[] => {
        const modes: UserRole[] = ['user'];
        const isAdmin = isAuthenticated && canAccessAdminPortal(realmRoles);

        if (isAuthenticated && canAccessHostConsole(realmRoles) && !isAdmin) {
            modes.push('host');
        }
        if (isAdmin) {
            modes.push('admin');
        }
        return modes;
    }, [isAuthenticated, realmRoles]);

    const currentRole: UserRole = pathname.startsWith('/admin')
        ? 'admin'
        : pathname.startsWith('/rental')
          ? 'host'
          : 'user';

    const handleRoleChange = (newRole: UserRole) => {
        if (!allowedModes.includes(newRole)) return;
        if (newRole === 'admin') navigate('/admin');
        else if (newRole === 'host') navigate('/rental/dashboard');
        else navigate('/');
    };

    return (
        <>
            <ChatInboxNotificationBridge />
            <Outlet />
            {pathname !== '/messages' && !pathname.startsWith('/rental') && (
                <RoleSwitcher
                    currentRole={currentRole}
                    onRoleChange={handleRoleChange}
                    allowedModes={allowedModes}
                />
            )}
        </>
    );
};

export const router = createBrowserRouter([
    {
        path: '/',
        element: <RootLayout />,
        children: [
            ...customerRoutes,
            ...rentalRoutes,
            ...adminRoutes,
            { path: ':spaceRef', element: <SpaceDetailPage /> },
            {
                path: '*',
                element: <Navigate to="/" replace />,
            }
        ]
    }
]);
