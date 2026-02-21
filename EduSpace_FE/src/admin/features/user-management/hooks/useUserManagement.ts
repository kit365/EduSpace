import { useState, useEffect } from 'react';
import { adminService } from '../../admin/services/adminService';

export interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
    joined: string;
}

export interface Role {
    id: string;
    name: string;
    users: number;
    permissions: string[];
}

export const useUsers = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            const data = await adminService.getUsers();
            setUsers(data as User[]);
            setLoading(false);
        };
        fetch();
    }, []);

    return { users, loading };
};

export const useRoles = () => {
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            const data = await adminService.getRoles();
            setRoles(data as Role[]);
            setLoading(false);
        };
        fetch();
    }, []);

    return { roles, loading };
};
