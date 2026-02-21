import { useState, useEffect } from 'react';
import { Booking } from '../types';
import { bookingService } from '../services/bookingService';

export function useBookings() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            const data = await bookingService.getBookings();
            setBookings(data);
            setLoading(false);
        };
        fetch();
    }, []);

    const cancelBooking = async (id: number) => {
        const success = await bookingService.cancelBooking(id);
        if (success) {
            setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b));
        }
        return success;
    };

    return { bookings, loading, cancelBooking };
}
