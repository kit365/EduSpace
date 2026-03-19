

export type PropertyStatus = 'PENDING' | 'VERIFIED' | 'REJECTED' | 'BANNED';

export type RoomType = 'MEETING_ROOM' | 'EVENT_SPACE' | 'STUDIO' | 'COWORKING';

export type RoomStatus = 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';

export type RoomApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type BookingType = 'SLOT_BASED' | 'FREE_FORM';

export interface PropertyDto {
  id: number;
  ownerId: string;
  name: string;
  propertyType: string;
  contactPhone: string;
  contactEmail: string;
  address: string;
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
  address: string;
  logo?: string | null;
  description?: string | null;
  status?: PropertyStatus;
}

/** Payload POST /rooms */
export interface RoomCreateRequest {
  propertyId: number;
  roomType: RoomType;
  bookingType: BookingType;
  name: string;
  capacity: number;
  area?: number | null;
  location?: string | null;
  images?: string | null;
  description?: string | null;
  status?: RoomStatus;
  approvalStatus?: RoomApprovalStatus;
  isActive?: boolean;
}

export type RoomSlotStatus = 'AVAILABLE' | 'LOCKED';

/** Payload POST /room-slots */
export interface RoomSlotCreateRequest {
  roomId: number;
  name: string;
  /** HH:mm:ss */
  startTime: string;
  endTime: string;
  /** MONDAY … SUNDAY */
  dayOfWeek: string;
  basePrice: number;
  status: RoomSlotStatus;
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
  location: string | null;
  images: string | null;
  description: string | null;
  status: RoomStatus;
  approvalStatus: RoomApprovalStatus;
  rejectionNote: string | null;
  avgRating: number | null;
  reviewCount: number | null;
  deletedAt: string | null;
  isActive: boolean | null;
}
