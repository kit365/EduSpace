import { API_PREFIX } from './base';

const BASE_ACCOUNT = `${API_PREFIX}/accounts`;

export const ACCOUNT_API = {
  BASE: BASE_ACCOUNT,
  ME: `${BASE_ACCOUNT}/me`,
  SETUP_2FA: `${BASE_ACCOUNT}/me/2fa/setup`,
  ENABLE_2FA: `${BASE_ACCOUNT}/me/2fa/enable`,
  DISABLE_2FA: `${BASE_ACCOUNT}/me/2fa/disable`,
  /** Đơn đối tác: GET/POST …/me */
  HOST_APPLICATIONS_ME: `${BASE_ACCOUNT}/host-applications/me`,
  HOST_APPLICATIONS_ME_PENDING_BRANCH_UPDATES: `${BASE_ACCOUNT}/host-applications/me/pending-branch-updates`,
  HOST_APPLICATIONS_ADMIN: `${BASE_ACCOUNT}/host-applications/admin`,
    /** Admin portal heartbeat — marks support staff as “online” for guest widget. */
    ME_SUPPORT_PRESENCE: `${BASE_ACCOUNT}/me/support-presence`,
    /** Host Console — Level-2 STAFF RBAC (list/create/update permissions/remove). */
    HOST_STAFF: `${BASE_ACCOUNT}/host/staff`,
  PUBLIC_SUPPORT_ONLINE_STAFF_COUNT: `${BASE_ACCOUNT}/public/support/online-staff-count`,
} as const;
