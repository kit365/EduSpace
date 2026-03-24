import apiClient from '@/lib/axios';
import type { CreateBookingReq } from '@/types';

function unwrap<T>(res: unknown): T {
  if (res && typeof res === 'object' && 'data' in res && (res as { data: unknown }).data !== undefined) {
    return (res as { data: T }).data;
  }
  return res as T;
}

export interface CreateBookingResponse {
  id: number;
  bookingCode: string;
  roomId: number;
  userId: string;
  bookingDate: string;
  slotId: number;
  durationValue: number;
  durationUnit: 'MINUTE' | 'HOUR';
  startDateTime: string;
  endDateTime: string;
  totalPrice: number;
  status: string;
}

export const checkoutBookingApiService = {
  createBooking: async (body: CreateBookingReq): Promise<CreateBookingResponse> => {
    const res = await apiClient.post('/api/v1/bookings', body);
    return unwrap<CreateBookingResponse>(res);
  },
};
