import apiClient from '@/lib/axios';
import type { ApiResponse } from '@/types/api';
import { ROOM_API } from '@/config/api';

/**
 * Folder Cloudinary (và thư mục con khi lưu local) chỉ dành cho EduSpace — tách biệt với TeddyPet / pet-avatars.
 * Không dùng lại folder của dự án khác.
 */
export const EDUSPACE_MEDIA_FOLDER_BRANCH_LOGOS = 'eduspace-host-branch-logos';

function unwrapData<T>(res: unknown): T {
    if (res && typeof res === 'object' && 'data' in res && (res as { data: unknown }).data !== undefined) {
        return (res as { data: T }).data;
    }
    return res as T;
}

/**
 * Upload ảnh logo chi nhánh → URL (Cloudinary secure_url hoặc URL /media/... khi BE ở chế độ local).
 */
export async function uploadBranchLogoImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post<unknown, ApiResponse<string>>(
        `${ROOM_API.ROOM_MEDIA_UPLOAD}?folder=${encodeURIComponent(EDUSPACE_MEDIA_FOLDER_BRANCH_LOGOS)}`,
        formData,
    );
    const url = unwrapData<string>(res);
    if (typeof url !== 'string' || !url.trim()) {
        throw new Error('Máy chủ không trả về URL ảnh hợp lệ');
    }
    return url.trim();
}
