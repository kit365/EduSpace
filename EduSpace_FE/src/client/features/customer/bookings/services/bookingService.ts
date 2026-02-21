import { Booking } from '../types';
import { USER_BOOKINGS } from '../data/mockData';

class BookingService {
    async getBookings(): Promise<Booking[]> {
        return new Promise((resolve) => {
            setTimeout(() => resolve(USER_BOOKINGS), 600);
        });
    }

    async cancelBooking(bookingId: number): Promise<boolean> {
        return new Promise((resolve) => {
            setTimeout(() => resolve(true), 400);
        });
    }
}

export const bookingService = new BookingService();
