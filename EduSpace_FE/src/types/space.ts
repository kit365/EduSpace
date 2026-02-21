import { LucideIcon } from 'lucide-react';

/**
 * Space approval flow: Host creates → Admin reviews → Active/Rejected
 */
export type SpaceApprovalStatus = 'draft' | 'pending_review' | 'active' | 'rejected' | 'suspended';
export type SpaceType = 'classroom' | 'meeting_room' | 'lab' | 'workshop' | 'seminar_hall' | 'studio' | 'co_working' | 'other';

export interface Space {
  id: number;
  name: string;
  location: string;
  address?: string;
  capacity: number;
  size?: number;              // sqm
  price: number;              // VNĐ per hour
  rating: number;
  reviewCount?: number;
  image: string;
  images?: string[];
  verified: boolean;
  instantBook?: boolean;
  type: SpaceType;
  amenities: string[];
  badge?: string | null;
  description?: string;
  additionalInfo?: string;

  // Ownership & approval
  hostId?: string;
  hostName?: string;
  approvalStatus?: SpaceApprovalStatus;
  rejectionReason?: string;
  submittedAt?: string;
  approvedAt?: string;
}

export interface SpaceAmenity {
  icon: LucideIcon;
  name: string;
}

export interface SpaceReview {
  id: number;
  author: string;
  date: string;
  rating: number;
  comment: string;
  avatar: string;
}

export interface SpaceDetails extends Space {
  amenitiesDetailed: SpaceAmenity[];
  reviews: SpaceReview[];
  availableSlots?: number;
}
