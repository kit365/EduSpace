import { Space } from '../../../../../types/space';
import { FAVORITE_SPACES } from '../data/mockData';

const STORAGE_KEY = 'eduspace_favorite_spaces_v1';
const CHANGED = 'eduspace-favorites-changed';

function readStorage(): Space[] | null {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw === null) return null;
        return JSON.parse(raw) as Space[];
    } catch {
        return null;
    }
}

function writeStorage(spaces: Space[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(spaces));
    window.dispatchEvent(new CustomEvent(CHANGED));
}

function normalizeSpace(space: Space): Space {
    return {
        ...space,
        amenities: space.amenities ?? [],
        verified: space.verified ?? true,
        type: space.type ?? 'other',
        rating: space.rating ?? 0,
        image: space.image || '/placeholder-space.jpg',
    };
}

/** Lần đầu (chưa có key): seed bằng mock để giữ demo; sau đó chỉ đọc/ghi user data. */
function getAll(): Space[] {
    const data = readStorage();
    if (data === null) {
        const initial = FAVORITE_SPACES.map((s) => normalizeSpace(s));
        writeStorage(initial);
        return initial;
    }
    return data;
}

class FavoriteService {
    /** Đọc đồng bộ (cho hook subscribe). */
    getAllSync(): Space[] {
        return getAll();
    }

    async getFavorites(): Promise<Space[]> {
        return Promise.resolve(getAll());
    }

    isFavorite(spaceId: number): boolean {
        return getAll().some((s) => s.id === spaceId);
    }

    async addFavorite(space: Space): Promise<boolean> {
        const all = getAll();
        if (all.some((s) => s.id === space.id)) return true;
        writeStorage([...all, normalizeSpace(space)]);
        return true;
    }

    /** Xóa khỏi yêu thích (dùng trên trang Favorites). */
    async removeFavorite(spaceId: number): Promise<boolean> {
        const next = getAll().filter((s) => s.id !== spaceId);
        writeStorage(next);
        return true;
    }

    /** Giữ tên cũ: toggle = remove. */
    async toggleFavorite(spaceId: number): Promise<boolean> {
        return this.removeFavorite(spaceId);
    }

    /** Bấm tim trên search: thêm nếu chưa có, nếu đã có thì gỡ. */
    async toggleFavoriteSpace(space: Space): Promise<boolean> {
        if (this.isFavorite(space.id)) {
            return this.removeFavorite(space.id);
        }
        return this.addFavorite(space);
    }
}

export const favoriteService = new FavoriteService();

export function subscribeFavoriteChanges(listener: () => void): () => void {
    window.addEventListener(CHANGED, listener);
    return () => window.removeEventListener(CHANGED, listener);
}
