import apiClient from '@/lib/axios';
import { ROOM_API } from '@/config/api';
import type { RoomCreateRequest, RoomDto } from '../types';

function unwrap<T>(res: unknown): T {
  if (res && typeof res === 'object' && 'data' in res && (res as { data: unknown }).data !== undefined) {
    return (res as { data: T }).data;
  }
  return res as T;
}

export const roomApiService = {
  getAll: async (propertyId?: number): Promise<RoomDto[]> => {
    const url =
      propertyId != null
        ? `${ROOM_API.ROOMS}?propertyId=${propertyId}`
        : ROOM_API.ROOMS;
    const res = await apiClient.get(url);
    const list = unwrap<RoomDto[]>(res);
    return Array.isArray(list) ? list : [];
  },

  getByRef: async (ref: string): Promise<RoomDto> => {
    const res = await apiClient.get(`${ROOM_API.ROOMS}/${encodeURIComponent(ref)}`);
    return unwrap<RoomDto>(res);
  },

  create: async (body: RoomCreateRequest): Promise<RoomDto> => {
    const res = await apiClient.post(ROOM_API.ROOMS, body);
    return unwrap<RoomDto>(res);
  },
};
