import { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import { User, Role } from '@/types';

export interface Log {
    id: string;
    action: string;
    user: string;
    time: string;
    status: string;
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

export const useLogs = () => {
    const [logs, setLogs] = useState<Log[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            const data = await adminService.getLogs();
            setLogs(data as Log[]);
            setLoading(false);
        };
        fetch();
    }, []);

    return { logs, loading };
};
