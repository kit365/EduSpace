import {
  BookingRequest, DashboardStats, CalendarEvent, HostFinanceSummary,
  StaffMember, PricingConfig, OperatingHour, BlockedSlot,
  RoomStatusInfo, AdsPackage, AdsSubscription
} from '../types';

// ─── DASHBOARD ────────────────────────────────────────────────
export const DASHBOARD_STATS: DashboardStats = {
  totalRevenue: 45_200_000,
  revenueChange: 12.5,
  activeBookings: 12,
  bookingsChange: 2,
  newRequests: 5,
  requestsStatus: 'warning',
  totalSpaces: 8,
  pendingSpaces: 2,
  monthlyRevenue: 12_800_000,
  commissionPaid: 1_280_000,
  occupancyRate: 72,
};

// ─── BOOKING REQUESTS ─────────────────────────────────────────
export const BOOKING_REQUESTS: BookingRequest[] = [
  {
    id: 1, guestName: 'Nguyễn Văn Minh', guestAvatar: 'https://i.pravatar.cc/150?img=11',
    guestType: 'GIA SƯ TOÁN', guestEmail: 'minh.nv@gmail.com', guestPhone: '0901234567',
    spaceName: 'Studio A-12', spaceId: 'A-12', date: 'Dec 20', time: '08:00 - 11:00',
    duration: 3, guests: 8, revenue: '2.4M', revenueAmount: 2_400_000,
    status: 'pending', paymentStatus: 'escrow', bookingCode: 'EDU-2024-0015'
  },
  {
    id: 2, guestName: 'Phạm Đức Anh', guestAvatar: 'https://i.pravatar.cc/150?img=33',
    guestType: 'DIỄN GIẢ', guestEmail: 'anh.pd@gmail.com',
    spaceName: 'Lab Room 402', spaceId: '402', date: 'Dec 22', time: '14:00 - 17:00',
    duration: 3, guests: 30, revenue: '3.6M', revenueAmount: 3_600_000,
    status: 'pending', paymentStatus: 'escrow', bookingCode: 'EDU-2024-0016'
  },
  {
    id: 3, guestName: 'Lê Thúy Dương', guestAvatar: 'https://i.pravatar.cc/150?img=45',
    guestType: 'CLB SINH VIÊN', guestEmail: 'duong.lt@gmail.com',
    spaceName: 'Cubicle C-3', spaceId: 'C-3', date: 'Dec 23', time: '09:00 - 12:00',
    duration: 3, guests: 12, revenue: '1.5M', revenueAmount: 1_500_000,
    status: 'approved', paymentStatus: 'escrow', bookingCode: 'EDU-2024-0017'
  },
  {
    id: 4, guestName: 'Trương Minh Khoa', guestAvatar: 'https://i.pravatar.cc/150?img=22',
    guestType: 'IELTS TRAINER', guestEmail: 'khoa.tm@gmail.com',
    spaceName: 'Studio A-12', spaceId: 'A-12', date: 'Dec 18', time: '14:00 - 16:00',
    duration: 2, guests: 6, revenue: '1.6M', revenueAmount: 1_600_000,
    status: 'checked_in', paymentStatus: 'partially_paid', bookingCode: 'EDU-2024-0013'
  },
  {
    id: 5, guestName: 'Hoàng Thu Hà', guestAvatar: 'https://i.pravatar.cc/150?img=48',
    guestType: 'CODING BOOTCAMP', guestEmail: 'ha.ht@gmail.com',
    spaceName: 'Lab Room 402', spaceId: '402', date: 'Dec 15', time: '08:00 - 17:00',
    duration: 8, guests: 25, revenue: '8.0M', revenueAmount: 8_000_000,
    status: 'completed', paymentStatus: 'fully_paid', bookingCode: 'EDU-2024-0010'
  }
];

// ─── CALENDAR ─────────────────────────────────────────────────
export const CALENDAR_EVENTS: CalendarEvent[] = [
  { id: 1, title: 'Lab 402 - IELTS', date: '2024-12-20', type: 'booking', status: 'confirmed', startTime: '08:00', endTime: '11:00', guestName: 'Nguyễn Văn Minh' },
  { id: 2, title: 'Seminar A - Python', date: '2024-12-21', type: 'workshop', status: 'confirmed', startTime: '09:00', endTime: '17:00', guestName: 'Hoàng Thu Hà' },
  { id: 3, title: 'Studio A-12 - Kỹ Năng', date: '2024-12-22', type: 'seminar', status: 'pending', startTime: '14:00', endTime: '17:00', guestName: 'Phạm Đức Anh' },
  { id: 4, title: 'Cubicle C-3 - CLB SV', date: '2024-12-23', type: 'booking', status: 'confirmed', startTime: '09:00', endTime: '12:00', guestName: 'Lê Thúy Dương' },
  { id: 5, title: 'Lab 204 - Full', date: '2024-12-25', type: 'booking', status: 'confirmed', startTime: '08:00', endTime: '18:00' },
];

// ─── FINANCE ──────────────────────────────────────────────────
export const HOST_FINANCE: HostFinanceSummary = {
  totalEarnings: 45_200_000, pendingPayouts: 8_500_000, commissionPaid: 4_520_000,
  thisMonthRevenue: 12_800_000, lastMonthRevenue: 10_500_000, commissionRate: 8,
};

// ─── STAFF ────────────────────────────────────────────────────
export const HOST_STAFF: StaffMember[] = [
  {
    id: 'STF-001', name: 'Võ Minh Tuấn', email: 'tuan.vm@eduhub.vn', phone: '0945678901',
    avatar: 'https://i.pravatar.cc/150?img=15',
    permissions: ['check_in', 'collect_payment', 'view_bookings', 'add_services'],
    status: 'active', createdAt: '2024-03-15'
  },
  {
    id: 'STF-002', name: 'Ngô Bảo Trâm', email: 'tram.nb@eduhub.vn', phone: '0956789012',
    avatar: 'https://i.pravatar.cc/150?img=44',
    permissions: ['check_in', 'view_bookings'],
    status: 'active', createdAt: '2024-06-01'
  }
];

// ─── FR-02: PRICING CONFIG ────────────────────────────────────
export const SAMPLE_PRICING: PricingConfig = {
  basePrice: 500_000,
  weekendPrice: 700_000,
  peakPrice: 1_000_000,
  peakDates: ['2024-12-24', '2024-12-25', '2024-12-31', '2025-01-01']
};

// ─── FR-03: OPERATING HOURS ───────────────────────────────────
export const DEFAULT_OPERATING_HOURS: OperatingHour[] = [
  { day: 'monday', isOpen: true, openTime: '07:00', closeTime: '22:00' },
  { day: 'tuesday', isOpen: true, openTime: '07:00', closeTime: '22:00' },
  { day: 'wednesday', isOpen: true, openTime: '07:00', closeTime: '22:00' },
  { day: 'thursday', isOpen: true, openTime: '07:00', closeTime: '22:00' },
  { day: 'friday', isOpen: true, openTime: '07:00', closeTime: '22:00' },
  { day: 'saturday', isOpen: true, openTime: '08:00', closeTime: '20:00' },
  { day: 'sunday', isOpen: false, openTime: '08:00', closeTime: '18:00' },
];

export const BLOCKED_SLOTS: BlockedSlot[] = [
  { id: 'BLK-001', date: '2024-12-26', startTime: '08:00', endTime: '22:00', reason: 'Bảo trì hệ thống điều hòa' },
  { id: 'BLK-002', date: '2024-12-31', startTime: '12:00', endTime: '22:00', reason: 'Tất niên công ty' },
];

// ─── FR-15: ROOM STATUS ───────────────────────────────────────
export const ROOM_STATUSES: RoomStatusInfo[] = [
  {
    spaceId: 1, spaceName: 'Studio A-12',
    spaceImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400',
    status: 'occupied',
    currentBooking: { guestName: 'Trương Minh Khoa', checkInTime: '14:00', checkOutTime: '16:00', bookingCode: 'EDU-2024-0013' },
    lastUpdated: '2024-12-18T14:05:00', updatedBy: 'Võ Minh Tuấn'
  },
  {
    spaceId: 2, spaceName: 'Lab Room 402',
    spaceImage: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400',
    status: 'available',
    lastUpdated: '2024-12-18T12:00:00', updatedBy: 'Ngô Bảo Trâm'
  },
  {
    spaceId: 3, spaceName: 'Meeting Cubicle C-3',
    spaceImage: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400',
    status: 'cleaning',
    lastUpdated: '2024-12-18T13:10:00', updatedBy: 'Võ Minh Tuấn',
    note: 'Khách vừa rời, đang dọn dẹp'
  },
  {
    spaceId: 4, spaceName: 'Seminar Hall A',
    spaceImage: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=400',
    status: 'maintenance',
    lastUpdated: '2024-12-17T16:00:00', updatedBy: 'Trần Thị Bích Ngọc',
    note: 'Đang sửa máy chiếu & loa, dự kiến xong 20/12'
  },
  {
    spaceId: 5, spaceName: 'Workshop Studio B',
    spaceImage: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=400',
    status: 'available',
    lastUpdated: '2024-12-18T08:00:00', updatedBy: 'Ngô Bảo Trâm'
  },
];

// ─── FR-05: ADS PACKAGES ──────────────────────────────────────
export const ADS_PACKAGES: AdsPackage[] = [
  {
    id: 'ADS-SILVER', name: 'Gói Bạc (Silver)', tier: 'silver',
    price: 500_000, duration: 30,
    features: [
      'Gắn nhãn "Đề xuất" trên tin đăng',
      'Ưu tiên hiển thị trong kết quả tìm kiếm',
      'Hiển thị trên trang chủ (vị trí thấp)',
      'Báo cáo lượt xem cơ bản',
    ],
    badge: '⭐ Silver', priorityBoost: 20
  },
  {
    id: 'ADS-GOLD', name: 'Gói Vàng (Gold)', tier: 'gold',
    price: 1_200_000, duration: 30,
    features: [
      'Gắn nhãn "Nổi bật" trên tin đăng',
      'Vị trí hàng đầu trong kết quả tìm kiếm',
      'Hiển thị trên trang chủ (banner nổi bật)',
      'Báo cáo phân tích chi tiết (views, clicks, bookings)',
      'Hỗ trợ chụp ảnh chuyên nghiệp (1 lần)',
      'Badge Gold trên hồ sơ Host',
    ],
    badge: '👑 Gold', priorityBoost: 50
  }
];

export const HOST_ADS_SUBSCRIPTIONS: AdsSubscription[] = [
  {
    id: 'SUB-001', packageId: 'ADS-SILVER', packageName: 'Gói Bạc', tier: 'silver',
    spaceId: 1, spaceName: 'Studio A-12',
    startDate: '2024-12-01', endDate: '2024-12-31', status: 'active'
  }
];
