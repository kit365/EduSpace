export interface BookingRequest {
  id: number;
  guestName: string;
  guestAvatar: string;
  guestType: string;
  guestEmail?: string;
  guestPhone?: string;
  spaceName: string;
  spaceId: string;
  date: string;
  time: string;
  duration?: number;
  guests?: number;
  revenue: string;
  revenueAmount?: number;
  status: 'pending' | 'approved' | 'rejected' | 'checked_in' | 'completed';
  paymentStatus: 'unpaid' | 'escrow' | 'partially_paid' | 'fully_paid';
  bookingCode?: string;
  branchId?: number;
}

export interface DashboardStats {
  totalRevenue: number;
  revenueChange: number;
  activeBookings: number;
  bookingsChange: number;
  newRequests: number;
  requestsStatus: 'normal' | 'warning';
  totalSpaces: number;
  pendingSpaces: number;
  monthlyRevenue: number;
  commissionPaid: number;
  occupancyRate: number;
}

export interface CalendarEvent {
  id: number;
  title: string;
  date: string;
  type: 'booking' | 'workshop' | 'seminar';
  status: 'confirmed' | 'pending';
  startTime?: string;
  endTime?: string;
  guestName?: string;
  branchId?: number;
}

export interface HostFinanceSummary {
  totalEarnings: number;
  pendingPayouts: number;
  commissionPaid: number;
  thisMonthRevenue: number;
  lastMonthRevenue: number;
  commissionRate: number;
}

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  permissions: StaffPermission[];
  status: 'active' | 'inactive';
  createdAt: string;
}

export type StaffPermission = 'check_in' | 'collect_payment' | 'manage_schedule' | 'view_bookings' | 'add_services';

// ─── FR-02: Flexible Pricing ──────────────────────────────────
export interface PricingConfig {
  basePrice: number;        // VNĐ per hour (weekday)
  weekendPrice: number;     // VNĐ per hour (Sat/Sun)
  peakPrice: number;        // VNĐ per hour (peak/holiday)
  peakDates: string[];      // Dates marked as peak (YYYY-MM-DD)
}

// ─── FR-03: Operating Hours ───────────────────────────────────
export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface OperatingHour {
  day: DayOfWeek;
  isOpen: boolean;
  openTime: string;   // "08:00"
  closeTime: string;  // "22:00"
}

export interface BlockedSlot {
  id: string;
  /** YYYY-MM-DDTHH:mm (datetime-local) — bắt đầu khoảng chặn */
  startDatetime: string;
  /** Kết thúc (có thể khác ngày, qua đêm) */
  endDatetime: string;
  reason: string;
  branchId?: number;
}

// ─── FR-15: Room Status ────────────────────────────────────────
export type RoomStatus = 'available' | 'occupied' | 'cleaning' | 'maintenance';

export interface RoomStatusInfo {
  spaceId: number;
  spaceName: string;
  spaceImage: string;
  status: RoomStatus;
  currentBooking?: {
    guestName: string;
    checkInTime: string;
    checkOutTime: string;
    bookingCode: string;
  };
  lastUpdated: string;
  updatedBy: string;
  note?: string;
  branchId?: number;
}

// ─── ROOM TYPES ────────────────────────────────────────────────
export interface RoomType {
  id: string;
  name: string;
  description: string;
  icon: string;
  status: 'active' | 'inactive';
  basePrice: number;
}
  
// ─── UTILITY PRICES ────────────────────────────────────────────
export interface UtilityPrice {
  id: string;
  name: string;
  price: number;
  unit: string;
  description?: string;
  status: 'active' | 'inactive';
}
