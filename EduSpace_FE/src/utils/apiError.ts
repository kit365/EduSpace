/**
 * Lấy thông báo lỗi từ response API / Axios để hiển thị cho user.
 * Ưu tiên: BE message -> status 403/404 -> error.message -> fallback.
 */
export function getApiErrorMessage(err: unknown, fallback: string): string {
  if (err == null) return fallback;
  const ax = err as { response?: { status?: number; data?: { message?: string } }; message?: string };
  const msg = ax.response?.data?.message;
  if (msg && typeof msg === 'string') {
    const normalized = msg.trim();
    const translated = BACKEND_ERROR_MESSAGE_MAP[normalized];
    return translated ?? normalized;
  }
  if (ax.response?.status === 403) return 'Không có quyền thực hiện (403 Forbidden)';
  if (ax.response?.status === 404) return 'Không tìm thấy (404)';
  if (ax.message && typeof ax.message === 'string') return ax.message;
  return fallback;
}

const BACKEND_ERROR_MESSAGE_MAP: Record<string, string> = {
  'host.application.pending-exists': 'Bạn đã có một đơn đăng ký chi nhánh đang chờ duyệt.',
  'host.application.already-partner': 'Tài khoản của bạn đã là đối tác. Bạn không cần gửi lại đơn đăng ký.',
};
