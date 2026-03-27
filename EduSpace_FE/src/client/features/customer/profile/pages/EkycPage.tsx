import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { CustomerLayout } from '../../../../layouts/CustomerLayout';
import { Camera, Upload, CheckCircle2, XCircle, Loader2, ShieldCheck, ScanFace, CreditCard, ArrowRight, AlertTriangle, ChevronLeft } from 'lucide-react';
import { submitEkycVerification } from '../services/ekycService';
import { profileService } from '../services/profileService';

type EkycStep = 'intro' | 'info' | 'front' | 'back' | 'selfie' | 'processing' | 'result';

async function getImageMeta(file: File): Promise<{ width: number; height: number } | null> {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
            const meta = { width: img.naturalWidth, height: img.naturalHeight };
            URL.revokeObjectURL(url);
            resolve(meta);
        };
        img.onerror = () => {
            URL.revokeObjectURL(url);
            resolve(null);
        };
        img.src = url;
    });
}

export function EkycPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
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
    const [basicInfo, setBasicInfo] = useState({
        fullName: '',
        dob: '',
        phone: '',
        address: ''
    });

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const profile = await profileService.getProfile();
                // Prioritize existing profile info, fallback to ocrData for auto-fill
                setBasicInfo({
                    fullName: profile.name || profile.ocrData?.name || '',
                    dob: profile.dateOfBirth || profile.ocrData?.dob || '',
                    phone: profile.phone || '',
                    address: profile.streetAddress || profile.location || profile.ocrData?.address || ''
                });
            } catch (err) {
                console.error('Failed to pre-fill eKYC info:', err);
            }
        };
        void loadProfile();
    }, []);

    const frontInputRef = useRef<HTMLInputElement>(null);
    const backInputRef = useRef<HTMLInputElement>(null);
    const selfieInputRef = useRef<HTMLInputElement>(null);

    const resetVerificationFlow = () => {
        if (frontPreview) URL.revokeObjectURL(frontPreview);
        if (backPreview) URL.revokeObjectURL(backPreview);
        if (selfiePreview) URL.revokeObjectURL(selfiePreview);

        setFrontFile(null);
        setBackFile(null);
        setSelfieFile(null);
        setFrontPreview(null);
        setBackPreview(null);
        setSelfiePreview(null);
        setVerifyResult(null);
        setOcrData(null);
        setErrorMessage(null);

        if (frontInputRef.current) frontInputRef.current.value = '';
        if (backInputRef.current) backInputRef.current.value = '';
        if (selfieInputRef.current) selfieInputRef.current.value = '';
    };

    const pickFile = (type: 'front' | 'back' | 'selfie', file: File | null) => {
        if (!file) return;
        const url = URL.createObjectURL(file);
        if (type === 'front') {
            if (frontPreview) URL.revokeObjectURL(frontPreview);
            setFrontFile(file);
            setFrontPreview(url);
            setStep('back');
        } else if (type === 'back') {
            if (backPreview) URL.revokeObjectURL(backPreview);
            setBackFile(file);
            setBackPreview(url);
            setStep('selfie');
        } else {
            if (selfiePreview) URL.revokeObjectURL(selfiePreview);
            setSelfieFile(file);
            setSelfiePreview(url);
            void runVerify(file);
        }
    };

    const openPicker = (type: 'front' | 'back' | 'selfie') => {
        if (type === 'front') frontInputRef.current?.click();
        else if (type === 'back') backInputRef.current?.click();
        else selfieInputRef.current?.click();
    };

    const runVerify = async (selfie: File) => {
        if (!frontFile) return;
        setStep('processing');
        setErrorMessage(null);
        try {
            if (import.meta.env.DEV) {
                try {
                    const [frontMeta, selfieMeta, backMeta] = await Promise.all([
                        getImageMeta(frontFile),
                        getImageMeta(selfie),
                        backFile ? getImageMeta(backFile) : Promise.resolve(null),
                    ]);
                    console.info('[eKYC debug] upload files', {
                        front: {
                            name: frontFile.name,
                            type: frontFile.type,
                            size: frontFile.size,
                            width: frontMeta?.width ?? null,
                            height: frontMeta?.height ?? null,
                        },
                        selfie: {
                            name: selfie.name,
                            type: selfie.type,
                            size: selfie.size,
                            width: selfieMeta?.width ?? null,
                            height: selfieMeta?.height ?? null,
                        },
                        back: backFile
                            ? {
                                  name: backFile.name,
                                  type: backFile.type,
                                  size: backFile.size,
                                  width: backMeta?.width ?? null,
                                  height: backMeta?.height ?? null,
                              }
                            : null,
                    });
                } catch {
                    // Debug log only; never block eKYC flow.
                }
            }
            const data = await submitEkycVerification({
                ...basicInfo,
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
        } catch (e: any) {
            setVerifyResult('failed');
            setOcrData(null);
            
            // Extract localized message from backend if available
            const backendMessage = e.response?.data?.message;
            setErrorMessage(backendMessage ?? (e instanceof Error ? e.message : t('customer.ekyc.failed')));
            
            setStep('result');
        }
    };

    const stepLabels = [
        t('customer.ekyc.steps.front') || 'ID Upload',
        t('customer.ekyc.steps.selfie') || 'Face Match',
        t('customer.ekyc.steps.result') || 'Result'
    ];
    const stepIndex = (step === 'front' || step === 'back') ? 0 : step === 'selfie' ? 1 : (step === 'result' || step === 'processing') ? 2 : -1;

    return (
        <CustomerLayout>
            <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/30 py-16">
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
                    <AnimatePresence mode="wait">
                        {step === 'intro' ? (
                            <motion.div 
                                key="intro"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="text-center"
                            >
                                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-blue-200">
                                    <ShieldCheck className="w-12 h-12 text-white" />
                                </div>
                                <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">{t('customer.ekyc.title')}</h1>
                                <p className="text-gray-500 font-medium max-w-lg mx-auto mb-10 leading-relaxed">
                                    {t('customer.ekyc.description')}
                                </p>

                                <div className="bg-white/80 backdrop-blur-xl rounded-[40px] border border-white p-10 mb-8 shadow-2xl shadow-blue-100/50 text-left">
                                    <h3 className="font-black text-gray-900 mb-8 text-xl">EduSpace eKYC Protocol</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {[
                                            { icon: CreditCard, title: t('customer.ekyc.steps.front'), desc: 'OCR extracts your information' },
                                            { icon: CreditCard, title: t('customer.ekyc.steps.back'), desc: 'Additional identity details' },
                                            { icon: ScanFace, title: t('customer.ekyc.steps.selfie'), desc: 'Face matching security' },
                                            { icon: CheckCircle2, title: t('customer.ekyc.steps.result'), desc: 'Instant verification' },
                                        ].map((item, i) => (
                                            <div key={i} className="flex items-start gap-4">
                                                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center flex-shrink-0 border border-blue-100/50 rotate-3 group-hover:rotate-0 transition-transform">
                                                    <item.icon className="w-6 h-6 text-blue-600" />
                                                </div>
                                                <div>
                                                    <div className="font-black text-gray-900 text-sm mb-1">{item.title}</div>
                                                    <div className="text-[11px] text-gray-400 font-bold leading-tight uppercase tracking-tighter">{item.desc}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 px-6 py-5 bg-amber-50/50 border border-amber-100 rounded-3xl mb-10 text-left backdrop-blur-sm">
                                    <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                                    </div>
                                    <p className="text-xs font-bold text-amber-800 leading-snug">
                                        Please ensure good lighting and have your physical ID card ready before proceeding.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => {
                                        resetVerificationFlow();
                                        setStep('front');
                                    }}
                                    className="bg-gray-900 text-white px-12 py-5 rounded-3xl font-black text-lg shadow-2xl shadow-gray-200 hover:scale-105 active:scale-95 transition-all flex items-center gap-4 mx-auto"
                                >
                                    {t('customer.ekyc.start')}
                                    <div className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center">
                                        <ArrowRight className="w-5 h-5" />
                                    </div>
                                </button>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="main-card"
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-white rounded-[48px] border border-gray-100 shadow-[0_32px_128px_-32px_rgba(0,0,0,0.12)] overflow-hidden"
                            >
                                {/* Unified Card Header: Stepper */}
                                <div className="bg-gray-50/50 border-b border-gray-100 p-10">
                                    <div className="flex items-center justify-between relative px-4">
                                        {stepLabels.map((label, i) => (
                                            <div key={i} className="flex flex-col items-center relative z-10">
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-black transition-all duration-500 border-4 ${
                                                    i < stepIndex 
                                                        ? 'bg-blue-600 text-white border-blue-100 shadow-xl shadow-blue-100' 
                                                        : i === stepIndex
                                                            ? 'bg-white text-blue-600 border-blue-600 shadow-xl shadow-blue-100 scale-110'
                                                            : 'bg-white text-gray-200 border-gray-100'
                                                }`}>
                                                    {i < stepIndex ? '✓' : i + 1}
                                                </div>
                                                <div className={`mt-3 text-[10px] font-black uppercase tracking-widest hidden sm:block ${
                                                    i <= stepIndex ? 'text-blue-600' : 'text-gray-300'
                                                }`}>
                                                    {label}
                                                </div>
                                            </div>
                                        ))}
                                        <div className="absolute top-6 left-0 right-0 h-1 bg-gray-100/50 -z-10 mx-16 rounded-full overflow-hidden">
                                            <motion.div 
                                                className="h-full bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.5)]" 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${(stepIndex / (stepLabels.length - 1)) * 100}%` }}
                                                transition={{ duration: 0.8, ease: "circOut" }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Card Body: Dynamic Content */}
                                <div className="p-12">
                                    <AnimatePresence mode="wait">
                                        {step === 'info' && (
                                            <motion.div 
                                                key="info-step"
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                className="space-y-8"
                                            >
                                                <div>
                                                    <h2 className="text-3xl font-black text-gray-900 mb-2">{t('customer.ekyc.steps.info')}</h2>
                                                    <p className="text-gray-400 font-medium text-sm">Verify your details before we start the document scan.</p>
                                                </div>
                                                
                                                <div className="space-y-6">
                                                    <div className="group">
                                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 block group-focus-within:text-blue-500 transition-colors">Họ và tên</label>
                                                        <input 
                                                            type="text" 
                                                            className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-3xl px-8 py-5 font-black text-gray-900 transition-all outline-none text-lg shadow-sm"
                                                            placeholder="NGUYEN VAN A"
                                                            value={basicInfo.fullName}
                                                            onChange={e => setBasicInfo({...basicInfo, fullName: e.target.value.toUpperCase()})}
                                                        />
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-6">
                                                        <div>
                                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 block">Ngày sinh</label>
                                                            <input 
                                                                type="date" 
                                                                className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-3xl px-8 py-5 font-black text-gray-900 transition-all outline-none shadow-sm"
                                                                value={basicInfo.dob}
                                                                onChange={e => setBasicInfo({...basicInfo, dob: e.target.value})}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 block">Số điện thoại</label>
                                                            <input 
                                                                type="tel" 
                                                                className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-3xl px-8 py-5 font-black text-gray-900 transition-all outline-none shadow-sm"
                                                                placeholder="0912345678"
                                                                value={basicInfo.phone}
                                                                onChange={e => setBasicInfo({...basicInfo, phone: e.target.value})}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 block">Địa chỉ thường chú</label>
                                                        <textarea 
                                                            className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-3xl px-8 py-5 font-bold text-gray-900 transition-all outline-none min-h-[140px] shadow-sm resize-none"
                                                            placeholder="Số 1, Đường ABC, Phường XYZ..."
                                                            value={basicInfo.address}
                                                            onChange={e => setBasicInfo({...basicInfo, address: e.target.value})}
                                                        />
                                                    </div>
                                                    <button
                                                        onClick={() => setStep('front')}
                                                        disabled={!basicInfo.fullName || !basicInfo.dob || !basicInfo.phone || !basicInfo.address}
                                                        className="w-full bg-blue-600 disabled:bg-gray-100 disabled:text-gray-400 text-white py-6 rounded-3xl font-black text-lg shadow-2xl shadow-blue-200 hover:scale-[1.02] active:scale-98 transition-all flex items-center justify-center gap-4 mt-8"
                                                    >
                                                        Tiếp tục bước 2
                                                        <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
                                                            <ArrowRight className="w-5 h-5 flex-shrink-0" />
                                                        </div>
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}

                                        {(step === 'front' || step === 'back' || step === 'selfie') && (
                                            <motion.div 
                                                key="upload-step"
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                className="text-center"
                                            >
                                                <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-blue-100 shadow-sm shadow-blue-50">
                                                    {step === 'selfie' ? <ScanFace className="w-10 h-10 text-blue-600" /> : <CreditCard className="w-10 h-10 text-blue-600" />}
                                                </div>
                                                <h2 className="text-3xl font-black text-gray-900 mb-2">
                                                    {step === 'front' ? t('customer.ekyc.steps.front') : step === 'back' ? t('customer.ekyc.steps.back') : t('customer.ekyc.steps.selfie')}
                                                </h2>
                                                <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mb-10">
                                                    {step === 'selfie'
                                                        ? 'Keep your face in frame • Good lighting • No glasses'
                                                        : 'Flat surface • All 4 corners visible • No glare'}
                                                </p>

                                                <motion.button
                                                    whileHover={{ scale: 1.01 }}
                                                    whileTap={{ scale: 0.99 }}
                                                    type="button"
                                                    onClick={() => openPicker(step === 'front' ? 'front' : step === 'back' ? 'back' : 'selfie')}
                                                    className="w-full aspect-[16/10] bg-gray-50 border-4 border-dashed border-gray-100 rounded-[40px] flex flex-col items-center justify-center cursor-pointer hover:border-blue-200 hover:bg-blue-50/20 transition-all group mb-8 shadow-inner"
                                                >
                                                    <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-all mb-4 text-gray-300 group-hover:text-blue-500">
                                                        {step === 'selfie' ? (
                                                            <Camera className="w-10 h-10 transition-transform group-hover:scale-110" />
                                                        ) : (
                                                            <Upload className="w-10 h-10 transition-transform group-hover:scale-110" />
                                                        )}
                                                    </div>
                                                    <span className="font-black text-gray-400 group-hover:text-blue-600 transition-colors uppercase text-xs tracking-[0.2em]">
                                                        {step === 'selfie' ? 'Open Face Scanner' : 'Upload Document'}
                                                    </span>
                                                </motion.button>

                                                {(frontPreview || backPreview || selfiePreview) && (
                                                    <div className="space-y-3">
                                                        <div className="flex gap-4 justify-center">
                                                        {frontPreview && (
                                                            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="w-28 h-20 bg-gray-100 rounded-2xl overflow-hidden border-4 border-green-500/30 relative shadow-xl">
                                                                <img src={frontPreview} alt="Front" className="w-full h-full object-cover" />
                                                                <div className="absolute inset-0 bg-green-500/10 flex items-center justify-center">
                                                                    <CheckCircle2 className="w-8 h-8 text-white shadow-lg" />
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                        {backPreview && (
                                                            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="w-28 h-20 bg-gray-100 rounded-2xl overflow-hidden border-4 border-green-500/30 relative shadow-xl">
                                                                <img src={backPreview} alt="Back" className="w-full h-full object-cover" />
                                                                <div className="absolute inset-0 bg-green-500/10 flex items-center justify-center">
                                                                    <CheckCircle2 className="w-8 h-8 text-white shadow-lg" />
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                        </div>
                                                        {(step === 'back' || step === 'selfie') && (
                                                            <div className="flex flex-wrap items-center justify-center gap-3">
                                                                {frontPreview && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => openPicker('front')}
                                                                        className="px-4 py-2 rounded-xl border border-blue-200 bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wide hover:bg-blue-100 transition-colors"
                                                                    >
                                                                        Chọn lại mặt trước
                                                                    </button>
                                                                )}
                                                                {backPreview && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => openPicker('back')}
                                                                        className="px-4 py-2 rounded-xl border border-blue-200 bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wide hover:bg-blue-100 transition-colors"
                                                                    >
                                                                        Chọn lại mặt sau
                                                                    </button>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </motion.div>
                                        )}

                                        {step === 'processing' && (
                                            <motion.div 
                                                key="processing-step"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="py-12 text-center"
                                            >
                                                <div className="relative w-32 h-32 mx-auto mb-10">
                                                    <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-20" />
                                                    <div className="relative w-32 h-32 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full flex items-center justify-center z-10 shadow-2xl shadow-blue-200">
                                                        <Loader2 className="w-14 h-14 text-white animate-spin" />
                                                    </div>
                                                </div>
                                                <h2 className="text-3xl font-black text-gray-900 mb-3">{t('common.loading')}</h2>
                                                <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest max-w-xs mx-auto leading-relaxed">
                                                    {t('customer.ekyc.processing')}
                                                </p>
                                            </motion.div>
                                        )}

                                        {step === 'result' && (
                                            <motion.div 
                                                key="result-step"
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="space-y-8"
                                            >
                                                <div className={`rounded-[40px] p-12 text-center shadow-inner ${verifyResult === 'success'
                                                        ? 'bg-emerald-50/50'
                                                        : 'bg-rose-50/50'
                                                    }`}>
                                                    <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl ${verifyResult === 'success' 
                                                        ? 'bg-gradient-to-br from-emerald-500 to-green-600 shadow-emerald-200' 
                                                        : 'bg-gradient-to-br from-rose-500 to-red-600 shadow-rose-200'
                                                        }`}>
                                                        {verifyResult === 'success'
                                                            ? <CheckCircle2 className="w-12 h-12 text-white" />
                                                            : <XCircle className="w-12 h-12 text-white" />
                                                        }
                                                    </div>
                                                    <h2 className="text-4xl font-black text-gray-900 mb-2 tracking-tight">
                                                        {verifyResult === 'success' ? t('customer.ekyc.success') : t('customer.ekyc.failed')}
                                                    </h2>
                                                    {verifyResult === 'failed' && errorMessage && (
                                                        <p className="text-sm text-red-700 font-bold bg-white/50 px-6 py-3 rounded-2xl inline-block border border-red-100 mt-4 uppercase tracking-tight">{errorMessage}</p>
                                                    )}
                                                </div>

                                                {ocrData && verifyResult === 'success' && (
                                                    <div className="space-y-8">
                                                        <div className="bg-gray-50/50 border border-gray-100 rounded-[40px] p-10 backdrop-blur-sm">
                                                            <h3 className="font-black text-gray-900 mb-8 flex items-center gap-3 text-lg">
                                                                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                                                                    <ShieldCheck className="w-6 h-6 text-emerald-600" />
                                                                </div>
                                                                Verified Identity Profile
                                                            </h3>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                                {[
                                                                    { label: 'Verified Name', value: ocrData.name ?? '—' },
                                                                    { label: 'Document Number', value: ocrData.idNumber ?? '—' },
                                                                    { label: 'Date of Birth', value: ocrData.dob ?? '—' },
                                                                    { label: 'Registered Address', value: ocrData.address ?? '—' },
                                                                ].map((field, i) => (
                                                                    <div key={i}>
                                                                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">{field.label}</div>
                                                                        <div className="text-sm font-black text-gray-900 bg-white border border-gray-100 px-6 py-4 rounded-2xl shadow-sm leading-relaxed">{field.value}</div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        <button
                                                            type="button"
                                                            onClick={() => navigate('/rental/register')}
                                                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-6 rounded-[32px] font-black text-lg shadow-2xl shadow-blue-200 hover:scale-[1.02] active:scale-98 transition-all flex items-center justify-center gap-4"
                                                        >
                                                            Continue to Registration
                                                            <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
                                                                <ArrowRight className="w-6 h-6" />
                                                            </div>
                                                        </button>
                                                    </div>
                                                )}

                                                {verifyResult === 'failed' && (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            resetVerificationFlow();
                                                            setStep('front');
                                                        }}
                                                        className="w-full bg-gray-900 text-white py-6 rounded-[32px] font-black text-lg shadow-2xl shadow-gray-200 hover:scale-[1.02] active:scale-98 transition-all flex items-center justify-center gap-4"
                                                    >
                                                        Retry Verification Process
                                                        <div className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center">
                                                            <ArrowRight className="w-5 h-5" />
                                                        </div>
                                                    </button>
                                                )}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </CustomerLayout>
    );
}
