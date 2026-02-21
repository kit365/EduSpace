import { createBrowserRouter, Navigate, Outlet, useNavigate } from 'react-router-dom';
import { customerRoutes, rentalRoutes } from '../client/routes';
import { adminRoutes } from '../admin/routes';
import { RoleSwitcher } from '../components/common/RoleSwitcher';
import { useState } from 'react';

const RootLayout = () => {
    const [role, setRole] = useState<'user' | 'host' | 'admin'>('user');
    const navigate = useNavigate();

    const handleRoleChange = (newRole: 'user' | 'host' | 'admin') => {
        setRole(newRole);
        if (newRole === 'admin') navigate('/admin');
        else if (newRole === 'host') navigate('/rental'); // Host role goes to rental app
        else navigate('/');
    };

    return (
        <>
            <Outlet />
            <RoleSwitcher currentRole={role} onRoleChange={handleRoleChange} />
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
            {
                path: '*',
                element: <Navigate to="/" replace />,
            }
        ]
    }
]);
