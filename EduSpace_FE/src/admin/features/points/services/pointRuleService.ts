import apiClient from '@/lib/axios';
import type { PointEarningRule, PointEarningRuleRequest } from '../types';

/** BE có thể trả { data: T } hoặc T trực tiếp */
function unwrap<T>(res: unknown): T {
  const raw = res as Record<string, unknown> | T;
  if (raw && typeof raw === 'object' && 'data' in raw && raw.data !== undefined) {
    return raw.data as T;
  }
  return raw as T;
}

const BASE = '/api/v1/points/rules';

export const pointRuleService = {
  getAllRules: async (): Promise<PointEarningRule[]> => {
    try {
      const res = await apiClient.get(BASE);
      const list = unwrap<PointEarningRule[]>(res);
      return Array.isArray(list) ? list : [];
    } catch {
      return [];
    }
  },

  getRuleById: async (id: number): Promise<PointEarningRule> => {
    const res = await apiClient.get(`${BASE}/${id}`);
    return unwrap<PointEarningRule>(res);
  },

  createRule: async (body: PointEarningRuleRequest): Promise<PointEarningRule> => {
    const res = await apiClient.post(BASE, body);
    return unwrap<PointEarningRule>(res);
  },

  updateRule: async (id: number, body: PointEarningRuleRequest): Promise<PointEarningRule> => {
    const res = await apiClient.put(`${BASE}/${id}`, body);
    return unwrap<PointEarningRule>(res);
  },

  deleteRule: async (id: number): Promise<void> => {
    await apiClient.delete(`${BASE}/${id}`);
  },
};
