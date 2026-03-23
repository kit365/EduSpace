// --- Base Types ---
export type Language = 'vi' | 'en';

export interface PaginationReq {
    page: number;
    limit: number;
}

export interface ApiResponse<T = any> {
    success: boolean;
    timestamp: string;
    status: number;
    code: string;
    message: string;
    data: T;
}

export interface Paginated<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface ResponseError {
    code: string;
    message: string;
    errors?: Record<string, string[]>;
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
    frontIdCard: File | string;
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
    appliedPrice: number;
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
    roomId: number;
    userId: string;
    bookingDate: string;
    slotId: number;
    durationValue: number;
    durationUnit: 'MINUTE' | 'HOUR';
    paymentMethod?: 'card' | 'bank' | 'momo';
    contactInfo?: {
        fullName: string;
        email: string;
        phone: string;
    };
}

// --- FR-10: Review API ---
export interface SubmitReviewReq {
    bookingId: number;
    spaceId: number;
    rating: number;
    comment: string;
    images?: (File | string)[];
}
