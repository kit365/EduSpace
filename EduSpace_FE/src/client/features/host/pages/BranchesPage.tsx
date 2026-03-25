import { FormEvent, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
    Plus,
    Building2,
    MapPin,
    Search,
    ArrowUpDown,
    SlidersHorizontal,
    LayoutGrid,
    List,
    Mail,
    Phone,
    Loader2,
    Upload,
    ImageIcon,
    CheckCircle,
    Clock,
    XCircle,
    Ban,
    Edit2,
    Trash2,
} from 'lucide-react';
import { RentalLayout } from '../../../layouts/RentalLayout';
import { hostPartnerApplicationService } from '../services/hostPartnerApplicationService';
import { showToast } from '@/utils/toast';
import { getApiErrorMessage } from '@/utils/apiError';
import { branchService, BranchApprovalStatus, HostBranch } from '../services/branchService';
import { useBranch } from '../context/BranchContext';
import { profileService } from '@/client/features/customer/profile/services/profileService';
import { useTranslation } from 'react-i18next';
import { addressService } from '@/client/features/customer/profile/services/addressService';
import { uploadBranchLogoImage } from '../services/mediaUploadService';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

const PROPERTY_TYPE_OPTIONS = [
    { value: 'COMMERCIAL_BUILDING', labelKey: 'common.propertyTypes.commercialBuilding' },
    { value: 'CENTER_COWORKING', labelKey: 'common.propertyTypes.centerCoworking' },
    { value: 'INDEPENDENT_SPACE', labelKey: 'common.propertyTypes.independentSpace' },
] as const;

type BranchFilter = 'ALL' | 'VERIFIED' | 'PENDING' | 'REJECTED';
type BranchViewMode = 'grid' | 'list';
type BranchSortBy = 'newest' | 'oldest' | 'nameAsc' | 'nameDesc';
type BranchExtraFilter = 'all' | 'pendingUpdate' | 'hasLogo';

/** Bộ lọc trạng thái — cùng pattern UI với trang Trạng thái phòng */
const BRANCH_FILTER_ITEMS: {
    key: BranchFilter;
    label: string;
    color: string;
    bg: string;
}[] = [
    { key: 'ALL', label: 'Tất cả', color: 'text-gray-600', bg: 'bg-gray-50' },
    { key: 'VERIFIED', label: 'Đã duyệt', color: 'text-green-600', bg: 'bg-green-50' },
    { key: 'PENDING', label: 'Chờ duyệt', color: 'text-amber-600', bg: 'bg-amber-50' },
    { key: 'REJECTED', label: 'Từ chối', color: 'text-red-600', bg: 'bg-red-50' },
];

/** Giao diện thẻ — đồng bộ với RoomStatusPage (badge + border + hero) */
const BRANCH_CARD_STATUS: Record<
    BranchApprovalStatus,
    { labelVi: string; icon: ReactNode; color: string; bg: string; border: string }
> = {
    VERIFIED: {
        labelVi: 'Đã duyệt',
        icon: <CheckCircle className="w-5 h-5" />,
        color: 'text-green-600',
        bg: 'bg-green-50',
        border: 'border-green-200',
    },
    PENDING: {
        labelVi: 'Chờ duyệt',
        icon: <Clock className="w-5 h-5" />,
        color: 'text-amber-600',
        bg: 'bg-amber-50',
        border: 'border-amber-200',
    },
    REJECTED: {
        labelVi: 'Từ chối',
        icon: <XCircle className="w-5 h-5" />,
        color: 'text-red-600',
        bg: 'bg-red-50',
        border: 'border-red-200',
    },
    BANNED: {
        labelVi: 'Bị khóa',
        icon: <Ban className="w-5 h-5" />,
        color: 'text-gray-600',
        bg: 'bg-gray-100',
        border: 'border-gray-200',
    },
};

function branchCardStatus(branch: HostBranch) {
    return BRANCH_CARD_STATUS[branch.rawStatus] ?? BRANCH_CARD_STATUS.BANNED;
}

function isLikelyImageUrl(url: string | undefined): boolean {
    if (!url?.trim()) return false;
    const u = url.trim().toLowerCase();
    return u.startsWith('http://') || u.startsWith('https://') || u.startsWith('data:');
}

function formatBranchDate(iso: string | null | undefined): string {
    if (!iso) return '—';
    try {
        return new Date(iso).toLocaleString('vi-VN');
    } catch {
        return '—';
    }
}

export function BranchesPage() {
    const { t } = useTranslation();
    const { refreshBranches } = useBranch();
    const [branches, setBranches] = useState<HostBranch[]>([]);
    const [loadingBranches, setLoadingBranches] = useState(false);
    const [pendingUpdatePropertyIds, setPendingUpdatePropertyIds] = useState<Set<number>>(new Set());
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<BranchFilter>('ALL');
    const [viewMode, setViewMode] = useState<BranchViewMode>('grid');
    const [sortBy, setSortBy] = useState<BranchSortBy>('newest');
    const [extraFilter, setExtraFilter] = useState<BranchExtraFilter>('all');
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
    const [savingBranch, setSavingBranch] = useState(false);
    const [deletingBranchId, setDeletingBranchId] = useState<number | null>(null);
    const [showBranchForm, setShowBranchForm] = useState(false);
    const [editingBranchId, setEditingBranchId] = useState<number | null>(null);
    const [branchForm, setBranchForm] = useState({
        name: '',
        propertyType: 'INDEPENDENT_SPACE',
        address: '',
        provinceCode: '',
        districtCode: '',
        wardCode: '',
        logo: '',
        phone: '',
        email: '',
        description: '',
    });
    const [provinces, setProvinces] = useState<{ code: number; name: string }[]>([]);
    const [districts, setDistricts] = useState<{ code: number; name: string }[]>([]);
    const [wards, setWards] = useState<{ code: number; name: string }[]>([]);
    const [loadingProvinces, setLoadingProvinces] = useState(false);
    const [loadingDistricts, setLoadingDistricts] = useState(false);
    const [loadingWards, setLoadingWards] = useState(false);
    const toolbarRef = useRef<HTMLDivElement | null>(null);
    const filterMenuRef = useRef<HTMLDivElement | null>(null);
    const branchLogoFileInputRef = useRef<HTMLInputElement | null>(null);
    const [uploadingBranchLogo, setUploadingBranchLogo] = useState(false);

    const provinceCodeNum = branchForm.provinceCode ? Number(branchForm.provinceCode) : undefined;
    const districtCodeNum = branchForm.districtCode ? Number(branchForm.districtCode) : undefined;

    const filteredBranches = useMemo(() => {
        const q = searchTerm.trim().toLowerCase();
        const list = branches.filter((b) => {
            const passesStatus = statusFilter === 'ALL' || b.rawStatus === statusFilter;
            const passesSearch =
                q.length === 0 || b.name.toLowerCase().includes(q) || b.address.toLowerCase().includes(q);
            const passesExtra =
                extraFilter === 'all' ||
                (extraFilter === 'pendingUpdate' && pendingUpdatePropertyIds.has(b.id)) ||
                (extraFilter === 'hasLogo' && isLikelyImageUrl(b.logo));
            return passesStatus && passesSearch && passesExtra;
        });

        const sorted = [...list].sort((a, b) => {
            if (sortBy === 'nameAsc') return a.name.localeCompare(b.name, 'vi');
            if (sortBy === 'nameDesc') return b.name.localeCompare(a.name, 'vi');
            const aTime = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
            const bTime = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
            return sortBy === 'oldest' ? aTime - bTime : bTime - aTime;
        });

        return sorted;
    }, [branches, searchTerm, statusFilter, extraFilter, pendingUpdatePropertyIds, sortBy]);

    const sortLabelMap: Record<BranchSortBy, string> = {
        newest: 'Mới nhất',
        oldest: 'Cũ nhất',
        nameAsc: 'Tên A → Z',
        nameDesc: 'Tên Z → A',
    };

    const extraFilterLabelMap: Record<BranchExtraFilter, string> = {
        all: 'Mọi cơ sở',
        pendingUpdate: 'Đang chờ duyệt cập nhật',
        hasLogo: 'Có logo',
    };

    const cycleSortBy = () => {
        const order: BranchSortBy[] = ['newest', 'oldest', 'nameAsc', 'nameDesc'];
        const idx = order.indexOf(sortBy);
        const next = order[(idx + 1) % order.length];
        setSortBy(next);
    };

    const statusCounts = useMemo(
        () => ({
            ALL: branches.length,
            VERIFIED: branches.filter((b) => b.rawStatus === 'VERIFIED').length,
            PENDING: branches.filter((b) => b.rawStatus === 'PENDING').length,
            REJECTED: branches.filter((b) => b.rawStatus === 'REJECTED').length,
        }),
        [branches]
    );

    const loadBranches = useCallback(async () => {
        setLoadingBranches(true);
        try {
            const user = await profileService.getProfile();
            const [list, pendingUpdates] = await Promise.all([
                branchService.listByOwner(user.id),
                hostPartnerApplicationService.getMyPendingBranchUpdates(),
            ]);
            setBranches(list);
            setPendingUpdatePropertyIds(new Set(pendingUpdates.map((item) => item.propertyId).filter((id) => Number.isFinite(id))));
        } catch (error) {
            setBranches([]);
            setPendingUpdatePropertyIds(new Set());
            showToast.error(getApiErrorMessage(error, 'Không tải được danh sách cơ sở từ backend.'));
        } finally {
            setLoadingBranches(false);
        }
    }, []);

    useEffect(() => {
        void loadBranches();
    }, [loadBranches]);

    useEffect(() => {
        void (async () => {
            setLoadingProvinces(true);
            try {
                const data = await addressService.getProvinces();
                setProvinces(data);
            } finally {
                setLoadingProvinces(false);
            }
        })();
    }, []);

    useEffect(() => {
        if (!provinceCodeNum) {
            setDistricts([]);
            setWards([]);
            return;
        }
        void (async () => {
            setLoadingDistricts(true);
            try {
                const data = await addressService.getDistricts(provinceCodeNum);
                setDistricts(data);
            } finally {
                setLoadingDistricts(false);
            }
        })();
    }, [provinceCodeNum]);

    useEffect(() => {
        if (!districtCodeNum) {
            setWards([]);
            return;
        }
        void (async () => {
            setLoadingWards(true);
            try {
                const data = await addressService.getWards(districtCodeNum);
                setWards(data);
            } finally {
                setLoadingWards(false);
            }
        })();
    }, [districtCodeNum]);

    useEffect(() => {
        const onClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            if (filterMenuRef.current && !filterMenuRef.current.contains(target)) {
                setIsFilterMenuOpen(false);
            }
            if (toolbarRef.current && !toolbarRef.current.contains(target)) {
                setIsSearchOpen(false);
            }
        };

        document.addEventListener('mousedown', onClickOutside);
        return () => document.removeEventListener('mousedown', onClickOutside);
    }, []);

    const canSaveBranch =
        branchForm.name.trim() &&
        branchForm.propertyType.trim() &&
        branchForm.address.trim() &&
        branchForm.phone.trim() &&
        branchForm.email.trim();

    const openCreateBranch = () => {
        setEditingBranchId(null);
        setBranchForm({
            name: '',
            propertyType: 'INDEPENDENT_SPACE',
            address: '',
            provinceCode: '',
            districtCode: '',
            wardCode: '',
            logo: '',
            phone: '',
            email: '',
            description: '',
        });
        setShowBranchForm(true);
    };

    const openEditBranch = (branch: HostBranch) => {
        setEditingBranchId(branch.id);
        setBranchForm({
            name: branch.name,
            propertyType: branch.propertyType || 'INDEPENDENT_SPACE',
            address: branch.address,
            provinceCode: branch.provinceCode,
            districtCode: branch.districtCode,
            wardCode: branch.wardCode,
            logo: branch.logo,
            phone: branch.phone,
            email: branch.email,
            description: branch.manager,
        });
        setShowBranchForm(true);
    };

    const removeBranch = async (branch: HostBranch) => {
        const confirmed = window.confirm(
            `Ẩn chi nhánh "${branch.name}" khỏi danh sách?\n(Dữ liệu được giữ trong hệ thống — xóa mềm.)`
        );
        if (!confirmed) return;
        setDeletingBranchId(branch.id);
        try {
            await branchService.remove(branch.id);
            showToast.success('Đã ẩn chi nhánh khỏi danh sách (xóa mềm).');
            await Promise.all([refreshBranches(), loadBranches()]);
        } catch (error) {
            showToast.error(getApiErrorMessage(error, 'Không thực hiện được thao tác.'));
        } finally {
            setDeletingBranchId(null);
        }
    };

    const saveBranch = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!canSaveBranch || savingBranch) return;
        setSavingBranch(true);
        try {
            const profile = await profileService.getProfile();
            if (!profile?.id) {
                showToast.error('Không xác định được host hiện tại.');
                return;
            }
            const provinceName = provinces.find((p) => String(p.code) === branchForm.provinceCode)?.name;
            const districtName = districts.find((d) => String(d.code) === branchForm.districtCode)?.name;
            const wardName = wards.find((w) => String(w.code) === branchForm.wardCode)?.name;
            const fullAddress = [branchForm.address, wardName, districtName, provinceName]
                .filter(Boolean)
                .join(', ');

            if (editingBranchId) {
                const noteParts = [
                    'action=UPDATE',
                    `propertyId=${editingBranchId}`,
                    `propertyType=${branchForm.propertyType}`,
                    branchForm.provinceCode ? `provinceCode=${branchForm.provinceCode}` : '',
                    branchForm.districtCode ? `districtCode=${branchForm.districtCode}` : '',
                    branchForm.wardCode ? `wardCode=${branchForm.wardCode}` : '',
                    branchForm.description ? `description=${branchForm.description}` : '',
                    branchForm.logo ? `logo=${branchForm.logo}` : '',
                ].filter(Boolean);

                await hostPartnerApplicationService.submit({
                    applicantType: 'BRANCH',
                    fullName: branchForm.name.trim(),
                    phone: branchForm.phone.trim(),
                    email: branchForm.email.trim(),
                    address: fullAddress || branchForm.address.trim(),
                    message: noteParts.join(' | '),
                });
                showToast.success('Đã gửi yêu cầu cập nhật chi nhánh. Dữ liệu mới sẽ hiển thị sau khi admin duyệt.');
            } else {
                const noteParts = [
                    `propertyType=${branchForm.propertyType}`,
                    branchForm.provinceCode ? `provinceCode=${branchForm.provinceCode}` : '',
                    branchForm.districtCode ? `districtCode=${branchForm.districtCode}` : '',
                    branchForm.wardCode ? `wardCode=${branchForm.wardCode}` : '',
                    branchForm.description ? `description=${branchForm.description}` : '',
                    branchForm.logo ? `logo=${branchForm.logo}` : '',
                ].filter(Boolean);

                const created = await branchService.createIfNotExists({
                    ownerId: profile.id,
                    name: branchForm.name.trim(),
                    propertyType: branchForm.propertyType.trim(),
                    address: fullAddress || branchForm.address.trim(),
                    provinceCode: branchForm.provinceCode,
                    districtCode: branchForm.districtCode,
                    wardCode: branchForm.wardCode,
                    logo: branchForm.logo.trim(),
                    phone: branchForm.phone.trim(),
                    email: branchForm.email.trim(),
                    manager: branchForm.description.trim() || branchForm.name.trim(),
                });
                noteParts.push(`propertyId=${created.branch.id}`);

                await hostPartnerApplicationService.submit({
                    applicantType: 'BRANCH',
                    fullName: branchForm.name.trim(),
                    phone: branchForm.phone.trim(),
                    email: branchForm.email.trim(),
                    address: fullAddress || branchForm.address.trim(),
                    message: noteParts.join(' | '),
                });
                showToast.success('Đã gửi đăng ký chi nhánh. Admin duyệt xong sẽ hiển thị trong danh sách chi nhánh.');
            }
            setShowBranchForm(false);
            setEditingBranchId(null);
            await Promise.all([refreshBranches(), loadBranches()]);
        } catch (error) {
            showToast.error(
                getApiErrorMessage(
                    error,
                    editingBranchId ? 'Không gửi được yêu cầu cập nhật chi nhánh.' : 'Không gửi được đăng ký chi nhánh.'
                )
            );
        } finally {
            setSavingBranch(false);
        }
    };

    return (
        <RentalLayout title="Quản lý Cơ sở / Chi nhánh">
            <div className="w-full animate-in fade-in duration-500">
                {/* Header Actions */}
                <div className="mb-6 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                    <div>
                        <h2 className="mb-1 text-2xl font-black text-gray-900">Cơ sở hoạt động ({branches.length})</h2>
                        <p className="text-gray-500 text-sm">Dữ liệu lấy từ backend room-service.</p>
                    </div>
                    <button
                        onClick={openCreateBranch}
                        className="inline-flex h-10 items-center gap-2 rounded-xl bg-red-500 px-4 text-sm font-bold text-white shadow-md transition-all hover:bg-red-600 active:scale-95"
                    >
                        <Plus className="h-4 w-4" />
                        Thêm cơ sở mới
                    </button>
                </div>

                {/* Toolbar: status tabs (left) + controls (right) */}
                <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-3.5 shadow-sm" ref={toolbarRef}>
                    <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                        <div className="flex flex-wrap items-center gap-2">
                            {BRANCH_FILTER_ITEMS.map((item) => (
                                <button
                                    key={item.key}
                                    type="button"
                                    onClick={() => setStatusFilter(item.key)}
                                    className={`inline-flex h-9 cursor-pointer items-center rounded-lg border px-3 text-sm font-semibold transition ${
                                        statusFilter === item.key
                                            ? 'border-gray-300 bg-gray-100 text-gray-900'
                                            : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                                    }`}
                                >
                                    <span>{item.label}</span>
                                    <span className="ml-1.5 rounded-md bg-gray-100 px-1.5 py-0.5 text-[11px] font-bold text-gray-600">
                                        {statusCounts[item.key]}
                                    </span>
                                </button>
                            ))}
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <div className="relative flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsSearchOpen((prev) => !prev)}
                                    className={`inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border transition ${
                                        isSearchOpen || searchTerm
                                            ? 'border-gray-300 bg-gray-100 text-gray-900'
                                            : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                                    }`}
                                    title="Tìm kiếm"
                                    aria-label="Tìm kiếm"
                                >
                                    <Search className="h-4 w-4" />
                                </button>

                                {isSearchOpen && (
                                    <div className="w-64 sm:w-80">
                                        <input
                                            autoFocus
                                            type="text"
                                            placeholder="Tìm theo tên cơ sở, địa chỉ..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 outline-none"
                                        />
                                    </div>
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={cycleSortBy}
                                className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50"
                                title={`Sắp xếp: ${sortLabelMap[sortBy]} (bấm để đổi)`}
                                aria-label={`Sắp xếp hiện tại: ${sortLabelMap[sortBy]}. Bấm để đổi kiểu sắp xếp`}
                            >
                                <ArrowUpDown className="h-4 w-4" />
                            </button>

                            <div className="relative" ref={filterMenuRef}>
                                <button
                                    type="button"
                                    onClick={() => setIsFilterMenuOpen((prev) => !prev)}
                                    className={`inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border transition ${
                                        extraFilter !== 'all'
                                            ? 'border-gray-300 bg-gray-100 text-gray-900'
                                            : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                                    }`}
                                    title={`Bộ lọc: ${extraFilterLabelMap[extraFilter]}`}
                                    aria-label={`Bộ lọc hiện tại: ${extraFilterLabelMap[extraFilter]}`}
                                >
                                    <SlidersHorizontal className="h-4 w-4" />
                                </button>

                                {isFilterMenuOpen && (
                                    <div className="absolute left-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
                                        {(Object.keys(extraFilterLabelMap) as BranchExtraFilter[]).map((value) => (
                                            <button
                                                key={value}
                                                type="button"
                                                onClick={() => {
                                                    setExtraFilter(value);
                                                    setIsFilterMenuOpen(false);
                                                }}
                                                className={`flex w-full cursor-pointer items-center justify-between px-3 py-2 text-left text-sm font-semibold transition ${
                                                    extraFilter === value
                                                        ? 'bg-gray-100 text-gray-900'
                                                        : 'text-gray-600 hover:bg-gray-50'
                                                }`}
                                            >
                                                <span>{extraFilterLabelMap[value]}</span>
                                                {extraFilter === value ? <span>✓</span> : null}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="inline-flex h-9 items-center rounded-lg border border-gray-200 bg-white p-1">
                                <button
                                    type="button"
                                    onClick={() => setViewMode('grid')}
                                    className={`h-7 w-7 cursor-pointer rounded-md p-1 ${viewMode === 'grid' ? 'bg-gray-100 text-gray-900' : 'text-gray-500'}`}
                                    title="Dạng thẻ"
                                    aria-label="Hiển thị dạng thẻ"
                                >
                                    <LayoutGrid className="h-4 w-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setViewMode('list')}
                                    className={`h-7 w-7 cursor-pointer rounded-md p-1 ${viewMode === 'list' ? 'bg-gray-100 text-gray-900' : 'text-gray-500'}`}
                                    title="Dạng danh sách"
                                    aria-label="Hiển thị dạng danh sách"
                                >
                                    <List className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Branches */}
                {viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                        {loadingBranches && (
                            <div className="col-span-full flex justify-center py-10">
                                <Loader2 className="h-8 w-8 animate-spin text-red-500" />
                            </div>
                        )}
                        {filteredBranches.map((branch) => {
                            const cfg = branchCardStatus(branch);
                            const showLogo = isLikelyImageUrl(branch.logo);
                            return (
                                <div
                                    key={branch.id}
                                    className={`group overflow-hidden rounded-2xl border ${cfg.border} bg-white shadow-sm transition-all hover:shadow-md`}
                                >
                                    <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-slate-100 via-red-50/40 to-rose-50">
                                        {showLogo ? (
                                            <img
                                                src={branch.logo!.trim()}
                                                alt=""
                                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-700/90 via-slate-800 to-slate-900">
                                                <Building2 className="h-20 w-20 text-white/25" />
                                            </div>
                                        )}
                                        <div className={`absolute left-3 top-3 rounded-lg px-3 py-1.5 shadow-sm ${cfg.bg} ${cfg.color}`}>
                                            <div className="flex items-center gap-1.5 text-xs font-black">
                                                {cfg.icon}
                                                {cfg.labelVi}
                                            </div>
                                        </div>
                                        <div className="absolute right-2.5 top-2.5 z-10 flex gap-1.5">
                                            <button
                                                type="button"
                                                onClick={() => openEditBranch(branch)}
                                                className="rounded-lg bg-white/95 p-2 text-gray-600 shadow-md backdrop-blur-sm transition-all hover:bg-white hover:text-blue-600 active:scale-95"
                                                title="Chỉnh sửa"
                                            >
                                                <Edit2 className="h-3.5 w-3.5" />
                                            </button>
                                            <button
                                                type="button"
                                                disabled={deletingBranchId === branch.id}
                                                onClick={() => void removeBranch(branch)}
                                                className="rounded-lg bg-white/95 p-2 text-gray-600 shadow-md backdrop-blur-sm transition-all hover:bg-white hover:text-red-600 disabled:opacity-50 active:scale-95"
                                                title="Xóa"
                                            >
                                                {deletingBranchId === branch.id ? (
                                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                ) : (
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="p-5">
                                        <h3 className="mb-2.5 line-clamp-2 text-lg font-black text-gray-900" title={branch.name}>
                                            {branch.name}
                                        </h3>

                                        <div className="mb-4 space-y-2.5 rounded-xl border border-gray-100/80 bg-gray-50 p-3">
                                            <div className="flex items-start gap-2 text-sm text-gray-700">
                                                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                                                <span className="line-clamp-3 font-medium leading-snug">{branch.address}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-700">
                                                <Phone className="h-4 w-4 shrink-0 text-gray-400" />
                                                <span className="font-medium">{branch.phone}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-700">
                                                <Mail className="h-4 w-4 shrink-0 text-gray-400" />
                                                <span className="truncate font-medium" title={branch.email}>
                                                    {branch.email}
                                                </span>
                                            </div>
                                        </div>

                                        {pendingUpdatePropertyIds.has(branch.id) ? (
                                            <div className="mb-4 rounded-xl border border-blue-100 bg-blue-50 p-3">
                                                <p className="text-xs font-bold text-blue-700">Đang chờ duyệt cập nhật</p>
                                                <p className="mt-1 text-xs font-medium text-blue-500">
                                                    Thay đổi sẽ hiển thị sau khi admin xét duyệt.
                                                </p>
                                            </div>
                                        ) : null}

                                        {branch.manager ? (
                                            <p className="mb-4 line-clamp-2 text-xs font-medium italic text-gray-500">
                                                📝 {branch.manager}
                                            </p>
                                        ) : null}

                                        <div className="mb-3 text-[10px] font-bold text-gray-300">
                                            Gửi: {formatBranchDate(branch.submittedAt)} · Duyệt: {formatBranchDate(branch.approvedAt)}
                                        </div>

                                        {branch.rejectionNote ? (
                                            <p className="rounded-xl border border-red-100 bg-red-50 px-2.5 py-2 text-xs font-medium text-red-700">
                                                Lý do từ chối: {branch.rejectionNote}
                                            </p>
                                        ) : null}
                                    </div>
                                </div>
                            );
                        })}

                        {!loadingBranches && (
                            <button
                                type="button"
                                onClick={openCreateBranch}
                                className="group flex h-full min-h-[280px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 text-gray-400 shadow-sm transition-all hover:border-red-200 hover:bg-red-50/50 hover:text-red-500 hover:shadow-md md:min-h-[320px]"
                            >
                                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-50 transition-colors group-hover:bg-white">
                                    <Plus className="h-5 w-5" />
                                </div>
                                <span className="text-sm font-black text-gray-900">Thêm cơ sở</span>
                                <span className="mt-1 px-6 text-center text-xs font-medium text-gray-500">
                                    Mở rộng mạng lưới điểm dạy của bạn
                                </span>
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {loadingBranches && (
                            <div className="flex justify-center py-10">
                                <Loader2 className="h-8 w-8 animate-spin text-red-500" />
                            </div>
                        )}

                        {filteredBranches.map((branch) => {
                            const cfg = branchCardStatus(branch);
                            return (
                                <div
                                    key={branch.id}
                                    className={`rounded-xl border ${cfg.border} bg-white p-3.5 shadow-sm transition hover:shadow-md`}
                                >
                                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                        <div className="min-w-0">
                                            <div className="mb-1.5 flex flex-wrap items-center gap-2">
                                                <h3 className="text-sm font-black text-gray-900">{branch.name}</h3>
                                                <span className={`inline-flex items-center gap-1 rounded-lg px-1.5 py-0.5 text-[11px] font-bold ${cfg.bg} ${cfg.color}`}>
                                                    {cfg.icon}
                                                    {cfg.labelVi}
                                                </span>
                                            </div>
                                            <div className="space-y-1 text-xs text-gray-600">
                                                <p className="line-clamp-1">📍 {branch.address}</p>
                                                <p>📞 {branch.phone}</p>
                                                <p className="truncate">✉️ {branch.email}</p>
                                            </div>
                                            <p className="mt-1.5 text-[10px] font-semibold text-gray-400">
                                                Gửi: {formatBranchDate(branch.submittedAt)} · Duyệt: {formatBranchDate(branch.approvedAt)}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-2 self-start">
                                            {pendingUpdatePropertyIds.has(branch.id) ? (
                                                <span className="rounded-lg bg-blue-50 px-2 py-1 text-[11px] font-bold text-blue-700">
                                                    Chờ duyệt cập nhật
                                                </span>
                                            ) : null}
                                            <button
                                                type="button"
                                                onClick={() => openEditBranch(branch)}
                                                className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-blue-600"
                                                title="Chỉnh sửa"
                                            >
                                                <Edit2 className="h-3.5 w-3.5" />
                                            </button>
                                            <button
                                                type="button"
                                                disabled={deletingBranchId === branch.id}
                                                onClick={() => void removeBranch(branch)}
                                                className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-red-600 disabled:opacity-50"
                                                title="Xóa"
                                            >
                                                {deletingBranchId === branch.id ? (
                                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                ) : (
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {branch.rejectionNote ? (
                                        <p className="mt-2.5 rounded-xl border border-red-100 bg-red-50 px-2.5 py-2 text-xs font-medium text-red-700">
                                            Lý do từ chối: {branch.rejectionNote}
                                        </p>
                                    ) : null}
                                </div>
                            );
                        })}

                        {!loadingBranches && (
                            <button
                                type="button"
                                onClick={openCreateBranch}
                                className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 px-4 py-4 text-xs font-bold text-gray-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                            >
                                <Plus className="h-3.5 w-3.5" />
                                Thêm cơ sở mới
                            </button>
                        )}
                    </div>
                )}


                {!loadingBranches && filteredBranches.length === 0 ? (
                    <div className="mt-4 rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center">
                        <p className="text-sm font-semibold text-gray-500">Không có cơ sở phù hợp với bộ lọc hiện tại.</p>
                    </div>
                ) : null}

                <Dialog open={showBranchForm} onOpenChange={(open) => {
                    if (!open) {
                        setShowBranchForm(false);
                        setEditingBranchId(null);
                    }
                }}>
                    <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-black text-gray-900">
                                {editingBranchId ? 'Cập nhật chi nhánh' : 'Gửi đăng ký chi nhánh'}
                            </DialogTitle>
                            <DialogDescription className="text-sm text-gray-500">
                                {editingBranchId
                                    ? 'Thay đổi sẽ được gửi cho admin duyệt. Dữ liệu hiển thị sau khi được xét duyệt.'
                                    : 'Thông tin sẽ được gửi cho admin duyệt. Sau khi duyệt, chi nhánh sẽ hiển thị trong danh sách của bạn.'}
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={saveBranch} className="space-y-4 py-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="branch-name" className="text-xs font-bold uppercase tracking-wider text-gray-500">
                                        Tên chi nhánh <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="branch-name"
                                        placeholder="Nhập tên chi nhánh..."
                                        value={branchForm.name}
                                        onChange={(e) => setBranchForm((prev) => ({ ...prev, name: e.target.value }))}
                                        className="h-11 rounded-xl"
                                        required
                                    />
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="property-type" className="text-xs font-bold uppercase tracking-wider text-gray-500">
                                        Loại mặt bằng <span className="text-red-500">*</span>
                                    </Label>
                                    <Select
                                        value={branchForm.propertyType}
                                        onValueChange={(val) => setBranchForm((prev) => ({ ...prev, propertyType: val }))}
                                    >
                                        <SelectTrigger id="property-type" className="h-11 rounded-xl">
                                            <SelectValue placeholder="Chọn loại mặt bằng" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {PROPERTY_TYPE_OPTIONS.map((opt) => (
                                                <SelectItem key={opt.value} value={opt.value}>
                                                    {t(opt.labelKey)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-wider text-gray-500">
                                        Số điện thoại <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        placeholder="09xx xxx xxx"
                                        value={branchForm.phone}
                                        onChange={(e) => setBranchForm((prev) => ({ ...prev, phone: e.target.value }))}
                                        className="h-11 rounded-xl"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-gray-500">
                                        Email liên hệ <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="example@email.com"
                                        value={branchForm.email}
                                        onChange={(e) => setBranchForm((prev) => ({ ...prev, email: e.target.value }))}
                                        className="h-11 rounded-xl"
                                        required
                                    />
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="address" className="text-xs font-bold uppercase tracking-wider text-gray-500">
                                        Địa chỉ cụ thể <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="address"
                                        placeholder="Số nhà, tên đường..."
                                        value={branchForm.address}
                                        onChange={(e) => setBranchForm((prev) => ({ ...prev, address: e.target.value }))}
                                        className="h-11 rounded-xl"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="province" className="text-xs font-bold uppercase tracking-wider text-gray-500">
                                        Tỉnh/Thành phố
                                    </Label>
                                    <Select
                                        value={branchForm.provinceCode}
                                        onValueChange={(val) =>
                                            setBranchForm((prev) => ({
                                                ...prev,
                                                provinceCode: val,
                                                districtCode: '',
                                                wardCode: '',
                                            }))
                                        }
                                        disabled={loadingProvinces}
                                    >
                                        <SelectTrigger id="province" className="h-11 rounded-xl">
                                            <SelectValue placeholder={loadingProvinces ? 'Đang tải...' : 'Chọn Tỉnh/Thành phố'} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {provinces.map((p) => (
                                                <SelectItem key={p.code} value={String(p.code)}>
                                                    {p.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="district" className="text-xs font-bold uppercase tracking-wider text-gray-500">
                                        Quận/Huyện
                                    </Label>
                                    <Select
                                        value={branchForm.districtCode}
                                        onValueChange={(val) =>
                                            setBranchForm((prev) => ({
                                                ...prev,
                                                districtCode: val,
                                                wardCode: '',
                                            }))
                                        }
                                        disabled={!branchForm.provinceCode || loadingDistricts}
                                    >
                                        <SelectTrigger id="district" className="h-11 rounded-xl">
                                            <SelectValue placeholder={loadingDistricts ? 'Đang tải...' : 'Chọn Quận/Huyện'} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {districts.map((d) => (
                                                <SelectItem key={d.code} value={String(d.code)}>
                                                    {d.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="ward" className="text-xs font-bold uppercase tracking-wider text-gray-500">
                                        Phường/Xã
                                    </Label>
                                    <Select
                                        value={branchForm.wardCode}
                                        onValueChange={(val) => setBranchForm((prev) => ({ ...prev, wardCode: val }))}
                                        disabled={!branchForm.districtCode || loadingWards}
                                    >
                                        <SelectTrigger id="ward" className="h-11 rounded-xl">
                                            <SelectValue placeholder={loadingWards ? 'Đang tải...' : 'Chọn Phường/Xã'} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {wards.map((w) => (
                                                <SelectItem key={w.code} value={String(w.code)}>
                                                    {w.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-4 md:col-span-2">
                                    <Label className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 ml-1">
                                        Hình ảnh chi nhánh
                                    </Label>
                                    <div 
                                        onClick={() => branchLogoFileInputRef.current?.click()}
                                        className={`relative aspect-[16/6] rounded-[24px] border-2 border-dashed transition-all cursor-pointer group overflow-hidden flex flex-col items-center justify-center gap-3 ${
                                            branchForm.logo 
                                                ? 'border-red-100 bg-red-50/30' 
                                                : 'border-gray-200 bg-gray-50 hover:border-red-300 hover:bg-red-50/50'
                                        }`}
                                    >
                                        {branchForm.logo ? (
                                            <>
                                                <img 
                                                    src={branchForm.logo} 
                                                    alt="Branch Logo" 
                                                    className="absolute inset-0 w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500" 
                                                />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 backdrop-blur-[2px]">
                                                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-red-500 shadow-xl">
                                                        <ImageIcon className="w-5 h-5" />
                                                    </div>
                                                    <span className="text-white text-xs font-black tracking-widest uppercase">Thay đổi hình ảnh</span>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-gray-400 group-hover:text-red-500 shadow-sm transition-colors">
                                                    {uploadingBranchLogo ? <Loader2 className="w-6 h-6 animate-spin" /> : <Upload className="w-6 h-6" />}
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-sm font-black text-gray-900 mb-0.5">Tải ảnh cơ sở lên Cloud</p>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Kích thước khuyên dùng: 512x512</p>
                                                </div>
                                            </>
                                        )}

                                        <input
                                            ref={branchLogoFileInputRef}
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (!file) return;
                                                if (!file.type.startsWith('image/')) {
                                                    showToast.error('Vui lòng chọn file ảnh (JPEG, PNG, WebP...).');
                                                    return;
                                                }
                                                setUploadingBranchLogo(true);
                                                try {
                                                    const url = await uploadBranchLogoImage(file);
                                                    setBranchForm((prev) => ({ ...prev, logo: url }));
                                                    showToast.success('Đã tải hình ảnh lên thành công.');
                                                } catch (err) {
                                                    showToast.error(getApiErrorMessage(err, 'Không tải được hình ảnh.'));
                                                } finally {
                                                    setUploadingBranchLogo(false);
                                                    e.target.value = '';
                                                }
                                            }}
                                        />
                                    </div>
                                    <p className="text-[10px] text-gray-400 font-bold leading-relaxed px-1">
                                        Ảnh sẽ được lưu vĩnh viễn trên Cloud EduSpace. Bạn cũng có thể kéo thả ảnh trực tiếp vào khu vực này.
                                    </p>
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="description" className="text-xs font-bold uppercase tracking-wider text-gray-500">
                                        Mô tả (tuỳ chọn)
                                    </Label>
                                    <Textarea
                                        id="description"
                                        placeholder="Giới thiệu ngắn gọn về chi nhánh..."
                                        value={branchForm.description}
                                        onChange={(e) => setBranchForm((prev) => ({ ...prev, description: e.target.value }))}
                                        className="min-h-24 rounded-xl px-4 py-3"
                                    />
                                </div>
                            </div>

                            <DialogFooter className="mt-4 gap-2 border-t pt-6">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setShowBranchForm(false);
                                        setEditingBranchId(null);
                                    }}
                                    className="h-11 rounded-xl px-8 font-bold"
                                >
                                    Hủy
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={!canSaveBranch || savingBranch}
                                    className="h-11 min-w-32 rounded-xl px-8 font-bold"
                                >
                                    {savingBranch ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    {editingBranchId ? 'Lưu thay đổi' : 'Gửi đăng ký'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

            </div>
        </RentalLayout>
    );
}
