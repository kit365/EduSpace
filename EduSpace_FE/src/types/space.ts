import { LucideIcon } from 'lucide-react';

/**
 * Space approval flow: Host creates → Admin reviews → Active/Rejected
 */
export type SpaceApprovalStatus = 'draft' | 'pending_review' | 'active' | 'rejected' | 'suspended';
export type SpaceType = 'classroom' | 'meeting_room' | 'lab' | 'workshop' | 'seminar_hall' | 'studio' | 'co_working' | 'other';

export interface Space {
  id: number;
  /** Slug do BE trả về sau khi tạo phòng — dùng cho URL /{slug} */
  slug?: string;
  name: string;
  /** Tên cơ sở/chi nhánh vật lý của phòng (map từ BE `properties.name`). */
  facilityName?: string;
  location: string;
  address?: string;
  roomLocationHint?: string;
  capacity: number;
  size?: number;              // sqm
  floorNumber?: string;
  price: number;              // VNĐ per hour
  rating: number;
  reviewCount?: number;
  image: string;
  images?: string[];
  verified: boolean;
  instantBook?: boolean;
  type: SpaceType;
  amenities: string[];
  categoryName?: string;
  categorySlug?: string;
  badge?: string | null;
  description?: string;
  additionalInfo?: string;
  minDuration?: number;
  stepUnit?: number;
  weekendSurchargeEnabled?: boolean;
  weekendSurchargePercent?: number;
  weekendApplySaturday?: boolean;
  weekendApplySunday?: boolean;

  // Ownership & approval
  hostId?: string;
  hostName?: string;
  approvalStatus?: SpaceApprovalStatus;
  rejectionReason?: string;
  submittedAt?: string;
  approvedAt?: string;
  priceRules?: RoomPriceRule[];
}

export interface SpaceAmenity {
  id?: number;
  icon: LucideIcon;
  name: string;
  type?: string;
  price?: number;
}


export interface SpaceReview {
  id: number;
  author: string;
  date: string;
  rating: number;
  comment: string;
  avatar: string;
}

export interface ReservationSchedule {
  id?: number;
  dayOfWeek: number;
  isOpen: boolean;
  openTime: string | null;
  closeTime: string | null;
}

export interface ReservationTimeslot {
  id: number;
  dayOfWeek: number;
  slotType: 'DAY' | 'SESSION';
  startTime: string;
  endTime: string;
  durationMode: 'MINUTE' | 'HOUR';
  durationStep: number;
  isActive: boolean;
}

/** Bậc giá theo giờ (room-service price rules) — dùng UI chi tiết / checkout. */
export interface RoomPriceRule {
  id?: number;
  minHours: number;
  maxHours?: number | null;
  pricePerHour?: number | null;
  flatPrice?: number | null;
  label?: string | null;
  applicableDayOfWeeks?: number[] | null;
}

export interface RoomPriceRule {
  id?: number;
  minHours: number;
  maxHours?: number | null;
  pricePerHour?: number | null;
  flatPrice?: number | null;
  label?: string | null;
  applicableDayOfWeeks?: number[] | null;
}

export interface SpaceDetails extends Space {
  /** Tên cơ sở / tòa nhà (hiển thị chi tiết). */
  facilityName?: string;
  priceRules?: RoomPriceRule[];
  amenitiesDetailed: SpaceAmenity[];
  reviews: SpaceReview[];
  availableSlots?: number;
  schedules?: ReservationSchedule[];
  timeslots?: ReservationTimeslot[];
  roomId?: number;
  host?: {
    name: string;
    avatar?: string;
    joinedDate?: string;
    isVerified?: boolean;
    phone?: string;
    email?: string;
  };
  policies?: { id: number; name: string; description: string; icon?: string }[];
}
