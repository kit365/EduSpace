import { ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Step3Props {
    formData: any;
    setFormData: (data: any) => void;
}

export function Step3Confirmation({ formData, setFormData }: Step3Props) {
    const { t } = useTranslation();

    const summaryItems = [
        { label: t('host.register.labelName'), value: formData.name },
        { label: t('host.register.labelPhone'), value: formData.phone },
        { label: 'Email', value: formData.email },
        { label: t('host.register.labelAddress'), value: formData.address },
        { label: t('host.register.typeLabel'), value: formData.type === 'individual' ? t('host.register.typeIndividual') : t('host.register.typeBusiness') },
    ];

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-2xl font-black text-gray-900 mb-8">{t('host.register.step3Title')}</h3>

            <div className="bg-gray-50 rounded-[32px] p-8 mb-8 border border-gray-100">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 block">{t('host.register.summary')}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {summaryItems.map((item, idx) => (
                        <div key={idx}>
                            <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{item.label}</span>
                            <span className="font-bold text-gray-900">{item.value || t('common.notProvided')}</span>
                        </div>
                    ))}
                </div>

                <div className="mt-8 pt-8 border-t border-gray-200">
                    <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">{t('host.register.documentsSubmitted')}</span>
                    <div className="flex flex-wrap gap-2">
                        {formData.documents
                            .filter((d: any) => d.status === 'uploaded')
                            .filter((d: any) => formData.type === 'business' || d.id !== 'business_license')
                            .map((doc: any) => (
                                <div key={doc.id} className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-600 rounded-lg border border-green-100">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span className="text-xs font-black uppercase tracking-tight">{doc.label}</span>
                                </div>
                            ))}
                    </div>
                </div>
            </div>

            <div className="bg-red-50 rounded-3xl p-6 mb-8 border border-red-100 flex items-start gap-4">
                <ShieldCheck className="w-6 h-6 text-red-500 mt-1 flex-shrink-0" />
                <div>
                    <h4 className="font-black text-red-900 mb-2">{t('host.register.termsHeader')}</h4>
                    <p className="text-sm text-red-800/80 font-medium leading-relaxed">
                        {t('host.register.termsContent')}
                    </p>
                </div>
            </div>

            <label className="flex items-center gap-4 cursor-pointer group p-4 rounded-2xl hover:bg-gray-50 transition-all">
                <div className="relative flex items-center">
                    <input
                        type="checkbox"
                        checked={formData.agreedTerms}
                        onChange={(e) => setFormData({ ...formData, agreedTerms: e.target.checked })}
                        className="w-6 h-6 rounded-lg border-gray-200 text-red-500 focus:ring-red-500 transition-all cursor-pointer"
                    />
                </div>
                <span className="font-bold text-gray-700 group-hover:text-gray-900 transition-colors">
                    {t('host.register.agreeCheckbox')}
                </span>
            </label>
        </div>
    );
}
