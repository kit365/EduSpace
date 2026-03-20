import apiClient from '@/lib/axios';
import { ROOM_API } from '@/config/api';
import type { RoomSlotCreateRequest } from '../types';

function unwrap<T>(res: unknown): T {
  if (res && typeof res === 'object' && 'data' in res && (res as { data: unknown }).data !== undefined) {
    return (res as { data: T }).data;
  }
  return res as T;
}

export interface RoomSlotDto {
  id: number;
  roomId: number;
  name: string;
  startTime: string;
  endTime: string;
  dayOfWeek: string;
  basePrice: number;
  status: string;
}

export const roomSlotApiService = {
  create: async (body: RoomSlotCreateRequest): Promise<RoomSlotDto> => {
    const res = await apiClient.post(ROOM_API.ROOM_SLOTS, body);
    return unwrap<RoomSlotDto>(res);
  },
};
