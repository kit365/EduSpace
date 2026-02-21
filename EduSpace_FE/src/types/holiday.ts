/**
 * EduSpace Holiday & Surge Pricing Types
 * FR-13: Admin configures holiday dates with automatic price surcharges.
 */

export interface HolidayEntry {
    id: string;
    name: string;                     // e.g., "Tết Nguyên Đán 2026"
    startDate: string;                // ISO date YYYY-MM-DD
    endDate: string;                  // ISO date YYYY-MM-DD
    surchargePercent: number;         // e.g., 30 means +30% on top of normal price
    isRecurring: boolean;             // true = repeats every year
    description?: string;
    createdBy: string;                // Admin who added
    createdAt: string;
}

export interface HolidayConfig {
    holidays: HolidayEntry[];
    defaultSurchargePercent: number;   // Fallback % for holidays without custom surcharge
    isActive: boolean;                 // Global on/off toggle
    lastUpdatedAt: string;
    lastUpdatedBy: string;
}
