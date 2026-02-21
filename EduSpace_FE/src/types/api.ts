/**
 * API Types for Backend Integration
 * Use these interfaces to maintain consistency between FE and BE
 */

// --- Base Types ---
export type Language = 'vi' | 'en';

export interface PaginationReq {
    page: number;
    limit: number;
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
    errors?: string[];
}

// --- FR-06: Search API ---
export interface SearchSpacesReq {
    query?: string;
    district?: string;
    startDate?: string;
    endDate?: string;
    startTime?: string;
    endTime?: string;
    minPrice?: number;
    maxPrice?: number;
    minCapacity?: number;
    maxCapacity?: number;
    amenities?: string[];
    roomType?: string;
    sortBy?: 'price_asc' | 'price_desc' | 'rating_desc' | 'recommended';
}

// --- FR-07: eKYC API ---
export interface EkycSubmissionReq {
    frontIdCard: File | string; // File object or base64/url
    backIdCard: File | string;
    selfieImage: File | string;
}

export interface EkycResult {
    status: 'pending' | 'success' | 'failed';
    ocrData?: {
        name: string;
        idNumber: string;
        dob: string;
        address: string;
        expiryDate: string;
    };
    faceMatchingScore: number;
    message?: string;
}

// --- FR-08: Booking API ---
export interface BookingPriceCalculationItem {
    date: string;
    hours: number;
    basePrice: number;
    appliedPrice: number; // weekend or peak rates might apply
    isWeekend: boolean;
}

export interface BookingPriceCalculationResult {
    dailyBreakdown: BookingPriceCalculationItem[];
    totalRoomPrice: number;
    cleaningFee: number;
    serviceFee: number;
    extraCharges: { name: string; amount: number }[];
    grandTotal: number;
    currency: string;
}

export interface CreateBookingReq {
    spaceId: number;
    startDate: string;
    durationDays: number;
    startTime: string;
    endTime: string;
    guests: number;
    paymentMethod: 'card' | 'bank' | 'momo';
    contactInfo: {
        fullName: string;
        email: string;
        phone: string;
    };
}

// --- FR-10: Review API ---
export interface SubmitReviewReq {
    bookingId: number;
    spaceId: number;
    rating: number; // 1-5
    comment: string;
    images?: (File | string)[];
}
