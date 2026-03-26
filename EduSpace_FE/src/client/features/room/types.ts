

export type PropertyStatus = 'PENDING' | 'VERIFIED' | 'REJECTED' | 'BANNED';

export type RoomType = 'MEETING_ROOM' | 'CLASSROOM' | 'EVENT_SPACE' | 'STUDIO' | 'COWORKING';

/** Trạng thái lưu trong DB (room-service). */
export type RoomStatus =
  | 'READY'
  | 'IN_USE'
  | 'CLEANING'
  | 'MAINTENANCE'
  | 'ACTIVE'
  | 'INACTIVE';

/** 4 trạng thái vận hành trên dashboard (nút bấm). */
export type RoomOperationalStatus = 'READY' | 'IN_USE' | 'CLEANING' | 'MAINTENANCE';

export type RoomApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type BookingType = 'SLOT_BASED' | 'FREE_FORM';
export type TimeslotType = 'DAY' | 'SESSION';
export type DurationMode = 'MINUTE' | 'HOUR';

export interface RoomPriceRuleDto {
  id?: number;
  minHours: number;
  maxHours?: number | null;
  pricePerHour?: number | null;
  flatPrice?: number | null;
  label?: string | null;
  /** 2 = Thứ 2 … 8 = CN. Trống/undefined = mọi ngày (tương thích cũ). */
  applicableDayOfWeeks?: number[] | null;
}

export interface RoomPriceQuoteRequest {
  durationMinutes?: number;
  startDateTime?: string;
  endDateTime?: string;
}

export interface RoomPriceQuoteResponse {
  roomId: number;
  durationMinutes: number;
  durationHours: number;
  minDuration: number;
  stepUnit: number;
  matchedRuleId?: number | null;
  pricingMode: 'RULE_FLAT_PRICE' | 'RULE_PRICE_PER_HOUR' | 'ROOM_DEFAULT_PER_UNIT';
  unitPrice?: number | null;
  subtotal: number;
  weekendSurchargeApplied: boolean;
  weekendSurchargePercent?: number | null;
  weekendSurchargeAmount?: number | null;
  total: number;
}

export interface PropertyDto {
  id: number;
  ownerId: string;
  name: string;
  propertyType: string;
  contactPhone: string;
  contactEmail: string;
  provinceCode: string | null;
  districtCode: string | null;
  wardCode: string | null;
  addressDetail: string;
  logo: string | null;
  description: string | null;
  status: PropertyStatus;
  rejectionNote: string | null;
  submittedAt: string | null;
  approvedBy: string | null;
  approvedAt: string | null;
}

/** Payload POST /properties */
export interface PropertyCreateRequest {
  ownerId: string;
  name: string;
  propertyType: string;
  contactPhone: string;
  contactEmail: string;
  provinceCode?: string | null;
  districtCode?: string | null;
  wardCode?: string | null;
  addressDetail: string;
  logo?: string | null;
  description?: string | null;
}

/** Payload POST /rooms — khớp RoomRequest (BE). */
export interface RoomCreateRequest {
  propertyId: number;
  categorySlug: string;
  roomType: RoomType;
  bookingType: BookingType;
  nameVi: string;
  nameEn: string;
  /** Tuỳ chọn; BE tự ghép từ địa chỉ chi nhánh + phòng/tầng nếu bỏ trống. */
  locationVi?: string | null;
  locationEn?: string | null;
  /** Gợi ý vị trí phòng cụ thể khi check-in (vd: gần thang máy, cuối hành lang). */
  roomLocationHint?: string | null;
  capacity: number;
  area?: number | null;
  roomNumber?: string | null;
  floorNumber?: string | null;
  pricePerHour?: number | null;
  pricePerDay?: number | null;
  /** Legacy from BE, kept for compatibility only. */
  minBookingHours?: number | null;
  minDuration?: number | null;
  stepUnit?: number | null;
  weekendSurchargeEnabled?: boolean | null;
  weekendSurchargePercent?: number | null;
  weekendApplySaturday?: boolean | null;
  weekendApplySunday?: boolean | null;
  priceRules?: RoomPriceRuleDto[] | null;
  images?: string | null;
  mainImageUrl?: string | null;
  descriptionVi?: string | null;
  descriptionEn?: string | null;
  /** Selected amenities for room_amenities (includes both TIEN ÍCH & TRANG THIẾT BỊ and CHÍNH SÁCH as items with amenities.type='POLICY'). */
  amenityIds?: number[] | null;
  status?: RoomStatus;
  approvalStatus?: RoomApprovalStatus;
  isActive?: boolean;
}

/** Một dòng lịch tuần — khớp RoomSchedule (BE). */
export interface RoomScheduleDto {
  id?: number;
  dayOfWeek: number;
  isOpen: boolean;
  isOverDay?: boolean;
  /** HH:mm:ss hoặc null */
  openTime: string | null;
  closeTime: string | null;
}

export interface RoomTimeslotDto {
  id: number;
  dayOfWeek: number;
  slotType: TimeslotType;
  startTime: string;
  endTime: string;
  durationMode: DurationMode;
  durationStep: number;
  isActive: boolean;
}

/** PUT /rooms/{id}/schedules — không gửi id. */
export type RoomScheduleSaveItem = {
  dayOfWeek: number;
  isOpen: boolean;
  isOverDay?: boolean;
  openTime: string | null;
  closeTime: string | null;
};

/** GET/PUT /properties/{id}/schedules — buffer + cờ over-day + 7 dòng lịch. */
export interface PropertyScheduleBundleDto {
  bufferMinutes: number;
  isOverDay: boolean;
  schedules: RoomScheduleDto[];
}

export interface PropertyScheduleReplacePayload {
  bufferMinutes: number;
  isOverDay: boolean;
  schedules: RoomScheduleSaveItem[];
}


export interface RoomDto {
  id: number;
  propertyId: number;
  roomType: RoomType;
  bookingType: BookingType;
  name: string;
  slug: string;
  capacity: number;
  area: number | null;
  /** Có thể không còn từ API; ưu tiên property.address khi map. */
  location?: string | null;
  roomLocationHint?: string | null;
  roomNumber?: string | null;
  floorNumber?: string | null;
  /** Từ property: phút nghỉ giữa các slot (turnover). */
  scheduleBufferMinutes?: number | null;
  /** Từ property: cho phép sinh slot trên toàn ngày. */
  scheduleIsOverDay?: boolean | null;
  pricePerHour?: number | null;
  pricePerDay?: number | null;
  minDuration?: number | null;
  stepUnit?: number | null;
  /** Legacy field; prefer minDuration. */
  minBookingHours?: number | null;
  priceRules?: RoomPriceRuleDto[] | null;
  weekendSurchargeEnabled?: boolean | null;
  weekendSurchargePercent?: number | null;
  weekendApplySaturday?: boolean | null;
  weekendApplySunday?: boolean | null;
  /** Lịch 7 ngày — từ room_schedules */
  schedules?: RoomScheduleDto[];
  timeslots?: RoomTimeslotDto[];
  images: string | null;
  mainImageUrl?: string | null;
  description: string | null;
  status: RoomStatus;
  approvalStatus: RoomApprovalStatus;
  rejectionNote: string | null;
  avgRating: number | null;
  reviewCount: number | null;
  deletedAt: string | null;
  isActive: boolean | null;
  /** ISO-8601 — cập nhật gần nhất (BE). */
  updatedAt?: string | null;
  /** Chờ duyệt chỉnh sửa — bản hiển thị vẫn là dữ liệu cũ. */
  pendingEditStatus?: string | null;
  pendingEditRejectionNote?: string | null;
  pendingEditPayload?: string | null;
  amenities?: RoomAmenityDto[];
  category?: RoomCategoryDto | null;
  policies?: RoomPolicyDto[];
}

export interface RoomAvailabilityCheckRequest {
  slotId: number;
  bookingDate: string;
  durationValue: number;
  durationUnit: DurationMode;
}

export interface RoomAvailabilityCheckResponse {
  available: boolean;
  reason: string;
  startDateTime: string;
  endDateTime: string;
}

export interface RoomPricingQuoteRequest {
  slotId: number;
  bookingDate: string;
  durationValue: number;
  durationUnit: DurationMode;
}

export interface RoomPricingQuoteResponse {
  slotId: number;
  durationMinutes: number;
  unitPrice: number;
  totalPrice: number;
  startDateTime: string;
  endDateTime: string;
  currency: string;
}

export interface RoomCategoryDto {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isFeatured?: boolean;
}

export interface AmenityDto {
  id: number;
  name: string;
  icon: string;
  type: 'EQUIPMENT' | 'SERVICE' | 'FEATURE' | string;
  position: number;
  price: number | null;
}

export interface AmenityCreateRequest {
  nameVi: string;
  nameEn?: string | null;
  icon: string;
  type: 'BASIC' | 'EQUIPMENT' | 'SERVICE' | 'FEATURE' | 'POLICY';
  position?: number | null;
  price?: number | null;
}

export interface RoomAmenityDto {
  roomId: number;
  amenityId: number;
  amenityName: string;
  amenityIcon: string;
  quantity: number;
  notes?: string | null;
  /** Grouping type from BE: POLICY vs AMENITY */
  type?: string;
}

export interface RoomPolicyDto {
  id: number;
  name: string;
  description: string;
  logo?: string | null;
  position?: number;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}
