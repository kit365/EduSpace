import { useState, useEffect, useRef, useMemo, Fragment } from 'react';
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
    Brush,
    Search,
    Phone,
    Mail,
    Globe,
    Bell,
    Smartphone,
    Users,
    User,
    Lock,
    Key,
    Camera,
    Mic,
    Monitor,
    Palette,
    Gift,
    Coins,
    Settings,
    RefreshCcw,
    ClipboardList,
    BookOpen,
    Building,
    Banknote,
    CreditCard,
    FileText,
    CheckCircle,
    AlertTriangle,
    Eye,
    ChevronDown,
    ChevronUp,
    Plus,
    Trash2,
    Upload,
    Info
} from 'lucide-react';
import { hostService } from '../services/hostService';
import { showToast } from '@/utils/toast';
import { getApiErrorMessage } from '@/utils/apiError';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useBranch } from '../context/BranchContext';
import type { HostBranch } from '../services/branchService';
import { roomApiService } from '@/client/features/room/services/roomApiService';
import { propertyApiService } from '@/client/features/room/services/propertyApiService';
import type {
    AmenityDto,
    PropertyDto,
    RoomCategoryDto,
    RoomDto,
    RoomPriceRuleDto,
    RoomScheduleDto,
} from '@/client/features/room/types';
import { profileService } from '@/client/features/customer/profile/services/profileService';

const ICON_MAP: Record<string, any> = {
    wifi: Wifi,
    presentation: Video,
    board: Building2,
    ac: Wind,
    wind: Wind,
    water: Coffee,
    coffee: Coffee,
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
    search: Search,
    phone: Phone,
    mail: Mail,
    globe: Globe,
    bell: Bell,
    mobile: Smartphone,
    users: Users,
    user: User,
    lock: Lock,
    key: Key,
    camera: Camera,
    mic: Mic,
    monitor: Monitor,
    palette: Palette,
    gift: Gift,
    coins: Coins,
    settings: Settings,
    refresh: RefreshCcw,
    checklist: ClipboardList,
    book: BookOpen,
    building: Building,
    banknote: Banknote,
    card: CreditCard,
    file: FileText,
    check: CheckCircle,
    warning: AlertTriangle,
    eye: Eye,
};

const CUSTOM_AMENITY_ICON_OPTIONS: { key: string; label: string }[] = [
    { key: 'wifi', label: 'Wi-Fi' },
    { key: 'presentation', label: 'Máy chiếu / Màn hình' },
    { key: 'board', label: 'Bảng viết' },
    { key: 'monitor', label: 'Màn hình rời' },
    { key: 'camera', label: 'Camera họp' },
    { key: 'mic', label: 'Micro' },
    { key: 'sound', label: 'Âm thanh' },
    { key: 'ac', label: 'Điều hòa' },
    { key: 'wind', label: 'Thông gió' },
    { key: 'water', label: 'Nước uống' },
    { key: 'coffee', label: 'Đồ uống' },
    { key: 'support', label: 'Hỗ trợ kỹ thuật' },
    { key: 'support-247', label: 'Hỗ trợ 24/7' },
    { key: 'parking', label: 'Bãi đỗ xe' },
    { key: 'cleaning', label: 'Vệ sinh' },
    { key: 'check', label: 'Đảm bảo dịch vụ' },
    { key: 'shield', label: 'An toàn' },
    { key: 'lock', label: 'Khóa bảo mật' },
    { key: 'key', label: 'Ra vào khóa thẻ' },
    { key: 'users', label: 'Hỗ trợ nhóm' },
    { key: 'user', label: 'Hỗ trợ cá nhân' },
    { key: 'phone', label: 'Liên hệ điện thoại' },
    { key: 'mail', label: 'Hỗ trợ email' },
    { key: 'globe', label: 'Internet quốc tế' },
    { key: 'mobile', label: 'Ứng dụng di động' },
    { key: 'search', label: 'Dễ tìm kiếm' },
    { key: 'calendar', label: 'Đặt theo lịch' },
    { key: 'clock', label: 'Theo giờ' },
    { key: 'book', label: 'Không gian học tập' },
    { key: 'building', label: 'Tiện ích tòa nhà' },
    { key: 'palette', label: 'Không gian sáng tạo' },
    { key: 'eye', label: 'Tầm nhìn thoáng' },
    { key: 'gift', label: 'Ưu đãi đi kèm' },
    { key: 'coins', label: 'Chi phí tối ưu' },
    { key: 'banknote', label: 'Thanh toán linh hoạt' },
    { key: 'card', label: 'Thanh toán thẻ' },
    { key: 'checklist', label: 'Quy trình rõ ràng' },
    { key: 'settings', label: 'Thiết bị tùy chỉnh' },
    { key: 'refresh', label: 'Bảo trì định kỳ' },
    { key: 'file', label: 'Tài liệu in ấn' },
    { key: 'warning', label: 'Lưu ý an toàn' },
    { key: 'smoking', label: 'Không hút thuốc' },
    { key: 'zap', label: 'Khác' },
];

const CUSTOM_POLICY_ICON_OPTIONS: { key: string; label: string }[] = [
    { key: 'shield', label: 'An toàn' },
    { key: 'support-247', label: 'Hỗ trợ 24/7' },
    { key: 'smoking', label: 'Không hút thuốc' },
    { key: 'lock', label: 'Bảo mật' },
    { key: 'key', label: 'Quy định ra vào' },
    { key: 'clock', label: 'Theo giờ' },
    { key: 'calendar', label: 'Theo ngày' },
    { key: 'checklist', label: 'Nội quy chung' },
    { key: 'warning', label: 'Cảnh báo' },
    { key: 'file', label: 'Quy định văn bản' },
    { key: 'bell', label: 'Thông báo' },
    { key: 'camera', label: 'Giám sát' },
    { key: 'users', label: 'Ứng xử cộng đồng' },
    { key: 'book', label: 'Hướng dẫn sử dụng' },
    { key: 'settings', label: 'Vận hành thiết bị' },
    { key: 'cleaning', label: 'Vệ sinh' },
    { key: 'parking', label: 'Bãi đỗ xe' },
    { key: 'zap', label: 'Khác' },
];

interface SpaceFormData {
    branchId: number | null;
    /** Tên chi nhánh — Property.name */
    branchName: string;
    /** Tên phòng — RoomEntity.name */
    roomName: string;
    roomType: string;
    title: string;
    address: string;
    roomLocationHint: string;
    roomNumber: string;
    capacity: number;
    size: number;
    floor: number;
    defaultPricePerUnit: number;
    minDuration: number;
    stepUnit: number;
    weekendSurchargeEnabled: boolean;
    weekendSurchargePercent: number;
    weekendApplySaturday: boolean;
    weekendApplySunday: boolean;
    priceRules: RoomPriceRuleDto[];
    amenities: string[];
    images: string[];
    mainImageUrl: string | null;
}

type DraftPriceRule = {
    minHours: string;
    maxHours: string;
    pricePerHour: string;
    flatPrice: string;
    label: string;
};

/** 2 = Thứ 2 … 8 = Chủ nhật — cùng quy ước room_schedules.day_of_week (BE). */
const PROPERTY_WEEKDAYS: { dow: number; short: string }[] = [
    { dow: 2, short: 'T2' },
    { dow: 3, short: 'T3' },
    { dow: 4, short: 'T4' },
    { dow: 5, short: 'T5' },
    { dow: 6, short: 'T6' },
    { dow: 7, short: 'T7' },
    { dow: 8, short: 'CN' },
];

function operatingHoursFromScheduleRow(sched: RoomScheduleDto | undefined): number {
    if (!sched || !sched.isOpen) return 0;
    if (sched.isOverDay) return 24;
    const ot = sched.openTime?.trim();
    const ct = sched.closeTime?.trim();
    if (!ot || !ct) return 0;
    const toMinutes = (t: string) => {
        const p = t.split(':');
        return Number.parseInt(p[0] ?? '0', 10) * 60 + Number.parseInt(p[1] ?? '0', 10);
    };
    const openM = toMinutes(ot);
    const closeM = toMinutes(ct);
    if (closeM <= openM) return 0;
    return (closeM - openM) / 60;
}

function isPriceRuleDayDisabled(rule: RoomPriceRuleDto, dow: number, schedules: RoomScheduleDto[]): boolean {
    if (!schedules.length) return false;
    const sched = schedules.find((s) => s.dayOfWeek === dow);
    const minH = Number(rule.minHours ?? 0);
    return operatingHoursFromScheduleRow(sched) < minH;
}

function isPriceRuleDaySelected(rule: RoomPriceRuleDto, dow: number, schedules: RoomScheduleDto[]): boolean {
    if (isPriceRuleDayDisabled(rule, dow, schedules)) return false;
    const d = rule.applicableDayOfWeeks;
    if (d == null || d.length === 0) return true;
    return d.includes(dow);
}

function priceRuleEffectiveSelectedDays(rule: RoomPriceRuleDto, schedules: RoomScheduleDto[]): number[] {
    if (!schedules.length) {
        return PROPERTY_WEEKDAYS.map((x) => x.dow);
    }
    const explicit = rule.applicableDayOfWeeks;
    if (explicit != null && explicit.length > 0) {
        return explicit.filter((dow) => !isPriceRuleDayDisabled(rule, dow, schedules));
    }
    return PROPERTY_WEEKDAYS.map((x) => x.dow).filter((dow) => !isPriceRuleDayDisabled(rule, dow, schedules));
}

function formatVndInput(value: number): string {
    if (!Number.isFinite(value) || value <= 0) return '';
    return Math.trunc(value).toLocaleString('vi-VN');
}

function parseVndInput(raw: string): number {
    const digits = raw.replace(/[^\d]/g, '');
    if (!digits) return Number.NaN;
    return Number.parseInt(digits, 10);
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

function validateSpaceStep(
    step: number,
    data: SpaceFormData,
    branches: HostBranch[],
    branchSchedules: RoomScheduleDto[],
    t: TFunction,
): Record<string, string> {
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
        if (!Number.isFinite(data.defaultPricePerUnit) || data.defaultPricePerUnit <= 0) {
            errors.defaultPricePerUnit = 'Vui lòng nhập đơn giá mặc định theo bước lớn hơn 0';
        }
        if (!Number.isFinite(data.minDuration) || data.minDuration <= 0) errors.minDuration = 'Min duration phải > 0';
        if (!Number.isFinite(data.stepUnit) || data.stepUnit <= 0) errors.stepUnit = 'Step unit phải > 0';
        if (Number.isFinite(data.minDuration) && Number.isFinite(data.stepUnit) && data.minDuration % data.stepUnit !== 0) {
            errors.minDuration = 'Min duration phải chia hết cho step unit';
        }
        if (data.weekendSurchargeEnabled && !data.weekendApplySaturday && !data.weekendApplySunday) {
            errors.weekendSurchargePercent = 'Chọn ít nhất Thứ 7 hoặc Chủ nhật khi bật phụ thu cuối tuần';
        }
        if ((data.priceRules ?? []).some((r) => !r.minHours || Number(r.minHours) <= 0)) {
            errors.priceRules = 'Mỗi quy tắc phải có "Số giờ tối thiểu" > 0';
        }
        for (const r of data.priceRules ?? []) {
            if (branchSchedules.length === 0) continue;
            const effective = priceRuleEffectiveSelectedDays(r, branchSchedules);
            if (effective.length === 0) {
                errors.priceRules =
                    'Có quy tắc giá không áp dụng được ngày nào: giờ tối thiểu vượt thời gian mở cửa của cơ sở.';
                break;
            }
            const explicit = r.applicableDayOfWeeks;
            if (explicit != null && explicit.length > 0) {
                for (const dow of explicit) {
                    if (isPriceRuleDayDisabled(r, dow, branchSchedules)) {
                        errors.priceRules =
                            'Quy tắc giá có ngày được chọn nhưng không đủ thời gian hoạt động — bỏ chọn các ngày xám.';
                        break;
                    }
                }
            }
            if (errors.priceRules) break;
        }
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

function validateAllSteps(data: SpaceFormData, branches: HostBranch[], branchSchedules: RoomScheduleDto[], t: TFunction) {
    for (let s = 1; s <= 5; s++) {
        const errs = validateSpaceStep(s, data, branches, branchSchedules, t);
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

function mapRoomToForm(room: RoomDto, property: PropertyDto): SpaceFormData {
    const meta = parseDescriptionForForm(room.description);
    const floorNum = room.floorNumber != null ? parseInt(String(room.floorNumber), 10) : 1;
    const imgs = (room.images ?? '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    const cap = room.capacity ?? 0;
    const ar = room.area != null ? Number(room.area) : 0;
    const stepUnit = room.stepUnit != null ? Math.round(Number(room.stepUnit)) : 30;
    const hourly = room.pricePerHour != null ? Number(room.pricePerHour) : 0;
    const defaultPerUnit = stepUnit > 0 && hourly > 0 ? Math.round((hourly * stepUnit) / 60) : 0;
    return {
        branchId: room.propertyId,
        branchName: property.name?.trim() ?? '',
        roomName: room.name,
        roomType: room.category?.slug || normalizeRoomType(room.roomType),
        title: meta.title || room.name,
        address: property.addressDetail?.trim() ?? '',
        roomLocationHint: room.roomLocationHint?.trim() ?? '',
        roomNumber: room.roomNumber?.trim() ?? '',
        capacity: cap,
        size: Number.isFinite(ar) && ar > 0 ? ar : 0,
        floor: Number.isFinite(floorNum) && floorNum >= 0 ? floorNum : 1,
        defaultPricePerUnit: defaultPerUnit,
        minDuration: room.minDuration != null ? Math.round(Number(room.minDuration)) : 30,
        stepUnit,
        weekendSurchargeEnabled: Boolean(room.weekendSurchargeEnabled),
        weekendSurchargePercent: room.weekendSurchargePercent != null ? Math.round(Number(room.weekendSurchargePercent)) : 10,
        weekendApplySaturday: room.weekendApplySaturday ?? false,
        weekendApplySunday: room.weekendApplySunday ?? true,
        priceRules: Array.isArray(room.priceRules)
            ? room.priceRules.map((r) => ({
                  minHours: Number(r.minHours ?? 1),
                  maxHours: r.maxHours == null ? null : Number(r.maxHours),
                  pricePerHour: r.pricePerHour == null ? null : Number(r.pricePerHour),
                  flatPrice: r.flatPrice == null ? null : Number(r.flatPrice),
                  label: r.label ?? '',
                  applicableDayOfWeeks:
                      r.applicableDayOfWeeks != null && r.applicableDayOfWeeks.length > 0
                          ? [...r.applicableDayOfWeeks]
                          : undefined,
              }))
            : [],
        amenities: meta.amenities,
        images: imgs.length ? imgs : [],
        mainImageUrl: room.mainImageUrl?.trim() || (imgs[0] ?? null),
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
    const [branchSchedules, setBranchSchedules] = useState<RoomScheduleDto[]>([]);
    const [loadingEdit, setLoadingEdit] = useState(false);
    const [editLoadError, setEditLoadError] = useState<string | null>(null);
    const [editSubmitMode, setEditSubmitMode] = useState<'pending' | 'direct'>('pending');
    const [categories, setCategories] = useState<RoomCategoryDto[]>([]);
    const [amenities, setAmenities] = useState<AmenityDto[]>([]);
    const [loadingResources, setLoadingResources] = useState(false);
    const [customAmenity, setCustomAmenity] = useState('');
    const [customPolicy, setCustomPolicy] = useState('');
    const [selectedCustomAmenityIcon, setSelectedCustomAmenityIcon] = useState<string>('zap');
    const [selectedCustomPolicyIcon, setSelectedCustomPolicyIcon] = useState<string>('shield');
    const [customAmenityIconByName, setCustomAmenityIconByName] = useState<Record<string, string>>({});
    const [addingCustomAmenity, setAddingCustomAmenity] = useState(false);
    const [addingCustomPolicy, setAddingCustomPolicy] = useState(false);
    const [uploadingImages, setUploadingImages] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [showCreateRuleForm, setShowCreateRuleForm] = useState(false);
    const [ruleDraftError, setRuleDraftError] = useState<string | null>(null);
    const [ruleDraft, setRuleDraft] = useState<DraftPriceRule>({
        minHours: '',
        maxHours: '',
        pricePerHour: '',
        flatPrice: '',
        label: '',
    });
    const [showAmenityIconSelector, setShowAmenityIconSelector] = useState(false);
    const [showPolicyIconSelector, setShowPolicyIconSelector] = useState(false);
    const totalSteps = 5;

    const amenityIconOptions = CUSTOM_AMENITY_ICON_OPTIONS;

    const stepNavLabel = (n: number) => {
        const keys = ['basics', 'location', 'pricing', 'amenities', 'gallery'] as const;
        return t(`host.listSpace.steps.${keys[n - 1]}`);
    };

    const fieldRing = (key: string) => (fieldErrors[key] ? 'border-red-500 ring-2 ring-red-100' : '');
    const hasDraftMin = ruleDraft.minHours.trim() !== '';
    const hasDraftMax = ruleDraft.maxHours.trim() !== '';
    const ruleDraftMode: 'flat' | 'hourly' = hasDraftMin && !hasDraftMax ? 'flat' : 'hourly';
    const [formData, setFormData] = useState<SpaceFormData>(() => ({
        branchId: selectedBranch ? selectedBranch.id : null,
        branchName: selectedBranch?.name?.trim() ?? '',
        roomName: '',
        roomType: '',
        title: '',
        address: selectedBranch?.address?.trim() ?? '',
        roomLocationHint: '',
        roomNumber: '',
        capacity: 0,
        size: 0,
        floor: 1,
        defaultPricePerUnit: 0,
        minDuration: 30,
        stepUnit: 30,
        weekendSurchargeEnabled: false,
        weekendSurchargePercent: 10,
        weekendApplySaturday: false,
        weekendApplySunday: true,
        priceRules: [],
        amenities: [],
        images: [],
        mainImageUrl: null,
    }));

    const hourlyBasePrice = useMemo(() => {
        const step = Number(formData.stepUnit);
        const unit = Number(formData.defaultPricePerUnit);
        if (!Number.isFinite(step) || step <= 0 || !Number.isFinite(unit) || unit <= 0) return 0;
        return Math.round((unit * 60) / step);
    }, [formData.defaultPricePerUnit, formData.stepUnit]);

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
        if (amenityIconOptions.length === 0) return;
        const exists = amenityIconOptions.some((x) => x.key === selectedCustomAmenityIcon);
        if (!exists) {
            setSelectedCustomAmenityIcon(amenityIconOptions[0].key);
        }
    }, [amenityIconOptions, selectedCustomAmenityIcon]);

    useEffect(() => {
        if (!isEdit || !editId) {
            setRoomSnapshot(null);
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

    useEffect(() => {
        let cancelled = false;
        if (formData.branchId == null) {
            setBranchSchedules([]);
            return () => {
                cancelled = true;
            };
        }
        if (
            isEdit &&
            roomSnapshot != null &&
            roomSnapshot.propertyId === formData.branchId &&
            roomSnapshot.schedules != null &&
            roomSnapshot.schedules.length > 0
        ) {
            setBranchSchedules(roomSnapshot.schedules);
            return () => {
                cancelled = true;
            };
        }
        void (async () => {
            try {
                const profile = await profileService.getProfile();
                const uid = profile?.id?.trim();
                if (!uid || cancelled) return;
                const bundle = await propertyApiService.getSchedules(formData.branchId!, uid);
                if (!cancelled) setBranchSchedules(bundle.schedules ?? []);
            } catch {
                if (!cancelled) setBranchSchedules([]);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [formData.branchId, isEdit, roomSnapshot]);

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
            const errs = validateSpaceStep(step, formData, branches, branchSchedules, t);
            if (Object.keys(errs).length > 0) {
                setFieldErrors(errs);
                showToast.error(t('host.listSpace.validation.fixCurrentStep'));
                return;
            }
            setFieldErrors({});
            setStep((prev) => prev + 1);
            return;
        }

        const failed = validateAllSteps(formData, branches, branchSchedules, t);
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

    const addPriceRule = () => {
        setShowCreateRuleForm((prev) => !prev);
        setRuleDraftError(null);
    };

    const removePriceRule = (idx: number) => {
        handleUpdate(
            'priceRules',
            (formData.priceRules ?? []).filter((_, i) => i !== idx),
        );
    };

    const toggleRuleWeekday = (idx: number, dow: number) => {
        const rules = formData.priceRules ?? [];
        const cur = rules[idx];
        if (!cur || isPriceRuleDayDisabled(cur, dow, branchSchedules)) return;
        let days = cur.applicableDayOfWeeks;
        if (days == null || days.length === 0) {
            days = PROPERTY_WEEKDAYS.map((x) => x.dow).filter(
                (d) => !isPriceRuleDayDisabled(cur, d, branchSchedules),
            );
        }
        const set = new Set(days);
        if (set.has(dow)) {
            if (branchSchedules.length > 0 && set.size <= 1) return;
            set.delete(dow);
        } else {
            set.add(dow);
        }
        const nextList = [...rules];
        nextList[idx] = {
            ...cur,
            applicableDayOfWeeks: [...set].sort((a, b) => a - b),
        };
        handleUpdate('priceRules', nextList);
    };

    const createRuleFromDraft = () => {
        setRuleDraftError(null);
        const min = ruleDraft.minHours.trim() ? Number.parseInt(ruleDraft.minHours, 10) : NaN;
        const max = ruleDraft.maxHours.trim() ? Number.parseInt(ruleDraft.maxHours, 10) : null;
        if (!Number.isFinite(min) || min <= 0) {
            setRuleDraftError('Vui lòng nhập số giờ tối thiểu hợp lệ (>0).');
            return;
        }
        if (max != null && (!Number.isFinite(max) || max < min)) {
            setRuleDraftError('Số giờ tối đa phải lớn hơn hoặc bằng số giờ tối thiểu.');
            return;
        }

        // Kiểm tra trùng lắp khoảng giờ với các quy tắc đã có
        const newMin = min;
        const newMax = max ?? Infinity;
        const existingRules = formData.priceRules ?? [];
        const overlap = existingRules.find((r) => {
            const rMin = r.minHours;
            const rMax = r.maxHours ?? Infinity;
            return newMin < rMax && rMin < newMax;
        });
        if (overlap) {
            const overlapRange = overlap.maxHours != null
                ? `${overlap.minHours}h – ${overlap.maxHours}h`
                : `từ ${overlap.minHours}h trở lên`;
            setRuleDraftError(`Khoảng giờ bị trùng với quy tắc đã có (${overlapRange}). Vui lòng chọn khoảng giờ khác.`);
            return;
        }

        let pricePerHour: number | null = null;
        let flatPrice: number | null = null;
        if (ruleDraftMode === 'flat') {
            const flat = Number.parseInt(ruleDraft.flatPrice, 10);
            if (!Number.isFinite(flat) || flat <= 0) {
                setRuleDraftError('Vui lòng nhập giá trọn gói hợp lệ (>0).');
                return;
            }
            flatPrice = flat;
        } else {
            const hourly = Number.parseInt(ruleDraft.pricePerHour, 10);
            if (!Number.isFinite(hourly) || hourly <= 0) {
                setRuleDraftError('Vui lòng nhập đơn giá theo giờ hợp lệ (>0).');
                return;
            }
            pricePerHour = hourly;
        }

        const provisionalRule: RoomPriceRuleDto = {
            minHours: min,
            maxHours: max,
            pricePerHour,
            flatPrice,
            label: ruleDraft.label.trim() || '',
        };
        const initialDays = PROPERTY_WEEKDAYS.map((x) => x.dow).filter(
            (dow) => !isPriceRuleDayDisabled(provisionalRule, dow, branchSchedules),
        );
        if (branchSchedules.length > 0 && initialDays.length === 0) {
            setRuleDraftError(
                'Không có ngày nào đủ thời gian hoạt động so với số giờ tối thiểu — giảm giờ tối thiểu hoặc điều chỉnh lịch cơ sở.',
            );
            return;
        }

        const next: RoomPriceRuleDto = {
            ...provisionalRule,
            applicableDayOfWeeks: branchSchedules.length > 0 ? initialDays : undefined,
        };
        handleUpdate('priceRules', [...(formData.priceRules ?? []), next]);
        setRuleDraft({
            minHours: '',
            maxHours: '',
            pricePerHour: '',
            flatPrice: '',
            label: '',
        });
        setShowCreateRuleForm(false);
    };

    const addCustomAmenity = async (value: string, setter: (v: string) => void) => {
        const trimmed = value.trim();
        if (!trimmed) return;
        const existing = amenities.find(
            (a) => a.type !== 'POLICY' && a.name.trim().toLowerCase() === trimmed.toLowerCase()
        );
        if (existing) {
            if (!formData.amenities.includes(existing.name)) {
                handleUpdate('amenities', [...formData.amenities, existing.name]);
            }
            setter('');
            return;
        }
        if (addingCustomAmenity) return;
        try {
            setAddingCustomAmenity(true);
            const position = (amenities.filter((a) => a.type !== 'POLICY').reduce((m, a) => Math.max(m, a.position || 0), 0) || 0) + 1;
            const created = await roomApiService.createAmenity({
                nameVi: trimmed,
                nameEn: trimmed,
                icon: selectedCustomAmenityIcon,
                type: 'FEATURE',
                position,
            });
            setAmenities((prev) => [...prev, created]);
            if (!formData.amenities.includes(created.name)) {
                handleUpdate('amenities', [...formData.amenities, created.name]);
            }
            setCustomAmenityIconByName((prev) => ({ ...prev, [created.name]: created.icon || selectedCustomAmenityIcon }));
            showToast.success('Đã tạo tiện ích mới.');
            setter('');
        } catch (error) {
            showToast.error(getApiErrorMessage(error, 'Không tạo được tiện ích mới.'));
        } finally {
            setAddingCustomAmenity(false);
        }
    };

    const addCustomPolicy = async (value: string, setter: (v: string) => void) => {
        const trimmed = value.trim();
        if (!trimmed) return;
        const existing = amenities.find(
            (a) => a.type === 'POLICY' && a.name.trim().toLowerCase() === trimmed.toLowerCase()
        );
        if (existing) {
            if (!formData.amenities.includes(existing.name)) {
                handleUpdate('amenities', [...formData.amenities, existing.name]);
            }
            setter('');
            return;
        }
        if (addingCustomPolicy) return;
        try {
            setAddingCustomPolicy(true);
            const position = (amenities.filter((a) => a.type === 'POLICY').reduce((m, a) => Math.max(m, a.position || 0), 0) || 0) + 1;
            const created = await roomApiService.createAmenity({
                nameVi: trimmed,
                nameEn: trimmed,
                icon: selectedCustomPolicyIcon,
                type: 'POLICY',
                position,
            });
            setAmenities((prev) => [...prev, created]);
            if (!formData.amenities.includes(created.name)) {
                handleUpdate('amenities', [...formData.amenities, created.name]);
            }
            showToast.success('Đã tạo chính sách mới.');
            setter('');
        } catch (error) {
            showToast.error(getApiErrorMessage(error, 'Không tạo được chính sách mới.'));
        } finally {
            setAddingCustomPolicy(false);
        }
    };

    const removeCustomItem = (name: string) => {
        handleUpdate('amenities', formData.amenities.filter(a => a !== name));
        setCustomAmenityIconByName((prev) => {
            if (!(name in prev)) return prev;
            const next = { ...prev };
            delete next[name];
            return next;
        });
    };

    const openImagePicker = () => {
        fileInputRef.current?.click();
    };

    const handleImageFilesSelected = async (files: FileList | null) => {
        if (!files || files.length === 0) return;
        const list = Array.from(files).filter((f) => f.type.startsWith('image/'));
        if (list.length === 0) {
            showToast.error('Vui lòng chọn file ảnh (PNG/JPG/JPEG/WebP).');
            return;
        }
        try {
            setUploadingImages(true);
            const uploadedUrls = await Promise.all(
                list.map((file) => roomApiService.uploadRoomImage(file, 'eduspace-rooms')),
            );
            setFormData((prev) => {
                const nextImages = [...prev.images, ...uploadedUrls];
                const uniqueImages = Array.from(new Set(nextImages));
                return {
                    ...prev,
                    images: uniqueImages,
                    mainImageUrl: prev.mainImageUrl || uniqueImages[0] || null,
                };
            });
            clearFieldError('images');
            showToast.success(`Đã tải lên ${uploadedUrls.length} ảnh.`);
        } catch (error) {
            showToast.error(getApiErrorMessage(error, 'Upload ảnh thất bại.'));
        } finally {
            setUploadingImages(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const removeImage = (index: number) => {
        setFormData((prev) => {
            const removed = prev.images[index];
            const next = prev.images.filter((_, idx) => idx !== index);
            const nextMain =
                prev.mainImageUrl === removed ? (next[0] ?? null) : prev.mainImageUrl;
            return { ...prev, images: next, mainImageUrl: nextMain };
        });
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
                                                        <Select
                                                            value={formData.branchId ? String(formData.branchId) : ''}
                                                            onValueChange={(val) => handleBranchSelect(val)}
                                                        >
                                                            <SelectTrigger className={`h-11 rounded-xl bg-gray-50 border focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all font-medium text-gray-900 ${fieldRing('branchId') || 'border-gray-200'}`}>
                                                                <SelectValue placeholder="Chọn chi nhánh..." />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {branches
                                                                    .filter(b => b.rawStatus === 'VERIFIED')
                                                                    .map(b => (
                                                                        <SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>
                                                                    ))}
                                                            </SelectContent>
                                                        </Select>
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
                                                    <Select
                                                        value={formData.roomType || ''}
                                                        onValueChange={(val) => handleUpdate('roomType', val)}
                                                    >
                                                        <SelectTrigger className={`h-11 rounded-xl bg-gray-50 border focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all font-medium text-gray-900 ${fieldRing('roomType') || 'border-gray-200'}`}>
                                                            <SelectValue placeholder={t('host.listSpace.basics.chooseCategory')} />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {categories.map(cat => (
                                                                <SelectItem key={cat.slug} value={cat.slug}>{cat.name}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
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
                                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                                                    Gợi ý vị trí phòng học cụ thể
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.roomLocationHint}
                                                    onChange={(e) => handleUpdate('roomLocationHint', e.target.value)}
                                                    placeholder="Ví dụ: Cuối hành lang bên trái, gần thang máy B"
                                                    className="w-full px-4 py-3 bg-gray-50 rounded-xl border focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all font-medium text-gray-900 placeholder:text-gray-400 border-gray-200"
                                                />
                                                <p className="text-xs text-gray-500 font-medium leading-relaxed">
                                                    Thông tin này sẽ hiển thị cho khách khi xem chi tiết phòng để dễ tìm lúc check-in.
                                                </p>
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

                                            <div className="space-y-10">
                                            <div className="space-y-8">
                                                {/* Basic Pricing Configuration Card */}
                                                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                                                    <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                                                        <div className="p-2 bg-red-50 rounded-xl">
                                                            <Coins className="w-5 h-5 text-red-500" />
                                                        </div>
                                                        <div>
                                                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight">Cấu hình giá cơ bản</h3>
                                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Thiết lập giá gốc và quy tắc đặt phòng</p>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="p-6">
                                                        <div className="space-y-4 p-5 bg-gray-50 rounded-3xl border border-gray-100">
                                                            <div className="space-y-2">
                                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Đơn giá mặc định theo bước (VNĐ)</label>
                                                                <div className="relative">
                                                                    <input
                                                                        type="text"
                                                                        inputMode="numeric"
                                                                        value={formatVndInput(formData.defaultPricePerUnit)}
                                                                        onChange={(e) => {
                                                                            const v = parseVndInput(e.target.value);
                                                                            handleUpdate('defaultPricePerUnit', Number.isNaN(v) ? Number.NaN : v);
                                                                        }}
                                                                        className={`w-full pl-12 pr-4 py-3 rounded-2xl border-2 bg-white focus:border-red-500 focus:ring-4 focus:ring-red-50 transition-all font-black text-xl text-gray-900 ${fieldRing('defaultPricePerUnit') || 'border-gray-200'}`}
                                                                    />
                                                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-black text-xs">VND</span>
                                                                </div>
                                                                {fieldErrors.defaultPricePerUnit && (
                                                                    <p className="text-[10px] font-bold text-red-600 ml-1">{fieldErrors.defaultPricePerUnit}</p>
                                                                )}
                                                            </div>

                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div className="space-y-2">
                                                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tối thiểu (phút)</label>
                                                                    <input
                                                                        type="number"
                                                                        value={Number.isFinite(formData.minDuration) ? formData.minDuration : ''}
                                                                        onChange={(e) => handleUpdate('minDuration', parseInt(e.target.value || '0', 10))}
                                                                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white font-bold text-gray-900 focus:border-red-500 transition-all"
                                                                    />
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Bước nhảy (phút)</label>
                                                                    <input
                                                                        type="number"
                                                                        value={Number.isFinite(formData.stepUnit) ? formData.stepUnit : ''}
                                                                        onChange={(e) => handleUpdate('stepUnit', parseInt(e.target.value || '0', 10))}
                                                                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white font-bold text-gray-900 focus:border-red-500 transition-all"
                                                                    />
                                                                </div>
                                                            </div>
                                                            
                                                            <div className="pt-2 border-t border-gray-200">
                                                                <div className="flex justify-between items-center mb-1">
                                                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Đơn giá mặc định / bước</span>
                                                                    <span className="text-xs font-black text-red-600">
                                                                        {Number.isFinite(formData.defaultPricePerUnit) ? formData.defaultPricePerUnit.toLocaleString() : 0} VNĐ
                                                                    </span>
                                                                </div>
                                                                <p className="text-[9px] text-gray-400 font-bold mt-2 leading-tight">
                                                                    Giá theo giờ nội bộ sẽ tự quy đổi: Đơn giá theo bước x (60 / Bước nhảy) = {hourlyBasePrice.toLocaleString()} VNĐ/giờ
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Price Rules Section */}
                                                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                                                    <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 bg-slate-100 rounded-xl">
                                                                <ClipboardList className="w-5 h-5 text-slate-600" />
                                                            </div>
                                                            <div>
                                                                <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight">Quy tắc giá theo giờ</h3>
                                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Tùy chỉnh giá cho các khung giờ đặc biệt</p>
                                                            </div>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={addPriceRule}
                                                            className="px-4 py-2 rounded-xl bg-gray-900 text-white text-[11px] font-black uppercase tracking-wider hover:bg-red-600 transition-all shadow-lg active:scale-95 flex items-center gap-2"
                                                        >
                                                            {showCreateRuleForm ? 'Đóng' : <><Plus className="w-3.5 h-3.5" /> Thêm quy tắc</>}
                                                        </button>
                                                    </div>

                                                    <div className="p-6 space-y-6">
                                                        {showCreateRuleForm && (
                                                            <div className="p-5 rounded-2xl bg-red-50/30 border-2 border-dashed border-red-100 animate-in fade-in slide-in-from-top-4 duration-300">
                                                                <div className="grid grid-cols-2 gap-4 mb-4">
                                                                    <div className="space-y-1.5">
                                                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Giờ tối thiểu</label>
                                                                        <input
                                                                            type="number"
                                                                            placeholder="Ví dụ: 2"
                                                                            value={ruleDraft.minHours}
                                                                            onChange={(e) => setRuleDraft((p) => ({ ...p, minHours: e.target.value }))}
                                                                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white font-bold text-sm focus:border-red-500 outline-none"
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-1.5">
                                                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Giờ tối đa (Tùy chọn)</label>
                                                                        <input
                                                                            type="number"
                                                                            placeholder="Ví dụ: 8"
                                                                            value={ruleDraft.maxHours}
                                                                            onChange={(e) => setRuleDraft((p) => ({ ...p, maxHours: e.target.value }))}
                                                                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white font-bold text-sm focus:border-red-500 outline-none"
                                                                        />
                                                                    </div>
                                                                </div>

                                                                <div className="space-y-1.5 mb-4">
                                                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                                                                        {ruleDraftMode === 'flat' ? 'Giá trọn gói (VNĐ)' : 'Đơn giá / giờ (VNĐ)'}
                                                                    </label>
                                                                    <input
                                                                        type="text"
                                                                        inputMode="numeric"
                                                                        placeholder="Nhập số tiền..."
                                                                        value={
                                                                            ruleDraftMode === 'flat'
                                                                                ? formatVndInput(Number.parseInt(ruleDraft.flatPrice, 10))
                                                                                : formatVndInput(Number.parseInt(ruleDraft.pricePerHour, 10))
                                                                        }
                                                                        onChange={(e) => {
                                                                            const v = parseVndInput(e.target.value);
                                                                            setRuleDraft((p) => ({
                                                                                ...p,
                                                                                [ruleDraftMode === 'flat' ? 'flatPrice' : 'pricePerHour']:
                                                                                    Number.isNaN(v) ? '' : String(v),
                                                                            }));
                                                                        }}
                                                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white font-black text-lg focus:border-red-500 outline-none text-red-600"
                                                                    />
                                                                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tight">
                                                                        {ruleDraftMode === 'flat' 
                                                                            ? "✱ Chế độ giá trọn gói (không nhân thêm thời gian)" 
                                                                            : "✱ Chế độ giá theo giờ (sẽ nhân với tổng thời gian thuê)"}
                                                                    </p>
                                                                </div>

                                                                <div className="mb-5">
                                                                    <div className="space-y-1.5">
                                                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nhãn cho quy tắc giá</label>
                                                                        <input
                                                                            type="text"
                                                                            placeholder="Ví dụ: Giảm giá ca sáng"
                                                                            value={ruleDraft.label}
                                                                            onChange={(e) => setRuleDraft((p) => ({ ...p, label: e.target.value }))}
                                                                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white font-bold text-sm outline-none"
                                                                        />
                                                                    </div>
                                                                </div>

                                                                {ruleDraftError && (
                                                                    <div className="mb-4 p-3 rounded-xl bg-red-100 border border-red-200 flex items-center gap-2">
                                                                        <AlertTriangle className="w-4 h-4 text-red-600" />
                                                                        <p className="text-xs font-black text-red-700">{ruleDraftError}</p>
                                                                    </div>
                                                                )}

                                                                <div className="flex gap-3">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setShowCreateRuleForm(false);
                                                                            setRuleDraftError(null);
                                                                        }}
                                                                        className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-xs font-black uppercase tracking-wider text-gray-500 hover:bg-white transition-all"
                                                                    >
                                                                        Hủy bỏ
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={createRuleFromDraft}
                                                                        className="flex-1 px-4 py-3 rounded-xl bg-red-500 text-white text-xs font-black uppercase tracking-wider hover:bg-red-600 transition-all shadow-md shadow-red-200"
                                                                    >
                                                                        Xác nhận tạo
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {(formData.priceRules ?? []).length === 0 ? (
                                                            <div className="py-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                                                                    <Info className="w-6 h-6 text-gray-300" />
                                                                </div>
                                                                <p className="text-sm font-bold text-gray-400">Chưa có quy tắc giá bổ sung.</p>
                                                                <p className="text-[10px] text-gray-300 font-black uppercase tracking-widest mt-1">Hệ thống sẽ dùng bảng giá mặc định</p>
                                                            </div>
                                                        ) : (
                                                            <div className="overflow-hidden rounded-2xl border border-gray-100 shadow-sm">
                                                                <table className="min-w-full text-xs">
                                                                    <thead>
                                                                        <tr className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                                            <th className="px-4 py-3 text-left">Khung giờ (h)</th>
                                                                            <th className="px-4 py-3 text-left">Đơn giá / Loại</th>
                                                                            <th className="px-4 py-3 text-left">Giá sàn</th>
                                                                            <th className="px-4 py-3 text-right">Hành động</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody className="divide-y divide-gray-50">
                                                                        {(formData.priceRules ?? []).map((rule, idx) => (
                                                                            <Fragment key={idx}>
                                                                                <tr className="hover:bg-gray-50 transition-colors group">
                                                                                    <td className="px-4 py-4">
                                                                                        <div className="flex items-center gap-2">
                                                                                            <span className="font-black text-gray-900">{rule.minHours}h</span>
                                                                                            <ArrowRight className="w-3 h-3 text-gray-300" />
                                                                                            <span className="font-black text-gray-900">{rule.maxHours || '∞'}h</span>
                                                                                        </div>
                                                                                        {rule.label && <p className="text-[10px] text-gray-400 font-bold mt-0.5">{rule.label}</p>}
                                                                                    </td>
                                                                                    <td className="px-4 py-4">
                                                                                        <div className="space-y-0.5">
                                                                                            <p className="font-black text-red-600 text-sm">
                                                                                                {rule.flatPrice != null && Number(rule.flatPrice) > 0
                                                                                                    ? `${Number(rule.flatPrice).toLocaleString()} VNĐ`
                                                                                                    : `${Number(rule.pricePerHour).toLocaleString()} VNĐ`}
                                                                                            </p>
                                                                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-tight">
                                                                                                {rule.flatPrice != null && Number(rule.flatPrice) > 0 ? "Trọn gói" : "Mỗi giờ"}
                                                                                            </p>
                                                                                        </div>
                                                                                    </td>
                                                                                    <td className="px-4 py-4">
                                                                                        {rule.maxHours == null ? (
                                                                                            <>
                                                                                                <span className="font-black text-emerald-600 text-sm">
                                                                                                    {rule.flatPrice != null && Number(rule.flatPrice) > 0
                                                                                                        ? `${Number(rule.flatPrice).toLocaleString()} VNĐ`
                                                                                                        : `${(Number(rule.minHours) * Number(rule.pricePerHour ?? 0)).toLocaleString()} VNĐ`}
                                                                                                </span>
                                                                                                <p className="text-[9px] font-bold text-gray-400 mt-0.5">
                                                                                                    {rule.flatPrice != null && Number(rule.flatPrice) > 0
                                                                                                        ? 'Cố định'
                                                                                                        : `${rule.minHours}h × ${Number(rule.pricePerHour ?? 0).toLocaleString()}`}
                                                                                                </p>
                                                                                            </>
                                                                                        ) : (
                                                                                            <span className="text-gray-300 font-bold">—</span>
                                                                                        )}
                                                                                    </td>
                                                                                    <td className="px-4 py-4 text-right">
                                                                                        <button
                                                                                            type="button"
                                                                                            onClick={() => removePriceRule(idx)}
                                                                                            className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                                                        >
                                                                                            <Trash2 className="w-4 h-4" />
                                                                                        </button>
                                                                                    </td>
                                                                                </tr>
                                                                                <tr className="bg-slate-50/80 border-t border-gray-100">
                                                                                    <td colSpan={4} className="px-4 py-3">
                                                                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">
                                                                                            Áp dụng các thứ (theo lịch cơ sở)
                                                                                        </p>
                                                                                        {branchSchedules.length === 0 ? (
                                                                                            <p className="text-xs text-amber-600 font-bold">
                                                                                                Chưa có lịch & giờ hoạt động cho cơ sở đang chọn.
                                                                                            </p>
                                                                                        ) : (
                                                                                        <div className="flex flex-wrap gap-2">
                                                                                            {PROPERTY_WEEKDAYS.map(({ dow, short }) => {
                                                                                                const dis = isPriceRuleDayDisabled(rule, dow, branchSchedules);
                                                                                                const sel = isPriceRuleDaySelected(rule, dow, branchSchedules);
                                                                                                return (
                                                                                                    <button
                                                                                                        key={dow}
                                                                                                        type="button"
                                                                                                        disabled={dis}
                                                                                                        title={
                                                                                                            dis
                                                                                                                ? 'Ngày này không đủ thời gian hoạt động cho số giờ tối thiểu của quy tắc (hoặc đóng cửa).'
                                                                                                                : undefined
                                                                                                        }
                                                                                                        onClick={() => toggleRuleWeekday(idx, dow)}
                                                                                                        className={`min-w-[2.5rem] px-2 py-1.5 rounded-lg text-[10px] font-black transition-all ${
                                                                                                            dis
                                                                                                                ? 'bg-gray-100 text-gray-300 cursor-not-allowed opacity-50'
                                                                                                                : sel
                                                                                                                  ? 'bg-red-500 text-white shadow-sm'
                                                                                                                  : 'bg-white border border-gray-200 text-gray-500 hover:border-red-200'
                                                                                                        }`}
                                                                                                    >
                                                                                                        {short}
                                                                                                    </button>
                                                                                                );
                                                                                            })}
                                                                                        </div>
                                                                                        )}
                                                                                    </td>
                                                                                </tr>
                                                                            </Fragment>
                                                                        ))}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        )}
                                                        {fieldErrors.priceRules && (
                                                            <p className="text-xs font-bold text-red-600 mt-2 px-1">{fieldErrors.priceRules}</p>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Weekend Surcharges Section */}
                                                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                                                    <div className="bg-amber-50/50 px-6 py-4 border-b border-amber-100 flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 bg-amber-100 rounded-xl">
                                                                <Calendar className="w-5 h-5 text-amber-600" />
                                                            </div>
                                                            <div>
                                                                <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight">Phụ thu cuối tuần</h3>
                                                                <p className="text-[10px] text-amber-600/60 font-bold uppercase tracking-widest">Tự động tăng giá vào Thứ 7/CN</p>
                                                            </div>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            role="switch"
                                                            aria-checked={formData.weekendSurchargeEnabled}
                                                            onClick={() => handleUpdate('weekendSurchargeEnabled', !formData.weekendSurchargeEnabled)}
                                                            className={`relative w-12 h-7 rounded-full transition-all duration-300 ${formData.weekendSurchargeEnabled ? 'bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.4)]' : 'bg-gray-200'}`}
                                                        >
                                                            <span
                                                                className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300 ${
                                                                    formData.weekendSurchargeEnabled ? 'translate-x-5' : ''
                                                                }`}
                                                            />
                                                        </button>
                                                    </div>

                                                    <div className="p-6">
                                                        {formData.weekendSurchargeEnabled ? (
                                                            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                                                                <div className="flex items-center justify-between bg-amber-50 rounded-2xl p-4 border border-amber-100">
                                                                    <div className="flex flex-col">
                                                                        <span className="text-[10px] font-black text-amber-800 uppercase tracking-widest">Tỷ lệ phụ thu hiện tại</span>
                                                                        <span className="text-2xl font-black text-amber-600">+{formData.weekendSurchargePercent}%</span>
                                                                    </div>
                                                                    <div className="w-32">
                                                                        <input
                                                                            type="range"
                                                                            min="0"
                                                                            max="100"
                                                                            step="5"
                                                                            value={formData.weekendSurchargePercent}
                                                                            onChange={(e) => handleUpdate('weekendSurchargePercent', parseInt(e.target.value))}
                                                                            className="w-full h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                                                                        />
                                                                    </div>
                                                                </div>

                                                                <div className="grid grid-cols-2 gap-3">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleUpdate('weekendApplySaturday', !formData.weekendApplySaturday)}
                                                                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border-2 transition-all font-black text-xs uppercase tracking-tight ${
                                                                            formData.weekendApplySaturday
                                                                                ? 'bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-200'
                                                                                : 'bg-white border-gray-100 text-gray-400 hover:border-amber-200/50 hover:bg-amber-50/20'
                                                                        }`}
                                                                    >
                                                                        {formData.weekendApplySaturday && <CheckCircle2 className="w-4 h-4" />}
                                                                        Thứ 7
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleUpdate('weekendApplySunday', !formData.weekendApplySunday)}
                                                                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border-2 transition-all font-black text-xs uppercase tracking-tight ${
                                                                            formData.weekendApplySunday
                                                                                ? 'bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-200'
                                                                                : 'bg-white border-gray-100 text-gray-400 hover:border-amber-200/50 hover:bg-amber-50/20'
                                                                        }`}
                                                                    >
                                                                        {formData.weekendApplySunday && <CheckCircle2 className="w-4 h-4" />}
                                                                        Chủ nhật
                                                                    </button>
                                                                </div>

                                                                {fieldErrors.weekendSurchargePercent && (
                                                                    <p className="text-xs font-bold text-red-600 px-1">{fieldErrors.weekendSurchargePercent}</p>
                                                                )}
                                                                
                                                                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-start gap-2">
                                                                    <Info className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
                                                                    <p className="text-[10px] text-gray-500 font-bold leading-relaxed">
                                                                        Hệ thống sẽ cộng thêm {formData.weekendSurchargePercent}% vào tổng tiền của đơn đặt phòng {formData.weekendApplySaturday && formData.weekendApplySunday ? 'thứ bảy và chủ nhật' : formData.weekendApplySaturday ? 'thứ bảy' : 'chủ nhật'}.
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="py-6 text-center">
                                                                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Phụ thu cuối tuần đang tắt</p>
                                                                <p className="text-[10px] text-gray-300 font-bold mt-1 italic">Giá thuê các ngày cuối tuần sẽ được tính như ngày thường.</p>
                                                            </div>
                                                        )}
                                                    </div>
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
                                                                {(() => {
                                                                    const iconKey = customAmenityIconByName[name] || 'zap';
                                                                    const Icon = ICON_MAP[iconKey] || Zap;
                                                                    return <Icon className="w-5 h-5" />;
                                                                })()}
                                                            </div>
                                                            <span className="text-xs font-bold text-center leading-tight text-red-900 truncate w-full px-1">
                                                                {name}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Add Custom Amenity Input */}
                                                <div className="mt-4 space-y-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                                                    <div className="flex items-center justify-between">
                                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tùy chỉnh tiện ích</p>
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowAmenityIconSelector(!showAmenityIconSelector)}
                                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                                                                showAmenityIconSelector 
                                                                    ? 'bg-red-50 text-red-600 border border-red-100' 
                                                                    : 'bg-gray-50 text-gray-500 border border-gray-100 hover:bg-gray-100'
                                                            }`}
                                                        >
                                                            {showAmenityIconSelector ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                                            {showAmenityIconSelector ? 'Đóng bộ icon' : 'Chọn icon'}
                                                        </button>
                                                    </div>

                                                    {showAmenityIconSelector && (
                                                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 animate-in fade-in zoom-in-95 duration-300">
                                                            <div className="flex flex-wrap gap-2">
                                                                {amenityIconOptions.map((opt) => {
                                                                    const Icon = ICON_MAP[opt.key] || Zap;
                                                                    const active = selectedCustomAmenityIcon === opt.key;
                                                                    return (
                                                                        <button
                                                                            key={opt.key}
                                                                            type="button"
                                                                            onClick={() => setSelectedCustomAmenityIcon(opt.key)}
                                                                            title={opt.label}
                                                                            className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold transition-all ${
                                                                                active
                                                                                    ? 'border-red-500 bg-red-50 text-red-700 shadow-sm'
                                                                                    : 'border-gray-200 bg-white text-gray-600 hover:border-red-200 hover:bg-red-50'
                                                                            }`}
                                                                        >
                                                                            <Icon className="w-4 h-4" />
                                                                            <span className="max-w-[110px] truncate">{opt.label}</span>
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    )}
                                                    <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        placeholder="Thêm tiện ích khác..."
                                                        value={customAmenity}
                                                        onChange={(e) => setCustomAmenity(e.target.value)}
                                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), void addCustomAmenity(customAmenity, setCustomAmenity))}
                                                        disabled={addingCustomAmenity}
                                                        className="flex-1 px-4 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all outline-none disabled:opacity-50"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => void addCustomAmenity(customAmenity, setCustomAmenity)}
                                                        disabled={addingCustomAmenity}
                                                        className="px-4 py-2 bg-gray-900 text-white text-xs font-bold rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50"
                                                    >
                                                        {addingCustomAmenity ? 'Đang thêm...' : 'Thêm'}
                                                    </button>
                                                    </div>
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
                                                <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                                                    <div className="flex items-center justify-between">
                                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tùy chỉnh chính sách</p>
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowPolicyIconSelector(!showPolicyIconSelector)}
                                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                                                                showPolicyIconSelector 
                                                                    ? 'bg-red-50 text-red-600 border border-red-100' 
                                                                    : 'bg-gray-50 text-gray-500 border border-gray-100 hover:bg-gray-100'
                                                            }`}
                                                        >
                                                            {showPolicyIconSelector ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                                            {showPolicyIconSelector ? 'Đóng bộ icon' : 'Chọn icon'}
                                                        </button>
                                                    </div>

                                                    {showPolicyIconSelector && (
                                                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 animate-in fade-in zoom-in-95 duration-300">
                                                            <div className="flex flex-wrap gap-2">
                                                                {CUSTOM_POLICY_ICON_OPTIONS.map((opt) => {
                                                                    const Icon = ICON_MAP[opt.key] || ShieldCheck;
                                                                    const active = selectedCustomPolicyIcon === opt.key;
                                                                    return (
                                                                        <button
                                                                            key={opt.key}
                                                                            type="button"
                                                                            onClick={() => setSelectedCustomPolicyIcon(opt.key)}
                                                                            title={opt.label}
                                                                            className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold transition-all ${
                                                                                active
                                                                                    ? 'border-red-500 bg-red-50 text-red-700 shadow-sm'
                                                                                    : 'border-gray-200 bg-white text-gray-600 hover:border-red-200 hover:bg-red-50'
                                                                            }`}
                                                                        >
                                                                            <Icon className="w-4 h-4" />
                                                                            <span className="max-w-[110px] truncate">{opt.label}</span>
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    )}
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="text"
                                                            placeholder="Thêm quy định khác..."
                                                            value={customPolicy}
                                                            onChange={(e) => setCustomPolicy(e.target.value)}
                                                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), void addCustomPolicy(customPolicy, setCustomPolicy))}
                                                            disabled={addingCustomPolicy}
                                                            className="flex-1 px-4 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:border-red-600 focus:ring-2 focus:ring-red-100 transition-all outline-none disabled:opacity-50"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => void addCustomPolicy(customPolicy, setCustomPolicy)}
                                                            disabled={addingCustomPolicy}
                                                            className="px-4 py-2 bg-gray-900 text-white text-xs font-bold rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50"
                                                        >
                                                            {addingCustomPolicy ? 'Đang thêm...' : 'Thêm'}
                                                        </button>
                                                    </div>
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

                                            <div className="grid grid-cols-12 gap-8 min-h-[500px]">
                                                {/* Left: Upload Area */}
                                                <div className="col-span-12 lg:col-span-5 space-y-6">
                                                    <div
                                                        className="relative aspect-square border-2 border-dashed border-gray-200 rounded-[40px] p-8 text-center hover:bg-red-50/30 hover:border-red-300 transition-all duration-500 group flex flex-col items-center justify-center cursor-pointer overflow-hidden"
                                                        onClick={openImagePicker}
                                                    >
                                                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-50/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                        
                                                        <div className="relative w-28 h-28 bg-white rounded-[32px] flex items-center justify-center mb-6 shadow-2xl shadow-gray-200 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500">
                                                            <div className="absolute inset-0 bg-red-500 rounded-[32px] opacity-0 group-hover:opacity-10 transition-opacity" />
                                                            <Upload className="w-10 h-10 text-gray-400 group-hover:text-red-500 transition-colors" />
                                                        </div>
                                                        
                                                        <div className="relative">
                                                            <h4 className="text-xl font-black text-gray-900 mb-2 tracking-tight">
                                                                {uploadingImages ? 'Vui lòng đợi...' : 'Tải ảnh phòng học'}
                                                            </h4>
                                                            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest max-w-[200px] mx-auto leading-loose">
                                                                {uploadingImages ? 'Đang xử lý dữ liệu Cloud' : 'PNG, JPG hoặc WebP (Tối đa 10MB/file)'}
                                                            </p>
                                                        </div>

                                                        <input
                                                            ref={fileInputRef}
                                                            type="file"
                                                            accept="image/*"
                                                            multiple
                                                            className="hidden"
                                                            onChange={(e) => void handleImageFilesSelected(e.target.files)}
                                                        />
                                                        
                                                        <div className="mt-8 flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest group-hover:bg-red-500 transition-all shadow-xl active:scale-95">
                                                            {uploadingImages ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                                            {uploadingImages ? 'ĐANG TẢI...' : 'CHỌN FILE'}
                                                        </div>
                                                    </div>

                                                    <div className="p-5 bg-blue-50/50 rounded-[32px] border border-blue-100/50 flex items-start gap-4">
                                                        <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm shrink-0">
                                                            <Info className="w-5 h-5 text-blue-500" />
                                                        </div>
                                                        <p className="text-[11px] text-blue-900/60 font-bold leading-relaxed">
                                                            Mẹo: Đăng ít nhất 5 ảnh với ánh sáng tốt để tăng tỉ lệ đặt phòng lên tới <span className="text-blue-600 font-black">40%</span>.
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Right: Gallery & Main Image selector */}
                                                <div className="col-span-12 lg:col-span-7 space-y-6">
                                                    <div
                                                        className={`relative aspect-[16/10] rounded-[40px] border-4 border-dashed transition-all duration-500 overflow-hidden flex items-center justify-center bg-gray-50 ${
                                                            formData.mainImageUrl ? 'border-transparent shadow-2xl' : 'border-gray-200 hover:border-red-200'
                                                        }`}
                                                        onDragOver={(e) => e.preventDefault()}
                                                        onDrop={(e) => {
                                                            e.preventDefault();
                                                            const droppedUrl = e.dataTransfer.getData('text/plain');
                                                            if (droppedUrl && formData.images.includes(droppedUrl)) {
                                                                handleUpdate('mainImageUrl', droppedUrl);
                                                            }
                                                        }}
                                                    >
                                                        {formData.mainImageUrl ? (
                                                            <>
                                                                <img src={formData.mainImageUrl} className="w-full h-full object-cover animate-in fade-in zoom-in duration-700" alt="Main" />
                                                                <div className="absolute top-6 left-6 px-4 py-2 bg-red-500 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-xl">
                                                                    Ảnh bìa hiển thị
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <div className="text-center group">
                                                                <div className="w-20 h-20 bg-white rounded-[28px] flex items-center justify-center mx-auto mb-4 shadow-sm text-gray-200 group-hover:text-red-200 transition-colors">
                                                                    <ImageIcon className="w-10 h-10" />
                                                                </div>
                                                                <p className="font-black text-xs text-gray-400 uppercase tracking-widest">Kéo ảnh vào đây để làm ảnh bìa</p>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="grid grid-cols-4 gap-4">
                                                        {formData.images.map((img, i) => (
                                                            <div
                                                                key={i}
                                                                className={`aspect-square relative rounded-[24px] overflow-hidden group cursor-grab active:cursor-grabbing transition-all duration-300 ${
                                                                    formData.mainImageUrl === img ? 'ring-4 ring-red-500 ring-offset-4 shadow-xl scale-95' : 'hover:scale-105 shadow-md'
                                                                }`}
                                                                draggable
                                                                onDragStart={(e) => e.dataTransfer.setData('text/plain', img)}
                                                            >
                                                                <img src={img} className="w-full h-full object-cover" alt="Space" />
                                                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                                
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => { e.stopPropagation(); removeImage(i); }}
                                                                    className="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur-md text-red-500 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white shadow-lg"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>

                                                                {formData.mainImageUrl === img && (
                                                                    <div className="absolute bottom-2 inset-x-2 bg-red-500/90 backdrop-blur-sm text-white text-[8px] font-black uppercase text-center py-1 rounded-lg">
                                                                        Đang chọn
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                        
                                                        {formData.images.length === 0 && (
                                                            <div className="col-span-4 py-12 flex flex-col items-center justify-center opacity-10 grayscale">
                                                                <ImageIcon className="w-20 h-20 mb-4" />
                                                                <p className="font-black text-xs uppercase tracking-[0.3em]">Thư viện ảnh trống</p>
                                                            </div>
                                                        )}
                                                    </div>
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
