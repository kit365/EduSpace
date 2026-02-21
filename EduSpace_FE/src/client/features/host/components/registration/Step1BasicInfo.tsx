import { User, Phone, MapPin, Mail, Building2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Step1Props {
    formData: any;
    setFormData: (data: any) => void;
}

export function Step1BasicInfo({ formData, setFormData }: Step1Props) {
    const { t } = useTranslation();

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-2xl font-black text-gray-900 mb-8">{t('host.register.step1Title')}</h3>

            <div className="grid grid-cols-2 gap-4 mb-10">
                <button
                    onClick={() => setFormData({ ...formData, type: 'individual' })}
                    className={`flex flex-col items-center gap-4 p-6 rounded-3xl border-2 transition-all ${formData.type === 'individual'
                        ? 'border-red-500 bg-red-50/50'
                        : 'border-gray-100 hover:border-gray-200'
                        }`}
                >
                    <User className={`w-8 h-8 ${formData.type === 'individual' ? 'text-red-500' : 'text-gray-400'}`} />
                    <span className="font-black text-sm uppercase tracking-widest">{t('host.register.typeIndividual')}</span>
                </button>
                <button
                    onClick={() => setFormData({ ...formData, type: 'business' })}
                    className={`flex flex-col items-center gap-4 p-6 rounded-3xl border-2 transition-all ${formData.type === 'business'
                        ? 'border-red-500 bg-red-50/50'
                        : 'border-gray-100 hover:border-gray-200'
                        }`}
                >
                    <Building2 className={`w-8 h-8 ${formData.type === 'business' ? 'text-red-500' : 'text-gray-400'}`} />
                    <span className="font-black text-sm uppercase tracking-widest">{t('host.register.typeBusiness')}</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">{t('host.register.labelName')}</label>
                    <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all font-bold"
                            placeholder={formData.type === 'individual' ? t('host.register.placeholderNameInd') : t('host.register.placeholderNameBus')}
                        />
                    </div>
                </div>
                <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">{t('host.register.labelPhone')}</label>
                    <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all font-bold"
                            placeholder="09xx xxx xxx"
                        />
                    </div>
                </div>
                <div className="col-span-1 md:col-span-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Email</label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all font-bold"
                            placeholder="example@gmail.com"
                        />
                    </div>
                </div>
                <div className="col-span-1 md:col-span-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">{t('host.register.labelAddress')}</label>
                    <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all font-bold"
                            placeholder={t('host.register.placeholderAddress')}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
