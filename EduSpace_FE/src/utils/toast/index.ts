import { toast } from 'sonner';

/**
 * Phụ trách hiển thị thông báo (Toast) toàn cục cho ứng dụng.
 * Sử dụng sonner làm backend.
 */
export const showToast = {
    success: (message: string, description?: string) => {
        toast.success(message, { description });
    },
    error: (message: string, description?: string) => {
        toast.error(message, { description });
    },
    info: (message: string, description?: string) => {
        toast(message, { description });
    },
    loading: (message: string) => {
        return toast.loading(message);
    },
    dismiss: (id?: string | number) => {
        toast.dismiss(id);
    }
};
