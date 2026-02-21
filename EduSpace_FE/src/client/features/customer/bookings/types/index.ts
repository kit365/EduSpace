export type BookingStatusFilter = 'all' | 'upcoming' | 'confirmed' | 'checked_in' | 'completed' | 'cancelled';

export interface Booking {
  id: number;
  bookingCode: string;           // e.g., "EDU-2024-0001"

  // Space info
  spaceId: number;
  spaceName: string;
  spaceImage: string;
  spaceLocation: string;

  // Host info
  hostId: string;
  hostName: string;

  // Schedule
  date: string;
  time: string;
  duration: number;              // hours
  guests: number;

  // Pricing
  pricePerHour: number;
  subtotal: number;
  cleaningFee: number;
  serviceFee: number;
  extraCharges: { name: string; amount: number }[];
  totalPrice: number;

  // Payment
  paymentStatus: 'unpaid' | 'escrow' | 'partially_paid' | 'fully_paid' | 'refunded';
  paidAmount: number;
  remainingAmount: number;

  // Status
  status: 'upcoming' | 'confirmed' | 'checked_in' | 'completed' | 'cancelled';

  // Dates
  bookingDate: string;           // When the booking was made
  confirmationCode: string;
  checkedInAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
}

export interface BookingFilters {
  status: BookingStatusFilter;
  sortBy: 'date' | 'price' | 'name';
}
