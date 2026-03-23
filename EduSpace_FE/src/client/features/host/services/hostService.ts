import { profileService } from '@/client/features/customer/profile/services/profileService';
import { propertyApiService } from '@/client/features/room/services/propertyApiService';
import { roomApiService } from '@/client/features/room/services/roomApiService';
import type { RoomCreateRequest, RoomScheduleSaveItem, RoomType } from '@/client/features/room/types';

export interface HostPublishFormData {
  branchId: number | null;
  /** Tên chi nhánh — dùng làm Property.name (cơ sở vật lý) */
  branchName: string;
  /** Tên phòng — map RoomEntity.name */
  roomName: string;
  roomType: string;
  /** Tiêu đề hiển thị công khai (mô tả / marketing) */
  title: string;
  address: string;
  roomNumber: string;
  capacity: number;
  size: number;
  floor: number;
  basePrice: number;
  pricePerDay: number;
  weekendSurcharge: number;
  is24_7: boolean;
  /** HH:mm */
  openTime: string;
  /** HH:mm */
  closeTime: string;
  amenities: string[];
  images: string[];
}

function mapRoomType(displayName: string): RoomType {
  const raw = (displayName || '').trim();
  if (raw === 'MEETING_ROOM' || raw === 'CLASSROOM' || raw === 'EVENT_SPACE' || raw === 'STUDIO' || raw === 'COWORKING') {
    return raw;
  }
  const n = raw.toLowerCase();
  if (n.includes('class') || n.includes('lớp') || n.includes('phòng học') || n.includes('đào tạo'))
    return 'CLASSROOM';
  if (n.includes('event') || n.includes('hall') || n.includes('sự kiện')) return 'EVENT_SPACE';
  if (n.includes('studio') || n.includes('lab') || n.includes('sáng tạo') || n.includes('máy tính'))
    return 'STUDIO';
  if (n.includes('cowork') || n.includes('chung') || n.includes('private office') || n.includes('văn phòng'))
    return 'COWORKING';
  return 'MEETING_ROOM';
}

function toLocalTime(isoOrHm: string): string {
  const s = isoOrHm.trim();
  if (/^\d{1,2}:\d{2}$/.test(s)) {
    const [h, m] = s.split(':');
    return `${h.padStart(2, '0')}:${m.padStart(2, '0')}:00`;
  }
  if (s.split(':').length === 3) return s;
  return `${s}:00`;
}

function timeToMinutes(isoOrHm: string): number {
  const normalized = toLocalTime(isoOrHm);
  const [h, m] = normalized.split(':').map((x) => parseInt(x, 10));
  return h * 60 + m;
}

/** Một khung giờ cho mỗi ngày: mở–đóng hoặc 24/7 (00:00–23:59:59). */
/** Payload đồng bộ với RoomRequest (BE) — dùng cho tạo / cập nhật / chỉnh sửa chờ duyệt. */
function buildRoomPayload(data: HostPublishFormData, propertyId: number): RoomCreateRequest {
  const roomName = data.roomName?.trim() ?? '';
  const floorNum = Number(data.floor);
  const floorStr = String(floorNum);
  const base = Math.max(0, Math.round(Number(data.basePrice) || 0));
  const dayPrice = Math.round(Number(data.pricePerDay) || 0);
  const images =
    data.images.length > 0 ? data.images.join(',') : 'https://placehold.co/1200x800/e2e8f0/64748b?text=EduSpace';
  
  const descParts = [
    data.title?.trim(),
    data.floor !== undefined && data.floor !== null ? `Tầng ${data.floor}` : '',
    data.amenities.length ? `Tiện ích: ${data.amenities.join(', ')}` : '',
  ].filter(Boolean);
  
  const locationLine = [
    data.address.trim(),
    data.roomNumber?.trim() ? `Phòng ${data.roomNumber.trim()}` : '',
    Number.isFinite(data.floor) ? `Tầng ${data.floor}` : '',
  ]
    .filter(Boolean)
    .join(' · ');

  // data.roomType contains the slug from categories
  const categorySlug = data.roomType;

  return {
    propertyId,
    categorySlug,
    // For now we map slug back to the enum if possible, or use default
    roomType: mapRoomType(data.roomType),
    bookingType: 'SLOT_BASED',
    nameVi: roomName.slice(0, 200),
    nameEn: roomName.slice(0, 200),
    locationVi: locationLine,
    locationEn: locationLine,
    capacity: Math.max(1, Number(data.capacity) || 1),
    area: data.size > 0 ? data.size : null,
    roomNumber: data.roomNumber.trim(),
    floorNumber: floorStr,
    is24_7: data.is24_7,
    pricePerHour: base,
    pricePerDay: dayPrice,
    minBookingHours: 1,
    images,
    descriptionVi: descParts.join('\n') || null,
    descriptionEn: descParts.join('\n') || null,
    status: 'ACTIVE',
    isActive: true,
  };
}

/** 7 ngày (2–8) từ form đăng phòng — đồng bộ với seed BE / PUT schedules. */
export function buildWeeklySchedulesFromForm(data: HostPublishFormData): RoomScheduleSaveItem[] {
  const days = [2, 3, 4, 5, 6, 7, 8] as const;
  if (data.is24_7) {
    return days.map((dayOfWeek) => ({
      dayOfWeek,
      isOpen: true,
      openTime: '00:00:00',
      closeTime: '23:59:00',
    }));
  }
  const o = toLocalTime(data.openTime);
  const c = toLocalTime(data.closeTime);
  return days.map((dayOfWeek) => ({
    dayOfWeek,
    isOpen: true,
    openTime: o,
    closeTime: c,
  }));
}

function validateHostPublishForm(data: HostPublishFormData): void {
  const roomName = data.roomName?.trim();
  if (!roomName) {
    throw new Error('Vui lòng nhập tên phòng.');
  }
  if (!data.address?.trim()) {
    throw new Error('Địa chỉ chi nhánh chưa có — vui lòng cập nhật ở trang Chi nhánh.');
  }
  if (!data.roomNumber?.trim()) {
    throw new Error('Vui lòng nhập số phòng / mã phòng.');
  }
  if (!data.is24_7) {
    const o = data.openTime?.trim();
    const c = data.closeTime?.trim();
    if (!o || !c) {
      throw new Error('Vui lòng chọn giờ mở cửa và giờ đóng cửa, hoặc bật hoạt động 24/7.');
    }
    const mo = timeToMinutes(o);
    const mc = timeToMinutes(c);
    if (mc <= mo) {
      throw new Error('Giờ đóng cửa phải sau giờ mở cửa (cùng một ngày).');
    }
  }
  const base = Math.max(0, Math.round(Number(data.basePrice) || 0));
  if (base <= 0) {
    throw new Error('Vui lòng nhập giá theo giờ lớn hơn 0.');
  }
  const dayPrice = Math.round(Number(data.pricePerDay) || 0);
  if (!Number.isFinite(dayPrice) || dayPrice <= 0) {
    throw new Error('Vui lòng nhập giá theo ngày lớn hơn 0.');
  }
  const floorNum = Number(data.floor);
  if (!Number.isFinite(floorNum) || floorNum < 0) {
    throw new Error('Vui lòng nhập tầng hợp lệ (số ≥ 0).');
  }
}

class HostService {
  /**
   * Gắn phòng vào chi nhánh (property) đã có → room → room_slots (một khung/ngày theo open–đóng hoặc 24/7).
   * Không tạo property mới — tránh trùng card ở mục Chi nhánh.
   */
  /**
   * Gửi chỉnh sửa phòng đã duyệt — lưu payload chờ admin; dữ liệu hiển thị giữ nguyên đến khi duyệt.
   */
  async submitRoomEdit(roomId: number, data: HostPublishFormData): Promise<void> {
    validateHostPublishForm(data);
    const profile = await profileService.getProfile();
    if (!profile?.id) {
      throw new Error('Không lấy được tài khoản. Vui lòng đăng nhập lại.');
    }
    const phone = profile.phone?.trim() || '';
    const email = profile.email?.trim() || '';
    if (!phone || !email) {
      throw new Error('Cập nhật số điện thoại và email trong Hồ sơ trước khi gửi chỉnh sửa.');
    }
    if (data.branchId == null) {
      throw new Error('Vui lòng chọn chi nhánh (cơ sở).');
    }
    const property = await propertyApiService.getById(data.branchId);
    const owner = (property.ownerId ?? '').trim();
    if (!owner || owner !== profile.id.trim()) {
      throw new Error('Chi nhánh không thuộc tài khoản của bạn hoặc không hợp lệ.');
    }
    const payload = buildRoomPayload(data, property.id);
    await roomApiService.submitPendingEdit(roomId, payload, profile.id.trim());
  }

  /**
   * Phòng đang chờ duyệt lần đầu — cập nhật trực tiếp (không qua hàng chờ chỉnh sửa).
   */
  async updateRoomBeforeApproval(roomId: number, data: HostPublishFormData): Promise<void> {
    validateHostPublishForm(data);
    const profile = await profileService.getProfile();
    if (!profile?.id) {
      throw new Error('Không lấy được tài khoản. Vui lòng đăng nhập lại.');
    }
    const phone = profile.phone?.trim() || '';
    const email = profile.email?.trim() || '';
    if (!phone || !email) {
      throw new Error('Cập nhật số điện thoại và email trong Hồ sơ.');
    }
    if (data.branchId == null) {
      throw new Error('Vui lòng chọn chi nhánh (cơ sở).');
    }
    const property = await propertyApiService.getById(data.branchId);
    const owner = (property.ownerId ?? '').trim();
    if (!owner || owner !== profile.id.trim()) {
      throw new Error('Chi nhánh không thuộc tài khoản của bạn hoặc không hợp lệ.');
    }
    const payload = buildRoomPayload(data, property.id);
    await roomApiService.update(roomId, {
      ...payload,
      approvalStatus: 'PENDING',
    });
    await roomApiService.putSchedules(roomId, profile.id.trim(), buildWeeklySchedulesFromForm(data));
  }

  async publishSpace(data: HostPublishFormData): Promise<void> {
    validateHostPublishForm(data);

    const profile = await profileService.getProfile();
    if (!profile?.id) {
      throw new Error('Không lấy được tài khoản. Vui lòng đăng nhập lại.');
    }

    const phone = profile.phone?.trim() || '';
    const email = profile.email?.trim() || '';
    if (!phone || !email) {
      throw new Error('Cập nhật số điện thoại và email trong Hồ sơ trước khi đăng phòng.');
    }

    if (data.branchId == null) {
      throw new Error('Vui lòng chọn chi nhánh (cơ sở) để gắn phòng.');
    }

    const property = await propertyApiService.getById(data.branchId);
    const owner = (property.ownerId ?? '').trim();
    if (!owner || owner !== profile.id.trim()) {
      throw new Error('Chi nhánh không thuộc tài khoản của bạn hoặc không hợp lệ.');
    }

    const payload = buildRoomPayload(data, property.id);
    const created = await roomApiService.create({
      ...payload,
      approvalStatus: 'PENDING',
    });
    await roomApiService.putSchedules(created.id, profile.id.trim(), buildWeeklySchedulesFromForm(data));
  }

  async getHostStats(): Promise<any> {
    return new Promise((resolve) => {
      setTimeout(
        () =>
          resolve({
            activeListings: 12,
            pendingBookings: 5,
            totalEarnings: 45000000,
            averageRating: 4.8,
          }),
        400,
      );
    });
  }
}

export const hostService = new HostService();
