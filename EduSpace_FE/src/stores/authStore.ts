import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GUEST_ID_KEY } from '../utils/guest';

// ==========================================
// Global Auth Store
// Dùng chung cho Header, Layout, ProtectedRoute, v.v.
// Feature auth cũng re-export từ đây
// ==========================================

/** Matches BE LoginResponse (snake_case); camelCase tolerated if a proxy changes JSON */
export interface AuthTokens {
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
    accessToken?: string;
    refreshToken?: string;
    expiresIn?: number;
}

export interface AuthState {
    accessToken: string | null;
    refreshToken: string | null;
    expiresIn: number | null;
    isAuthenticated: boolean;
    /** Quyền host từ GET /accounts/me (DB); bổ sung khi JWT Keycloak không có claim permissions */
    hostPermissionsFromAccount: string[];
}

export interface AuthActions {
    setTokens: (tokens: AuthTokens) => void;
    clearTokens: () => void;
    getAccessToken: () => string | null;
    getRefreshToken: () => string | null;
    setHostPermissionsFromAccount: (permissions: string[] | null | undefined) => void;
}

export type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
    persist(
        (set, get) => ({
            // --- State ---
            accessToken: null,
            refreshToken: null,
            expiresIn: null,
            isAuthenticated: false,
            hostPermissionsFromAccount: [],

            // --- Actions ---
            setTokens: (tokens: AuthTokens) => {
                const rawAccess = tokens.access_token ?? tokens.accessToken;
                const rawRefresh = tokens.refresh_token ?? tokens.refreshToken;
                const accessToken =
                    typeof rawAccess === 'string'
                        ? rawAccess.replace(/^Bearer\s+/i, '').trim()
                        : rawAccess;
                const refreshToken =
                    typeof rawRefresh === 'string' ? rawRefresh.trim() : rawRefresh;
                const expiresRaw = tokens.expires_in ?? tokens.expiresIn;
                if (typeof accessToken !== 'string' || typeof refreshToken !== 'string') {
                    console.warn('[authStore] setTokens: missing access or refresh token');
                    return;
                }
                let expiresIn: number | null = null;
                if (typeof expiresRaw === 'number' && Number.isFinite(expiresRaw)) {
                    expiresIn = expiresRaw;
                } else if (typeof expiresRaw === 'string' && expiresRaw !== '') {
                    const n = Number(expiresRaw);
                    if (Number.isFinite(n)) expiresIn = n;
                }
                set({
                    accessToken,
                    refreshToken,
                    expiresIn,
                    isAuthenticated: true,
                });
                try {
                    localStorage.removeItem(GUEST_ID_KEY);
                } catch {
                    /* ignore */
                }
            },

            setHostPermissionsFromAccount: (permissions) =>
                set({
                    hostPermissionsFromAccount:
                        Array.isArray(permissions) && permissions.length > 0 ? [...permissions] : [],
                }),

            clearTokens: () =>
                set({
                    accessToken: null,
                    refreshToken: null,
                    expiresIn: null,
                    isAuthenticated: false,
                    hostPermissionsFromAccount: [],
                }),

            getAccessToken: () => get().accessToken,
            getRefreshToken: () => get().refreshToken,
        }),
        {
            name: 'eduspace-auth', // localStorage key
            partialize: (state) => ({
                accessToken: state.accessToken,
                refreshToken: state.refreshToken,
                expiresIn: state.expiresIn,
                isAuthenticated: state.isAuthenticated,
            }),
        },
    ),
);
