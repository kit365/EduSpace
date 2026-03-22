import { API_PREFIX } from './base';

const BASE_ACCOUNT = `${API_PREFIX}/accounts`;

export const ACCOUNT_API = {
  ME: `${BASE_ACCOUNT}/me`,
  SETUP_2FA: `${BASE_ACCOUNT}/me/2fa/setup`,
  ENABLE_2FA: `${BASE_ACCOUNT}/me/2fa/enable`,
  DISABLE_2FA: `${BASE_ACCOUNT}/me/2fa/disable`,
  /** Đơn đối tác: GET/POST …/me */
  HOST_APPLICATIONS_ME: `${BASE_ACCOUNT}/host-applications/me`,
  HOST_APPLICATIONS_ME_PENDING_BRANCH_UPDATES: `${BASE_ACCOUNT}/host-applications/me/pending-branch-updates`,
  HOST_APPLICATIONS_ADMIN: `${BASE_ACCOUNT}/host-applications/admin`,
} as const;
