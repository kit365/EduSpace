import { useState } from 'react';
import { Upload, CheckCircle, Clock, XCircle, Shield, AlertTriangle, Eye } from 'lucide-react';
import { RentalLayout } from '../../../layouts/RentalLayout';

type KycStep = 'info' | 'docs' | 'review';
type DocStatus = 'not_uploaded' | 'uploaded' | 'verified' | 'rejected';

interface KycDoc {
    id: string;
    label: string;
    description: string;
    status: DocStatus;
    fileName?: string;
    rejectionReason?: string;
}

export function KycPage() {
    // Mock: host's current KYC status
    const [kycStatus] = useState<'not_submitted' | 'pending' | 'verified' | 'rejected'>('pending');
    const [currentStep, setCurrentStep] = useState<KycStep>('docs');
    const [documents, setDocuments] = useState<KycDoc[]>([
        { id: 'cccd_front', label: 'CMND/CCCD - Mặt trước', description: 'Ảnh rõ ràng, không che khuất', status: 'uploaded', fileName: 'cccd_front.jpg' },
        { id: 'cccd_back', label: 'CMND/CCCD - Mặt sau', description: 'Ảnh rõ ràng, không che khuất', status: 'uploaded', fileName: 'cccd_back.jpg' },
        { id: 'business_license', label: 'Giấy phép kinh doanh (tuỳ chọn)', description: 'Bản scan hoặc ảnh chụp rõ nét', status: 'not_uploaded' },
    ]);

    const handleUpload = (docId: string) => {
        setDocuments(prev => prev.map(d => d.id === docId ? { ...d, status: 'uploaded' as DocStatus, fileName: `${docId}_mock.jpg` } : d));
    };

    const getStatusBadge = (status: DocStatus) => {
        switch (status) {
            case 'verified': return <span className="flex items-center gap-1.5 text-[10px] font-black text-green-600 bg-green-50 px-3 py-1.5 rounded-lg uppercase tracking-widest"><CheckCircle className="w-3 h-3" />Đã duyệt</span>;
            case 'uploaded': return <span className="flex items-center gap-1.5 text-[10px] font-black text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg uppercase tracking-widest"><Clock className="w-3 h-3" />Chờ duyệt</span>;
            case 'rejected': return <span className="flex items-center gap-1.5 text-[10px] font-black text-red-600 bg-red-50 px-3 py-1.5 rounded-lg uppercase tracking-widest"><XCircle className="w-3 h-3" />Bị từ chối</span>;
            default: return <span className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 bg-gray-50 px-3 py-1.5 rounded-lg uppercase tracking-widest"><Upload className="w-3 h-3" />Chưa tải</span>;
        }
    };

    const getOverallStatusUI = () => {
        switch (kycStatus) {
            case 'verified':
                return (
                    <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl p-8 text-white mb-10">
                        <div className="flex items-center gap-4"><Shield className="w-12 h-12" /><div><h2 className="text-2xl font-black">Tài khoản đã xác minh ✓</h2><p className="text-green-100 font-medium mt-1">Bạn đã hoàn tất KYC và có thể đăng tin phòng trên EduSpace.</p></div></div>
                    </div>
                );
            case 'pending':
                return (
                    <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl p-8 text-white mb-10">
                        <div className="flex items-center gap-4"><Clock className="w-12 h-12 animate-pulse" /><div><h2 className="text-2xl font-black">Đang chờ xác minh</h2><p className="text-amber-100 font-medium mt-1">Giấy tờ của bạn đã được gửi. Admin sẽ xác minh trong 24-48 giờ.</p></div></div>
                    </div>
                );
            case 'rejected':
                return (
                    <div className="bg-gradient-to-br from-red-500 to-rose-600 rounded-3xl p-8 text-white mb-10">
                        <div className="flex items-center gap-4"><AlertTriangle className="w-12 h-12" /><div><h2 className="text-2xl font-black">Xác minh bị từ chối</h2><p className="text-red-100 font-medium mt-1">Vui lòng kiểm tra lại giấy tờ và tải lên lại.</p></div></div>
                    </div>
                );
            default:
                return (
                    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 text-white mb-10">
                        <div className="flex items-center gap-4"><Shield className="w-12 h-12 text-gray-400" /><div><h2 className="text-2xl font-black">Xác minh danh tính (KYC)</h2><p className="text-gray-400 font-medium mt-1">Upload CMND/CCCD hoặc Giấy phép kinh doanh để kích hoạt quyền đăng tin.</p></div></div>
                    </div>
                );
        }
    };

    const steps = [
        { key: 'info' as KycStep, label: 'Thông tin cá nhân', num: 1 },
        { key: 'docs' as KycStep, label: 'Giấy tờ xác minh', num: 2 },
        { key: 'review' as KycStep, label: 'Xem lại & Gửi', num: 3 },
    ];

    return (
        <RentalLayout title="Xác minh KYC">
            <div className="max-w-4xl mx-auto p-8">
                {getOverallStatusUI()}

                {/* Steps */}
                <div className="flex items-center gap-4 mb-10">
                    {steps.map((step, i) => (
                        <div key={step.key} className="flex items-center gap-3">
                            <button
                                onClick={() => setCurrentStep(step.key)}
                                className={`flex items-center gap-3 px-5 py-3 rounded-2xl font-bold text-sm transition-all ${currentStep === step.key ? 'bg-gray-900 text-white shadow-lg' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                            >
                                <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black ${currentStep === step.key ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-500'}`}>{step.num}</span>
                                {step.label}
                            </button>
                            {i < steps.length - 1 && <div className="w-8 h-px bg-gray-200" />}
                        </div>
                    ))}
                </div>

                {/* Step: Personal Info */}
                {currentStep === 'info' && (
                    <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm animate-in fade-in duration-500">
                        <h3 className="text-xl font-black text-gray-900 mb-6">Thông tin cá nhân</h3>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Họ và tên</label>
                                <input type="text" defaultValue="Trần Thị Bích Ngọc" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition-all" />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Số điện thoại</label>
                                <input type="text" defaultValue="0912345678" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition-all" />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Email</label>
                                <input type="email" defaultValue="ngoc.ttb@gmail.com" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition-all" />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Địa chỉ kinh doanh</label>
                                <input type="text" defaultValue="123 Nguyễn Huệ, Quận 1, TP.HCM" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition-all" />
                            </div>
                        </div>
                        <button onClick={() => setCurrentStep('docs')} className="mt-8 bg-gray-900 text-white px-10 py-4 rounded-2xl font-black text-sm shadow-lg hover:bg-red-500 transition-all active:scale-95">
                            Tiếp tục →
                        </button>
                    </div>
                )}

                {/* Step: Documents */}
                {currentStep === 'docs' && (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        {documents.map(doc => (
                            <div key={doc.id} className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h4 className="font-black text-gray-900">{doc.label}</h4>
                                            {getStatusBadge(doc.status)}
                                        </div>
                                        <p className="text-sm text-gray-400 font-medium">{doc.description}</p>
                                        {doc.fileName && <p className="text-xs font-bold text-blue-500 mt-2">📎 {doc.fileName}</p>}
                                        {doc.rejectionReason && <p className="text-xs font-bold text-red-500 mt-2">❌ Lý do: {doc.rejectionReason}</p>}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {doc.status === 'uploaded' && (
                                            <button className="p-3 rounded-xl bg-gray-50 text-gray-500 hover:bg-blue-50 hover:text-blue-500 transition-all"><Eye className="w-5 h-5" /></button>
                                        )}
                                        <button
                                            onClick={() => handleUpload(doc.id)}
                                            className={`px-6 py-3 rounded-xl font-bold text-sm transition-all active:scale-95 ${doc.status === 'not_uploaded' || doc.status === 'rejected' ? 'bg-red-500 text-white shadow-lg shadow-red-200 hover:bg-red-600' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                                        >
                                            <Upload className="w-4 h-4 inline mr-2" />
                                            {doc.status === 'not_uploaded' ? 'Tải lên' : 'Tải lại'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div className="flex gap-4 mt-8">
                            <button onClick={() => setCurrentStep('info')} className="px-8 py-4 rounded-2xl font-black text-sm border border-gray-200 text-gray-500 hover:bg-gray-50 transition-all">← Quay lại</button>
                            <button onClick={() => setCurrentStep('review')} className="bg-gray-900 text-white px-10 py-4 rounded-2xl font-black text-sm shadow-lg hover:bg-red-500 transition-all active:scale-95">Tiếp tục →</button>
                        </div>
                    </div>
                )}

                {/* Step: Review & Submit */}
                {currentStep === 'review' && (
                    <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm animate-in fade-in duration-500">
                        <h3 className="text-xl font-black text-gray-900 mb-6">Xem lại & Gửi</h3>
                        <div className="space-y-4 mb-8">
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                                <span className="font-bold text-gray-600">Tên</span><span className="font-black text-gray-900">Trần Thị Bích Ngọc</span>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                                <span className="font-bold text-gray-600">SĐT</span><span className="font-black text-gray-900">0912345678</span>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                                <span className="font-bold text-gray-600">Email</span><span className="font-black text-gray-900">ngoc.ttb@gmail.com</span>
                            </div>
                            {documents.filter(d => d.status !== 'not_uploaded').map(doc => (
                                <div key={doc.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                                    <span className="font-bold text-gray-600">{doc.label}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-green-600">✓ {doc.fileName}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-4">
                            <button onClick={() => setCurrentStep('docs')} className="px-8 py-4 rounded-2xl font-black text-sm border border-gray-200 text-gray-500 hover:bg-gray-50 transition-all">← Quay lại</button>
                            <button className="flex-1 bg-gradient-to-r from-red-500 to-rose-600 text-white px-10 py-4 rounded-2xl font-black text-sm shadow-xl hover:shadow-2xl transition-all active:scale-95">
                                🚀 Gửi hồ sơ KYC
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </RentalLayout>
    );
}
