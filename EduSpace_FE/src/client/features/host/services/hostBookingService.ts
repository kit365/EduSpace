export interface HostBookingDto {
    id: number;
    roomId: number;
    bookingCode: string;
    startDateTime: string;
    endDateTime: string;
    status: string;
    totalPrice: number;
    customerName: string;
}

/**
 * Placeholder service for Host Bookings.
 * Resolve Vite import error while the actual booking logic is being implemented.
 */
export const hostBookingService = {
    getAll: async (): Promise<HostBookingDto[]> => {
        // Mock data for the calendar
        return [
            {
                id: 1,
                roomId: 1,
                bookingCode: 'EDU-12345',
                startDateTime: new Date().toISOString(),
                endDateTime: new Date(Date.now() + 3600000 * 2).toISOString(),
                status: 'COMPLETED',
                totalPrice: 500000,
                customerName: 'Nguyễn Văn A'
            }
        ];
    }
};
