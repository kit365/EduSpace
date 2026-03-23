import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import {
    Building2,
    MapPin,
    Image as ImageIcon,
    CheckCircle2,
    ArrowRight,
    ArrowLeft,
    Wifi,
    Wind,
    Video,
    Coffee,
    Maximize2,
    PartyPopper,
    Clock,
    Calendar,
    ShieldCheck,
    Zap,
    Loader2,
    CigaretteOff,
    Car,
    Brush
} from 'lucide-react';
import { hostService } from '../services/hostService';
import { showToast } from '@/utils/toast';
import { getApiErrorMessage } from '@/utils/apiError';
import { useBranch } from '../context/BranchContext';
import type { HostBranch } from '../services/branchService';
import { roomApiService } from '@/client/features/room/services/roomApiService';
import { propertyApiService } from '@/client/features/room/services/propertyApiService';
import type { AmenityDto, PropertyDto, RoomCategoryDto, RoomDto } from '@/client/features/room/types';

const ICON_MAP: Record<string, any> = {
    wifi: Wifi,
    presentation: Video,
    board: Building2,
    ac: Wind,
    water: Coffee,
    support: ShieldCheck,
    projectors: Video,
    whiteboard: Building2,
    sound: Maximize2,
    lounge: Coffee,
    zap: Zap,
    clock: Clock,
    calendar: Calendar,
    shield: ShieldCheck,
    smoking: CigaretteOff,
    'support-247': ShieldCheck,
    parking: Car,
    cleaning: Brush,
};

interface SpaceFormData {
    branchId: number | null;
    /** Tên chi nhánh — Property.name */
    branchName: string;
    /** Tên phòng — RoomEntity.name */
    roomName: string;
    roomType: string;
    title: string;
    address: string;
    roomNumber: string;
    capacity: number;
    size: number;
    floor: number;
    basePrice: number;
    pricePerDay: number;
    weekendSurcharge: number; // Percentage
    is24_7: boolean;
    openTime: string;
    closeTime: string;
    amenities: string[];
    images: string[];
}

function addressFromBranchId(branchId: number | null, list: HostBranch[]): string {
    if (branchId == null || !list.length) return '';
    const b = list.find((x) => x.id === branchId);
    return (b?.address && String(b.address).trim()) || '';
}

function getEffectiveAddress(data: SpaceFormData, branches: HostBranch[]): string {
    const fromBranch = addressFromBranchId(data.branchId, branches);
    return (fromBranch || data.address || '').trim();
}

function validateSpaceStep(step: number, data: SpaceFormData, branches: HostBranch[], t: TFunction): Record<string, string> {
    const errors: Record<string, string> = {};
    const tr = (k: string) => t(`host.listSpace.validation.${k}`);

    if (step === 1) {
        if (data.branchId == null) errors.branchId = tr('selectBranch');
        if (!data.roomName?.trim()) errors.roomName = tr('roomNameRequired');
        if (!data.roomType?.trim()) errors.roomType = tr('roomTypeRequired');
        if (!data.title?.trim()) errors.title = tr('titleRequired');
        return errors;
    }
    if (step === 2) {
        const addr = getEffectiveAddress(data, branches);
        if (!addr) errors.address = tr('addressRequired');
        if (!data.roomNumber?.trim()) errors.roomNumber = tr('roomNumberRequired');
        if (!Number.isFinite(data.size) || data.size <= 0) errors.size = tr('sizeRequired');
        if (!Number.isFinite(data.capacity) || data.capacity <= 0) errors.capacity = tr('capacityRequired');
        if (!Number.isFinite(data.floor) || data.floor < 0) errors.floor = tr('floorRequired');
        return errors;
    }
    if (step === 3) {
        if (!data.is24_7) {
            if (!data.openTime?.trim()) errors.openTime = tr('openTimeRequired');
            if (!data.closeTime?.trim()) errors.closeTime = tr('closeTimeRequired');
        }
        if (!Number.isFinite(data.basePrice) || data.basePrice <= 0) errors.basePrice = tr('basePriceRequired');
        if (!Number.isFinite(data.pricePerDay) || data.pricePerDay <= 0) errors.pricePerDay = tr('pricePerDayRequired');
        return errors;
    }
    if (step === 4) {
        // Tiện nghi là tuỳ chọn
        return errors;
    }
    if (step === 5) {
        if (!data.images?.length) errors.images = tr('imagesRequired');
        return errors;
    }
    return errors;
}

function validateAllSteps(data: SpaceFormData, branches: HostBranch[], t: TFunction) {
    for (let s = 1; s <= 5; s++) {
        const errs = validateSpaceStep(s, data, branches, t);
        if (Object.keys(errs).length > 0) {
            return { firstStep: s, errors: errs };
        }
    }
    return null;
}

function parseDescriptionForForm(desc: string | null): { title: string; amenities: string[] } {
    const lines = (desc ?? '')
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean);
    const title = lines[0] ?? '';
    const amenitiesLine = lines.find((l) => /^Tiện ích:/i.test(l));
    const amenities = amenitiesLine
        ? amenitiesLine
              .replace(/^Tiện ích:\s*/i, '')
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
        : [];
    return { title, amenities };
}

function formatTimeHm(t?: string | null): string {
    if (!t) return '08:00';
    const m = /^(\d{1,2}):(\d{2})/.exec(String(t));
    if (m) return `${m[1].padStart(2, '0')}:${m[2]}`;
    return '08:00';
}

/** Lấy cặp giờ hiển thị form từ lịch 7 ngày (ngày mở đầu tiên trong tuần). */
function pickFirstOpenScheduleTimes(schedules?: RoomDto['schedules']): { open: string; close: string } {
    if (!schedules?.length) return { open: '08:00', close: '22:00' };
    const sorted = [...schedules].sort((a, b) => a.dayOfWeek - b.dayOfWeek);
    const row = sorted.find((s) => s.isOpen);
    if (!row) return { open: '08:00', close: '22:00' };
    return {
        open: formatTimeHm(row.openTime),
        close: formatTimeHm(row.closeTime),
    };
}

function mapRoomToForm(room: RoomDto, property: PropertyDto): SpaceFormData {
    const meta = parseDescriptionForForm(room.description);
    const floorNum = room.floorNumber != null ? parseInt(String(room.floorNumber), 10) : 1;
    const imgs = (room.images ?? '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    const cap = room.capacity ?? 0;
    const ar = room.area != null ? Number(room.area) : 0;
    const schedTimes = pickFirstOpenScheduleTimes(room.schedules);
    return {
        branchId: room.propertyId,
        branchName: property.name?.trim() ?? '',
        roomName: room.name,
        roomType: room.category?.slug || normalizeRoomType(room.roomType),
        title: meta.title || room.name,
        address: property.addressDetail?.trim() ?? '',
        roomNumber: room.roomNumber?.trim() ?? '',
        capacity: cap,
        size: Number.isFinite(ar) && ar > 0 ? ar : 0,
        floor: Number.isFinite(floorNum) && floorNum >= 0 ? floorNum : 1,
        basePrice: room.pricePerHour != null ? Math.round(Number(room.pricePerHour)) : 0,
        pricePerDay: room.pricePerDay != null ? Math.round(Number(room.pricePerDay)) : 0,
        weekendSurcharge: 10,
        is24_7: Boolean(room.is24_7),
        openTime: schedTimes.open,
        closeTime: schedTimes.close,
        amenities: meta.amenities,
        images: imgs.length ? imgs : [],
    };
}

function normalizeRoomType(value: string): string {
    const s = (value || '').trim();
    if (['MEETING_ROOM', 'CLASSROOM', 'EVENT_SPACE', 'STUDIO', 'COWORKING'].includes(s)) {
        return s;
    }
    const n = s.toLowerCase();
    if (n.includes('class') || n.includes('lớp') || n.includes('phòng học') || n.includes('đào tạo')) return 'CLASSROOM';
    if (n.includes('event') || n.includes('hall') || n.includes('sự kiện')) return 'EVENT_SPACE';
    if (n.includes('studio') || n.includes('lab') || n.includes('sáng tạo') || n.includes('máy tính')) return 'STUDIO';
    if (n.includes('cowork') || n.includes('chung') || n.includes('private office') || n.includes('văn phòng'))
        return 'COWORKING';
    return 'MEETING_ROOM';
}

export interface SpacePublishFlowProps {
    isEdit: boolean;
    editId?: string;
    onCancel: () => void;
    onSuccess: () => void;
}

export function SpacePublishFlow({ isEdit, editId, onCancel, onSuccess }: SpacePublishFlowProps) {
    const { t } = useTranslation();
    const { selectedBranch, branches } = useBranch();
    const [step, setStep] = useState(1);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [roomSnapshot, setRoomSnapshot] = useState<RoomDto | null>(null);
    const [loadingEdit, setLoadingEdit] = useState(false);
    const [editLoadError, setEditLoadError] = useState<string | null>(null);
    const [editSubmitMode, setEditSubmitMode] = useState<'pending' | 'direct'>('pending');
    const [categories, setCategories] = useState<RoomCategoryDto[]>([]);
    const [amenities, setAmenities] = useState<AmenityDto[]>([]);
    const [loadingResources, setLoadingResources] = useState(false);
    const [customAmenity, setCustomAmenity] = useState('');
    const [customPolicy, setCustomPolicy] = useState('');
    const totalSteps = 5;

    const stepNavLabel = (n: number) => {
        const keys = ['basics', 'location', 'pricing', 'amenities', 'gallery'] as const;
        return t(`host.listSpace.steps.${keys[n - 1]}`);
    };

    const fieldRing = (key: string) => (fieldErrors[key] ? 'border-red-500 ring-2 ring-red-100' : '');

    const [formData, setFormData] = useState<SpaceFormData>(() => ({
        branchId: selectedBranch ? selectedBranch.id : null,
        branchName: selectedBranch?.name?.trim() ?? '',
        roomName: '',
        roomType: '',
        title: '',
        address: selectedBranch?.address?.trim() ?? '',
        roomNumber: '',
        capacity: 0,
        size: 0,
        floor: 1,
        basePrice: 0,
        pricePerDay: 0,
        weekendSurcharge: 10,
        is24_7: false,
        openTime: '08:00',
        closeTime: '22:00',
        amenities: [],
        images: []
    }));

    useEffect(() => {
        const loadResources = async () => {
            setLoadingResources(true);
            try {
                const [cats, amns] = await Promise.all([
                    roomApiService.getAllCategories(),
                    roomApiService.getAllAmenities()
                ]);
                setCategories(cats);
                setAmenities(amns);
            } catch (error) {
                console.error('Failed to load room resources', error);
            } finally {
                setLoadingResources(false);
            }
        };
        void loadResources();
    }, []);

    useEffect(() => {
        if (!isEdit || !editId) {
            if (selectedBranch) {
                setFormData((prev) => ({
                    ...prev,
                    branchId: selectedBranch.id,
                    address: selectedBranch.address?.trim() || '',
                    branchName: selectedBranch.name?.trim() || '',
                }));
            }
            return;
        }
        let cancelled = false;
        setLoadingEdit(true);
        setEditLoadError(null);
        void (async () => {
            try {
                const room = await roomApiService.getByRef(editId);
                const property = await propertyApiService.getById(room.propertyId);
                if (cancelled) return;
                setRoomSnapshot(room);
                setFormData(mapRoomToForm(room, property));
                if (room.approvalStatus === 'PENDING') {
                    setEditSubmitMode('direct');
                } else {
                    setEditSubmitMode('pending');
                }
            } catch (e) {
                if (!cancelled) {
                    setEditLoadError(getApiErrorMessage(e, 'Không tải được thông tin phòng.'));
                }
            } finally {
                if (!cancelled) setLoadingEdit(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [editId, isEdit, selectedBranch]);

    /** Khi danh sách chi nhánh load sau — đồng bộ địa chỉ & tên chi nhánh (Property.name). */
    useEffect(() => {
        if (formData.branchId == null || branches.length === 0) return;
        const b = branches.find((x) => x.id === formData.branchId);
        if (!b) return;
        const addr = addressFromBranchId(formData.branchId, branches);
        const bn = b.name?.trim() || '';
        setFormData((prev) => ({
            ...prev,
            address: addr || prev.address,
            branchName: bn || prev.branchName,
        }));
    }, [branches, formData.branchId]);

    const clearFieldError = (key: string) => {
        setFieldErrors((prev) => {
            if (!prev[key]) return prev;
            const next = { ...prev };
            delete next[key];
            return next;
        });
    };

    const goToStep = (n: number) => {
        setStep(n);
        setFieldErrors({});
    };

    const nextStep = () => {
        if (isSubmitting) return;

        if (step < totalSteps) {
            const errs = validateSpaceStep(step, formData, branches, t);
            if (Object.keys(errs).length > 0) {
                setFieldErrors(errs);
                showToast.error(t('host.listSpace.validation.fixCurrentStep'));
                return;
            }
            setFieldErrors({});
            setStep((prev) => prev + 1);
            return;
        }

        const failed = validateAllSteps(formData, branches, t);
        if (failed) {
            setStep(failed.firstStep);
            setFieldErrors(failed.errors);
            showToast.error(
                t('host.listSpace.validation.fixBeforePublish', { step: stepNavLabel(failed.firstStep) })
            );
            return;
        }

        setFieldErrors({});
        void handleSubmit();
    };

    const prevStep = () => {
        setFieldErrors({});
        setStep((prev) => Math.max(prev - 1, 1));
    };

    const handleUpdate = (field: keyof SpaceFormData, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        clearFieldError(field);
    };

    const handleBranchSelect = (raw: string) => {
        if (raw === '') {
            setFormData((prev) => ({ ...prev, branchId: null, address: '', branchName: '' }));
            setFieldErrors((prev) => {
                const next = { ...prev };
                delete next.branchId;
                delete next.address;
                return next;
            });
            return;
        }
        const id = Number(raw);
        const b = branches.find((x) => x.id === id);
        const addr = addressFromBranchId(id, branches);
        setFormData((prev) => ({
            ...prev,
            branchId: id,
            address: addr,
            branchName: b?.name?.trim() || '',
        }));
        clearFieldError('branchId');
        clearFieldError('address');
    };

    const resolvedBranchAddress = addressFromBranchId(formData.branchId, branches);
    const showBranchNoAddressHint = Boolean(formData.branchId) && !resolvedBranchAddress && !formData.address.trim();

    const toggleAmenity = (name: string) => {
        setFormData((prev) => ({
            ...prev,
            amenities: prev.amenities.includes(name)
                ? prev.amenities.filter((a) => a !== name)
                : [...prev.amenities, name],
        }));
    };

    const toggleIs247 = () => {
        const next = !formData.is24_7;
        handleUpdate('is24_7', next);
        if (next) {
            setFieldErrors((prev) => {
                const out = { ...prev };
                delete out.openTime;
                delete out.closeTime;
                return out;
            });
        }
    };

    const addCustomItem = (value: string, setter: (v: string) => void) => {
        const trimmed = value.trim();
        if (!trimmed) return;
        if (!formData.amenities.includes(trimmed)) {
            handleUpdate('amenities', [...formData.amenities, trimmed]);
        }
        setter('');
    };

    const removeCustomItem = (name: string) => {
        handleUpdate('amenities', formData.amenities.filter(a => a !== name));
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            if (isEdit && editId) {
                if (!roomSnapshot) {
                    showToast.error('Thiếu dữ liệu phòng. Tải lại trang.');
                    return;
                }
                if (editSubmitMode === 'direct') {
                    await hostService.updateRoomBeforeApproval(Number(editId), formData);
                } else {
                    await hostService.submitRoomEdit(Number(editId), formData);
                }
            } else {
                await hostService.publishSpace(formData);
            }
            setIsSubmitted(true);
        } catch (error) {
            console.error('Failed to submit space', error);
            showToast.error(getApiErrorMessage(error, 'Không thể đăng phòng. Thử lại sau.'));
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isEdit && loadingEdit) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center bg-slate-50 p-8">
                <Loader2 className="h-12 w-12 animate-spin text-red-500" />
            </div>
        );
    }

    if (isEdit && editLoadError) {
        return (
            <div className="mx-auto max-w-lg p-8 text-center">
                <p className="mb-6 font-bold text-red-600">{editLoadError}</p>
                <button
                    type="button"
                    onClick={onCancel}
                    className="rounded-xl bg-gray-900 px-6 py-3 font-bold text-white hover:bg-red-500"
                >
                    Quay lại
                </button>
            </div>
        );
    }

    if (isSubmitted) {
        const editPendingMessage =
            isEdit && editSubmitMode === 'pending'
                ? 'Đã gửi chỉnh sửa. Admin duyệt xong thì thông tin mới được áp dụng; nếu từ chối, phòng giữ nguyên như hiện tại.'
                : null;
        const editDirectMessage =
            isEdit && editSubmitMode === 'direct'
                ? 'Đã cập nhật bản đăng đang chờ duyệt lần đầu — admin vẫn duyệt trước khi hiển thị khách.'
                : null;
        return (
            <div className="min-h-[60vh] bg-slate-50 flex items-center justify-center p-4">
                <div className="max-w-xl w-full bg-white rounded-[48px] p-12 md:p-16 text-center shadow-2xl shadow-red-100 animate-in zoom-in duration-700 overflow-hidden relative border border-gray-100">
                    <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-red-500 via-orange-500 to-amber-500" />
                    <div className="w-24 h-24 bg-red-500 rounded-[32px] flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-red-200 rotate-12 transition-transform hover:rotate-0 duration-500">
                        <PartyPopper className="w-12 h-12 text-white" />
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight">{t('common.success')}</h2>
                    <p className="text-gray-500 text-lg md:text-xl mb-10 leading-relaxed font-medium">
                        {editPendingMessage || editDirectMessage ? (
                            <>
                                <span className="text-red-500 font-black">{formData.roomName}</span>
                                <br />
                                <span className="text-gray-600">{editPendingMessage ?? editDirectMessage}</span>
                            </>
                        ) : (
                            <>
                                {t('host.listSpace.success.reviewText')}{' '}
                                <span className="text-red-500 font-black">{formData.roomName}</span>{' '}
                                {t('host.listSpace.success.isBeingReviewed')}
                            </>
                        )}
                    </p>
                    <p className="text-sm text-amber-800 bg-amber-50 border border-amber-100 rounded-xl p-4 mb-8 font-bold">
                        {editPendingMessage || editDirectMessage
                            ? 'Bạn có thể theo dõi trạng thái tại trang Phòng của tôi hoặc mục duyệt trong trang quản trị.'
                            : 'Sau khi admin duyệt, phòng mới hiển thị và có thể đặt trên nền tảng.'}
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
                        type="button"
                        onClick={onSuccess}
                        className="w-full bg-gray-900 text-white py-6 rounded-3xl font-black text-lg hover:bg-red-500 transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-3 group"
                    >
                        {t('host.listSpace.success.goToPortal')}
                        <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-120px)] bg-slate-50 py-4 md:py-6 scroll-smooth">
                <div className="mx-auto max-w-[1360px] px-3 md:px-5">

                    {/* Progress Header */}
                    <div className="mb-8 text-center animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="inline-flex items-center gap-2 bg-white border border-red-100 text-red-600 px-6 py-2 rounded-full text-xs font-black uppercase tracking-[0.2em] mb-4 shadow-sm">
                            <Zap className="w-4 h-4" /> {isEdit ? "CẬP NHẬT TIN ĐĂNG" : t('host.listSpace.onboarding')}
                        </div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                            {isEdit ? `Chỉnh sửa: ${formData.roomName}` : t('host.listSpace.title')}
                        </h1>
                        {isEdit && roomSnapshot?.pendingEditStatus === 'PENDING' ? (
                            <p className="mx-auto mt-4 max-w-2xl rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-900">
                                Bạn đã có bản chỉnh sửa đang chờ admin duyệt. Gửi lại sẽ <strong>thay thế</strong> bản chờ
                                duyệt; dữ liệu hiển thị cho khách vẫn là bản đã duyệt trước đó.
                            </p>
                        ) : null}
                    </div>

                    <div className="flex gap-6 xl:gap-8">
                        {/* Nav Steps Sidebar */}
                        <div className="hidden h-fit w-56 shrink-0 sticky top-24 lg:block">
                            <div className="space-y-2 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                                {[
                                    { n: 1, text: t('host.listSpace.steps.basics') },
                                    { n: 2, text: t('host.listSpace.steps.location') },
                                    { n: 3, text: t('host.listSpace.steps.pricing') },
                                    { n: 4, text: t('host.listSpace.steps.amenities') },
                                    { n: 5, text: t('host.listSpace.steps.gallery') },
                                ].map((s) => (
                                    <button
                                        key={s.n}
                                        type="button"
                                        onClick={() => goToStep(s.n)}
                                        aria-current={step === s.n ? 'step' : undefined}
                                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-300 text-left cursor-pointer ${step === s.n ? 'bg-gray-900 text-white shadow-lg shadow-gray-200' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                                            }`}
                                    >
                                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs border transition-all shrink-0 ${step === s.n ? 'border-red-500 bg-red-500 text-white' : 'border-gray-200 bg-white'
                                            }`}>
                                            {step > s.n ? <CheckCircle2 className="w-4 h-4" /> : s.n}
                                        </div>
                                        <span className="font-bold text-sm tracking-tight">{s.text}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Content Container */}
                        <div className="flex-1">
                            <div className="relative flex min-h-[420px] flex-col overflow-hidden rounded-3xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-500 md:p-6">
                                {isSubmitting && (
                                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-[100] flex flex-col items-center justify-center gap-6 animate-in fade-in duration-300">
                                        <Loader2 className="w-16 h-16 text-red-500 animate-spin" />
                                        <p className="font-black text-2xl text-gray-900">{t('host.listSpace.publishing')}</p>
                                    </div>
                                )}

                                <div className="flex-1">
                                    {step === 1 && (
                                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                            <div>
                                                <h2 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">{t('host.listSpace.basics.title')}</h2>
                                                <p className="text-gray-400 text-base font-bold">{t('host.listSpace.basics.description')}</p>
                                            </div>

                                            <div className="grid grid-cols-2 gap-8">
                                                <div className="space-y-4 col-span-2 md:col-span-1">
                                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Thuộc Chi Nhánh</label>
                                                    <div className="relative">
                                                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                        <select
                                                            value={formData.branchId ?? ''}
                                                            onChange={(e) => handleBranchSelect(e.target.value)}
                                                            className={`w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl border focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all font-medium text-gray-900 appearance-none ${fieldRing('branchId') || 'border-gray-200'}`}
                                                        >
                                                            <option value="" disabled>Chọn chi nhánh...</option>
                                                            {branches.map(b => (
                                                                <option key={b.id} value={b.id}>{b.name}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    {fieldErrors.branchId ? (
                                                        <p className="text-xs font-bold text-red-600 ml-1">{fieldErrors.branchId}</p>
                                                    ) : null}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-8">
                                                <div className="space-y-4">
                                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">{t('host.listSpace.basics.roomName')}</label>
                                                    <div className="relative">
                                                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                        <input
                                                            type="text"
                                                            value={formData.roomName}
                                                            onChange={(e) => handleUpdate('roomName', e.target.value)}
                                                            placeholder={t('host.listSpace.basics.roomNamePlaceholder')}
                                                            className={`w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl border focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all font-medium text-gray-900 placeholder:text-gray-400 ${fieldRing('roomName') || 'border-gray-200'}`}
                                                        />
                                                    </div>
                                                    {fieldErrors.roomName ? (
                                                        <p className="text-xs font-bold text-red-600 ml-1">{fieldErrors.roomName}</p>
                                                    ) : null}
                                                </div>
                                                <div className="space-y-4">
                                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">{t('host.listSpace.basics.spaceType')}</label>
                                                    <select
                                                        value={formData.roomType}
                                                        onChange={(e) => handleUpdate('roomType', e.target.value)}
                                                        className={`w-full px-4 py-3 bg-gray-50 rounded-xl border focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all font-medium text-gray-900 appearance-none ${fieldRing('roomType') || 'border-gray-200'}`}
                                                    >
                                                        <option value="" disabled>{t('host.listSpace.basics.chooseCategory')}</option>
                                                        {categories.map(cat => (
                                                            <option key={cat.slug} value={cat.slug}>{cat.name}</option>
                                                        ))}
                                                    </select>
                                                    {fieldErrors.roomType ? (
                                                        <p className="text-xs font-bold text-red-600 ml-1">{fieldErrors.roomType}</p>
                                                    ) : null}
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">{t('host.listSpace.basics.publicTitle')}</label>
                                                <input
                                                    type="text"
                                                    value={formData.title}
                                                    onChange={(e) => handleUpdate('title', e.target.value)}
                                                    placeholder={t('host.listSpace.basics.publicTitlePlaceholder')}
                                                    className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all text-lg font-bold placeholder:text-gray-400 ${fieldRing('title') || 'border-gray-200'}`}
                                                />
                                                {fieldErrors.title ? (
                                                    <p className="text-xs font-bold text-red-600 ml-1">{fieldErrors.title}</p>
                                                ) : null}
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
                                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-700">
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
                                                        readOnly
                                                        value={formData.address}
                                                        placeholder={t('host.listSpace.location.streetAddressPlaceholder')}
                                                        className={`w-full pl-12 pr-4 py-3 rounded-xl border bg-gray-100 cursor-not-allowed text-gray-700 font-medium placeholder:text-gray-400 ${fieldRing('address') || 'border-gray-200'}`}
                                                    />
                                                </div>
                                                {fieldErrors.address ? (
                                                    <p className="text-xs font-bold text-red-600 ml-1">{fieldErrors.address}</p>
                                                ) : null}
                                                <p className="text-xs text-gray-500 font-medium leading-relaxed">
                                                    {t('host.listSpace.location.addressSyncedFromBranch')}
                                                </p>
                                                {showBranchNoAddressHint ? (
                                                    <p className="text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 font-medium">
                                                        {t('host.listSpace.location.branchHasNoAddress')}
                                                    </p>
                                                ) : null}
                                            </div>

                                            <div className="space-y-4">
                                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">{t('host.listSpace.location.roomNumber')}</label>
                                                <input
                                                    type="text"
                                                    value={formData.roomNumber}
                                                    onChange={(e) => handleUpdate('roomNumber', e.target.value)}
                                                    placeholder={t('host.listSpace.location.roomNumberPlaceholder')}
                                                    className={`w-full px-4 py-3 bg-gray-50 rounded-xl border focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all font-medium text-gray-900 placeholder:text-gray-400 ${fieldRing('roomNumber') || 'border-gray-200'}`}
                                                />
                                                {fieldErrors.roomNumber ? (
                                                    <p className="text-xs font-bold text-red-600 ml-1">{fieldErrors.roomNumber}</p>
                                                ) : null}
                                            </div>

                                            <div className="grid grid-cols-3 gap-8">
                                                <div className="space-y-4">
                                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">{t('host.listSpace.location.area')}</label>
                                                    <input
                                                        type="number"
                                                        value={Number.isFinite(formData.size) ? formData.size : ''}
                                                        onChange={(e) => {
                                                            const raw = e.target.value;
                                                            if (raw === '') {
                                                                handleUpdate('size', Number.NaN);
                                                                return;
                                                            }
                                                            const v = parseInt(raw, 10);
                                                            handleUpdate('size', Number.isNaN(v) ? Number.NaN : v);
                                                        }}
                                                        className={`w-full px-4 py-3 bg-gray-50 rounded-xl border focus:border-red-500 focus:ring-2 focus:ring-red-200 font-bold text-lg text-center transition-all ${fieldRing('size') || 'border-gray-200'}`}
                                                    />
                                                    {fieldErrors.size ? (
                                                        <p className="text-xs font-bold text-red-600 ml-1">{fieldErrors.size}</p>
                                                    ) : null}
                                                </div>
                                                <div className="space-y-4">
                                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">{t('host.listSpace.location.guests')}</label>
                                                    <input
                                                        type="number"
                                                        value={Number.isFinite(formData.capacity) ? formData.capacity : ''}
                                                        onChange={(e) => {
                                                            const raw = e.target.value;
                                                            if (raw === '') {
                                                                handleUpdate('capacity', Number.NaN);
                                                                return;
                                                            }
                                                            const v = parseInt(raw, 10);
                                                            handleUpdate('capacity', Number.isNaN(v) ? Number.NaN : v);
                                                        }}
                                                        className={`w-full px-4 py-3 bg-gray-50 rounded-xl border focus:border-red-500 focus:ring-2 focus:ring-red-200 font-bold text-lg text-center transition-all ${fieldRing('capacity') || 'border-gray-200'}`}
                                                    />
                                                    {fieldErrors.capacity ? (
                                                        <p className="text-xs font-bold text-red-600 ml-1">{fieldErrors.capacity}</p>
                                                    ) : null}
                                                </div>
                                                <div className="space-y-4">
                                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">{t('host.listSpace.location.floor')}</label>
                                                    <input
                                                        type="number"
                                                        value={Number.isFinite(formData.floor) ? formData.floor : ''}
                                                        onChange={(e) => {
                                                            const raw = e.target.value;
                                                            if (raw === '') {
                                                                handleUpdate('floor', Number.NaN);
                                                                return;
                                                            }
                                                            const v = parseInt(raw, 10);
                                                            handleUpdate('floor', Number.isNaN(v) ? Number.NaN : v);
                                                        }}
                                                        className={`w-full px-4 py-3 bg-gray-50 rounded-xl border focus:border-red-500 focus:ring-2 focus:ring-red-200 font-bold text-lg text-center transition-all ${fieldRing('floor') || 'border-gray-200'}`}
                                                    />
                                                    {fieldErrors.floor ? (
                                                        <p className="text-xs font-bold text-red-600 ml-1">{fieldErrors.floor}</p>
                                                    ) : null}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {step === 3 && (
                                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-700">
                                            <div>
                                                <h2 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">{t('host.listSpace.pricing.title')}</h2>
                                                <p className="text-gray-400 text-base font-bold">{t('host.listSpace.pricing.description')}</p>
                                            </div>

                                            <div className="grid grid-cols-2 gap-6">
                                                <div className="space-y-6">
                                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                                        <Clock className="w-5 h-5 text-red-500" /> {t('host.listSpace.pricing.sessionAvailability')}
                                                    </label>
                                                    <div className="p-5 rounded-2xl border border-gray-200 bg-gray-50/80 space-y-6">
                                                        <label className="flex items-center justify-between gap-4 cursor-pointer group">
                                                            <span className="text-sm font-bold text-gray-800">{t('host.listSpace.pricing.open24Hours')}</span>
                                                            <button
                                                                type="button"
                                                                role="switch"
                                                                aria-checked={formData.is24_7}
                                                                onClick={toggleIs247}
                                                                className={`relative w-14 h-8 rounded-full transition-colors shrink-0 ${formData.is24_7 ? 'bg-red-500' : 'bg-gray-300'}`}
                                                            >
                                                                <span
                                                                    className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow transition-transform ${formData.is24_7 ? 'translate-x-6' : ''}`}
                                                                />
                                                            </button>
                                                        </label>
                                                        {!formData.is24_7 && (
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div className="space-y-2">
                                                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">{t('host.listSpace.pricing.openTime')}</label>
                                                                    <input
                                                                        type="time"
                                                                        value={formData.openTime}
                                                                        onChange={(e) => handleUpdate('openTime', e.target.value)}
                                                                        className={`w-full px-3 py-3 bg-white rounded-xl border font-bold text-gray-900 ${fieldRing('openTime') || 'border-gray-200'}`}
                                                                    />
                                                                    {fieldErrors.openTime ? (
                                                                        <p className="text-xs font-bold text-red-600">{fieldErrors.openTime}</p>
                                                                    ) : null}
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">{t('host.listSpace.pricing.closeTime')}</label>
                                                                    <input
                                                                        type="time"
                                                                        value={formData.closeTime}
                                                                        onChange={(e) => handleUpdate('closeTime', e.target.value)}
                                                                        className={`w-full px-3 py-3 bg-white rounded-xl border font-bold text-gray-900 ${fieldRing('closeTime') || 'border-gray-200'}`}
                                                                    />
                                                                    {fieldErrors.closeTime ? (
                                                                        <p className="text-xs font-bold text-red-600">{fieldErrors.closeTime}</p>
                                                                    ) : null}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="space-y-10">
                                                    <div className="space-y-6">
                                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">{t('host.listSpace.pricing.hourlyBaseRate')}</label>
                                                        <div className="relative group">
                                                            <input
                                                                type="number"
                                                                value={Number.isFinite(formData.basePrice) ? formData.basePrice : ''}
                                                                onChange={(e) => {
                                                                    const raw = e.target.value;
                                                                    if (raw === '') {
                                                                        handleUpdate('basePrice', Number.NaN);
                                                                        return;
                                                                    }
                                                                    const v = parseInt(raw, 10);
                                                                    handleUpdate('basePrice', Number.isNaN(v) ? Number.NaN : v);
                                                                }}
                                                                placeholder={t('host.listSpace.pricing.pricePlaceholder')}
                                                                className={`w-full p-6 bg-gray-900 text-white rounded-[24px] border-none focus:ring-4 transition-all font-black text-3xl shadow-xl text-center placeholder:text-gray-600 ${fieldRing('basePrice') ? 'ring-4 ring-red-300' : 'focus:ring-gray-200'}`}
                                                            />
                                                            <div className="absolute top-1/2 -translate-y-1/2 left-8 text-gray-600 font-black">VNĐ</div>
                                                        </div>
                                                        {fieldErrors.basePrice ? (
                                                            <p className="text-xs font-bold text-red-600 ml-1">{fieldErrors.basePrice}</p>
                                                        ) : null}
                                                    </div>

                                                    <div className="space-y-6">
                                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">{t('host.listSpace.pricing.dailyRate')}</label>
                                                        <div className="relative group">
                                                            <input
                                                                type="number"
                                                                min={0}
                                                                value={Number.isFinite(formData.pricePerDay) ? formData.pricePerDay : ''}
                                                                onChange={(e) => {
                                                                    const raw = e.target.value;
                                                                    if (raw === '') {
                                                                        handleUpdate('pricePerDay', Number.NaN);
                                                                        return;
                                                                    }
                                                                    const v = parseInt(raw, 10);
                                                                    handleUpdate('pricePerDay', Number.isNaN(v) ? Number.NaN : v);
                                                                }}
                                                                placeholder={t('host.listSpace.pricing.dailyPlaceholder')}
                                                                className={`w-full p-5 text-gray-900 rounded-[20px] border-2 focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all font-black text-2xl shadow-sm text-center placeholder:text-gray-400 ${fieldRing('pricePerDay') || 'border-gray-200 bg-white'}`}
                                                            />
                                                            <div className="absolute top-1/2 -translate-y-1/2 left-6 text-gray-500 font-black text-sm">VNĐ</div>
                                                        </div>
                                                        {fieldErrors.pricePerDay ? (
                                                            <p className="text-xs font-bold text-red-600 ml-1">{fieldErrors.pricePerDay}</p>
                                                        ) : null}
                                                        <p className="text-xs text-gray-400 font-bold">{t('host.listSpace.pricing.dailyHint')}</p>
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
                                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-700">
                                            {/* Amenities Section */}
                                            <div className="space-y-6">
                                                <div>
                                                    <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">TIỆN ÍCH & TRANG THIẾT BỊ</h2>
                                                    <p className="text-gray-400 text-sm font-bold">{t('host.listSpace.amenities.description')}</p>
                                                </div>

                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                    {amenities.filter(a => a.type !== 'POLICY').map(item => {
                                                        const Icon = ICON_MAP[item.icon] || ShieldCheck;
                                                        const isSelected = formData.amenities.includes(item.name);
                                                        return (
                                                            <button
                                                                key={item.id}
                                                                type="button"
                                                                onClick={() => toggleAmenity(item.name)}
                                                                className={`p-3 flex flex-col items-center gap-2 rounded-2xl border transition-all duration-300 group ${isSelected ? 'border-red-500 bg-red-50 shadow-sm' : 'border-gray-200 hover:border-red-200 hover:bg-gray-50'
                                                                    }`}
                                                            >
                                                                <div className={`p-2.5 rounded-xl transition-all ${isSelected ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-400 group-hover:text-red-500 group-hover:bg-red-100'}`}>
                                                                    <Icon className="w-5 h-5" />
                                                                </div>
                                                                <span className={`text-xs font-bold text-center leading-tight ${isSelected ? 'text-red-900' : 'text-gray-500 group-hover:text-gray-900'}`}>
                                                                    {item.name}
                                                                </span>
                                                            </button>
                                                        );
                                                    })}

                                                    {/* Custom Amenities */}
                                                    {formData.amenities.filter(name => !amenities.some(a => a.name === name)).map(name => (
                                                        <div key={name} className="p-3 flex flex-col items-center gap-2 rounded-2xl border border-red-500 bg-red-50 shadow-sm relative group overflow-hidden">
                                                            <button
                                                                type="button"
                                                                onClick={() => removeCustomItem(name)}
                                                                className="absolute top-1 right-1 p-1 bg-red-100 text-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                            >
                                                                <Zap className="w-3 h-3 rotate-45" />
                                                            </button>
                                                            <div className="p-2.5 rounded-xl bg-red-500 text-white">
                                                                <Zap className="w-5 h-5" />
                                                            </div>
                                                            <span className="text-xs font-bold text-center leading-tight text-red-900 truncate w-full px-1">
                                                                {name}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Add Custom Amenity Input */}
                                                <div className="flex gap-2 mt-4">
                                                    <input
                                                        type="text"
                                                        placeholder="Thêm tiện ích khác..."
                                                        value={customAmenity}
                                                        onChange={(e) => setCustomAmenity(e.target.value)}
                                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomItem(customAmenity, setCustomAmenity))}
                                                        className="flex-1 px-4 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all outline-none"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => addCustomItem(customAmenity, setCustomAmenity)}
                                                        className="px-4 py-2 bg-gray-900 text-white text-xs font-bold rounded-xl hover:bg-gray-800 transition-colors"
                                                    >
                                                        Thêm
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Policies Section */}
                                            <div className="space-y-6 pt-6 border-t border-gray-100">
                                                <div>
                                                    <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">CHÍNH SÁCH CHO PHÒNG</h2>
                                                    <p className="text-gray-400 text-sm font-bold">Các quy định chung mà khách hàng cần tuân thủ khi sử dụng phòng.</p>
                                                </div>

                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                    {amenities.filter(a => a.type === 'POLICY').map(item => {
                                                        const Icon = ICON_MAP[item.icon] || ShieldCheck;
                                                        const isSelected = formData.amenities.includes(item.name);
                                                        return (
                                                            <button
                                                                key={item.id}
                                                                type="button"
                                                                onClick={() => toggleAmenity(item.name)}
                                                                className={`p-3 flex flex-col items-center gap-2 rounded-2xl border transition-all duration-300 group ${isSelected ? 'border-red-600 bg-red-50 shadow-sm' : 'border-gray-200 hover:border-red-200 hover:bg-gray-50'
                                                                    }`}
                                                            >
                                                                <div className={`p-2.5 rounded-xl transition-all ${isSelected ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-400 group-hover:text-red-600 group-hover:bg-red-100'}`}>
                                                                    <Icon className="w-5 h-5" />
                                                                </div>
                                                                <span className={`text-xs font-bold text-center leading-tight ${isSelected ? 'text-red-900' : 'text-gray-500 group-hover:text-gray-900'}`}>
                                                                    {item.name}
                                                                </span>
                                                            </button>
                                                        );
                                                    })}
                                                </div>

                                                {/* Add Custom Policy Input */}
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        placeholder="Thêm quy định khác..."
                                                        value={customPolicy}
                                                        onChange={(e) => setCustomPolicy(e.target.value)}
                                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomItem(customPolicy, setCustomPolicy))}
                                                        className="flex-1 px-4 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:border-red-600 focus:ring-2 focus:ring-red-100 transition-all outline-none"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => addCustomItem(customPolicy, setCustomPolicy)}
                                                        className="px-4 py-2 bg-gray-900 text-white text-xs font-bold rounded-xl hover:bg-gray-800 transition-colors"
                                                    >
                                                        Thêm
                                                    </button>
                                                </div>
                                            </div>

                                            {amenities.length === 0 && !loadingResources && (
                                                <div className="py-10 text-center text-gray-400 font-bold italic bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                                    Chưa có dữ liệu từ máy chủ.
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {step === 5 && (
                                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-700">
                                            <div>
                                                <h2 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">{t('host.listSpace.gallery.title')}</h2>
                                                <p className="text-gray-400 text-base font-bold">{t('host.listSpace.gallery.description')}</p>
                                            </div>

                                            {fieldErrors.images ? (
                                                <p className="text-sm font-bold text-red-600 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                                                    {fieldErrors.images}
                                                </p>
                                            ) : null}

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
                                        type="button"
                                        onClick={step === 1 ? onCancel : prevStep}
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
                                            type="button"
                                            onClick={nextStep}
                                            disabled={isSubmitting}
                                            className="bg-red-500 text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-red-600 transition-all shadow-lg shadow-red-100 flex items-center gap-2 active:scale-95 disabled:grayscale disabled:opacity-40"
                                        >
                                            {step === totalSteps
                                                ? isEdit
                                                    ? editSubmitMode === 'direct'
                                                        ? 'Lưu cập nhật'
                                                        : 'Gửi chờ duyệt'
                                                    : t('common.publish')
                                                : t('common.saveAndContinue')}
                                            <ArrowRight className="w-6 h-6" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
        </div>
    );
}
