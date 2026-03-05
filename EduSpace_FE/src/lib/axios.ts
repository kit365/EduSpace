import axios from 'axios';
import { useAuthStore } from '../stores/authStore';
import { AUTH_API } from '../config/api';
import i18n from '../i18n/config';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 15000,
});

// Request interceptor: auto-attach access token
apiClient.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().accessToken;

        // Gắn ngôn ngữ hiện tại để BE dịch message lỗi
        config.headers['Accept-Language'] = i18n.language;

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error),
);

// Response interceptor: ép khung response từ BE & handle 401 auto-refresh
apiClient.interceptors.response.use(
    (response) => {
        if (response.data && response.data.success === false) {
            return Promise.reject(new Error(response.data.message || 'API Error'));
        }
        return response.data;
    },
    async (error) => {
        const originalRequest = error.config;
        if (!originalRequest) return Promise.reject(error);

        // Determine if this is an authentication-related request to avoid redirect loops
        const url = originalRequest.url || '';
        const isAuthRequest = url.includes('/auth/') || url.includes('/login') || url.includes('/refresh');

        // If 401 and not already retried, try refresh (only for non-auth requests)
        if (error.response?.status === 401 && !originalRequest._retry && !isAuthRequest) {
            originalRequest._retry = true;

            const refreshToken = useAuthStore.getState().refreshToken;
            if (refreshToken) {
                try {
                    const { data } = await axios.post(`${API_BASE_URL}${AUTH_API.REFRESH}`, {
                        refreshToken,
                    });

                    if (data.success && data.data) {
                        useAuthStore.getState().setTokens(data.data);
                        originalRequest.headers.Authorization = `Bearer ${data.data.access_token}`;
                        return apiClient(originalRequest);
                    }
                } catch (refreshError) {
                    console.error('Refresh token failed', refreshError);
                }
            }

            // If we reach here, refresh failed or no token was found
            useAuthStore.getState().clearTokens();
            window.location.href = '/auth';
            return Promise.reject(error);
        }

        // Common handling for 401 status when no refresh is possible/attempted
        if (error.response?.status === 401 && !isAuthRequest) {
            useAuthStore.getState().clearTokens();
            window.location.href = '/auth';
        }

        return Promise.reject(error);
    },
);

export default apiClient;
