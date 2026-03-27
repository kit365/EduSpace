import { useState, useEffect } from 'react';
import { adminService, GetLogsParams } from '../services/adminService';
import { User, Role } from '@/types';

export interface Log {
    id: string;
    action: string;
    user: string;
    time: string;
    status: string;
    eventType?: string;
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
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10);
    const [totalElements, setTotalElements] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [search, setSearch] = useState('');
    const [eventType, setEventType] = useState('');
    const [status, setStatus] = useState('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetch = async () => {
            try {
                setLoading(true);
                setError(null);
                const params: GetLogsParams = { page, size };
                if (search.trim()) params.search = search.trim();
                if (eventType) params.eventType = eventType;
                if (status) params.status = status;
                const data = await adminService.getLogs(params);
                setLogs(data.content as Log[]);
                setTotalElements(data.totalElements ?? 0);
                setTotalPages(data.totalPages ?? 0);
            } catch (e) {
                setLogs([]);
                setError(e instanceof Error ? e.message : 'Failed to load logs');
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [page, size, search, eventType, status]);

    return {
        logs,
        loading,
        error,
        page,
        size,
        totalElements,
        totalPages,
        search,
        eventType,
        status,
        setPage,
        setSize,
        setSearch,
        setEventType,
        setStatus
    };
};
