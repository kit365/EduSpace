import apiClient from '../../../../../lib/axios';
import { AUTH_API } from '../../../../../config/api';
import { ApiResponse, AuthResponse } from '@/types';
import type {
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    RefreshTokenRequest,
} from '../types';

export const authService = {
    /**
     * POST /api/v1/auth/login
     */
    login: async (data: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
        const response = await apiClient.post<any, ApiResponse<LoginResponse>>(
            AUTH_API.LOGIN,
            data,
        );
        return response;
    },

    /**
     * POST /api/v1/auth/register
     */
    register: async (data: RegisterRequest): Promise<ApiResponse<void>> => {
        const response = await apiClient.post<any, ApiResponse<void>>(
            AUTH_API.REGISTER,
            data,
        );
        return response;
    },

    /**
     * POST /api/v1/auth/refresh
     */
    refreshToken: async (data: RefreshTokenRequest): Promise<ApiResponse<LoginResponse>> => {
        const response = await apiClient.post<any, ApiResponse<LoginResponse>>(
            AUTH_API.REFRESH,
            data,
        );
        return response;
    },

    /**
     * POST /api/v1/auth/logout
     */
    logout: async (data: RefreshTokenRequest): Promise<ApiResponse<void>> => {
        const response = await apiClient.post<any, ApiResponse<void>>(
            AUTH_API.LOGOUT,
            data,
        );
        return response;
    },

    /**
     * POST /api/v1/auth/verify-email
     */
    verifyEmail: async (token: string): Promise<ApiResponse<void>> => {
        const response = await apiClient.post<any, ApiResponse<void>>(
            `${AUTH_API.VERIFY_EMAIL}?token=${token}`
        );
        return response;
    },
};
