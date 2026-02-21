import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Building2,
    MapPin,
    Users,
    Image as ImageIcon,
    CheckCircle2,
    ArrowRight,
    ArrowLeft,
    Wifi,
    Wind,
    Video,
    Coffee,
    DollarSign,
    Maximize2,
    PartyPopper,
    Clock,
    Calendar,
    ShieldCheck,
    Zap,
    Loader2
} from 'lucide-react';
import { CustomerLayout } from '../../../layouts/CustomerLayout';
import { hostService } from '../services/hostService';

interface RoomSlot {
    id: string;
    name: string;
    startTime: string;
    endTime: string;
    enabled: boolean;
}

interface SpaceFormData {
    facilityName: string;
    roomType: string;
    title: string;
    address: string;
    capacity: number;
    size: number;
    floor: number;
    basePrice: number;
    weekendSurcharge: number; // Percentage
    availabilitySlots: RoomSlot[];
    amenities: string[];
    images: string[];
}

const DEFAULT_SLOTS: RoomSlot[] = [
    { id: '1', name: 'morning', startTime: '07:30', endTime: '11:30', enabled: true },
    { id: '2', name: 'afternoon', startTime: '13:00', endTime: '17:00', enabled: true },
    { id: '3', name: 'evening', startTime: '18:00', endTime: '21:30', enabled: true },
];

export function ListSpacePage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const totalSteps = 5;

    const [formData, setFormData] = useState<SpaceFormData>({
        facilityName: '',
        roomType: '',
        title: '',
        address: '',
        capacity: 0,
        size: 0,
        floor: 1,
        basePrice: 0,
        weekendSurcharge: 10,
        availabilitySlots: DEFAULT_SLOTS,
        amenities: [],
        images: []
    });

    const nextStep = () => {
        if (step < totalSteps) setStep(prev => prev + 1);
        else handleSubmit();
    };

    const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

    const handleUpdate = (field: keyof SpaceFormData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const toggleSlot = (id: string) => {
        setFormData(prev => ({
            ...prev,
            availabilitySlots: prev.availabilitySlots.map(slot =>
                slot.id === id ? { ...slot, enabled: !slot.enabled } : slot
            )
        }));
    };

    const toggleAmenity = (name: string) => {
        setFormData(prev => ({
            ...prev,
            amenities: prev.amenities.includes(name)
                ? prev.amenities.filter(a => a !== name)
                : [...prev.amenities, name]
        }));
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            await hostService.publishSpace(formData);
            setIsSubmitted(true);
        } catch (error) {
            console.error('Failed to submit space', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSubmitted) {
        return (
            <CustomerLayout>
                <div className="min-h-[calc(100vh-80px)] bg-slate-50 flex items-center justify-center p-4">
                    <div className="max-w-xl w-full bg-white rounded-[48px] p-16 text-center shadow-2xl shadow-red-100 animate-in zoom-in duration-700 overflow-hidden relative border border-gray-100">
                        <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-red-500 via-orange-500 to-amber-500" />
                        <div className="w-24 h-24 bg-red-500 rounded-[32px] flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-red-200 rotate-12 transition-transform hover:rotate-0 duration-500">
                            <PartyPopper className="w-12 h-12 text-white" />
                        </div>
                        <h2 className="text-5xl font-black text-gray-900 mb-6 tracking-tight">{t('common.success')}</h2>
                        <p className="text-gray-500 text-xl mb-10 leading-relaxed font-medium">
                            {t('host.listSpace.success.reviewText')} <span className="text-red-500 font-black">{formData.facilityName}</span> {t('host.listSpace.success.isBeingReviewed')}
                        </p>
                        <div className="bg-slate-50 p-8 rounded-[32px] border border-slate-100 flex items-start gap-6 text-left mb-12 shadow-inner">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
                                <ShieldCheck className="w-6 h-6 text-blue-500" />
                            </div>
                            <div>
                                <h4 className="font-black text-gray-900 text-lg mb-1 tracking-tight">{t('host.listSpace.success.qualityCheck')}</h4>
                                <p className="text-sm text-gray-400 font-bold leading-relaxed">{t('host.listSpace.success.qualityDescription')}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate('/rental')}
                            className="w-full bg-gray-900 text-white py-6 rounded-3xl font-black text-lg hover:bg-red-500 transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-3 group"
                        >
                            {t('host.listSpace.success.goToPortal')}
                            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </CustomerLayout>
        );
    }

    return (
        <CustomerLayout>
            <div className="min-h-[calc(100vh-80px)] bg-slate-50 py-16 scroll-smooth">
                <div className="max-w-6xl mx-auto px-4">

                    {/* Progress Header */}
                    <div className="mb-14 text-center animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="inline-flex items-center gap-2 bg-white border border-red-100 text-red-600 px-6 py-2 rounded-full text-xs font-black uppercase tracking-[0.2em] mb-4 shadow-sm">
                            <Zap className="w-4 h-4" /> {t('host.listSpace.onboarding')}
                        </div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">{t('host.listSpace.title')}</h1>
                    </div>

                    <div className="flex gap-12">
                        {/* Nav Steps Sidebar */}
                        <div className="w-64 shrink-0 hidden lg:block sticky top-24 h-fit">
                            <div className="space-y-2 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                                {[
                                    { n: 1, text: t('host.listSpace.steps.basics') },
                                    { n: 2, text: t('host.listSpace.steps.location') },
                                    { n: 3, text: t('host.listSpace.steps.pricing') },
                                    { n: 4, text: t('host.listSpace.steps.amenities') },
                                    { n: 5, text: t('host.listSpace.steps.gallery') },
                                ].map((s) => (
                                    <div
                                        key={s.n}
                                        className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${step === s.n ? 'bg-gray-900 text-white shadow-lg shadow-gray-200' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                                            }`}
                                    >
                                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs border transition-all ${step === s.n ? 'border-red-500 bg-red-500 text-white' : 'border-gray-200 bg-white'
                                            }`}>
                                            {step > s.n ? <CheckCircle2 className="w-4 h-4" /> : s.n}
                                        </div>
                                        <span className="font-bold text-sm tracking-tight">{s.text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Content Container */}
                        <div className="flex-1">
                            <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8 relative overflow-hidden min-h-[500px] flex flex-col transition-all duration-500">
                                {isSubmitting && (
                                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-[100] flex flex-col items-center justify-center gap-6 animate-in fade-in duration-300">
                                        <Loader2 className="w-16 h-16 text-red-500 animate-spin" />
                                        <p className="font-black text-2xl text-gray-900">{t('host.listSpace.publishing')}</p>
                                    </div>
                                )}

                                <div className="flex-1">
                                    {step === 1 && (
                                        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                            <div>
                                                <h2 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">{t('host.listSpace.basics.title')}</h2>
                                                <p className="text-gray-400 text-base font-bold">{t('host.listSpace.basics.description')}</p>
                                            </div>

                                            <div className="grid grid-cols-2 gap-8">
                                                <div className="space-y-4">
                                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">{t('host.listSpace.basics.facilityName')}</label>
                                                    <div className="relative">
                                                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                        <input
                                                            type="text"
                                                            value={formData.facilityName}
                                                            onChange={(e) => handleUpdate('facilityName', e.target.value)}
                                                            placeholder={t('host.listSpace.basics.facilityPlaceholder')}
                                                            className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all font-medium text-gray-900 placeholder:text-gray-400"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-4">
                                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">{t('host.listSpace.basics.spaceType')}</label>
                                                    <select
                                                        value={formData.roomType}
                                                        onChange={(e) => handleUpdate('roomType', e.target.value)}
                                                        className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all font-medium text-gray-900 appearance-none"
                                                    >
                                                        <option value="">{t('host.listSpace.basics.chooseCategory')}</option>
                                                        <option value="Classroom">Classroom</option>
                                                        <option value="Lab">Technology Lab</option>
                                                        <option value="Meeting">Meeting Suite</option>
                                                        <option value="Hall">Event Hall</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">{t('host.listSpace.basics.publicTitle')}</label>
                                                <input
                                                    type="text"
                                                    value={formData.title}
                                                    onChange={(e) => handleUpdate('title', e.target.value)}
                                                    placeholder={t('host.listSpace.basics.publicTitlePlaceholder')}
                                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all text-lg font-bold placeholder:text-gray-400"
                                                />
                                            </div>

                                            <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl flex items-start gap-3">
                                                <Zap className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                                                <p className="text-orange-900 text-sm font-medium leading-relaxed">
                                                    {t('host.listSpace.basics.intermediaryTip')}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {step === 2 && (
                                        <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-700">
                                            <div>
                                                <h2 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">{t('host.listSpace.location.title')}</h2>
                                                <p className="text-gray-400 text-base font-bold">{t('host.listSpace.location.description')}</p>
                                            </div>

                                            <div className="space-y-4">
                                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">{t('host.listSpace.location.streetAddress')}</label>
                                                <div className="relative">
                                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                    <input
                                                        type="text"
                                                        value={formData.address}
                                                        onChange={(e) => handleUpdate('address', e.target.value)}
                                                        placeholder={t('host.listSpace.location.streetAddressPlaceholder')}
                                                        className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all font-medium text-gray-900 placeholder:text-gray-400"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-3 gap-8">
                                                <div className="space-y-4">
                                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">{t('host.listSpace.location.area')}</label>
                                                    <input
                                                        type="number"
                                                        value={formData.size || ''}
                                                        onChange={(e) => handleUpdate('size', parseInt(e.target.value))}
                                                        className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 font-bold text-lg text-center transition-all"
                                                    />
                                                </div>
                                                <div className="space-y-4">
                                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">{t('host.listSpace.location.guests')}</label>
                                                    <input
                                                        type="number"
                                                        value={formData.capacity || ''}
                                                        onChange={(e) => handleUpdate('capacity', parseInt(e.target.value))}
                                                        className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 font-bold text-lg text-center transition-all"
                                                    />
                                                </div>
                                                <div className="space-y-4">
                                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">{t('host.listSpace.location.floor')}</label>
                                                    <input
                                                        type="number"
                                                        value={formData.floor || ''}
                                                        onChange={(e) => handleUpdate('floor', parseInt(e.target.value))}
                                                        className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 font-bold text-lg text-center transition-all"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {step === 3 && (
                                        <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-700">
                                            <div>
                                                <h2 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">{t('host.listSpace.pricing.title')}</h2>
                                                <p className="text-gray-400 text-base font-bold">{t('host.listSpace.pricing.description')}</p>
                                            </div>

                                            <div className="grid grid-cols-2 gap-12">
                                                <div className="space-y-6">
                                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                                        <Clock className="w-5 h-5 text-red-500" /> {t('host.listSpace.pricing.sessionAvailability')}
                                                    </label>
                                                    <div className="grid gap-4">
                                                        {formData.availabilitySlots.map(slot => (
                                                            <button
                                                                key={slot.id}
                                                                onClick={() => toggleSlot(slot.id)}
                                                                className={`group w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-300 ${slot.enabled ? 'border-red-500 bg-red-50 shadow-sm' : 'border-gray-200 text-gray-400 hover:border-red-200 hover:text-gray-600'
                                                                    }`}
                                                            >
                                                                <div className="flex flex-col items-start gap-1">
                                                                    <span className="font-bold text-base">{t(`host.listSpace.pricing.slots.${slot.name}`)}</span>
                                                                    <span className="text-xs font-medium uppercase tracking-wider opacity-70">{slot.startTime} - {slot.endTime}</span>
                                                                </div>
                                                                <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${slot.enabled ? 'bg-red-500 text-white' : 'bg-gray-100 text-transparent'}`}>
                                                                    <CheckCircle2 className="w-4 h-4" />
                                                                </div>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="space-y-10">
                                                    <div className="space-y-6">
                                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">{t('host.listSpace.pricing.hourlyBaseRate')}</label>
                                                        <div className="relative group">
                                                            <input
                                                                type="number"
                                                                value={formData.basePrice || ''}
                                                                onChange={(e) => handleUpdate('basePrice', parseInt(e.target.value))}
                                                                placeholder={t('host.listSpace.pricing.pricePlaceholder')}
                                                                className="w-full p-6 bg-gray-900 text-white rounded-[24px] border-none focus:ring-4 focus:ring-gray-200 transition-all font-black text-3xl shadow-xl text-center placeholder:text-gray-600"
                                                            />
                                                            <div className="absolute top-1/2 -translate-y-1/2 left-8 text-gray-600 font-black">VNĐ</div>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-6 bg-slate-50 p-8 rounded-[40px] border border-slate-100">
                                                        <div className="flex justify-between items-center mb-4">
                                                            <label className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                                                <Calendar className="w-5 h-5 text-amber-500" /> {t('host.listSpace.pricing.weekendMarkup')}
                                                            </label>
                                                            <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-lg text-sm font-black">+{formData.weekendSurcharge}%</span>
                                                        </div>
                                                        <input
                                                            type="range"
                                                            min="0"
                                                            max="100"
                                                            step="5"
                                                            value={formData.weekendSurcharge}
                                                            onChange={(e) => handleUpdate('weekendSurcharge', parseInt(e.target.value))}
                                                            className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-500 mb-4 shadow-inner"
                                                        />
                                                        <p className="text-xs text-gray-400 font-bold text-center leading-relaxed">
                                                            {t('host.listSpace.pricing.markupDescription')}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {step === 4 && (
                                        <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-700">
                                            <div>
                                                <h2 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">{t('host.listSpace.amenities.title')}</h2>
                                                <p className="text-gray-400 text-base font-bold">{t('host.listSpace.amenities.description')}</p>
                                            </div>

                                            <div className="grid grid-cols-3 gap-6">
                                                {[
                                                    { name: 'Dual Projectors', key: 'projectors', icon: Video },
                                                    { name: 'Whiteboard', key: 'whiteboard', icon: Building2 },
                                                    { name: 'Sound System', key: 'sound', icon: Maximize2 },
                                                    { name: 'Fiber Wifi 6', key: 'wifi', icon: Wifi },
                                                    { name: 'Air Conditioning', key: 'ac', icon: Wind },
                                                    { name: 'Lounge Area', key: 'lounge', icon: Coffee },
                                                ].map(item => {
                                                    const Icon = item.icon;
                                                    const isSelected = formData.amenities.includes(item.name);
                                                    return (
                                                        <button
                                                            key={item.name}
                                                            onClick={() => toggleAmenity(item.name)}
                                                            className={`p-4 flex flex-col items-center gap-3 rounded-2xl border transition-all duration-300 group ${isSelected ? 'border-red-500 bg-red-50 shadow-sm' : 'border-gray-200 hover:border-red-200 hover:bg-gray-50'
                                                                }`}
                                                        >
                                                            <div className={`p-3 rounded-xl transition-all ${isSelected ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-400 group-hover:text-red-500 group-hover:bg-red-100'}`}>
                                                                <Icon className="w-6 h-6" />
                                                            </div>
                                                            <span className={`text-sm font-bold text-center ${isSelected ? 'text-red-900' : 'text-gray-500 group-hover:text-gray-900'}`}>
                                                                {t(`host.listSpace.amenities.items.${item.key}`)}
                                                            </span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {step === 5 && (
                                        <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-700">
                                            <div>
                                                <h2 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">{t('host.listSpace.gallery.title')}</h2>
                                                <p className="text-gray-400 text-base font-bold">{t('host.listSpace.gallery.description')}</p>
                                            </div>

                                            <div className="grid grid-cols-2 gap-10 min-h-[400px]">
                                                <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:bg-gray-50 hover:border-red-400 transition-all group flex flex-col items-center justify-center cursor-pointer">
                                                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-8 shadow-xl group-hover:scale-110 transition-transform text-red-100 group-hover:text-red-500">
                                                        <ImageIcon className="w-10 h-10" />
                                                    </div>
                                                    <p className="text-gray-900 font-bold text-lg mb-1">{t('host.listSpace.gallery.dragDrop')}</p>
                                                    <p className="text-gray-500 text-sm mb-6 max-w-[200px]">{t('host.listSpace.gallery.supportedTypes')}</p>
                                                    <button
                                                        onClick={() => handleUpdate('images', [...formData.images, `https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80`])}
                                                        className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-red-600 transition-all shadow-lg active:scale-95 text-sm"
                                                    >
                                                        {t('common.browseFiles')}
                                                    </button>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-200">
                                                    {formData.images.map((img, i) => (
                                                        <div key={i} className="aspect-square relative rounded-xl overflow-hidden group shadow-md">
                                                            <img src={img} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" alt="Space" />
                                                            <button
                                                                onClick={() => handleUpdate('images', formData.images.filter((_, idx) => idx !== i))}
                                                                className="absolute top-4 right-4 w-10 h-10 bg-red-500 text-white rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all font-black shadow-xl"
                                                            >×</button>
                                                        </div>
                                                    ))}
                                                    {formData.images.length === 0 && (
                                                        <div className="col-span-2 flex flex-col items-center justify-center opacity-20">
                                                            <ImageIcon className="w-24 h-24 mb-4" />
                                                            <p className="font-black text-xl italic tracking-tighter uppercase">{t('host.listSpace.gallery.spacePreview')}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                </div>

                                {/* Navigation Controls */}
                                <div className="mt-10 pt-8 border-t border-gray-100 flex items-center justify-between">
                                    <button
                                        onClick={step === 1 ? () => navigate('/rental') : prevStep}
                                        className="flex items-center gap-2 px-6 py-3 text-gray-500 font-bold hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all group text-sm"
                                    >
                                        <ArrowLeft className="w-6 h-6 group-hover:-translate-x-2 transition-transform" />
                                        {step === 1 ? t('host.listSpace.cancelListing') : t('common.goBack')}
                                    </button>

                                    <div className="flex items-center gap-4">
                                        {step < totalSteps && (
                                            <div className="flex flex-col items-end mr-6">
                                                <span className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em] mb-1">{t('host.listSpace.onboarding')}</span>
                                                <span className="text-lg font-black text-gray-900">{step} / {totalSteps}</span>
                                            </div>
                                        )}
                                        <button
                                            onClick={nextStep}
                                            disabled={step === 1 && (!formData.facilityName || !formData.roomType)}
                                            className="bg-red-500 text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-red-600 transition-all shadow-lg shadow-red-100 flex items-center gap-2 active:scale-95 disabled:grayscale disabled:opacity-40"
                                        >
                                            {step === totalSteps ? t('common.publish') : t('common.saveAndContinue')}
                                            <ArrowRight className="w-6 h-6" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </CustomerLayout>
    );
}
