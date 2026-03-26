import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, ChevronLeft, ArrowRight, Loader2 } from 'lucide-react';
import { CustomerLayout } from '../../../layouts/CustomerLayout';
import { Step1BasicInfo, Step2KycDocs, Step3Confirmation } from '../components/registration';
import { hostPartnerApplicationService } from '../services/hostPartnerApplicationService';
import { profileService } from '@/client/features/customer/profile/services/profileService';
import { useAuthStore } from '@/stores/authStore';
import { showToast } from '@/utils/toast';
import { getApiErrorMessage } from '@/utils/apiError';
import { canAccessHostConsole, getRealmRolesFromAccessToken } from '@/utils/keycloakTokenRoles';

export function HostRegistrationPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const accessToken = useAuthStore((s) => s.accessToken);
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    /** Khách: true ngay; user đăng nhập: false cho đến khi kiểm tra đơn / realm role xong */
    const [hostRegHydrated, setHostRegHydrated] = useState(() => !useAuthStore.getState().isAuthenticated);
    const [appGate, setAppGate] = useState<'pending' | 'approved_relogin' | 'none'>('none');

    const [formData, setFormData] = useState({
        type: 'individual' as 'individual' | 'business',
        name: '',
        phone: '',
        email: '',
        address: '',
        kycFrontUrl: '',
        kycBackUrl: '',
        kycLicenseUrl: '',
        documents: [
            {
                id: 'cccd_front',
                label: t('host.register.docCccdFront'),
                description: t('host.register.docCccdFrontDesc'),
                status: 'not_uploaded',
            },
            {
                id: 'cccd_back',
                label: t('host.register.docCccdBack'),
                description: t('host.register.docCccdBackDesc'),
                status: 'not_uploaded',
            },
            {
                id: 'business_license',
                label: t('host.register.docBusinessLicense'),
                description: t('host.register.docBusinessLicenseDesc'),
                status: 'not_uploaded',
            },
        ],
        agreedTerms: false,
    });

    useEffect(() => {
        if (!isAuthenticated) return;
        let cancelled = false;
        (async () => {
            try {
                const p = await profileService.getProfile();
                if (cancelled) return;
                const addrParts = [p.streetAddress, p.ward, p.district, p.cityState].filter(Boolean);
                const addressFromProfile =
                    addrParts.length > 0 ? addrParts.join(', ') : (p.location || '').trim();
                setFormData((prev) => ({
                    ...prev,
                    name: prev.name.trim() ? prev.name : (p.name || '').trim() || prev.name,
                    phone: prev.phone.trim() ? prev.phone : (p.phone || '').trim() || prev.phone,
                    email: prev.email.trim() ? prev.email : (p.email || '').trim() || prev.email,
                    address: prev.address.trim() ? prev.address : addressFromProfile || prev.address,
                }));
            } catch {
                /* profile lỗi — form để trống */
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [isAuthenticated]);

    useEffect(() => {
        if (!isAuthenticated || isSuccess) {
            setHostRegHydrated(true);
            setAppGate('none');
            return;
        }
        let cancelled = false;
        setHostRegHydrated(false);
        void (async () => {
            try {
                const realmOk = canAccessHostConsole(getRealmRolesFromAccessToken(accessToken));
                if (realmOk) {
                    if (cancelled) return;
                    navigate('/rental', { replace: true });
                    return;
                }
                const st = await hostPartnerApplicationService.getMyStatus();
                if (cancelled) return;
                if (st.status === 'APPROVED') {
                    setAppGate('approved_relogin');
                    return;
                }
                if (st.status === 'PENDING') {
                    setAppGate('pending');
                    return;
                }
                setAppGate('none');
            } catch {
                if (!cancelled) {
                    setAppGate('none');
                }
            } finally {
                if (!cancelled) setHostRegHydrated(true);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [isAuthenticated, accessToken, isSuccess, navigate]);

    const nextStep = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setStep((s) => Math.min(s + 1, 3));
    };
    const prevStep = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setStep((s) => Math.max(s - 1, 1));
    };

    const handleSubmit = async () => {
        if (!isAuthenticated) {
            showToast.error('Vui lòng đăng nhập trước khi gửi đơn.');
            navigate('/auth');
            return;
        }
        setIsSubmitting(true);
        try {
            const docSummary = formData.documents.map((d) => `${d.id}:${d.status}`).join(';');
            await hostPartnerApplicationService.submit({
                applicantType: formData.type === 'individual' ? 'INDIVIDUAL' : 'BUSINESS',
                fullName: formData.name.trim(),
                phone: formData.phone.trim(),
                email: formData.email.trim(),
                address: formData.address.trim(),
                message: `Giấy tờ (mock): ${docSummary}`,
                documentFrontUrl: formData.kycFrontUrl.trim() || undefined,
                documentBackUrl: formData.kycBackUrl.trim() || undefined,
                businessLicenseUrl:
                    formData.type === 'business' ? formData.kycLicenseUrl.trim() || undefined : undefined,
            });
            setIsSuccess(true);
        } catch (e) {
            showToast.error(getApiErrorMessage(e, 'Không gửi được đơn. Đăng nhập và thử lại.'));
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <CustomerLayout>
                <div className="flex min-h-[80vh] items-center justify-center p-4">
                    <div className="w-full max-w-md animate-in zoom-in text-center duration-500">
                        <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-[32px] bg-green-100 shadow-xl shadow-green-100">
                            <CheckCircle2 className="h-12 w-12 text-green-500" />
                        </div>
                        <h2 className="mb-4 text-3xl font-black tracking-tight text-gray-900">
                            {t('host.register.successTitle')}
                        </h2>
                        <p className="mb-10 font-bold leading-relaxed text-gray-500">
                            {t('host.register.successMessage')}
                            <span className="mt-2 block text-red-500">{t('host.register.pendingNotice')}</span>
                        </p>
                        <p className="mb-6 text-sm text-gray-500">
                            Admin sẽ duyệt tại <strong>Trang quản trị → Xác minh &amp; duyệt → Đơn đối tác</strong>.
                        </p>
                        <button
                            type="button"
                            onClick={() => navigate('/')}
                            className="w-full rounded-2xl bg-gray-900 py-4 text-sm font-black uppercase tracking-widest text-white shadow-xl transition-all hover:shadow-gray-200 active:scale-95"
                        >
                            Về trang chủ
                        </button>
                        <p className="mt-4 text-xs text-gray-500">
                            Sau khi admin duyệt, bạn đăng xuất và đăng nhập lại để vào cổng Host.
                        </p>
                    </div>
                </div>
            </CustomerLayout>
        );
    }

    if (isAuthenticated && !isSuccess && !hostRegHydrated) {
        return (
            <CustomerLayout>
                <div className="flex min-h-[50vh] items-center justify-center p-8">
                    <Loader2 className="h-10 w-10 animate-spin text-red-500" />
                </div>
            </CustomerLayout>
        );
    }

    if (isAuthenticated && appGate === 'pending') {
        return (
            <CustomerLayout>
                <div className="mx-auto max-w-lg px-4 py-16 text-center">
                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-100">
                        <Loader2 className="h-10 w-10 text-amber-600" />
                    </div>
                    <h1 className="mb-4 text-2xl font-black text-gray-900">Đơn đăng ký Host đang chờ duyệt</h1>
                    <p className="mb-6 text-gray-600">
                        Bạn đã gửi đơn thành công. Hệ thống chỉ mở cổng Host sau khi admin phê duyệt. Bạn chưa thể vào{' '}
                        <strong>Phòng cho thuê</strong> cho đến lúc đó.
                    </p>
                    <button
                        type="button"
                        onClick={() => navigate('/')}
                        className="w-full rounded-2xl bg-gray-900 py-4 text-sm font-black uppercase tracking-widest text-white"
                    >
                        Về trang chủ
                    </button>
                </div>
            </CustomerLayout>
        );
    }

    if (isAuthenticated && appGate === 'approved_relogin') {
        return (
            <CustomerLayout>
                <div className="mx-auto max-w-lg px-4 py-16 text-center">
                    <CheckCircle2 className="mx-auto mb-6 h-16 w-16 text-green-500" />
                    <h1 className="mb-4 text-2xl font-black text-gray-900">Tài khoản đã được duyệt làm Host</h1>
                    <p className="mb-6 text-gray-600">
                        Vai trò Host đã được kích hoạt trên hệ thống, nhưng phiên đăng nhập hiện tại chưa có quyền mới.
                        Vui lòng <strong>đăng xuất rồi đăng nhập lại</strong>, sau đó mở cổng Host.
                    </p>
                    <button
                        type="button"
                        onClick={() => navigate('/rental')}
                        className="w-full rounded-2xl bg-gray-900 py-4 text-sm font-black uppercase tracking-widest text-white"
                    >
                        Thử vào cổng Host
                    </button>
                </div>
            </CustomerLayout>
        );
    }

    return (
        <CustomerLayout>
            <div className="min-h-screen bg-white px-4 py-12">
                <div className="mx-auto max-w-3xl">
                    <div className="mb-16 text-center">
                        <h1 className="mb-4 text-4xl font-black uppercase tracking-tight text-gray-900">
                            {t('host.register.pageTitle')}
                        </h1>
                        <p className="font-bold tracking-tight text-gray-500">{t('host.register.pageSubtitle')}</p>
                        {!isAuthenticated ? (
                            <p className="mt-4 text-sm font-medium text-amber-800">
                                Cần{' '}
                                <Link to="/auth" className="font-black text-red-600 underline underline-offset-2">
                                    đăng nhập
                                </Link>{' '}
                                để gửi đơn. Chưa có tài khoản thì{' '}
                                <Link to="/auth" className="font-black text-red-600 underline underline-offset-2">
                                    đăng ký
                                </Link>{' '}
                                trước.
                            </p>
                        ) : (
                            <p className="mt-4 text-sm font-medium text-emerald-800">
                                Bước &quot;Thông tin&quot; đã điền sẵn từ hồ sơ tài khoản — bạn có thể chỉnh lại trước khi gửi.
                            </p>
                        )}
                    </div>

                    <div className="relative mb-16 flex justify-between px-4">
                        <div className="absolute left-0 top-1/2 -z-0 h-1 w-full -translate-y-1/2 rounded-full bg-gray-100" />
                        <div
                            className="absolute left-0 top-1/2 -z-0 h-1 -translate-y-1/2 rounded-full bg-red-500 transition-all duration-500"
                            style={{ width: `${((step - 1) / 2) * 100}%` }}
                        />
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-2xl border-4 font-black transition-all duration-500 ${
                                    step >= i
                                        ? 'border-white bg-red-500 text-white shadow-xl shadow-red-200'
                                        : 'border-gray-100 bg-white text-gray-400'
                                }`}
                            >
                                {step > i ? <CheckCircle2 className="h-6 w-6" /> : i}
                                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
                                    <span
                                        className={`text-[10px] font-black uppercase tracking-widest ${step >= i ? 'text-red-500' : 'text-gray-300'}`}
                                    >
                                        {t(`host.register.step${i}Label`)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-white">
                        {step === 1 && <Step1BasicInfo formData={formData} setFormData={setFormData} />}
                        {step === 2 && <Step2KycDocs formData={formData} setFormData={setFormData} />}
                        {step === 3 && <Step3Confirmation formData={formData} setFormData={setFormData} />}

                        <div className="mt-16 flex gap-4 border-t border-gray-100 pt-10">
                            {step > 1 && (
                                <button
                                    type="button"
                                    onClick={prevStep}
                                    className="flex items-center gap-2 rounded-2xl px-8 py-4 text-xs font-black uppercase tracking-widest text-gray-400 transition-all hover:text-gray-900"
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                    {t('common.previous')}
                                </button>
                            )}

                            <button
                                type="button"
                                onClick={step === 3 ? handleSubmit : nextStep}
                                disabled={isSubmitting || (step === 3 && !formData.agreedTerms)}
                                className={`flex flex-1 items-center justify-center gap-3 rounded-2xl px-8 py-5 text-xs font-black uppercase tracking-widest shadow-xl transition-all active:scale-95 ${
                                    isSubmitting || (step === 3 && !formData.agreedTerms)
                                        ? 'cursor-not-allowed bg-gray-100 text-gray-400 shadow-none'
                                        : 'bg-gray-900 text-white shadow-gray-200 hover:bg-red-500 hover:shadow-red-100'
                                }`}
                            >
                                {isSubmitting ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : step === 3 ? (
                                    t('host.register.submitApplication')
                                ) : (
                                    <>
                                        {t('common.continue')}
                                        <ArrowRight className="h-5 w-5" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </CustomerLayout>
    );
}
