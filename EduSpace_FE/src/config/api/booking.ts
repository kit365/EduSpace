import { API_PREFIX } from './base';

/** Gateway → booking-service (xem api-gateway application.yml) */
export const BOOKING_API = {
    BOOKINGS:           `${API_PREFIX}/bookings`,
    VOUCHER_CAMPAIGNS:  `${API_PREFIX}/voucher-campaigns`,
    VOUCHERS:           `${API_PREFIX}/vouchers`,
    USER_VOUCHERS:      `${API_PREFIX}/user-vouchers`,
} as const;
