import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CustomerLayout } from '../../../../layouts/CustomerLayout';
import { bookingDepositService } from '../services/bookingDepositService';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function DepositReturnPage() {
    const { t } = useTranslation();
    const [params] = useSearchParams();
    const depositIdParam = params.get('depositId');
    const [status, setStatus] = useState<'loading' | 'paid' | 'pending' | 'error'>('loading');
    const [bookingCode, setBookingCode] = useState<string | null>(null);

    useEffect(() => {
        const id = depositIdParam ? parseInt(depositIdParam, 10) : NaN;
        if (!depositIdParam || Number.isNaN(id)) {
            setStatus('error');
            return;
        }

        let cancelled = false;

        async function poll() {
            for (let i = 0; i < 25; i++) {
                if (cancelled) return;
                try {
                    const s = await bookingDepositService.getStatus(id);
                    if (cancelled) return;
                    setBookingCode(s.bookingCode);
                    if (s.depositPaid || s.status === 'PAID') {
                        setStatus('paid');
                        return;
                    }
                } catch {
                    /* network: retry */
                }
                await new Promise((r) => setTimeout(r, 2000));
            }
            if (!cancelled) setStatus('pending');
        }

        void poll();
        return () => {
            cancelled = true;
        };
    }, [depositIdParam]);

    return (
        <CustomerLayout>
            <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-16">
                {status === 'loading' && (
                    <div className="text-center space-y-4">
                        <Loader2 className="w-12 h-12 animate-spin text-red-500 mx-auto" />
                        <p className="font-bold text-gray-700">{t('customer.checkout.depositReturn.waiting')}</p>
                    </div>
                )}
                {status === 'paid' && (
                    <div className="text-center space-y-6 max-w-md">
                        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
                        <h1 className="text-2xl font-black text-gray-900">{t('customer.checkout.depositReturn.success')}</h1>
                        {bookingCode && (
                            <p className="text-gray-600">
                                {t('customer.checkout.depositReturn.bookingCode')}:{' '}
                                <span className="font-mono font-bold">{bookingCode}</span>
                            </p>
                        )}
                        <Button asChild className="rounded-2xl">
                            <Link to="/bookings">{t('customer.checkout.depositReturn.goBookings')}</Link>
                        </Button>
                    </div>
                )}
                {status === 'pending' && (
                    <div className="text-center space-y-4 max-w-md">
                        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
                        <p className="text-gray-700">{t('customer.checkout.depositReturn.pending')}</p>
                        <Button asChild variant="outline" className="rounded-2xl">
                            <Link to="/bookings">{t('customer.checkout.depositReturn.goBookings')}</Link>
                        </Button>
                    </div>
                )}
                {status === 'error' && (
                    <div className="text-center space-y-4">
                        <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
                        <p className="text-gray-700">{t('customer.checkout.depositReturn.pending')}</p>
                        <Link to="/checkout" className="text-red-600 font-bold underline">
                            {t('common.goBack')}
                        </Link>
                    </div>
                )}
            </div>
        </CustomerLayout>
    );
}
