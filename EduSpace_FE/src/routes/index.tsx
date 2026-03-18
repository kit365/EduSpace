import { createBrowserRouter, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { customerRoutes, rentalRoutes } from '../client/routes';
import { SpaceDetailPage } from '../client/features/customer/spaces';
import { adminRoutes } from '../admin/routes';
import { RoleSwitcher, type UserRole } from '../components/common/RoleSwitcher';
import { useMemo } from 'react';
import { Toaster } from '../components/ui/sonner';
import { useAuthStore } from '../stores/authStore';
import {
    canAccessAdminPortal,
    canAccessHostConsole,
    getRealmRolesFromAccessToken,
} from '../utils/keycloakTokenRoles';

const RootLayout = () => {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const accessToken = useAuthStore((s) => s.accessToken);
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

    const realmRoles = useMemo(() => getRealmRolesFromAccessToken(accessToken), [accessToken]);
    const allowedModes = useMemo((): UserRole[] => {
        const modes: UserRole[] = ['user'];
        if (isAuthenticated && canAccessHostConsole(realmRoles)) {
            modes.push('host');
        }
        if (isAuthenticated && canAccessAdminPortal(realmRoles)) {
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
        else if (newRole === 'host') navigate('/rental');
        else navigate('/');
    };

    return (
        <>
            <Outlet />
            <RoleSwitcher
                currentRole={currentRole}
                onRoleChange={handleRoleChange}
                allowedModes={allowedModes}
            />
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
