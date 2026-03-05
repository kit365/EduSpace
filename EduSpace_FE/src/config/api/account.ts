import { API_PREFIX } from './base';

const BASE_ACCOUNT = `${API_PREFIX}/accounts`;

export const ACCOUNT_API = {
    ME: `${BASE_ACCOUNT}/me`,
    SETUP_2FA: `${BASE_ACCOUNT}/me/2fa/setup`,
    ENABLE_2FA: `${BASE_ACCOUNT}/me/2fa/enable`,
    DISABLE_2FA: `${BASE_ACCOUNT}/me/2fa/disable`,
} as const;
