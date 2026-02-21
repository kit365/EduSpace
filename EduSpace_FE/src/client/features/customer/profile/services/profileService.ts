import { UserProfile } from '../types';
import { USER_PROFILE } from '../data/mockData';

class ProfileService {
    async getProfile(): Promise<UserProfile> {
        return new Promise((resolve) => {
            setTimeout(() => resolve(USER_PROFILE), 300);
        });
    }

    async updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
        return new Promise((resolve) => {
            setTimeout(() => resolve({ ...USER_PROFILE, ...data }), 500);
        });
    }
}

export const profileService = new ProfileService();
