import { API_PREFIX } from './base';

const BASE_AUTH = `${API_PREFIX}/auth`;

export const AUTH_API = {
    LOGIN: `${BASE_AUTH}/login`,
    REGISTER: `${BASE_AUTH}/register`,
    REFRESH: `${BASE_AUTH}/refresh`,
    LOGOUT: `${BASE_AUTH}/logout`,
    VERIFY_EMAIL: `${BASE_AUTH}/verify-email`,
} as const;
