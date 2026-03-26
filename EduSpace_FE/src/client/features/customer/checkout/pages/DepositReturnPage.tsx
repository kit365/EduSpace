import { Link, useSearchParams } from 'react-router-dom';
import { CustomerLayout } from '../../../../layouts/CustomerLayout';
import { CheckCircle2 } from 'lucide-react';

export function DepositReturnPage() {
    const [params] = useSearchParams();
    const depositId = params.get('depositId');

    return (
        <CustomerLayout>
            <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-16">
                <div className="max-w-md w-full rounded-3xl border border-emerald-100 bg-white p-8 shadow-lg text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
                        <CheckCircle2 className="h-10 w-10 text-emerald-600" aria-hidden />
                    </div>
                    <h1 className="text-xl font-black text-gray-900 mb-2">Xác nhận thanh toán cọc</h1>
                    <p className="text-sm text-gray-600 mb-6">
                        {depositId
                            ? `Mã giao dịch: ${depositId}`
                            : 'Đã nhận redirect từ cổng thanh toán (demo).'}
                    </p>
                    <Link
                        to="/bookings"
                        className="inline-flex items-center justify-center rounded-xl bg-red-500 px-6 py-3 text-sm font-bold text-white hover:bg-red-600 transition-colors"
                    >
                        Xem đặt phòng
                    </Link>
                </div>
            </div>
        </CustomerLayout>
    );
}
