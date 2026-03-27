import { User, Phone, MapPin, Mail, Building2, CheckCircle2, CreditCard } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Step1Props {
    formData: any;
    setFormData: (data: any) => void;
}

export function Step1BasicInfo({ formData, setFormData }: Step1Props) {
    const { t } = useTranslation();

    const isBusiness = formData.type === 'business';

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

            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 mb-8 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-emerald-800 leading-relaxed">
                    Thông tin liên hệ đã được xác thực qua eKYC. Bạn chỉ có thể xem lại, không thể thay đổi tại đây.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">
                        {isBusiness ? "Tên doanh nghiệp" : "Họ và tên chủ sở hữu"}
                    </label>
                    <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            value={formData.name}
                            readOnly
                            className="w-full pl-12 pr-4 py-4 bg-gray-100/80 border border-gray-200 rounded-2xl outline-none font-bold text-gray-400 cursor-not-allowed shadow-inner transition-colors"
                            placeholder={isBusiness ? t('host.register.placeholderNameBus') : t('host.register.placeholderNameInd')}
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
                            readOnly
                            className="w-full pl-12 pr-4 py-4 bg-gray-100/80 border border-gray-200 rounded-2xl outline-none font-bold text-gray-400 cursor-not-allowed shadow-inner transition-colors"
                            placeholder="09xx xxx xxx"
                        />
                    </div>
                </div>
                <div className="col-span-1 md:col-span-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Email nhận thông báo</label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="email"
                            value={formData.email}
                            readOnly
                            className="w-full pl-12 pr-4 py-4 bg-gray-100/80 border border-gray-200 rounded-2xl outline-none font-bold text-gray-400 cursor-not-allowed shadow-inner transition-colors"
                            placeholder="example@gmail.com"
                        />
                    </div>
                </div>
                <div className="col-span-1 md:col-span-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Địa chỉ thường trú (Theo CCCD)</label>
                    <div className="relative flex items-start">
                        <MapPin className="absolute left-4 top-5 w-5 h-5 text-gray-400" />
                        <textarea
                            rows={2}
                            value={formData.address}
                            readOnly
                            className="w-full pl-12 pr-4 py-4 bg-gray-100/80 border border-gray-200 rounded-2xl outline-none font-bold text-gray-400 cursor-not-allowed shadow-inner transition-colors resize-none leading-relaxed"
                            placeholder={t('host.register.placeholderAddress')}
                        />
                    </div>
                </div>
            </div>

            <div className="mt-10 pt-10 border-t border-dashed border-gray-100">
                <h4 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
                    <div className="w-2 h-6 bg-red-500 rounded-full" />
                    Thông tin thanh toán & Thuế
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">
                            {isBusiness ? "Mã số thuế doanh nghiệp" : "Mã số thuế cá nhân (Nếu có)"}
                        </label>
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 flex items-center justify-center font-black text-lg">#</div>
                            <input
                                type="text"
                                value={formData.taxId}
                                onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                                className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all font-bold text-gray-900"
                                placeholder={isBusiness ? "Nhập MST doanh nghiệp..." : "Nhập MST cá nhân..."}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Số tài khoản nhận tiền</label>
                        <div className="relative">
                            <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={formData.bankAccount}
                                onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
                                className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all font-bold text-gray-900"
                                placeholder="Ví dụ: 0391000..."
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Tên ngân hàng</label>
                        <div className="relative">
                            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={formData.bankName}
                                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                                className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all font-bold text-gray-900"
                                placeholder="Ví dụ: Vietcombank, Techcombank..."
                            />
                        </div>
                    </div>
                </div>
                
                <p className="mt-4 text-[11px] text-gray-500 font-medium leading-relaxed">
                    * Lưu ý: Tên chủ tài khoản phải khớp với tên đã xác thực eKYC (<b>{formData.name}</b>). 
                    Thông tin này dùng để lập hợp đồng và chi trả đối soát doanh thu hàng tháng.
                </p>
            </div>
        </div>
    );
}
