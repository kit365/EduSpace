import apiClient from '@/lib/axios';

function unwrap<T>(res: unknown): T {
    if (res && typeof res === 'object' && 'data' in res && (res as { data: unknown }).data !== undefined) {
        return (res as { data: T }).data;
    }
    return res as T;
}

/** Khớp dữ liệu lịch host cần (CalendarPage). */
export type HostBookingDto = {
    id: number;
    bookingCode: string;
    roomId: number;
    startDateTime: string;
    endDateTime: string;
};

type BookingApiRow = {
    id: number;
    bookingCode: string;
    roomId: number;
    startDateTime: string;
    endDateTime: string;
};

export const hostBookingService = {
    /** GET /api/v1/bookings (booking-service) */
    getAll: async (): Promise<HostBookingDto[]> => {
        const res = await apiClient.get<BookingApiRow[] | { data: BookingApiRow[] }>('/api/v1/bookings');
        const raw = unwrap<BookingApiRow[]>(res);
        return (raw ?? []).map((b) => ({
            id: Number(b.id),
            bookingCode: String(b.bookingCode ?? ''),
            roomId: Number(b.roomId),
            startDateTime: b.startDateTime,
            endDateTime: b.endDateTime,
        }));
    },
};
