import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
    CheckCircle2,
    ChevronLeft,
    ArrowRight,
    Loader2
} from 'lucide-react';
import { CustomerLayout } from '../../../layouts/CustomerLayout';
import { Step1BasicInfo, Step2KycDocs, Step3Confirmation } from '../components/registration';

export function HostRegistrationPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        type: 'individual',
        name: '',
        phone: '',
        email: '',
        address: '',
        documents: [
            { id: 'cccd_front', label: t('host.register.docCccdFront'), description: t('host.register.docCccdFrontDesc'), status: 'not_uploaded' },
            { id: 'cccd_back', label: t('host.register.docCccdBack'), description: t('host.register.docCccdBackDesc'), status: 'not_uploaded' },
            { id: 'business_license', label: t('host.register.docBusinessLicense'), description: t('host.register.docBusinessLicenseDesc'), status: 'not_uploaded' },
        ],
        agreedTerms: false
    });

    const nextStep = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setStep(s => Math.min(s + 1, 3));
    };
    const prevStep = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setStep(s => Math.max(s - 1, 1));
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        // Simulate API call - Insert into Host_Application table
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsSubmitting(false);
        setIsSuccess(true);
    };

    if (isSuccess) {
        return (
            <CustomerLayout>
                <div className="min-h-[80vh] flex items-center justify-center p-4">
                    <div className="max-w-md w-full text-center animate-in zoom-in duration-500">
                        <div className="w-24 h-24 bg-green-100 rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-green-100">
                            <CheckCircle2 className="w-12 h-12 text-green-500" />
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">{t('host.register.successTitle')}</h2>
                        <p className="text-gray-500 font-bold mb-10 leading-relaxed">
                            {t('host.register.successMessage')}
                            <span className="block mt-2 text-red-500">{t('host.register.pendingNotice')}</span>
                        </p>
                        <button
                            onClick={() => navigate('/')}
                            className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black shadow-xl hover:shadow-gray-200 active:scale-95 transition-all uppercase tracking-widest text-sm"
                        >
                            {t('common.goBackHome')}
                        </button>
                    </div>
                </div>
            </CustomerLayout>
        );
    }

    return (
        <CustomerLayout>
            <div className="min-h-screen bg-white py-12 px-4">
                <div className="max-w-3xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-16">
                        <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight uppercase">{t('host.register.pageTitle')}</h1>
                        <p className="text-gray-500 font-bold tracking-tight">{t('host.register.pageSubtitle')}</p>
                    </div>

                    {/* Stepper */}
                    <div className="flex justify-between mb-16 relative px-4">
                        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -translate-y-1/2 -z-0 rounded-full" />
                        <div
                            className="absolute top-1/2 left-0 h-1 bg-red-500 -translate-y-1/2 -z-0 transition-all duration-500 rounded-full"
                            style={{ width: `${((step - 1) / 2) * 100}%` }}
                        />
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className={`relative z-10 w-12 h-12 rounded-2xl flex items-center justify-center font-black transition-all duration-500 border-4 ${step >= i
                                        ? 'bg-red-500 border-white text-white shadow-xl shadow-red-200'
                                        : 'bg-white border-gray-100 text-gray-400'
                                    }`}
                            >
                                {step > i ? <CheckCircle2 className="w-6 h-6" /> : i}
                                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${step >= i ? 'text-red-500' : 'text-gray-300'}`}>
                                        {t(`host.register.step${i}Label`)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Form Content */}
                    <div className="bg-white">
                        {step === 1 && <Step1BasicInfo formData={formData} setFormData={setFormData} />}
                        {step === 2 && <Step2KycDocs formData={formData} setFormData={setFormData} />}
                        {step === 3 && <Step3Confirmation formData={formData} setFormData={setFormData} />}

                        {/* Navigation Buttons */}
                        <div className="mt-16 pt-10 border-t border-gray-100 flex gap-4">
                            {step > 1 && (
                                <button
                                    onClick={prevStep}
                                    className="flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-all"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                    {t('common.previous')}
                                </button>
                            )}

                            <button
                                onClick={step === 3 ? handleSubmit : nextStep}
                                disabled={isSubmitting || (step === 3 && !formData.agreedTerms)}
                                className={`flex-1 flex items-center justify-center gap-3 px-8 py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl active:scale-95 ${isSubmitting || (step === 3 && !formData.agreedTerms)
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                                        : 'bg-gray-900 text-white hover:bg-red-500 shadow-gray-200 hover:shadow-red-100'
                                    }`}
                            >
                                {isSubmitting ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : step === 3 ? (
                                    t('host.register.submitApplication')
                                ) : (
                                    <>
                                        {t('common.continue')}
                                        <ArrowRight className="w-5 h-5" />
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
