

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
  capacity: number;
  area?: number | null;
  roomNumber?: string | null;
  floorNumber?: string | null;
  /** JSON key khớp field Java `is24_7` */
  is24_7?: boolean;
  pricePerHour?: number | null;
  pricePerDay?: number | null;
  minBookingHours?: number | null;
  images?: string | null;
  descriptionVi?: string | null;
  descriptionEn?: string | null;
  status?: RoomStatus;
  approvalStatus?: RoomApprovalStatus;
  isActive?: boolean;
}

/** Một dòng lịch tuần — khớp RoomSchedule (BE). */
export interface RoomScheduleDto {
  id?: number;
  dayOfWeek: number;
  isOpen: boolean;
  /** HH:mm:ss hoặc null */
  openTime: string | null;
  closeTime: string | null;
}

/** PUT /rooms/{id}/schedules — không gửi id. */
export type RoomScheduleSaveItem = {
  dayOfWeek: number;
  isOpen: boolean;
  openTime: string | null;
  closeTime: string | null;
};


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
  roomNumber?: string | null;
  floorNumber?: string | null;
  /** JSON key khớp BE `is24_7` */
  is24_7?: boolean | null;
  pricePerHour?: number | null;
  pricePerDay?: number | null;
  /** Lịch 7 ngày — từ room_schedules */
  schedules?: RoomScheduleDto[];
  images: string | null;
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
}

export interface RoomAmenityDto {
  roomId: number;
  amenityId: number;
  amenityName: string;
  amenityIcon: string;
  quantity: number;
  notes?: string | null;
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
