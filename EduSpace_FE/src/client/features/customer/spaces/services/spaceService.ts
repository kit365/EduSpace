import type { Space, SpaceDetails } from '@/types/space';
import type { PropertyDto, RoomDto } from '@/client/features/room';
import {
  propertyApiService,
  roomApiService,
  roomAndPropertyToSpaceDetails,
  roomToSpaceCard,
} from '@/client/features/room';

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
import { SEARCH_RESULTS } from '../../search/data/mockData';
import { DEMO_SPACE_BY_SLUG, DEMO_TOP_SPACES } from '../data/demoBySlug';

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
        return roomAndPropertyToSpaceDetails(room, property);
      } catch {
        const demo = DEMO_SPACE_BY_SLUG[key];
        if (demo) return { ...demo };
        throw new Error('Space not found');
      }
    }

    try {
      const room = await roomApiService.getByRef(String(parsed.id));
      const property = await propertyApiService.getById(room.propertyId);
      return roomAndPropertyToSpaceDetails(room, property);
    } catch {
      const legacy = SPACE_DETAILS_DATA[parsed.id];
      if (legacy) return { ...legacy };
      throw new Error('Space not found');
    }
  }

  async searchSpaces(query: { keyword?: string; q?: string }): Promise<Space[]> {
    const q = (query?.keyword ?? query?.q ?? '').toString().toLowerCase().trim();
    try {
      const rooms = await roomApiService.getAll();
      let list = rooms.filter((r) => r.approvalStatus === 'APPROVED' && r.status === 'ACTIVE');
      if (q) {
        list = list.filter(
          (r) =>
            r.name.toLowerCase().includes(q) ||
            (r.description ?? '').toLowerCase().includes(q) ||
            (r.slug ?? '').includes(q),
        );
      }
      const spaces = await roomsToSpaces(list.slice(0, 48));
      if (spaces.length) return spaces;
    } catch {
      /* demo */
    }
    if (DEMO_TOP_SPACES.length) return DEMO_TOP_SPACES.map((s) => ({ ...s }));
    return SEARCH_RESULTS.map((s) => ({
      ...s,
      slug: s.slug ?? `space-${s.id}`,
    }));
  }

  async getTopRatedSpaces(): Promise<Space[]> {
    try {
      const rooms = await roomApiService.getAll();
      const approved = rooms.filter(
        (r) => r.approvalStatus === 'APPROVED' && r.status === 'ACTIVE',
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
}

export const spaceService = new SpaceService();
