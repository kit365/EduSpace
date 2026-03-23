import apiClient from '@/lib/axios';
import { ROOM_API } from '@/config/api';
import type {
  AmenityDto,
  PageResponse,
  RoomAvailabilityCheckRequest,
  RoomAvailabilityCheckResponse,
  RoomCategoryDto,
  RoomCreateRequest,
  RoomDto,
  RoomOperationalStatus,
  RoomPricingQuoteRequest,
  RoomPricingQuoteResponse,
  RoomScheduleSaveItem,
  RoomTimeslotDto,
} from '../types';

function unwrap<T>(res: unknown): T {
  if (res && typeof res === 'object' && 'data' in res && (res as { data: unknown }).data !== undefined) {
    return (res as { data: T }).data;
  }
  return res as T;
}

export const roomApiService = {
  /** Gọi GET /rooms — có thể lọc theo propertyId hoặc ownerId (host). */
  getAll: async (
    options?: number | { propertyId?: number; ownerId?: string },
  ): Promise<RoomDto[]> => {
    let propertyId: number | undefined;
    let ownerId: string | undefined;
    if (typeof options === 'number') {
      propertyId = options;
    } else if (options && typeof options === 'object') {
      propertyId = options.propertyId;
      ownerId = options.ownerId;
    }
    const params = new URLSearchParams();
    if (propertyId != null) params.set('propertyId', String(propertyId));
    if (ownerId) params.set('ownerId', ownerId);
    const qs = params.toString();
    const url = qs ? `${ROOM_API.ROOMS}?${qs}` : ROOM_API.ROOMS;
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

  update: async (id: number, body: Partial<RoomCreateRequest> & { rejectionNote?: string | null }): Promise<RoomDto> => {
    const res = await apiClient.put(`${ROOM_API.ROOMS}/${id}`, body);
    return unwrap<RoomDto>(res);
  },

  /** Thay toàn bộ lịch 7 ngày (host — ownerId khớp property). */
  putSchedules: async (roomId: number, ownerId: string, items: RoomScheduleSaveItem[]): Promise<RoomDto> => {
    const params = new URLSearchParams({ ownerId: ownerId.trim() });
    const res = await apiClient.put(`${ROOM_API.ROOMS}/${roomId}/schedules?${params}`, items);
    return unwrap<RoomDto>(res);
  },

  getTimeslots: async (roomId: number, bookingDate: string): Promise<RoomTimeslotDto[]> => {
    const params = new URLSearchParams({ bookingDate });
    const res = await apiClient.get(`${ROOM_API.ROOMS}/${roomId}/timeslots?${params}`);
    return unwrap<RoomTimeslotDto[]>(res);
  },

  checkAvailability: async (roomId: number, body: RoomAvailabilityCheckRequest): Promise<RoomAvailabilityCheckResponse> => {
    const res = await apiClient.post(`${ROOM_API.ROOMS}/${roomId}/availability/check`, body);
    return unwrap<RoomAvailabilityCheckResponse>(res);
  },

  quotePrice: async (roomId: number, body: RoomPricingQuoteRequest): Promise<RoomPricingQuoteResponse> => {
    const res = await apiClient.post(`${ROOM_API.ROOMS}/${roomId}/pricing/quote`, body);
    return unwrap<RoomPricingQuoteResponse>(res);
  },

  /** PATCH /rooms/{id}/status — chỉ đổi trạng thái vận hành. */
  patchStatus: async (roomId: number, status: RoomOperationalStatus): Promise<RoomDto> => {
    const res = await apiClient.patch(`${ROOM_API.ROOMS}/${roomId}/status`, { status });
    return unwrap<RoomDto>(res);
  },

  /** Host: gửi JSON chỉnh sửa chờ admin duyệt (ownerId = UUID user). */
  submitPendingEdit: async (roomId: number, body: RoomCreateRequest, ownerId: string): Promise<RoomDto> => {
    const params = new URLSearchParams({ ownerId });
    const res = await apiClient.post(`${ROOM_API.ROOMS}/${roomId}/pending-edit?${params}`, body);
    return unwrap<RoomDto>(res);
  },

  /** Admin: áp dụng payload chờ duyệt vào phòng. */
  approvePendingEdit: async (roomId: number): Promise<RoomDto> => {
    const res = await apiClient.post(`${ROOM_API.ROOMS}/${roomId}/pending-edit/approve`);
    return unwrap<RoomDto>(res);
  },

  /** Admin: hủy chỉnh sửa chờ duyệt, giữ nguyên dữ liệu hiện tại. */
  rejectPendingEdit: async (roomId: number, rejectionNote?: string): Promise<RoomDto> => {
    const params = new URLSearchParams();
    if (rejectionNote) params.set('rejectionNote', rejectionNote);
    const qs = params.toString();
    const url = qs
      ? `${ROOM_API.ROOMS}/${roomId}/pending-edit/reject?${qs}`
      : `${ROOM_API.ROOMS}/${roomId}/pending-edit/reject`;
    const res = await apiClient.post(url);
    return unwrap<RoomDto>(res);
  },

  /** Public endpoints */
  getPublicRooms: async (params?: {
    propertyId?: number;
    category?: string;
    keyword?: string;
    minCapacity?: number;
    minPrice?: number;
    maxPrice?: number;
    amenityIds?: number[];
    districtCode?: string;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: string;
  }): Promise<PageResponse<RoomDto>> => {
    const res = await apiClient.get(ROOM_API.PUBLIC_ROOMS, { params });
    return unwrap<PageResponse<RoomDto>>(res);
  },

  getPublicCategories: async (): Promise<RoomCategoryDto[]> => {
    const res = await apiClient.get(ROOM_API.PUBLIC_ROOM_CATEGORIES);
    return unwrap<RoomCategoryDto[]>(res);
  },

  getFeaturedCategories: async (): Promise<RoomCategoryDto[]> => {
    const res = await apiClient.get(`${ROOM_API.PUBLIC_ROOM_CATEGORIES}/featured`);
    return unwrap<RoomCategoryDto[]>(res);
  },

  /** Admin endpoints */
  getAllCategories: async (): Promise<RoomCategoryDto[]> => {
    const res = await apiClient.get(ROOM_API.ROOM_CATEGORIES);
    return unwrap<RoomCategoryDto[]>(res);
  },

  updateCategory: async (id: number, body: Partial<RoomCategoryDto>): Promise<RoomCategoryDto> => {
    const res = await apiClient.put(`${ROOM_API.ROOM_CATEGORIES}/${id}`, body);
    return unwrap<RoomCategoryDto>(res);
  },

  getAllAmenities: async (): Promise<AmenityDto[]> => {
    const res = await apiClient.get(ROOM_API.AMENITIES);
    return unwrap<AmenityDto[]>(res);
  },
};
