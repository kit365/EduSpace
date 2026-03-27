import type { Space, SpaceDetails, SpaceApprovalStatus, SpaceType, SpaceAmenity } from '@/types/space';
import type { PropertyDto, RoomDto, PropertyStatus, RoomType } from '../types';
import { isRoomOpenForBooking } from '../utils/roomOperationalStatus';
import {
  Wifi,
  Video,
  Building2,
  Wind,
  Coffee,
  ShieldCheck,
  Clock,
  Calendar,
  CigaretteOff,
  Car,
  Brush,
  LucideIcon,
  Maximize2
} from 'lucide-react';

const AMENITY_ICON_MAP: Record<string, LucideIcon> = {
    wifi: Wifi,
    presentation: Video,
    board: Building2,
    ac: Wind,
    water: Coffee,
    support: ShieldCheck,
    projectors: Video,
    whiteboard: Building2,
    sound: Maximize2,
    lounge: Coffee,
    clock: Clock,
    calendar: Calendar,
    shield: ShieldCheck,
    smoking: CigaretteOff,
    'support-247': ShieldCheck,
    parking: Car,
    cleaning: Brush,
};

function mapPropertyStatus(s: PropertyStatus): SpaceApprovalStatus {
  switch (s) {
    case 'PENDING':
      return 'pending_review';
    case 'VERIFIED':
      return 'active';
    case 'REJECTED':
      return 'rejected';
    case 'BANNED':
      return 'suspended';
    default:
      return 'pending_review';
  }
}

function mapRoomType(t: RoomType): SpaceType {
  switch (t) {
    case 'MEETING_ROOM':
      return 'meeting_room';
    case 'EVENT_SPACE':
      return 'seminar_hall';
    case 'STUDIO':
      return 'studio';
    case 'COWORKING':
      return 'co_working';
    default:
      return 'other';
  }
}

/** Giá hiển thị trên card (VNĐ/giờ) — map từ BE `pricePerHour`. */
function roomPricePerHour(room: RoomDto | null | undefined): number {
  const v = room?.pricePerHour;
  if (v == null || Number.isNaN(Number(v))) return 0;
  return Number(v);
}

function parseImages(images: string | null): string[] {
  if (!images?.trim()) return [];
  try {
    const parsed = JSON.parse(images) as unknown;
    return Array.isArray(parsed) ? (parsed as string[]).filter(Boolean) : [];
  } catch {
    return images.includes(',')
      ? images.split(',').map((s) => s.trim()).filter(Boolean)
      : [images.trim()];
  }
}

function buildGallery(mainImageUrl: string | null | undefined, images: string | null): string[] {
  const main = (mainImageUrl ?? '').trim();
  const parsed = parseImages(images);
  const out: string[] = [];
  if (main) out.push(main);
  for (const img of parsed) {
    const u = (img ?? '').trim();
    if (!u) continue;
    if (main && u === main) continue;
    out.push(u);
  }
  return out;
}

function pickPrimaryRoom(rooms: RoomDto[]): RoomDto | null {
  const active = rooms.filter(
    (r) => isRoomOpenForBooking(r.status) && r.approvalStatus === 'APPROVED' && r.isActive !== false,
  );
  const pool = active.length ? active : rooms;
  if (!pool.length) return null;
  return pool.reduce((best, r) => {
    const br = (best.avgRating ?? 0) * (best.reviewCount ?? 0);
    const rr = (r.avgRating ?? 0) * (r.reviewCount ?? 0);
    return rr >= br ? r : best;
  });
}


export function propertyToSpace(property: PropertyDto, rooms: RoomDto[] = []): Space {
  const primary = pickPrimaryRoom(rooms);
  const imgs = primary ? buildGallery(primary.mainImageUrl, primary.images) : [];
  const mainImg = primary?.mainImageUrl?.trim() || '';
  const logo = mainImg || property.logo?.trim() || imgs[0] || '/placeholder-space.jpg';

  return {
    id: property.id,
    slug: primary?.slug,
    name: property.name,
    facilityName: property.name,
    location: property.addressDetail,
    address: property.addressDetail,
    roomLocationHint: primary?.roomLocationHint ?? undefined,
    capacity: primary?.capacity ?? 0,
    size: primary?.area != null ? Number(primary.area) : undefined,
    floorNumber: primary?.floorNumber ?? undefined,
    price: roomPricePerHour(primary),
    rating: primary?.avgRating != null ? Number(primary.avgRating) : 0,
    reviewCount: primary?.reviewCount ?? 0,
    image: logo,
    images: imgs.length ? imgs : [logo],
    verified: property.status === 'VERIFIED',
    type: primary ? mapRoomType(primary.roomType) : 'other',
    amenities: [],
    description: property.description ?? primary?.description ?? undefined,
    hostId: property.ownerId,
    approvalStatus: mapPropertyStatus(property.status),
    rejectionReason: property.rejectionNote ?? undefined,
    submittedAt: property.submittedAt ?? undefined,
    approvedAt: property.approvedAt ?? undefined,
    minDuration: primary?.minDuration ?? undefined,
    stepUnit: primary?.stepUnit ?? undefined,
    weekendSurchargeEnabled: primary?.weekendSurchargeEnabled ?? false,
    weekendSurchargePercent: primary?.weekendSurchargePercent ?? undefined,
    weekendApplySaturday: primary?.weekendApplySaturday ?? false,
    weekendApplySunday: primary?.weekendApplySunday ?? false,
    priceRules: primary?.priceRules || [],
  };
}

/** Property + danh sách phòng → SpaceDetails (amenities/reviews Phase sau) */
export function propertyToSpaceDetails(
  property: PropertyDto,
  rooms: RoomDto[],
): SpaceDetails {
  const base = propertyToSpace(property, rooms);
  return {
    ...base,
    amenitiesDetailed: [],
    reviews: [],
    availableSlots: undefined,
    schedules: rooms[0]?.schedules || [], // Simplification for property level
    timeslots: rooms[0]?.timeslots || [],
    roomId: rooms[0]?.id,
  };
}

/** Một phòng + property → card listing (id = room.id, slug cho URL). */
export function roomToSpaceCard(room: RoomDto, property: PropertyDto): Space {
  const imgs = buildGallery(room.mainImageUrl, room.images);
  const mainImg = room.mainImageUrl?.trim() || '';
  const image = mainImg || imgs[0] || property.logo?.trim() || '';
  return {
    id: room.id,
    slug: room.slug || undefined,
    name: room.name,
    facilityName: property.name,
    location: room.location || property.addressDetail,
    roomLocationHint: room.roomLocationHint ?? undefined,
    address: property.addressDetail,
    capacity: room.capacity,
    size: room.area != null ? Number(room.area) : undefined,
    floorNumber: room.floorNumber ?? undefined,
    price: roomPricePerHour(room),
    rating: room.avgRating != null ? Number(room.avgRating) : 0,
    reviewCount: room.reviewCount ?? 0,
    image,
    images: imgs.length ? imgs : image ? [image] : [],
    verified: property.status === 'VERIFIED',
    type: mapRoomType(room.roomType),
    amenities: (room.amenities ?? [])
      .filter((a) => (a.type ?? '').toUpperCase() !== 'POLICY')
      .map((a) => a.amenityName),
    categoryName: room.category?.name,
    categorySlug: room.category?.slug,
    description: room.description ?? property.description ?? undefined,
    hostId: property.ownerId,
    approvalStatus: mapPropertyStatus(property.status),
    minDuration: room.minDuration ?? undefined,
    stepUnit: room.stepUnit ?? undefined,
    weekendSurchargeEnabled: room.weekendSurchargeEnabled ?? false,
    weekendSurchargePercent: room.weekendSurchargePercent ?? undefined,
    weekendApplySaturday: room.weekendApplySaturday ?? false,
    weekendApplySunday: room.weekendApplySunday ?? false,
    priceRules: room.priceRules || [],
  };
}

/** Chi tiết trang /{slug} — hero theo đúng phòng. */
export function roomAndPropertyToSpaceDetails(
  room: RoomDto,
  property: PropertyDto,
): SpaceDetails {
  const card = roomToSpaceCard(room, property);
  const imgs = buildGallery(room.mainImageUrl, room.images);
  
  const amenitiesDetailed: SpaceAmenity[] = (room.amenities || [])
    .filter((a) => (a.type ?? '').toUpperCase() !== 'POLICY')
    .map((a) => ({
      id: a.amenityId,
      name: a.amenityName,
      type: a.amenityType,
      price: (a as any).price ?? 0,
      icon: AMENITY_ICON_MAP[a.amenityIcon.toLowerCase()] || Building2,
    }));


  // "Chính sách cho phòng" is stored as room_amenities with type=POLICY (new flow),
  // but we keep backward compatibility with existing room_policies rows.
  const policiesFromRoomPolicies =
    (room.policies || []).map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      icon: p.logo ?? undefined,
    }));

  const policiesFromRoomAmenities =
    (room.amenities || [])
      .filter((a) => (a.type ?? '').toUpperCase() === 'POLICY')
      .map((a) => ({
        id: a.amenityId,
        name: a.amenityName,
        description: a.amenityName,
        icon: undefined as string | undefined,
      }));

  const policies = Array.from(
    new Map([...policiesFromRoomPolicies, ...policiesFromRoomAmenities].map((p) => [p.id, p])).values(),
  );

  return {
    ...card,
    address: property.addressDetail,
    location: room.location || property.addressDetail,
    images: imgs.length ? imgs : card.image ? [card.image] : [],
    additionalInfo: property.description ?? '',
    amenitiesDetailed,
    reviews: [],
    policies,
    schedules: room.schedules || [],
    timeslots: room.timeslots || [],
    roomId: room.id,
  };
}
