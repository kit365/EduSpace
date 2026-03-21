import apiClient from '@/lib/axios';
import { ROOM_API } from '@/config/api';

function unwrap<T>(res: unknown): T {
    if (res && typeof res === 'object' && 'data' in res && (res as { data: unknown }).data !== undefined) {
        return (res as { data: T }).data;
    }
    return res as T;
}

export type RoomBlockType = 'MAINTENANCE' | 'BOOKED' | 'PRIVATE_EVENT' | 'HOLIDAY' | 'SPECIAL_EVENT';

/** Khớp RoomBlockResponse (room-service) — JSON serializes LocalDateTime thành chuỗi ISO. */
export interface RoomBlockDto {
    id: number;
    roomId: number;
    startDatetime: string;
    endDatetime: string;
    reason: string | null;
    blockType: RoomBlockType | string | null;
    createdBy: string | null;
}

export interface RoomBlockCreatePayload {
    roomId: number;
    startDatetime: string;
    endDatetime: string;
    reason?: string | null;
    blockType: RoomBlockType;
    createdBy?: string | null;
}

export const roomBlockService = {
    listAll: async (): Promise<RoomBlockDto[]> => {
        const res = await apiClient.get(ROOM_API.ROOM_BLOCKS);
        const list = unwrap<RoomBlockDto[]>(res);
        return Array.isArray(list) ? list : [];
    },

    create: async (body: RoomBlockCreatePayload): Promise<RoomBlockDto> => {
        const res = await apiClient.post(ROOM_API.ROOM_BLOCKS, body);
        return unwrap<RoomBlockDto>(res);
    },

    remove: async (id: number): Promise<void> => {
        await apiClient.delete(`${ROOM_API.ROOM_BLOCKS}/${id}`);
    },
};
