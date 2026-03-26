import { profileService } from '@/client/features/customer/profile/services/profileService';
import { propertyApiService } from '@/client/features/room/services/propertyApiService';
import { roomApiService } from '@/client/features/room/services/roomApiService';
import type { RoomCreateRequest, RoomPriceRuleDto, RoomType } from '@/client/features/room/types';

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
  roomLocationHint: string;
  roomNumber: string;
  capacity: number;
  size: number;
  floor: number;
  defaultPricePerUnit: number;
  minDuration: number;
  stepUnit: number;
  weekendSurchargeEnabled: boolean;
  weekendSurchargePercent: number;
  weekendApplySaturday: boolean;
  weekendApplySunday: boolean;
  priceRules: RoomPriceRuleDto[];
  amenities: string[];
  images: string[];
  mainImageUrl?: string | null;
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

/** Payload đồng bộ với RoomRequest (BE) — dùng cho tạo / cập nhật / chỉnh sửa chờ duyệt. */
function buildRoomPayload(
  data: HostPublishFormData,
  propertyId: number,
  selectedAmenityIds: number[],
): RoomCreateRequest {
  const roomName = data.roomName?.trim() ?? '';
  const floorNum = Number(data.floor);
  const floorStr = String(floorNum);
  const stepUnit = Math.max(15, Math.round(Number(data.stepUnit) || 30));
  const defaultPricePerUnit = Math.max(0, Math.round(Number(data.defaultPricePerUnit) || 0));
  const base = Math.max(0, Math.round((defaultPricePerUnit * 60) / stepUnit));
  const mainImageUrl = data.mainImageUrl?.trim() || data.images[0] || null;
  const orderedImages = mainImageUrl
    ? [mainImageUrl, ...data.images.filter((img) => img !== mainImageUrl)]
    : [...data.images];
  const images =
    orderedImages.length > 0 ? orderedImages.join(',') : 'https://placehold.co/1200x800/e2e8f0/64748b?text=EduSpace';
  
  const descParts = [
    data.title?.trim(),
    data.floor !== undefined && data.floor !== null ? `Tầng ${data.floor}` : '',
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
  const weekendEnabled = Boolean(data.weekendSurchargeEnabled);
  const weekendPercent = weekendEnabled ? Math.max(0, Math.round(Number(data.weekendSurchargePercent) || 0)) : 0;
  const weekendSaturday = weekendEnabled ? Boolean(data.weekendApplySaturday) : false;
  const weekendSunday = weekendEnabled ? Boolean(data.weekendApplySunday) : false;

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
    roomLocationHint: data.roomLocationHint?.trim() || null,
    capacity: Math.max(1, Number(data.capacity) || 1),
    area: data.size > 0 ? data.size : null,
    roomNumber: data.roomNumber.trim(),
    floorNumber: floorStr,
    pricePerHour: base,
    pricePerDay: null,
    minBookingHours: 1,
    minDuration: Math.max(30, Math.round(Number(data.minDuration) || 30)),
    stepUnit,
    weekendSurchargeEnabled: weekendEnabled,
    weekendSurchargePercent: weekendPercent,
    weekendApplySaturday: weekendSaturday,
    weekendApplySunday: weekendSunday,
    priceRules: (data.priceRules ?? []).map((r) => ({
      minHours: Math.max(1, Math.round(Number(r.minHours) || 1)),
      maxHours: r.maxHours != null && Number.isFinite(Number(r.maxHours)) ? Math.round(Number(r.maxHours)) : null,
      pricePerHour: r.pricePerHour != null ? Number(r.pricePerHour) : null,
      flatPrice: r.flatPrice != null ? Number(r.flatPrice) : null,
      label: r.label?.trim() || null,
      applicableDayOfWeeks:
        r.applicableDayOfWeeks != null && r.applicableDayOfWeeks.length > 0 ? [...r.applicableDayOfWeeks] : null,
    })),
    images,
    mainImageUrl,
    descriptionVi: descParts.join('\n') || null,
    descriptionEn: descParts.join('\n') || null,
    // Always send (even as []) so BE can clear existing room amenities on update.
    amenityIds: selectedAmenityIds,
    status: 'ACTIVE',
    isActive: true,
  };
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
  const defaultPricePerUnit = Math.max(0, Math.round(Number(data.defaultPricePerUnit) || 0));
  if (defaultPricePerUnit <= 0) {
    throw new Error('Vui lòng nhập đơn giá mặc định theo bước lớn hơn 0.');
  }
  const minDuration = Math.round(Number(data.minDuration) || 0);
  if (!Number.isFinite(minDuration) || minDuration <= 0) {
    throw new Error('Vui lòng nhập thời lượng tối thiểu hợp lệ (phút).');
  }
  const stepUnit = Math.round(Number(data.stepUnit) || 0);
  if (!Number.isFinite(stepUnit) || stepUnit <= 0) {
    throw new Error('Vui lòng nhập bước nhảy hợp lệ (phút).');
  }
  if (minDuration % stepUnit !== 0) {
    throw new Error('Thời lượng tối thiểu phải là bội số của bước nhảy.');
  }
  if (data.weekendSurchargeEnabled) {
    const percent = Math.round(Number(data.weekendSurchargePercent) || 0);
    if (percent < 0) {
      throw new Error('Phụ thu cuối tuần phải >= 0%.');
    }
    if (!data.weekendApplySaturday && !data.weekendApplySunday) {
      throw new Error('Bật phụ thu cuối tuần thì cần chọn ít nhất Thứ 7 hoặc Chủ nhật.');
    }
  }
  for (const r of data.priceRules ?? []) {
    const minHours = Math.round(Number(r.minHours) || 0);
    if (minHours <= 0) {
      throw new Error('Mỗi rule giá phải có min_hours > 0.');
    }
    const maxHours = r.maxHours != null ? Math.round(Number(r.maxHours)) : null;
    if (maxHours != null && maxHours < minHours) {
      throw new Error('max_hours phải lớn hơn hoặc bằng min_hours.');
    }
    const hasFlat = r.flatPrice != null && Number(r.flatPrice) > 0;
    const hasHourly = r.pricePerHour != null && Number(r.pricePerHour) > 0;
    if (!hasFlat && !hasHourly) {
      throw new Error('Mỗi rule giá cần flat_price hoặc price_per_hour.');
    }
  }
  const floorNum = Number(data.floor);
  if (!Number.isFinite(floorNum) || floorNum < 0) {
    throw new Error('Vui lòng nhập tầng hợp lệ (số ≥ 0).');
  }
}

class HostService {
  /**
   * Gắn phòng vào chi nhánh (property) đã có.
   * Không tạo property mới — tránh trùng card ở mục Chi nhánh.
   */
  /**
   * Gửi chỉnh sửa phòng đã duyệt — lưu payload chờ admin; dữ liệu hiển thị giữ nguyên đến khi duyệt.
   */
  async submitRoomEdit(roomId: number, data: HostPublishFormData, selectedAmenityIds: number[]): Promise<void> {
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
    const payload = buildRoomPayload(data, property.id, selectedAmenityIds);
    await roomApiService.submitPendingEdit(roomId, payload, profile.id.trim());
  }

  /**
   * Phòng đang chờ duyệt lần đầu — cập nhật trực tiếp (không qua hàng chờ chỉnh sửa).
   */
  async updateRoomBeforeApproval(
    roomId: number,
    data: HostPublishFormData,
    selectedAmenityIds: number[],
  ): Promise<void> {
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
    const payload = buildRoomPayload(data, property.id, selectedAmenityIds);
    await roomApiService.update(roomId, { ...payload, approvalStatus: 'PENDING' });
  }

  async publishSpace(data: HostPublishFormData, selectedAmenityIds: number[]): Promise<void> {
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

    const payload = buildRoomPayload(data, property.id, selectedAmenityIds);
    await roomApiService.create({
      ...payload,
      approvalStatus: 'PENDING',
    });
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
