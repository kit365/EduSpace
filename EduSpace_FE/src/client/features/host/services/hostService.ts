import { profileService } from '@/client/features/customer/profile/services/profileService';
import { propertyApiService } from '@/client/features/room/services/propertyApiService';
import { roomApiService } from '@/client/features/room/services/roomApiService';
import { roomSlotApiService } from '@/client/features/room/services/roomSlotApiService';
import type { RoomType } from '@/client/features/room/types';

export interface HostPublishSlot {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  enabled: boolean;
}

export interface HostPublishFormData {
  branchId: number | null;
  facilityName: string;
  roomType: string;
  title: string;
  address: string;
  capacity: number;
  size: number;
  floor: number;
  basePrice: number;
  weekendSurcharge: number;
  availabilitySlots: HostPublishSlot[];
  amenities: string[];
  images: string[];
}

const WEEKDAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'] as const;
const WEEKEND = ['SATURDAY', 'SUNDAY'] as const;

const SLOT_LABEL: Record<string, string> = {
  morning: 'Ca sáng',
  afternoon: 'Ca chiều',
  evening: 'Ca tối',
};

function mapRoomType(displayName: string): RoomType {
  const n = (displayName || '').toLowerCase();
  if (n.includes('event') || n.includes('hall') || n.includes('sự kiện')) return 'EVENT_SPACE';
  if (n.includes('studio') || n.includes('lab') || n.includes('sáng tạo') || n.includes('máy tính'))
    return 'STUDIO';
  if (n.includes('cowork') || n.includes('chung')) return 'COWORKING';
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

class HostService {
  /**
   * Tạo property → room (SLOT_BASED) → room_slots theo từng ngày (T2–CN),
   * giá cuối tuần = basePrice * (1 + weekendSurcharge%).
   */
  async publishSpace(data: HostPublishFormData): Promise<void> {
    const name = data.facilityName?.trim();
    if (!name) {
      throw new Error('Vui lòng nhập tên cơ sở / địa điểm.');
    }
    if (!data.address?.trim()) {
      throw new Error('Vui lòng nhập địa chỉ.');
    }

    const profile = await profileService.getProfile();
    if (!profile?.id) {
      throw new Error('Không lấy được tài khoản. Vui lòng đăng nhập lại.');
    }

    const phone = profile.phone?.trim() || '';
    const email = profile.email?.trim() || '';
    if (!phone || !email) {
      throw new Error('Cập nhật số điện thoại và email trong Hồ sơ trước khi đăng phòng.');
    }

    const property = await propertyApiService.create({
      ownerId: profile.id,
      name,
      propertyType: 'PRIVATE_ROOM',
      contactPhone: phone,
      contactEmail: email,
      address: data.address.trim(),
      description: data.title?.trim() || null,
      logo: data.images[0] ?? null,
      status: 'PENDING',
    });

    const roomTitle = (data.title?.trim() || name).slice(0, 200);
    const images =
      data.images.length > 0 ? data.images.join(',') : 'https://placehold.co/1200x800/e2e8f0/64748b?text=EduSpace';

    const descParts = [
      data.title?.trim(),
      data.floor ? `Tầng ${data.floor}` : '',
      data.amenities.length ? `Tiện ích: ${data.amenities.join(', ')}` : '',
    ].filter(Boolean);

    const room = await roomApiService.create({
      propertyId: property.id,
      roomType: mapRoomType(data.roomType),
      bookingType: 'SLOT_BASED',
      name: roomTitle,
      capacity: Math.max(1, Number(data.capacity) || 1),
      area: data.size > 0 ? data.size : null,
      location: data.address.trim(),
      images,
      description: descParts.join('\n') || null,
      status: 'ACTIVE',
      approvalStatus: 'PENDING',
      isActive: true,
    });

    const enabled = data.availabilitySlots.filter((s) => s.enabled);
    if (enabled.length === 0) {
      return;
    }

    const base = Math.max(0, Math.round(Number(data.basePrice) || 0));
    const sur = Number(data.weekendSurcharge) || 0;
    const weekendPrice = Math.round(base * (1 + sur / 100));

    const tasks: Promise<unknown>[] = [];
    for (const slot of enabled) {
      const start = toLocalTime(slot.startTime);
      const end = toLocalTime(slot.endTime);
      const label = SLOT_LABEL[slot.name] || slot.name;
      for (const day of WEEKDAYS) {
        tasks.push(
          roomSlotApiService.create({
            roomId: room.id,
            name: `${label} · ${day}`,
            startTime: start,
            endTime: end,
            dayOfWeek: day,
            basePrice: base,
            status: 'AVAILABLE',
          }),
        );
      }
      for (const day of WEEKEND) {
        tasks.push(
          roomSlotApiService.create({
            roomId: room.id,
            name: `${label} · ${day}`,
            startTime: start,
            endTime: end,
            dayOfWeek: day,
            basePrice: weekendPrice,
            status: 'AVAILABLE',
          }),
        );
      }
    }

    await Promise.all(tasks);
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
