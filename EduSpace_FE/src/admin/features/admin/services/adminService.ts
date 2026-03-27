import apiClient from '@/lib/axios';
import { MOCK_USERS, MOCK_ROLES } from '../data/mockData';

export interface ActivityLogItem {
    id: string;
    action: string;
    user: string;
    time: string;
    status: 'Success' | 'Failed';
    eventType?: string;
}

export interface GetLogsParams {
    page?: number;
    size?: number;
    search?: string;
    eventType?: string;
    status?: string;
}

interface ActivityLogApiItem {
    id?: number | string;
    eventType?: string;
    status?: string;
    actorEmail?: string;
    message?: string;
    createdAt?: string;
}

interface PageResponse<T> {
    content: T[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
}

function mapLogItem(item: ActivityLogApiItem): ActivityLogItem {
    const normalizedStatus = (item.status ?? '').toUpperCase() === 'SUCCESS' ? 'Success' : 'Failed';
    return {
        id: String(item.id ?? ''),
        action: item.message ?? item.eventType ?? 'Activity',
        user: item.actorEmail ?? 'System',
        time: item.createdAt ?? '',
        status: normalizedStatus,
        eventType: item.eventType ?? ''
    };
}

export const adminService = {
    getUsers: async () => {
        // Simulate API call
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(MOCK_USERS);
            }, 500);
        });
    },

    getRoles: async () => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(MOCK_ROLES);
            }, 400);
        });
    },

    getLogs: async (params: GetLogsParams = {}): Promise<PageResponse<ActivityLogItem>> => {
        const res = await apiClient.get<{ data?: PageResponse<ActivityLogApiItem> }>('/api/v1/accounts/admin/activity-logs', { params });
        const raw = res as unknown as { data?: PageResponse<ActivityLogApiItem> } | PageResponse<ActivityLogApiItem>;
        const pageData: PageResponse<ActivityLogApiItem> = ('data' in raw && raw.data) ? raw.data : (raw as PageResponse<ActivityLogApiItem>);
        return {
            content: (pageData.content ?? []).map(mapLogItem),
            page: pageData.page ?? 0,
            size: pageData.size ?? 10,
            totalElements: pageData.totalElements ?? 0,
            totalPages: pageData.totalPages ?? 0
        };
    }
};
