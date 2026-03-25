import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CustomerLayout } from '../../../../layouts/CustomerLayout';
import { Camera, Upload, CheckCircle2, XCircle, Loader2, ShieldCheck, ScanFace, CreditCard, ArrowRight, AlertTriangle } from 'lucide-react';
import { submitEkycVerification } from '../services/ekycService';

type EkycStep = 'intro' | 'front' | 'back' | 'selfie' | 'processing' | 'result';

export function EkycPage() {
    const { t } = useTranslation();
    const [step, setStep] = useState<EkycStep>('intro');
    const [frontFile, setFrontFile] = useState<File | null>(null);
    const [backFile, setBackFile] = useState<File | null>(null);
    const [selfieFile, setSelfieFile] = useState<File | null>(null);
    const [frontPreview, setFrontPreview] = useState<string | null>(null);
    const [backPreview, setBackPreview] = useState<string | null>(null);
    const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
    const [verifyResult, setVerifyResult] = useState<'success' | 'failed' | null>(null);
    const [ocrData, setOcrData] = useState<{
        name: string | null;
        idNumber: string | null;
        dob: string | null;
        address: string | null;
        expiryDate: string | null;
    } | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const frontInputRef = useRef<HTMLInputElement>(null);
    const backInputRef = useRef<HTMLInputElement>(null);
    const selfieInputRef = useRef<HTMLInputElement>(null);

    const pickFile = (type: 'front' | 'back' | 'selfie', file: File | null) => {
        if (!file) return;
        const url = URL.createObjectURL(file);
        if (type === 'front') {
            setFrontFile(file);
            setFrontPreview(url);
            setStep('back');
        } else if (type === 'back') {
            setBackFile(file);
            setBackPreview(url);
            setStep('selfie');
        } else {
            setSelfieFile(file);
            setSelfiePreview(url);
            void runVerify(file);
        }
    };

    const runVerify = async (selfie: File) => {
        if (!frontFile) return;
        setStep('processing');
        setErrorMessage(null);
        try {
            const data = await submitEkycVerification({
                front: frontFile,
                back: backFile ?? undefined,
                selfie,
            });
            if (data.status === 'success' && data.ocrData) {
                setOcrData({
                    name: data.ocrData.name,
                    idNumber: data.ocrData.idNumber,
                    dob: data.ocrData.dob,
                    address: data.ocrData.address,
                    expiryDate: data.ocrData.expiryDate,
                });
                setVerifyResult('success');
            } else {
                setOcrData(null);
                setVerifyResult('failed');
                setErrorMessage(data.message ?? t('customer.ekyc.failed'));
            }
            setStep('result');
        } catch (e) {
            setVerifyResult('failed');
            setOcrData(null);
            setErrorMessage(e instanceof Error ? e.message : t('customer.ekyc.failed'));
            setStep('result');
        }
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

                    <input
                        ref={frontInputRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        onChange={(e) => pickFile('front', e.target.files?.[0] ?? null)}
                    />
                    <input
                        ref={backInputRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        onChange={(e) => pickFile('back', e.target.files?.[0] ?? null)}
                    />
                    <input
                        ref={selfieInputRef}
                        type="file"
                        accept="image/*"
                        capture="user"
                        className="hidden"
                        onChange={(e) => pickFile('selfie', e.target.files?.[0] ?? null)}
                    />

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
                                        { icon: CreditCard, title: t('customer.ekyc.steps.front'), desc: 'OCR extracts your information (local AI on our servers)' },
                                        { icon: CreditCard, title: t('customer.ekyc.steps.back'), desc: 'Additional identity details' },
                                        { icon: ScanFace, title: t('customer.ekyc.steps.selfie'), desc: 'Face matching with DeepFace' },
                                        { icon: CheckCircle2, title: t('customer.ekyc.steps.result'), desc: 'Processed by EduSpace — data stays on your infrastructure' },
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
                                type="button"
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

                            <button
                                type="button"
                                onClick={() => {
                                    if (step === 'front') frontInputRef.current?.click();
                                    else if (step === 'back') backInputRef.current?.click();
                                    else selfieInputRef.current?.click();
                                }}
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
                            </button>

                            {(frontPreview || backPreview) && (
                                <div className="flex gap-4 justify-center">
                                    {frontPreview && (
                                        <div className="w-24 h-16 bg-gray-100 rounded-xl overflow-hidden border-2 border-green-500 relative">
                                            <img src={frontPreview} alt="Front" className="w-full h-full object-cover" />
                                            <CheckCircle2 className="w-4 h-4 text-green-500 absolute top-1 right-1" />
                                        </div>
                                    )}
                                    {backPreview && (
                                        <div className="w-24 h-16 bg-gray-100 rounded-xl overflow-hidden border-2 border-green-500 relative">
                                            <img src={backPreview} alt="Back" className="w-full h-full object-cover" />
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
                                {verifyResult === 'failed' && errorMessage && (
                                    <p className="text-sm text-red-700 font-medium mt-2 max-w-md mx-auto">{errorMessage}</p>
                                )}
                            </div>

                            {ocrData && verifyResult === 'success' && (
                                <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
                                    <h3 className="font-black text-gray-900 mb-6 flex items-center gap-2">
                                        <ShieldCheck className="w-5 h-5 text-green-500" />
                                        {t('customer.ekyc.extractedInfo')}
                                    </h3>
                                    <div className="grid grid-cols-2 gap-6">
                                        {[
                                            { label: 'Name', value: ocrData.name ?? '—' },
                                            { label: 'ID Number', value: ocrData.idNumber ?? '—' },
                                            { label: 'Date of Birth', value: ocrData.dob ?? '—' },
                                            { label: 'Address', value: ocrData.address ?? '—' },
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
                                    type="button"
                                    onClick={() => {
                                        setStep('front');
                                        setFrontFile(null);
                                        setBackFile(null);
                                        setSelfieFile(null);
                                        setFrontPreview(null);
                                        setBackPreview(null);
                                        setSelfiePreview(null);
                                        setVerifyResult(null);
                                        setOcrData(null);
                                        setErrorMessage(null);
                                    }}
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
