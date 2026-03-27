import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { userService, UserFilterParams } from '../services/userService';
import { User, Paginated } from '@/types';
import { showToast } from '@/utils/toast';

export const useUsers = (initialParams: UserFilterParams = { page: 0, size: 10 }) => {
    const { t } = useTranslation();
    const [data, setData] = useState<Paginated<User> | null>(null);
    const [loading, setLoading] = useState(true);
    const [params, setParams] = useState<UserFilterParams>(initialParams);

    // Sync params with initialParams when props change
    useEffect(() => {
        setParams(initialParams);
    }, [
        initialParams.page, 
        initialParams.size, 
        initialParams.search, 
        initialParams.role, 
        initialParams.status, 
        initialParams.sort
    ]);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const result = await userService.getUsers(params);
            setData(result);
        } catch (error: any) {
            console.error('Failed to fetch users:', error);
            const errMsg = error.response?.data?.message || error.message || t('common.error.fetchUsers');
            showToast.error(t('common.error.title'), errMsg);
        } finally {
            setLoading(false);
        }
    }, [params, t]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    return { 
        users: data?.items || [], 
        pagination: data ? {
            total: data.total,
            page: data.page,
            limit: data.limit,
            totalPages: data.totalPages
        } : null,
        loading, 
        params, 
        setParams,
        refresh: fetchUsers
    };
};
