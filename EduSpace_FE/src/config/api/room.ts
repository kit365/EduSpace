import { API_PREFIX } from './base';

/** Gateway → room-service (xem api-gateway application.yml) */
export const ROOM_API = {
  PROPERTIES: `${API_PREFIX}/properties`,
  BRANCHES: `${API_PREFIX}/properties`,
  ROOMS: `${API_PREFIX}/rooms`,
  AMENITIES: `${API_PREFIX}/amenities`,
  ROOM_AMENITIES: `${API_PREFIX}/room-amenities`,
  REVIEWS: `${API_PREFIX}/reviews`,
  ROOM_ADS: `${API_PREFIX}/room-ads`,
  ROOM_BLOCKS: `${API_PREFIX}/room-blocks`,
  EXTRA_SERVICES: `${API_PREFIX}/extra-services`,
  ADS_PACKAGES: `${API_PREFIX}/ads-packages`,
  SYSTEM_CALENDAR_RULES: `${API_PREFIX}/system-calendar-rules`,
  ROOM_CATEGORIES: `${API_PREFIX}/room-categories`,

  /** Public endpoints */
  PUBLIC_ROOMS: `${API_PREFIX}/public/rooms`,
  PUBLIC_PROPERTIES: `${API_PREFIX}/public/properties`,
  PUBLIC_ROOM_CATEGORIES: `${API_PREFIX}/public/room-categories`,
} as const;
