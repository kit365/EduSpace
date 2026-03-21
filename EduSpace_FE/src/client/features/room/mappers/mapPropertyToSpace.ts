import type { Space, SpaceDetails, SpaceApprovalStatus, SpaceType } from '@/types/space';
import type { PropertyDto, RoomDto, PropertyStatus, RoomType } from '../types';
import { isRoomOpenForBooking } from '../utils/roomOperationalStatus';

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
  const imgs = primary ? parseImages(primary.images) : [];
  const logo = property.logo?.trim() || imgs[0] || '/placeholder-space.jpg';

  return {
    id: property.id,
    slug: primary?.slug,
    name: property.name,
    location: property.address,
    address: property.address,
    capacity: primary?.capacity ?? 0,
    size: primary?.area != null ? Number(primary.area) : undefined,
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
  };
}

/** Một phòng + property → card listing (id = room.id, slug cho URL). */
export function roomToSpaceCard(room: RoomDto, property: PropertyDto): Space {
  const imgs = parseImages(room.images);
  const image = imgs[0] || property.logo?.trim() || '';
  return {
    id: room.id,
    slug: room.slug || undefined,
    name: room.name,
    location: room.location || property.address,
    address: property.address,
    capacity: room.capacity,
    size: room.area != null ? Number(room.area) : undefined,
    price: roomPricePerHour(room),
    rating: room.avgRating != null ? Number(room.avgRating) : 0,
    reviewCount: room.reviewCount ?? 0,
    image,
    images: imgs.length ? imgs : image ? [image] : [],
    verified: property.status === 'VERIFIED',
    type: mapRoomType(room.roomType),
    amenities: [],
    description: room.description ?? property.description ?? undefined,
    hostId: property.ownerId,
    approvalStatus: mapPropertyStatus(property.status),
  };
}

/** Chi tiết trang /{slug} — hero theo đúng phòng. */
export function roomAndPropertyToSpaceDetails(
  room: RoomDto,
  property: PropertyDto,
): SpaceDetails {
  const card = roomToSpaceCard(room, property);
  const imgs = parseImages(room.images);
  return {
    ...card,
    address: property.address,
    location: room.location || property.address,
    images: imgs.length ? imgs : card.image ? [card.image] : [],
    additionalInfo: property.description ?? '',
    amenitiesDetailed: [],
    reviews: [],
  };
}
