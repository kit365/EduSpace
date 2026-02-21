export const APP_NAME = 'EduSpace';
export const APP_TAGLINE = 'Không gian kết nối tri thức';
export const APP_DESCRIPTION = 'Nền tảng cho thuê không gian giáo dục hàng đầu Việt Nam';

export const ROUTES = {
  HOME: '/',
  SEARCH: '/search',
  SPACE_DETAIL: '/space',
  LOGIN: '/login',
  SIGNUP: '/signup',
  HOST_DASHBOARD: '/host',
} as const;

export const PRICE_RANGE = {
  MIN: 50000,
  MAX: 500000,
} as const;

// FR-06: Capacity giới hạn 4-50 người - use i18n keys
export const CAPACITY_OPTIONS = [
  { value: '4-10', labelKey: 'customer.search.capacityOptions.small' },
  { value: '10-20', labelKey: 'customer.search.capacityOptions.medium' },
  { value: '20-30', labelKey: 'customer.search.capacityOptions.large' },
  { value: '30-50', labelKey: 'customer.search.capacityOptions.xlarge' },
] as const;

// FR-06: Khu vực Quận/Huyện - use i18n keys for labels
export const DISTRICT_OPTIONS = [
  { value: 'all', labelKey: 'customer.search.districtOptions.all' },
  { value: 'quan-1', labelKey: 'customer.search.districtOptions.quan1' },
  { value: 'quan-3', labelKey: 'customer.search.districtOptions.quan3' },
  { value: 'quan-7', labelKey: 'customer.search.districtOptions.quan7' },
  { value: 'binh-thanh', labelKey: 'customer.search.districtOptions.binhThanh' },
  { value: 'phu-nhuan', labelKey: 'customer.search.districtOptions.phuNhuan' },
  { value: 'thu-duc', labelKey: 'customer.search.districtOptions.thuDuc' },
  { value: 'tan-binh', labelKey: 'customer.search.districtOptions.tanBinh' },
  { value: 'go-vap', labelKey: 'customer.search.districtOptions.goVap' },
] as const;

// FR-06: Khung giờ tìm kiếm
export const TIME_SLOTS = [
  '07:00', '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00', '16:00',
  '17:00', '18:00', '19:00', '20:00', '21:00',
] as const;

export const AMENITIES_LIST = [
  { value: 'projector', labelKey: 'customer.search.amenitiesOptions.projector' },
  { value: 'whiteboard', labelKey: 'customer.search.amenitiesOptions.whiteboard' },
  { value: 'wifi', labelKey: 'customer.search.amenitiesOptions.wifi' },
  { value: 'ac', labelKey: 'customer.search.amenitiesOptions.ac' },
  { value: 'parking', labelKey: 'customer.search.amenitiesOptions.parking' },
  { value: 'sound', labelKey: 'customer.search.amenitiesOptions.sound' },
  { value: 'webcam', labelKey: 'customer.search.amenitiesOptions.webcam' },
] as const;

export const ROOM_TYPES = [
  { value: 'classroom', labelKey: 'customer.search.roomTypeOptions.classroom', count: 84 },
  { value: 'auditorium', labelKey: 'customer.search.roomTypeOptions.auditorium', count: 12 },
  { value: 'meeting', labelKey: 'customer.search.roomTypeOptions.meeting', count: 36 },
  { value: 'studio', labelKey: 'customer.search.roomTypeOptions.studio', count: 18 },
] as const;
