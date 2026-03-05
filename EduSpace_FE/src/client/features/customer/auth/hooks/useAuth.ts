import { useMutation } from '@tanstack/react-query';
import { authService } from '../services/authService';
import { useAuthStore } from '../stores/authStore';
import type { LoginRequest, RegisterRequest } from '../types';
import { AxiosError } from 'axios';
import type { ApiResponse } from '../../../../../types/api';

// ==========================================
// useLogin - Đăng nhập
// ==========================================
export const useLogin = () => {
    const setTokens = useAuthStore((s) => s.setTokens);

    return useMutation({
        mutationFn: (data: LoginRequest) => authService.login(data),
        onSuccess: (response) => {
            if (response.success && response.data) {
                setTokens(response.data);
            }
        },
        onError: (error: AxiosError<ApiResponse<null>>) => {
            console.error(
                '[useLogin] Error:',
                error.response?.data?.message || error.message,
            );
        },
    });
};

// ==========================================
// useRegister - Đăng ký
// ==========================================
export const useRegister = () => {
    return useMutation({
        mutationFn: (data: RegisterRequest) => authService.register(data),
        onError: (error: AxiosError<ApiResponse<null>>) => {
            console.error(
                '[useRegister] Error:',
                error.response?.data?.message || error.message,
            );
        },
    });
};

// ==========================================
// useLogout - Đăng xuất
// ==========================================
export const useLogout = () => {
    const clearTokens = useAuthStore((s) => s.clearTokens);
    const refreshToken = useAuthStore((s) => s.refreshToken);

    return useMutation({
        mutationFn: () => {
            if (!refreshToken) throw new Error('No refresh token');
            return authService.logout({ refreshToken });
        },
        onSuccess: () => {
            clearTokens();
        },
        onError: () => {
            // Even if logout API fails, clear local tokens
            clearTokens();
        },
    });
};

// ==========================================
// useRefreshToken - Làm mới token
// ==========================================
export const useRefreshToken = () => {
    const setTokens = useAuthStore((s) => s.setTokens);
    const clearTokens = useAuthStore((s) => s.clearTokens);
    const refreshToken = useAuthStore((s) => s.refreshToken);

    return useMutation({
        mutationFn: () => {
            if (!refreshToken) throw new Error('No refresh token');
            return authService.refreshToken({ refreshToken });
        },
        onSuccess: (response) => {
            if (response.success && response.data) {
                setTokens(response.data);
            }
        },
        onError: () => {
            clearTokens();
        },
    });
};

// ==========================================
// useVerifyEmail - Verify Email via Token
// ==========================================
export const useVerifyEmail = () => {
    return useMutation({
        mutationFn: (token: string) => authService.verifyEmail(token),
        onError: (error: AxiosError<ApiResponse<null>>) => {
            console.error(
                '[useVerifyEmail] Error:',
                error.response?.data?.message || error.message,
            );
        },
    });
};
