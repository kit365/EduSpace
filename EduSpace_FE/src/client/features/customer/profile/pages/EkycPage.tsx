import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CustomerLayout } from '../../../../layouts/CustomerLayout';
import { Camera, Upload, CheckCircle2, XCircle, Loader2, ShieldCheck, ScanFace, CreditCard, ArrowRight, AlertTriangle } from 'lucide-react';
import { EkycResult } from '../../../../../types/api';

type EkycStep = 'intro' | 'front' | 'back' | 'selfie' | 'processing' | 'result';

export function EkycPage() {
    const { t } = useTranslation();
    const [step, setStep] = useState<EkycStep>('intro');
    const [frontImage, setFrontImage] = useState<string | null>(null);
    const [backImage, setBackImage] = useState<string | null>(null);
    const [selfieImage, setSelfieImage] = useState<string | null>(null);
    const [verifyResult, setVerifyResult] = useState<EkycResult['status'] | null>(null);
    const [ocrData, setOcrData] = useState<EkycResult['ocrData'] | null>(null);

    const handleImageUpload = (type: 'front' | 'back' | 'selfie') => {
        // Simulate file upload
        const mockImages: Record<string, string> = {
            front: 'https://images.unsplash.com/photo-1633265486064-086b219458ec?w=400&h=250&fit=crop',
            back: 'https://images.unsplash.com/photo-1633265486064-086b219458ec?w=400&h=250&fit=crop',
            selfie: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop',
        };
        if (type === 'front') { setFrontImage(mockImages.front); setStep('back'); }
        else if (type === 'back') { setBackImage(mockImages.back); setStep('selfie'); }
        else { setSelfieImage(mockImages.selfie); handleVerify(); }
    };

    const handleVerify = () => {
        setStep('processing');
        // Simulate API call to VNPT eKYC / FPT.AI
        setTimeout(() => {
            setOcrData({
                name: 'Nguyễn Văn An',
                idNumber: '079200012345',
                dob: '15/03/2000',
                address: 'Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
                expiryDate: '15/03/2030'
            });
            setVerifyResult('success');
            setStep('result');
        }, 3000);
    };

    const stepLabels = [
        t('customer.ekyc.steps.front'),
        t('customer.ekyc.steps.back'),
        t('customer.ekyc.steps.selfie'),
        t('customer.ekyc.steps.result')
    ];
    const stepIndex = step === 'front' ? 0 : step === 'back' ? 1 : step === 'selfie' ? 2 : step === 'result' || step === 'processing' ? 3 : -1;

    return (
        <CustomerLayout>
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 animate-in fade-in duration-700">
                <div className="max-w-2xl mx-auto px-4">

                    {/* Intro Screen */}
                    {step === 'intro' && (
                        <div className="text-center">
                            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-blue-200">
                                <ShieldCheck className="w-12 h-12 text-white" />
                            </div>
                            <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">{t('customer.ekyc.title')}</h1>
                            <p className="text-gray-500 font-medium max-w-lg mx-auto mb-10 leading-relaxed">
                                {t('customer.ekyc.description')}
                            </p>

                            <div className="bg-white rounded-3xl border border-gray-100 p-8 mb-8 shadow-sm text-left">
                                <h3 className="font-black text-gray-900 mb-6">EduSpace eKYC Protocol</h3>
                                <div className="space-y-4">
                                    {[
                                        { icon: CreditCard, title: t('customer.ekyc.steps.front'), desc: 'OCR automatically extracts your information' },
                                        { icon: CreditCard, title: t('customer.ekyc.steps.back'), desc: 'Verifying additional identity details' },
                                        { icon: ScanFace, title: t('customer.ekyc.steps.selfie'), desc: 'Face matching using AI' },
                                        { icon: CheckCircle2, title: t('customer.ekyc.steps.result'), desc: 'Powered by VNPT eKYC / FPT.AI' },
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-start gap-4">
                                            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                                <item.icon className="w-5 h-5 text-blue-500" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900 text-sm">{item.title}</div>
                                                <div className="text-xs text-gray-400 font-medium">{item.desc}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center gap-3 px-5 py-4 bg-amber-50 border border-amber-200 rounded-2xl mb-8 text-left">
                                <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                                <p className="text-xs font-medium text-amber-700">Please prepare your valid ID and enable camera access.</p>
                            </div>

                            <button
                                onClick={() => setStep('front')}
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-12 py-4 rounded-2xl font-black text-lg shadow-xl shadow-blue-200 hover:shadow-2xl transition-all active:scale-95 inline-flex items-center gap-3"
                            >
                                {t('customer.ekyc.start')}
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    )}

                    {/* Step Progress */}
                    {step !== 'intro' && (
                        <div className="mb-10">
                            <div className="flex items-center justify-between mb-4">
                                {stepLabels.map((label, i) => (
                                    <div key={i} className="flex items-center gap-2 flex-1">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${i <= stepIndex ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-gray-200 text-gray-400'
                                            }`}>
                                            {i < stepIndex ? '✓' : i + 1}
                                        </div>
                                        <span className={`text-[10px] font-bold uppercase tracking-wider hidden sm:block ${i <= stepIndex ? 'text-blue-600' : 'text-gray-300'}`}>
                                            {label}
                                        </span>
                                        {i < stepLabels.length - 1 && (
                                            <div className={`flex-1 h-0.5 mx-2 rounded-full ${i < stepIndex ? 'bg-blue-500' : 'bg-gray-200'}`} />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Upload Steps */}
                    {(step === 'front' || step === 'back' || step === 'selfie') && (
                        <div className="bg-white rounded-3xl border border-gray-100 p-10 shadow-lg text-center">
                            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                {step === 'selfie' ? <ScanFace className="w-8 h-8 text-blue-500" /> : <CreditCard className="w-8 h-8 text-blue-500" />}
                            </div>
                            <h2 className="text-2xl font-black text-gray-900 mb-2">
                                {step === 'front' ? t('customer.ekyc.steps.front') : step === 'back' ? t('customer.ekyc.steps.back') : t('customer.ekyc.steps.selfie')}
                            </h2>
                            <p className="text-sm text-gray-400 font-medium mb-8">
                                {step === 'selfie'
                                    ? 'Keep your face in frame, ensure good lighting and remove glasses.'
                                    : 'Place ID card on a flat surface, ensure all 4 corners are visible.'}
                            </p>

                            {/* Upload area */}
                            <div
                                onClick={() => handleImageUpload(step)}
                                className="w-full aspect-[16/10] bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all group mb-6"
                            >
                                {step === 'selfie' ? (
                                    <Camera className="w-16 h-16 text-gray-300 group-hover:text-blue-400 transition-colors mb-4" />
                                ) : (
                                    <Upload className="w-16 h-16 text-gray-300 group-hover:text-blue-400 transition-colors mb-4" />
                                )}
                                <span className="font-bold text-gray-400 group-hover:text-blue-500 transition-colors uppercase text-xs tracking-widest">
                                    {step === 'selfie' ? 'Open Camera' : 'Upload Doc'}
                                </span>
                            </div>

                            {/* Preview of previous steps */}
                            {(frontImage || backImage) && (
                                <div className="flex gap-4 justify-center">
                                    {frontImage && (
                                        <div className="w-24 h-16 bg-gray-100 rounded-xl overflow-hidden border-2 border-green-500 relative">
                                            <img src={frontImage} alt="Mặt trước" className="w-full h-full object-cover" />
                                            <CheckCircle2 className="w-4 h-4 text-green-500 absolute top-1 right-1" />
                                        </div>
                                    )}
                                    {backImage && (
                                        <div className="w-24 h-16 bg-gray-100 rounded-xl overflow-hidden border-2 border-green-500 relative">
                                            <img src={backImage} alt="Mặt sau" className="w-full h-full object-cover" />
                                            <CheckCircle2 className="w-4 h-4 text-green-500 absolute top-1 right-1" />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Processing */}
                    {step === 'processing' && (
                        <div className="bg-white rounded-3xl border border-gray-100 p-16 shadow-lg text-center">
                            <div className="relative w-24 h-24 mx-auto mb-8">
                                <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-30" />
                                <div className="relative w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center z-10">
                                    <Loader2 className="w-12 h-12 text-white animate-spin" />
                                </div>
                            </div>
                            <h2 className="text-2xl font-black text-gray-900 mb-3">{t('common.loading')}</h2>
                            <p className="text-sm text-gray-400 font-medium max-w-sm mx-auto">
                                {t('customer.ekyc.processing')}
                            </p>
                        </div>
                    )}

                    {/* Result */}
                    {step === 'result' && (
                        <div className="space-y-6">
                            <div className={`rounded-3xl p-10 text-center shadow-lg ${verifyResult === 'success'
                                    ? 'bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200'
                                    : 'bg-gradient-to-br from-red-50 to-rose-50 border border-red-200'
                                }`}>
                                <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl ${verifyResult === 'success' ? 'bg-green-500 shadow-green-200' : 'bg-red-500 shadow-red-200'
                                    }`}>
                                    {verifyResult === 'success'
                                        ? <CheckCircle2 className="w-10 h-10 text-white" />
                                        : <XCircle className="w-10 h-10 text-white" />
                                    }
                                </div>
                                <h2 className="text-3xl font-black text-gray-900 mb-2">
                                    {verifyResult === 'success' ? t('customer.ekyc.success') : t('customer.ekyc.failed')}
                                </h2>
                            </div>

                            {/* OCR Data Display */}
                            {ocrData && verifyResult === 'success' && (
                                <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
                                    <h3 className="font-black text-gray-900 mb-6 flex items-center gap-2">
                                        <ShieldCheck className="w-5 h-5 text-green-500" />
                                        {t('customer.ekyc.extractedInfo')}
                                    </h3>
                                    <div className="grid grid-cols-2 gap-6">
                                        {[
                                            { label: 'Name', value: ocrData.name },
                                            { label: 'ID Number', value: ocrData.idNumber },
                                            { label: 'Date of Birth', value: ocrData.dob },
                                            { label: 'Address', value: ocrData.address },
                                        ].map((field, i) => (
                                            <div key={i}>
                                                <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">{field.label}</div>
                                                <div className="text-sm font-bold text-gray-900 bg-gray-50 px-4 py-3 rounded-xl">{field.value}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {verifyResult === 'failed' && (
                                <button
                                    onClick={() => { setStep('front'); setFrontImage(null); setBackImage(null); setSelfieImage(null); }}
                                    className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black shadow-xl hover:shadow-2xl transition-all active:scale-95"
                                >
                                    {t('customer.ekyc.retry')}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </CustomerLayout>
    );
}
