import { Space, SpaceDetails } from '../../../../../types/space';
import { SPACE_DETAILS_DATA } from '../data/mockData';
import { SEARCH_RESULTS } from '../../search/data/mockData';
import { TOP_RATED_SPACES } from '../../home/data/mockData';

class SpaceService {
    async getSpaceDetails(id: number): Promise<SpaceDetails> {
        // Simulate API call
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const details = SPACE_DETAILS_DATA[id];
                if (details) resolve(details);
                else reject(new Error('Space not found'));
            }, 500);
        });
    }

    async searchSpaces(query: any): Promise<Space[]> {
        // Simulate API search
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(SEARCH_RESULTS);
            }, 800);
        });
    }

    async getTopRatedSpaces(): Promise<Space[]> {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(TOP_RATED_SPACES);
            }, 300);
        });
    }
}

export const spaceService = new SpaceService();
