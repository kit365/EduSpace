import { RouteObject } from 'react-router-dom';
import { customerRoutes } from './customerRoutes';
import { rentalRoutes } from './rentalRoutes';

export { customerRoutes, rentalRoutes };
export const UserAuthRoutes: RouteObject[] = [
    // Auth routes if separate, or included in customerRoutes?
    // In previous file, UserAuthRoutes was separate. Let's keep it if needed, or merge.
    // Actually, AuthPage is in customerRoutes now. So maybe I don't need UserAuthRoutes anymore.
    // But I should check if AuthPage handles both scenarios or if there are other auth pages.
    // In previous file: { path: '/auth', element: <AuthPage /> }
    // I included it in customerRoutes. So I can remove UserAuthRoutes export or keep for compatibility.
];

export const UserRoutes = customerRoutes; // Alias for backward compatibility if needed, but better to update usage.
