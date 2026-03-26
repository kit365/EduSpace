import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, ArrowRight, Loader2 } from 'lucide-react';
import { useVerifyEmail } from '../hooks/useAuth';
import { CustomerLayout } from '../../../../layouts/CustomerLayout';

// Module-level guards survive StrictMode remounts in dev.
const verifyingTokens = new Set<string>();
const verifiedTokens = new Set<string>();

export function VerifyEmailPage() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();
    const { mutate: verifyEmail } = useVerifyEmail();

    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('Token xác thực không hợp lệ hoặc đã bị thiếu.');
            return;
        }

        if (verifiedTokens.has(token)) {
            setStatus('success');
            setMessage('Email đã được xác thực thành công.');
            return;
        }
        if (verifyingTokens.has(token)) {
            return;
        }
        verifyingTokens.add(token);

        verifyEmail(token, {
            onSuccess: (res) => {
                verifiedTokens.add(token);
                setStatus('success');
                setMessage(res.message || 'Xác thực email thành công!');
            },
            onError: (err: any) => {
                setStatus('error');
                setMessage(err.response?.data?.message || 'Xác thực thất bại. Token có thể đã hết hạn.');
            },
            onSettled: () => {
                verifyingTokens.delete(token);
            },
        });
    }, [token, verifyEmail]);

    useEffect(() => {
        if (status !== 'success') {
            return;
        }
        const timer = window.setTimeout(() => {
            navigate('/auth');
        }, 2500);
        return () => window.clearTimeout(timer);
    }, [status, navigate]);

    return (
        <CustomerLayout>
            <div className="min-h-[calc(100vh-80px)] bg-slate-50 flex items-center justify-center p-4">
                <div className="bg-white max-w-md w-full rounded-[32px] p-8 mt-12 mb-24 text-center shadow-xl border border-slate-100">
                    <div className="mb-6 flex justify-center">
                        {status === 'loading' && (
                            <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center animate-pulse">
                                <Loader2 className="w-10 h-10 animate-spin" />
                            </div>
                        )}
                        {status === 'success' && (
                            <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-10 h-10" />
                            </div>
                        )}
                        {status === 'error' && (
                            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center">
                                <XCircle className="w-10 h-10" />
                            </div>
                        )}
                    </div>

                    <h2 className="text-2xl font-black text-gray-900 mb-2">
                        {status === 'loading' && 'Đang xác thực...'}
                        {status === 'success' && 'Xác thực thành công'}
                        {status === 'error' && 'Xác thực thất bại'}
                    </h2>

                    <p className="text-slate-600 mb-8 font-medium">
                        {message}
                    </p>
                    {status === 'success' && (
                        <p className="text-sm text-slate-500 mb-6">Tự động chuyển tới trang đăng nhập sau vài giây...</p>
                    )}

                    <button
                        onClick={() => navigate('/auth')}
                        className="btn-primary w-full py-4 text-base rounded-2xl flex items-center justify-center gap-2 group"
                    >
                        {status === 'success' ? 'Đăng nhập ngay' : 'Quay lại trang Đăng nhập'}
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
        </CustomerLayout>
    );
}
