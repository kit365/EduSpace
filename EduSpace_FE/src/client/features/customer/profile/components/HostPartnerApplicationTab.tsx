import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Loader2, Clock, CheckCircle2, XCircle, FileQuestion, ArrowRight } from 'lucide-react';
import {
    hostPartnerApplicationService,
    type MyHostApplicationStatus,
} from '@/client/features/host/services/hostPartnerApplicationService';

export function HostPartnerApplicationTab() {
    const { t } = useTranslation();
    const [st, setSt] = useState<MyHostApplicationStatus | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let c = false;
        hostPartnerApplicationService
            .getMyStatus()
            .then((s) => {
                if (!c) setSt(s);
            })
            .catch(() => {
                if (!c) setSt(null);
            })
            .finally(() => {
                if (!c) setLoading(false);
            });
        return () => {
            c = true;
        };
    }, []);

    if (loading) {
        return (
            <div className="flex min-h-[320px] items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-red-500" />
            </div>
        );
    }

    if (!st) {
        return (
            <p className="text-gray-500">{t('customer.profile.hostApplication.loadError', 'Không tải được trạng thái.')}</p>
        );
    }

    const status = st.status;

    return (
        <div className="max-w-xl space-y-6">
            <div>
                <h2 className="text-xl font-bold text-gray-900">
                    {t('customer.profile.hostApplication.title', 'Đơn đối tác cho thuê')}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                    {t(
                        'customer.profile.hostApplication.subtitle',
                        'Theo dõi trạng thái giống luồng đăng ký (List My Space / Đăng ký host).',
                    )}
                </p>
            </div>

            {status === 'NONE' && (
                <div className="rounded-2xl border border-amber-100 bg-amber-50/80 p-8">
                    <FileQuestion className="mb-4 h-12 w-12 text-amber-600" />
                    <p className="mb-6 font-medium text-gray-700">
                        {t(
                            'customer.profile.hostApplication.none',
                            'Bạn chưa gửi đơn. Đăng ký tài khoản với "List My Space" hoặc gửi hồ sơ tại trang đối tác.',
                        )}
                    </p>
                    <Link
                        to="/rental/register"
                        className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-6 py-3 text-sm font-bold text-white hover:bg-red-500"
                    >
                        {t('customer.profile.hostApplication.ctaRegister', 'Gửi hồ sơ đối tác')}
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            )}

            {status === 'PENDING' && (
                <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                    <Clock className="mb-4 h-12 w-12 text-slate-400" />
                    <h3 className="mb-2 font-black text-gray-900">
                        {t('customer.profile.hostApplication.pendingTitle', 'Đang chờ admin duyệt')}
                    </h3>
                    <p className="text-sm text-gray-600">
                        {t(
                            'customer.profile.hostApplication.pendingDesc',
                            'Đơn đã gửi. Admin xử lý tại trang quản trị → Xác minh & duyệt.',
                        )}
                    </p>
                </div>
            )}

            {status === 'APPROVED' && (
                <div className="rounded-2xl border border-green-100 bg-green-50/80 p-8">
                    <CheckCircle2 className="mb-4 h-12 w-12 text-green-600" />
                    <h3 className="mb-2 font-black text-gray-900">
                        {t('customer.profile.hostApplication.approvedTitle', 'Đã là đối tác')}
                    </h3>
                    <p className="mb-6 text-sm text-gray-600">
                        {t(
                            'customer.profile.hostApplication.approvedDesc',
                            'Bạn có thể đăng phòng tại Phòng cho thuê (rental).',
                        )}
                    </p>
                    <Link
                        to="/rental/spaces"
                        className="inline-flex items-center gap-2 text-sm font-bold text-red-600 hover:underline"
                    >
                        {t('customer.profile.hostApplication.goSpaces', 'Mở Phòng của tôi')}
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            )}

            {status === 'REJECTED' && (
                <div className="rounded-2xl border border-red-100 bg-red-50/50 p-8">
                    <XCircle className="mb-4 h-12 w-12 text-red-500" />
                    <h3 className="mb-2 font-black text-gray-900">
                        {t('customer.profile.hostApplication.rejectedTitle', 'Đơn chưa được duyệt')}
                    </h3>
                    {st.rejectedReason ? (
                        <p className="mb-4 rounded-lg bg-white p-4 text-sm text-gray-700">{st.rejectedReason}</p>
                    ) : null}
                    <Link
                        to="/rental/register"
                        className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-6 py-3 text-sm font-bold text-white hover:bg-red-500"
                    >
                        {t('customer.profile.hostApplication.resubmit', 'Gửi đơn mới')}
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            )}
        </div>
    );
}
