import apiClient from '@/lib/axios';
import type { LoyaltyConfig, LoyaltyConfigRequest } from '../types';

/** BE có thể trả { data: T } hoặc T trực tiếp (axios interceptor đã return response.data) */
function unwrap<T>(res: unknown): T {
  const raw = res as Record<string, unknown> | T;
  if (raw && typeof raw === 'object' && 'data' in raw && raw.data !== undefined) {
    return raw.data as T;
  }
  return raw as T;
}

const BASE = '/api/v1/points/config';
const DEFAULT_CONFIG: LoyaltyConfig = { id: 1, vndPerPoint: 100, updatedAt: new Date().toISOString() };

export const loyaltyConfigService = {
  getConfig: async (): Promise<LoyaltyConfig> => {
    try {
      const res = await apiClient.get(BASE);
      const data = unwrap<LoyaltyConfig>(res);
      const vnd = data?.vndPerPoint ?? DEFAULT_CONFIG.vndPerPoint;
      return { id: data?.id ?? 1, vndPerPoint: vnd, updatedAt: data?.updatedAt ?? new Date().toISOString() };
    } catch {
      return DEFAULT_CONFIG;
    }
  },

  updateConfig: async (body: LoyaltyConfigRequest): Promise<LoyaltyConfig> => {
    const res = await apiClient.put(BASE, body);
    const data = unwrap<LoyaltyConfig>(res);
    const vnd = data?.vndPerPoint ?? body.vndPerPoint;
    return { id: data?.id ?? 1, vndPerPoint: vnd, updatedAt: data?.updatedAt ?? new Date().toISOString() };
  },
};
