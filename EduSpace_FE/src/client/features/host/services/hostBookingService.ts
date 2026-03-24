import apiClient from '@/lib/axios';

function unwrap<T>(res: unknown): T {
  if (res && typeof res === 'object' && 'data' in res && (res as { data: unknown }).data !== undefined) {
    return (res as { data: T }).data;
  }
  return res as T;
}

export interface HostBookingDto {
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

export const hostBookingService = {
  getAll: async (): Promise<HostBookingDto[]> => {
    const res = await apiClient.get('/api/v1/bookings');
    const data = unwrap<HostBookingDto[]>(res);
    return Array.isArray(data) ? data : [];
  },
};

