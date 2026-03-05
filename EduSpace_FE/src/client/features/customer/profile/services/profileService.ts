import { UserProfile, UserResponse, UpdateProfileRequest, TwoFactorSetup } from '../types';
import apiClient from '../../../../../lib/axios';
import { ACCOUNT_API } from '../../../../../config/api/account';
import { ApiResponse } from '../../../../../types/api';

class ProfileService {
    async getProfile(): Promise<UserProfile> {
        const response = await apiClient.post<unknown, ApiResponse<UserResponse>>(ACCOUNT_API.ME);
        const data = response.data;

        // Convert BE "ROLE_CUSTOMER" to FE format
        let role = 'renter'; // default fallback
        if (data.roles && data.roles.length > 0) {
            const rawRole = data.roles[0].toLowerCase().replace('role_', '');
            if (rawRole === 'student') role = 'renter';
            else if (rawRole === 'tutor') role = 'host';
            else if (rawRole === 'admin') role = 'admin';
            else role = rawRole;
        }

        // Parse date safely
        const memberSinceStr = data.createdAt;

        return {
            id: data.id,
            name: data.fullName,
            email: data.email,
            phone: data.phoneNumber || '',
            avatar: data.avatarUrl || '',
            bio: data.shortBio || '',
            location: data.location || '',
            memberSince: memberSinceStr,
            is2faEnabled: data.is2faEnabled || false,
            role: role as any,
            verified: data.isEmailVerified,
            kycStatus: 'not_submitted', // Fallback, mock for now
            totalBookings: 0,
            totalReviews: 0,
            rating: 5.0,
            totalSpent: 0
        };
    }

    async updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
        const updateData: UpdateProfileRequest = {
            fullName: data.name || '',
            phoneNumber: data.phone || '',
            avatarUrl: data.avatar || '',
            studentId: '',
            location: data.location || '',
            shortBio: data.bio || ''
        };

        await apiClient.put<unknown, ApiResponse<UserResponse>>(ACCOUNT_API.ME, updateData);
        return this.getProfile();
    }

    async changePassword(oldPassword: string, newPassword: string): Promise<boolean> {
        try {
            await apiClient.post(ACCOUNT_API.ME + "/password", {
                oldPassword,
                newPassword
            });
            return true;
        } catch (error) {
            throw error;
        }
    }

    async setup2fa(): Promise<TwoFactorSetup> {
        const response = await apiClient.get<unknown, ApiResponse<TwoFactorSetup>>(ACCOUNT_API.SETUP_2FA);
        return response.data;
    }

    async enable2fa(code: string): Promise<boolean> {
        await apiClient.post(ACCOUNT_API.ENABLE_2FA, null, { params: { code } });
        return true;
    }

    async disable2fa(code: string): Promise<boolean> {
        await apiClient.post(ACCOUNT_API.DISABLE_2FA, null, { params: { code } });
        return true;
    }
}

export const profileService = new ProfileService();
