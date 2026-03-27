import apiClient from '@/lib/axios';
import type { Paginated } from '@/types';
import type { RewardCatalog, RewardCatalogRequest, PointTransaction } from '../types';

/** BE có thể trả { data: T } hoặc T trực tiếp */
function unwrap<T>(res: unknown): T {
  const raw = res as Record<string, unknown> | T;
  if (raw && typeof raw === 'object' && 'data' in raw && raw.data !== undefined) {
    return raw.data as T;
  }
  return raw as T;
}

/** BE Page shape */
interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

const BASE = '/api/v1/rewards';

export const rewardCatalogService = {
  getAllRewards: async (): Promise<RewardCatalog[]> => {
    try {
      const res = await apiClient.get(BASE);
      const list = unwrap<RewardCatalog[]>(res);
      return Array.isArray(list) ? list : [];
    } catch {
      return [];
    }
  },

  getRewardById: async (id: number): Promise<RewardCatalog> => {
    const res = await apiClient.get(`${BASE}/${id}`);
    return unwrap<RewardCatalog>(res);
  },

  createReward: async (body: RewardCatalogRequest): Promise<RewardCatalog> => {
    const res = await apiClient.post(BASE, body);
    return unwrap<RewardCatalog>(res);
  },

  updateReward: async (id: number, body: RewardCatalogRequest): Promise<RewardCatalog> => {
    const res = await apiClient.put(`${BASE}/${id}`, body);
    return unwrap<RewardCatalog>(res);
  },

  deleteReward: async (id: number): Promise<void> => {
    await apiClient.delete(`${BASE}/${id}`);
  },

  getUserTransactions: async (
    userId: string,
    params?: { page?: number; size?: number }
  ): Promise<Paginated<PointTransaction>> => {
    try {
      const res = await apiClient.get(
        `/api/v1/rewards/transactions/${userId}`,
        { params: { page: params?.page ?? 0, size: params?.size ?? 10 } }
      );
      const page = unwrap<PageResponse<PointTransaction>>(res);
      const content = page?.content ?? [];
      return {
        items: Array.isArray(content) ? content : [],
        total: page?.totalElements ?? 0,
        page: page?.page ?? 0,
        limit: page?.size ?? 10,
        totalPages: page?.totalPages ?? 0,
      };
    } catch {
      return { items: [], total: 0, page: 0, limit: 10, totalPages: 0 };
    }
  },
};
