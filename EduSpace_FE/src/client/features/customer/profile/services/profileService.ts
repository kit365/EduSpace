import { UserProfile, UserResponse, UpdateProfileRequest, TwoFactorSetup, PublicUserProfile } from '../types';
import apiClient from '../../../../../lib/axios';
import { ACCOUNT_API } from '../../../../../config/api/account';
import { ApiResponse, User } from '@/types';

class ProfileService {
    async getProfile(): Promise<UserProfile> {
        try {
            const response = await apiClient.get<unknown, ApiResponse<UserResponse>>(ACCOUNT_API.ME);
            const data = response.data;

        let role = 'renter';
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
            cityState: data.cityState ?? undefined,
            district: data.district ?? undefined,
            ward: data.ward ?? undefined,
            streetAddress: data.streetAddress ?? undefined,
            postalCode: data.postalCode ?? undefined,
            taxId: data.taxId ?? undefined,
            memberSince: memberSinceStr,
            is2faEnabled: data.is2faEnabled || false,
            organizationName: data.organizationName || '',
            role: role as any,
            verified: data.isEmailVerified,
            kycStatus: 'not_submitted', // Fallback, mock for now
            totalBookings: 0,
            totalReviews: 0,
            rating: 5.0,
            totalSpent: 0
        };
        } catch (error: any) {
            console.error('Failed to fetch profile:', error);
            const errMsg = error.response?.data?.message || error.message || 'Không thể lấy thông tin cá nhân';
            // Note: useProfile hook usually handles this, but we toast just in case
            throw error;
        }
    }

    async updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
        const updateData: UpdateProfileRequest = {
            fullName: data.name || '',
            phoneNumber: data.phone || '',
            avatarUrl: data.avatar || '',
            studentId: '',
            location: data.location || '',
            shortBio: data.bio || '',
            cityState: data.cityState,
            district: data.district,
            ward: data.ward,
            streetAddress: data.streetAddress,
            postalCode: data.postalCode,
            taxId: data.taxId,
            organizationName: data.organizationName
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

    async getPublicProfile(userId: string): Promise<PublicUserProfile> {
        try {
            const response = await apiClient.get<unknown, ApiResponse<PublicUserProfile>>(`${ACCOUNT_API.BASE}/${userId}/public`);
            return response.data;
        } catch (error: any) {
            console.error('Failed to fetch public profile:', error);
            throw error;
        }
    }
}

export const profileService = new ProfileService();
