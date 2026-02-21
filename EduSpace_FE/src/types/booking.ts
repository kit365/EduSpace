/**
 * EduSpace Booking Model
 * Covers the full lifecycle: Created → Confirmed → Checked-in → Completed
 */

export type BookingStatus = 'pending_payment' | 'confirmed' | 'checked_in' | 'completed' | 'cancelled' | 'no_show';
export type PaymentStatus = 'unpaid' | 'escrow' | 'partially_paid' | 'fully_paid' | 'refunded';

export interface Booking {
    id: string;
    bookingCode: string;           // e.g., "EDU-2024-0001"

    // Space info
    spaceId: number;
    spaceName: string;
    spaceImage: string;
    spaceLocation: string;

    // People
    hostId: string;
    hostName: string;
    renterId: string;
    renterName: string;
    renterEmail: string;
    renterPhone?: string;

    // Schedule
    date: string;
    startTime: string;
    endTime: string;
    duration: number;              // hours
    guests: number;

    // Pricing (all in VNĐ)
    pricePerHour: number;
    subtotal: number;              // pricePerHour × duration
    cleaningFee: number;
    serviceFee: number;            // Platform commission
    extraCharges: ExtraCharge[];   // Added by Staff at check-in
    totalPrice: number;

    // Payment
    paymentStatus: PaymentStatus;
    paidAmount: number;
    remainingAmount: number;       // Collected by Staff on-site
    paymentMethod?: string;

    // Status & workflow
    status: BookingStatus;
    checkedInAt?: string;
    checkedInBy?: string;          // Staff ID who checked in

    // Meta
    createdAt: string;
    confirmedAt?: string;
    completedAt?: string;
    cancelledAt?: string;
    cancellationReason?: string;
    notes?: string;
}

export interface ExtraCharge {
    id: string;
    name: string;                  // e.g., "Projector rental", "Extra hour"
    amount: number;
    addedBy: string;               // Staff name
    addedAt: string;
}
