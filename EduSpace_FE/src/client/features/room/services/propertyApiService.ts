import apiClient from '@/lib/axios';
import { ROOM_API } from '@/config/api';
import type { PropertyCreateRequest, PropertyDto } from '../types';

function unwrap<T>(res: unknown): T {
  if (res && typeof res === 'object' && 'data' in res && (res as { data: unknown }).data !== undefined) {
    return (res as { data: T }).data;
  }
  return res as T;
}

export const propertyApiService = {
  getAll: async (): Promise<PropertyDto[]> => {
    const res = await apiClient.get(ROOM_API.PROPERTIES);
    const list = unwrap<PropertyDto[]>(res);
    return Array.isArray(list) ? list : [];
  },

  getById: async (id: number): Promise<PropertyDto> => {
    const res = await apiClient.get(`${ROOM_API.PROPERTIES}/${id}`);
    return unwrap<PropertyDto>(res);
  },

  create: async (body: PropertyCreateRequest): Promise<PropertyDto> => {
    const res = await apiClient.post(ROOM_API.PROPERTIES, body);
    return unwrap<PropertyDto>(res);
  },
};
