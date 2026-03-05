import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ==========================================
// Global Auth Store
// Dùng chung cho Header, Layout, ProtectedRoute, v.v.
// Feature auth cũng re-export từ đây
// ==========================================

export interface AuthTokens {
    access_token: string;
    refresh_token: string;
    expires_in: number;
}

export interface AuthState {
    accessToken: string | null;
    refreshToken: string | null;
    expiresIn: number | null;
    isAuthenticated: boolean;
}

export interface AuthActions {
    setTokens: (tokens: AuthTokens) => void;
    clearTokens: () => void;
    getAccessToken: () => string | null;
    getRefreshToken: () => string | null;
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

            // --- Actions ---
            setTokens: (tokens: AuthTokens) =>
                set({
                    accessToken: tokens.access_token,
                    refreshToken: tokens.refresh_token,
                    expiresIn: tokens.expires_in,
                    isAuthenticated: true,
                }),

            clearTokens: () =>
                set({
                    accessToken: null,
                    refreshToken: null,
                    expiresIn: null,
                    isAuthenticated: false,
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
