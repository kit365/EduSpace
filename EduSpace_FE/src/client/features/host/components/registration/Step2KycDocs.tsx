import { Upload, CheckCircle, Clock, XCircle, Eye } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Step2Props {
    formData: any;
    setFormData: (data: any) => void;
}

export function Step2KycDocs({ formData, setFormData }: Step2Props) {
    const { t } = useTranslation();

    const handleUpload = (docId: string) => {
        // Simulate upload
        const updatedDocs = formData.documents.map((d: any) =>
            d.id === docId ? { ...d, status: 'uploaded', fileName: `${docId}_mock_verified.jpg` } : d
        );
        setFormData({ ...formData, documents: updatedDocs });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'verified': return <span className="flex items-center gap-1.5 text-[10px] font-black text-green-600 bg-green-50 px-3 py-1.5 rounded-lg uppercase tracking-widest"><CheckCircle className="w-3 h-3" />{t('common.verified')}</span>;
            case 'uploaded': return <span className="flex items-center gap-1.5 text-[10px] font-black text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg uppercase tracking-widest"><Clock className="w-3 h-3" />{t('common.pending')}</span>;
            case 'rejected': return <span className="flex items-center gap-1.5 text-[10px] font-black text-red-600 bg-red-50 px-3 py-1.5 rounded-lg uppercase tracking-widest"><XCircle className="w-3 h-3" />{t('common.rejected')}</span>;
            default: return <span className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 bg-gray-50 px-3 py-1.5 rounded-lg uppercase tracking-widest"><Upload className="w-3 h-3" />{t('common.notUploaded')}</span>;
        }
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-2xl font-black text-gray-900 mb-8">{t('host.register.step2Title')}</h3>
            <p className="text-gray-500 font-bold mb-8 leading-relaxed">{t('host.register.kycDesc')}</p>

            <div className="space-y-6">
                {formData.documents
                    .filter((d: any) => formData.type === 'business' || d.id !== 'business_license')
                    .map((doc: any) => (
                        <div key={doc.id} className="bg-gray-50 rounded-[32px] border border-gray-100 p-6 transition-all hover:bg-white hover:shadow-xl hover:shadow-gray-200/50 group">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h4 className="font-black text-gray-900 uppercase tracking-tight">{doc.label}</h4>
                                        {getStatusBadge(doc.status)}
                                    </div>
                                    <p className="text-sm text-gray-500 font-medium">{doc.description}</p>
                                    {doc.fileName && (
                                        <div className="flex items-center gap-2 mt-3 p-2 bg-blue-50 rounded-xl w-fit border border-blue-100">
                                            <span className="text-xs font-bold text-blue-600 text-ellipsis overflow-hidden max-w-[200px]">📎 {doc.fileName}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-3">
                                    {doc.status === 'uploaded' && (
                                        <button className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white text-gray-400 border border-gray-100 hover:text-blue-500 transition-all shadow-sm">
                                            <Eye className="w-5 h-5" />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleUpload(doc.id)}
                                        className={`px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2 ${doc.status === 'not_uploaded' || doc.status === 'rejected'
                                                ? 'bg-gray-900 text-white shadow-lg'
                                                : 'bg-white text-gray-500 border border-gray-100'
                                            }`}
                                    >
                                        <Upload className="w-4 h-4" />
                                        {doc.status === 'not_uploaded' ? t('common.upload') : t('common.reupload')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
            </div>
        </div>
    );
}
