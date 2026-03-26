import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, ChevronLeft, ArrowRight, Loader2, ShieldCheck, ScanFace, CreditCard } from 'lucide-react';
import { CustomerLayout } from '../../../layouts/CustomerLayout';
import { Step1BasicInfo, Step3Confirmation } from '../components/registration';
import { hostPartnerApplicationService } from '../services/hostPartnerApplicationService';
import { profileService } from '@/client/features/customer/profile/services/profileService';
import { useAuthStore } from '@/stores/authStore';
import { showToast } from '@/utils/toast';
import { getApiErrorMessage } from '@/utils/apiError';

export function HostRegistrationPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingProfile, setIsLoadingProfile] = useState(true);
    const [kycStatus, setKycStatus] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);

    const [formData, setFormData] = useState({
        type: 'individual' as 'individual' | 'business',
        name: '',
        phone: '',
        email: '',
        address: '',
        kycFrontUrl: '',
        kycBackUrl: '',
        kycSelfieUrl: '', 
        kycLicenseUrl: '',
        documents: [], 
        agreedTerms: false,
    });

    useEffect(() => {
        if (!isAuthenticated) {
            setIsLoadingProfile(false);
            return;
        }
        let cancelled = false;
        (async () => {
            try {
                setIsLoadingProfile(true);
                const p = await profileService.getProfile();
                if (cancelled) return;
                
                setKycStatus(p.kycStatus);
                
                const addrParts = [p.streetAddress, p.ward, p.district, p.cityState].filter(Boolean);
                const addressFromProfile =
                    addrParts.length > 0 ? addrParts.join(', ') : (p.location || '').trim();
                    
                setFormData((prev) => ({
                    ...prev,
                    name: (p.name || '').trim() || prev.name,
                    phone: (p.phone || '').trim() || prev.phone,
                    email: (p.email || '').trim() || prev.email,
                    address: addressFromProfile || prev.address,
                    kycFrontUrl: p.verified ? 'verified' : '', // Mock indicator
                }));
            } catch {
                /* profile lỗi */
            } finally {
                setIsLoadingProfile(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [isAuthenticated]);

    const nextStep = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setStep((s) => Math.min(s + 1, 2));
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
            await hostPartnerApplicationService.submit({
                applicantType: formData.type === 'individual' ? 'INDIVIDUAL' : 'BUSINESS',
                fullName: formData.name.trim(),
                phone: formData.phone.trim(),
                email: formData.email.trim(),
                address: formData.address.trim(),
                message: `Đăng ký Đối tác (eKYC Verified)`,
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

    if (isLoadingProfile) {
        return (
            <CustomerLayout>
                <div className="flex min-h-[60vh] items-center justify-center">
                    <Loader2 className="h-12 w-12 animate-spin text-gray-300" />
                </div>
            </CustomerLayout>
        );
    }

    if (isAuthenticated && kycStatus !== 'VERIFIED') {
        return (
            <CustomerLayout>
                <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-12 bg-white">
                    <div className="max-w-md w-full text-center">
                        <div className="w-24 h-24 bg-amber-50 rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-amber-50">
                            <ShieldCheck className="w-12 h-12 text-amber-500" />
                        </div>
                        <h1 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Xác thực danh tính</h1>
                        <p className="text-gray-500 font-medium mb-10 leading-relaxed">
                            Để bảo vệ cộng đồng EduSpace, bạn cần hoàn tất xác thực eKYC trước khi đăng ký làm Đối tác (Host).
                        </p>
                        
                        <div className="space-y-4 mb-10 text-left">
                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                                <ScanFace className="w-6 h-6 text-blue-600" />
                                <div>
                                    <div className="text-sm font-bold text-gray-900">Xác thực khuôn mặt AI</div>
                                    <div className="text-xs text-gray-400">Đối soát khuôn mặt với CCCD</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                                <CreditCard className="w-6 h-6 text-blue-600" />
                                <div>
                                    <div className="text-sm font-bold text-gray-900">Xác thực CCCD</div>
                                    <div className="text-xs text-gray-400">Tự động nhận diện thông tin</div>
                                </div>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => navigate('/eKYC')}
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-5 rounded-2xl font-black shadow-xl shadow-blue-100 hover:shadow-2xl transition-all active:scale-95 inline-flex items-center justify-center gap-3"
                        >
                            Bắt đầu xác thực ngay
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </CustomerLayout>
        );
    }

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
                        <button
                            type="button"
                            onClick={() => navigate('/rental/spaces')}
                            className="w-full rounded-2xl bg-gray-900 py-4 text-sm font-black uppercase tracking-widest text-white shadow-xl transition-all hover:shadow-gray-200 active:scale-95"
                        >
                            Về Phòng cho thuê
                        </button>
                    </div>
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
                    </div>

                    <div className="relative mb-16 flex justify-between px-20">
                        <div className="absolute left-0 top-1/2 -z-0 h-1 w-full -translate-y-1/2 rounded-full bg-gray-100" />
                        <div
                            className="absolute left-0 top-1/2 -z-0 h-1 -translate-y-1/2 rounded-full bg-red-500 transition-all duration-500"
                            style={{ width: `${((step - 1)) * 100}%` }}
                        />
                        {[1, 2].map((i) => (
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
                                        {i === 1 ? t('host.register.step2Label') : t('host.register.step3Label')}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-white">
                        {step === 1 && <Step1BasicInfo formData={formData} setFormData={setFormData} />}
                        {step === 2 && <Step3Confirmation formData={formData} setFormData={setFormData} />}

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
                                onClick={step === 2 ? handleSubmit : nextStep}
                                disabled={isSubmitting || (step === 2 && !formData.agreedTerms)}
                                className={`flex flex-1 items-center justify-center gap-3 rounded-2xl px-8 py-5 text-xs font-black uppercase tracking-widest shadow-xl transition-all active:scale-95 ${
                                    isSubmitting || (step === 2 && !formData.agreedTerms)
                                        ? 'cursor-not-allowed bg-gray-100 text-gray-400 shadow-none'
                                        : 'bg-gray-900 text-white shadow-gray-200 hover:bg-red-500 hover:shadow-red-100'
                                }`}
                            >
                                {isSubmitting ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : step === 2 ? (
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
