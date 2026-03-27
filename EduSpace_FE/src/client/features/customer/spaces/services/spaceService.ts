import type { Space, SpaceDetails } from '@/types/space';
import type { PageResponse, PropertyDto, RoomCategoryDto, RoomDto } from '@/client/features/room';
import {
  propertyApiService,
  roomApiService,
  roomAndPropertyToSpaceDetails,
  roomToSpaceCard,
} from '@/client/features/room';
import { isRoomOpenForBooking } from '@/client/features/room/utils/roomOperationalStatus';
import { DISTRICT_OPTIONS } from '@/config/constants';
import { profileService } from '@/client/features/customer/profile/services/profileService';

function parseSpaceRef(param: string): { kind: 'id'; id: number } | { kind: 'slug'; slug: string } | null {
  const t = param?.trim();
  if (!t) return null;
  const decoded = decodeURIComponent(t);
  if (/^\d+$/.test(decoded)) {
    const id = parseInt(decoded, 10);
    if (id >= 1) return { kind: 'id', id };
  }
  return { kind: 'slug', slug: decoded };
}
import { SPACE_DETAILS_DATA } from '../data/mockData';
import { DEMO_SPACE_BY_SLUG, DEMO_TOP_SPACES } from '../data/demoBySlug';

/** Slug (URL / FE) ↔ administrative district code — must stay inverse-consistent. */
const DISTRICT_SLUG_TO_CODE: Record<string, string> = {
  'quan-1': '760',
  'quan-3': '770',
  'quan-7': '778',
  'binh-thanh': '771',
  'phu-nhuan': '776',
  'thu-duc': '769',
  'tan-binh': '774',
  'go-vap': '764',
};

const CODE_TO_DISTRICT_SLUG: Record<string, string> = Object.fromEntries(
  Object.entries(DISTRICT_SLUG_TO_CODE).map(([slug, code]) => [code, slug]),
);

/** Backend dayOfWeek: Mon=2 … Sun=8 (see room schedules). */
function dayOfWeekFromIsoDate(iso?: string): number {
  const d = iso ? new Date(`${iso}T12:00:00`) : new Date();
  const jsDay = d.getDay();
  return jsDay === 0 ? 8 : jsDay + 1;
}

async function roomsToSpaces(rooms: RoomDto[]): Promise<Space[]> {
  const propCache = new Map<number, PropertyDto>();
  const out: Space[] = [];
  for (const r of rooms) {
    let p = propCache.get(r.propertyId);
    if (!p) {
      try {
        p = await propertyApiService.getById(r.propertyId);
        propCache.set(r.propertyId, p);
      } catch {
        continue;
      }
    }
    out.push(roomToSpaceCard(r, p));
  }
  return out;
}

class SpaceService {
  /**
   * ref: slug (phong-hop-alpha) hoặc id số (1).
   */
  async getSpaceDetails(ref: string): Promise<SpaceDetails> {
    const parsed = parseSpaceRef(ref);
    if (!parsed) {
      return new Promise((_, reject) => setTimeout(() => reject(new Error('Space not found')), 200));
    }

    if (parsed.kind === 'slug') {
      const key = parsed.slug.toLowerCase();
      try {
        const room = await roomApiService.getByRef(parsed.slug);
        const property = await propertyApiService.getById(room.propertyId);
        const details = roomAndPropertyToSpaceDetails(room, property);
        
        if (property.ownerId) {
          try {
            const hostProfile = await profileService.getPublicProfile(property.ownerId);
            details.host = {
              name: hostProfile.fullName,
              avatar: hostProfile.avatarUrl,
              joinedDate: hostProfile.createdAt,
              isVerified: hostProfile.isEmailVerified,
              phone: property.contactPhone,
              email: property.contactEmail
            };
            details.hostName = hostProfile.fullName;
          } catch (e) {
            console.error('Failed to fetch host profile', e);
          }
        }
        return details;
      } catch {
        const demo = DEMO_SPACE_BY_SLUG[key];
        if (demo) return { ...demo };
        throw new Error('Space not found');
      }
    }

    try {
      const room = await roomApiService.getByRef(String(parsed.id));
      const property = await propertyApiService.getById(room.propertyId);
      const details = roomAndPropertyToSpaceDetails(room, property);
      
      if (property.ownerId) {
        try {
          const hostProfile = await profileService.getPublicProfile(property.ownerId);
          details.host = {
            name: hostProfile.fullName,
            avatar: hostProfile.avatarUrl,
            joinedDate: hostProfile.createdAt,
            isVerified: hostProfile.isEmailVerified,
            phone: property.contactPhone,
            email: property.contactEmail
          };
          details.hostName = hostProfile.fullName;
        } catch (e) {
          console.error('Failed to fetch host profile', e);
        }
      }
      return details;
    } catch {
      const legacy = SPACE_DETAILS_DATA[parsed.id];
      if (legacy) return { ...legacy };
      throw new Error('Space not found');
    }
  }

  async searchSpaces(query: {
    keyword?: string;
    q?: string;
    category?: string;
    priceRange?: [number, number];
    capacity?: string;
    amenities?: string[];
    district?: string;
    timeStart?: string;
    timeEnd?: string;
    /** yyyy-MM-dd — used for schedule day matching (hero + URL `date`). */
    bookingDate?: string;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: string;
  }): Promise<PageResponse<Space>> {
    const q = (query?.keyword ?? query?.q ?? '').toString().toLowerCase().trim();
    const category = query?.category?.trim();

    let minCapacity: number | undefined;
    if (query.capacity) {
      const parts = query.capacity.split('-');
      if (parts.length > 0) minCapacity = parseInt(parts[0]);
    }

    let amenityIds: number[] | undefined;
    if (query.amenities && query.amenities.length > 0) {
      try {
        const allAmenities = await roomApiService.getAllAmenities();
        // FE constants labels like 'projector' match backend 'icon' (presentation)
        const labelToIcon: Record<string, string> = {
          'projector': 'presentation',
          'whiteboard': 'board',
          'wifi': 'wifi',
          'ac': 'ac',
          'parking': 'parking',
          'sound': 'support-247',
          'webcam': 'support'
        };
        amenityIds = allAmenities
          .filter((a: any) => query.amenities!.some((label: string) => (labelToIcon[label] || label) === a.icon))
          .map((a: any) => a.id);
      } catch (e) {
        console.error('Failed to map amenities', e);
      }
    }

    try {
      // Use getPublicRooms with all parameters
      const resp = await roomApiService.getPublicRooms({
        category,
        keyword: q || undefined,
        minCapacity,
        minPrice: query.priceRange?.[0],
        maxPrice: query.priceRange?.[1],
        amenityIds,
        districtCode: query.district
          ? DISTRICT_SLUG_TO_CODE[query.district] ||
            (query.district === 'all' ? undefined : query.district)
          : undefined,
        page: query.page ?? 1,
        size: query.size ?? 12,
        sortBy: query.sortBy,
        sortDir: query.sortDir,
      });

      // Handle both PageResponse and plain Array (legacy/error)
      const pageData: PageResponse<RoomDto> = (Array.isArray(resp)) 
        ? { content: resp, totalElements: resp.length, totalPages: 1, page: 1, size: resp.length, last: true }
        : resp;

      const content = pageData?.content || [];
      let list = content.filter(
        (r: RoomDto) => r.approvalStatus === 'APPROVED' && isRoomOpenForBooking(r.status),
      );

      const clientTimeFiltered = Boolean(query.timeStart && query.timeEnd);
      const clientDateOnlyFiltered = Boolean(query.bookingDate && !clientTimeFiltered);

      if (clientTimeFiltered) {
        const userDay = dayOfWeekFromIsoDate(query.bookingDate);
        list = list.filter((r) => {
          const schedule = r.schedules?.find((s) => s.dayOfWeek === userDay);
          if (!schedule || !schedule.isOpen) return false;
          if (!schedule.openTime || !schedule.closeTime) return true;

          const open = schedule.openTime.substring(0, 5);
          const close = schedule.closeTime.substring(0, 5);
          return query.timeStart! >= open && query.timeEnd! <= close;
        });
      } else if (clientDateOnlyFiltered) {
        const userDay = dayOfWeekFromIsoDate(query.bookingDate);
        list = list.filter((r) => {
          const schedule = r.schedules?.find((s) => s.dayOfWeek === userDay);
          return Boolean(schedule?.isOpen);
        });
      }

      const clientFiltered = clientTimeFiltered || clientDateOnlyFiltered;
      const spaces = await roomsToSpaces(list);
      return {
        ...pageData,
        content: spaces,
        totalElements: clientFiltered ? list.length : pageData.totalElements,
        totalPages: clientFiltered ? 1 : pageData.totalPages,
        last: clientFiltered ? true : pageData.last,
      };
    } catch (error) {
      console.error('Search failed', error);
      
      // If API failed, return empty PageResponse instead of falling back to demo data
      // unless we specifically want demo data for empty DBs
      return {
        content: [],
        page: 1,
        size: 0,
        totalElements: 0,
        totalPages: 0,
        last: true
      };
    }
  }

  async getTopRatedSpaces(): Promise<Space[]> {
    try {
      const rooms = await roomApiService.getAll();
      const approved = rooms.filter(
        (r) => r.approvalStatus === 'APPROVED' && isRoomOpenForBooking(r.status),
      );
      const sorted = [...approved].sort(
        (a, b) => (Number(b.avgRating) || 0) - (Number(a.avgRating) || 0),
      );
      const spaces = await roomsToSpaces(sorted.slice(0, 12));
      if (spaces.length) return spaces;
    } catch {
      /* demo */
    }
    return DEMO_TOP_SPACES.map((s) => ({ ...s }));
  }

  async getCategories(): Promise<RoomCategoryDto[]> {
    try {
      return await roomApiService.getPublicCategories();
    } catch {
      return [];
    }
  }

  async getFeaturedCategories(): Promise<RoomCategoryDto[]> {
    try {
      return await roomApiService.getFeaturedCategories();
    } catch {
      return [];
    }
  }

  async getAllCategoriesAdmin(): Promise<RoomCategoryDto[]> {
    return roomApiService.getAllCategories();
  }

  async updateCategory(id: number, body: Partial<RoomCategoryDto>): Promise<RoomCategoryDto> {
    return roomApiService.updateCategory(id, body);
  }
  async getAvailableDistricts(): Promise<{ value: string; labelKey: string }[]> {
    try {
      const properties = await propertyApiService.getAll();
      const availableCodes = new Set(properties.map((p) => p.districtCode).filter(Boolean));
      const availableValues = new Set(
        Array.from(availableCodes)
          .map((code) => CODE_TO_DISTRICT_SLUG[code!])
          .filter(Boolean),
      );
      
      if (availableValues.size === 0) return [...DISTRICT_OPTIONS];

      return DISTRICT_OPTIONS.filter((opt: any) => opt.value === 'all' || availableValues.has(opt.value));
    } catch {
      return [...DISTRICT_OPTIONS];
    }
  }
}

export const spaceService = new SpaceService();
