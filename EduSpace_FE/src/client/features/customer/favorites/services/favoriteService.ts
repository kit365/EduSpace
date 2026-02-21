import { Space } from '../../../../../types/space';
import { FAVORITE_SPACES } from '../data/mockData';

class FavoriteService {
    async getFavorites(): Promise<Space[]> {
        return new Promise((resolve) => {
            setTimeout(() => resolve(FAVORITE_SPACES), 400);
        });
    }

    async toggleFavorite(spaceId: number): Promise<boolean> {
        return new Promise((resolve) => {
            setTimeout(() => resolve(true), 300);
        });
    }
}

export const favoriteService = new FavoriteService();
