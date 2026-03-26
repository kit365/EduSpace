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
    paramsSerializer: {
        indexes: null, // use amenityIds=1&amenityIds=2 instead of amenityIds[]=1
    },
});

let refreshPromise: Promise<string | null> | null = null;

/** POST login/refresh/register — never clear session on 401 */
function isAuthEndpointUrl(url: string): boolean {
    return url.includes('/auth/') || url.includes('/login') || url.includes('/refresh');
}

/**
 * Best-effort calls after login (e.g. claim guest threads). A 401 here must not wipe
 * a session that was just established — interceptor used to call clearTokens() and left
 * eduspace-auth null in localStorage.
 */
function isSessionClearExemptUrl(url: string): boolean {
    return url.includes('/claim-guest');
}

let authRedirectScheduled = false;

/** After session clear on irrecoverable 401, send user to app home (respects Vite base URL). */
function scheduleRedirectToHome(): void {
    if (authRedirectScheduled) return;
    authRedirectScheduled = true;
    const base = import.meta.env.BASE_URL || '/';
    const { pathname, search } = new URL(base, window.location.origin);
    window.location.replace((pathname || '/') + search);
}

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

        const url = originalRequest.url || '';

        if (error.response?.status !== 401) {
            return Promise.reject(error);
        }

        // Login/register/refresh failures — do not clear stored session
        if (isAuthEndpointUrl(url)) {
            return Promise.reject(error);
        }

        // Optional post-login calls: never clear session on 401
        if (isSessionClearExemptUrl(url)) {
            return Promise.reject(error);
        }

        // Retry once with refresh token
        if (!originalRequest._retry) {
            originalRequest._retry = true;

            const refreshToken = useAuthStore.getState().refreshToken;
            if (!refreshToken) {
                useAuthStore.getState().clearTokens();
                return Promise.reject(error);
            }

            if (!refreshPromise) {
                refreshPromise = (async () => {
                    try {
                        const { data } = await axios.post(`${API_BASE_URL}${AUTH_API.REFRESH}`, {
                            refreshToken,
                        });
                        const payload = data?.data;
                        if (data?.success && payload) {
                            useAuthStore.getState().setTokens(payload);
                            return payload.access_token ?? payload.accessToken ?? null;
                        }
                    } catch (refreshError) {
                        console.error('Refresh token failed', refreshError);
                    } finally {
                        refreshPromise = null;
                    }
                    useAuthStore.getState().clearTokens();
                    return null;
                })();
            }

            const bearer = await refreshPromise;
            if (typeof bearer === 'string' && bearer.length > 0) {
                try {
                    originalRequest.headers.Authorization = `Bearer ${bearer}`;
                    return apiClient(originalRequest);
                } catch {
                    useAuthStore.getState().clearTokens();
                }
            }

            useAuthStore.getState().clearTokens();
            scheduleRedirectToHome();
            return Promise.reject(error);
        }

        // Already retried and still 401
        useAuthStore.getState().clearTokens();
        scheduleRedirectToHome();
        return Promise.reject(error);
    },
);

export default apiClient;
