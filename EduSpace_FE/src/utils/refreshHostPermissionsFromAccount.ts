import apiClient from '@/lib/axios';
import { ACCOUNT_API } from '@/config/api/account';
import { useAuthStore } from '@/stores/authStore';

let inFlight: Promise<void> | null = null;

/**
 * Đồng bộ quyền host từ GET /accounts/me (theo role trong DB).
 * Dùng chung để sau khi Admin đổi quyền, Host Console không giữ cache cũ.
 * Gọi trùng lúc sẽ gộp thành một request.
 */
export function refreshHostPermissionsFromAccount(): Promise<void> {
    if (inFlight) return inFlight;
    if (!useAuthStore.getState().accessToken) {
        return Promise.resolve();
    }
    inFlight = (async () => {
        try {
            const me = await apiClient.get(ACCOUNT_API.ME);
            const perms = (me as any)?.data?.permissions ?? (me as any)?.permissions ?? [];
            useAuthStore.getState().setHostPermissionsFromAccount(perms);
        } catch {
            // Fail closed for host console: nếu không lấy được quyền thì coi như không có quyền.
            useAuthStore.getState().setHostPermissionsFromAccount([]);
        } finally {
            inFlight = null;
        }
    })();
    return inFlight;
}
