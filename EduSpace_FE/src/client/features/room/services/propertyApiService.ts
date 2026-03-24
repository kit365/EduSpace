import apiClient from '@/lib/axios';
import { ROOM_API } from '@/config/api';
import type {
  PropertyCreateRequest,
  PropertyDto,
  PropertyScheduleBundleDto,
  PropertyScheduleReplacePayload,
  RoomScheduleDto,
} from '../types';

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

  /** Giờ mở cửa + buffer + over-day (cơ sở). */
  getSchedules: async (propertyId: number, ownerId: string): Promise<PropertyScheduleBundleDto> => {
    const params = new URLSearchParams({ ownerId: ownerId.trim() });
    const res = await apiClient.get(`${ROOM_API.PROPERTIES}/${propertyId}/schedules?${params}`);
    const data = unwrap<PropertyScheduleBundleDto | RoomScheduleDto[]>(res);
    if (Array.isArray(data)) {
      return {
        bufferMinutes: 0,
        isOverDay: false,
        schedules: data,
      };
    }
    return {
      bufferMinutes: data.bufferMinutes ?? 0,
      isOverDay: Boolean(data.isOverDay),
      schedules: Array.isArray(data.schedules) ? data.schedules : [],
    };
  },

  putSchedules: async (
    propertyId: number,
    ownerId: string,
    body: PropertyScheduleReplacePayload,
  ): Promise<PropertyScheduleBundleDto> => {
    const params = new URLSearchParams({ ownerId: ownerId.trim() });
    const res = await apiClient.put(`${ROOM_API.PROPERTIES}/${propertyId}/schedules?${params}`, body);
    const data = unwrap<PropertyScheduleBundleDto>(res);
    return {
      bufferMinutes: data.bufferMinutes ?? 0,
      isOverDay: Boolean(data.isOverDay),
      schedules: Array.isArray(data.schedules) ? data.schedules : [],
    };
  },
};
