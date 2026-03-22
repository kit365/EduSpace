import { FormEvent, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
    Plus,
    Building2,
    MapPin,
    Search,
    Mail,
    Phone,
    Loader2,
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

const PROPERTY_TYPE_OPTIONS = [
    { value: 'COMMERCIAL_BUILDING', labelKey: 'common.propertyTypes.commercialBuilding' },
    { value: 'CENTER_COWORKING', labelKey: 'common.propertyTypes.centerCoworking' },
    { value: 'INDEPENDENT_SPACE', labelKey: 'common.propertyTypes.independentSpace' },
] as const;

type BranchFilter = 'ALL' | 'VERIFIED' | 'PENDING' | 'REJECTED';

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

    const provinceCodeNum = branchForm.provinceCode ? Number(branchForm.provinceCode) : undefined;
    const districtCodeNum = branchForm.districtCode ? Number(branchForm.districtCode) : undefined;

    const filteredBranches = useMemo(
        () =>
            branches.filter(
                (b) =>
                    (statusFilter === 'ALL' || b.rawStatus === statusFilter) &&
                    (b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        b.address.toLowerCase().includes(searchTerm.toLowerCase()))
            ),
        [branches, searchTerm, statusFilter]
    );

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
            const [list, pendingUpdates] = await Promise.all([
                branchService.listAll(),
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
            <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
                {/* Header Actions */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 mb-1">Cơ sở hoạt động ({branches.length})</h2>
                        <p className="text-gray-500 text-sm">Dữ liệu lấy từ backend room-service.</p>
                    </div>
                    <button
                        onClick={openCreateBranch}
                        className="flex items-center gap-2 bg-red-500 text-white px-6 py-3 rounded-xl font-bold shadow-md hover:bg-red-600 transition-all active:scale-95"
                    >
                        <Plus className="w-5 h-5" />
                        Thêm cơ sở mới
                    </button>
                </div>

                {/* Search Bar */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-8 flex items-center gap-4">
                    <div className="flex-1 relative">
                        <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm tên cơ sở, địa chỉ..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-red-500/20 font-medium outline-none"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                    {BRANCH_FILTER_ITEMS.map((item) => (
                        <button
                            key={item.key}
                            type="button"
                            onClick={() => setStatusFilter(item.key)}
                            className={`p-4 rounded-2xl transition-all text-center ${
                                statusFilter === item.key ? 'ring-2 ring-gray-900 shadow-lg' : 'hover:shadow-md'
                            } ${item.bg}`}
                        >
                            <div className={`text-2xl font-black ${item.color}`}>
                                {statusCounts[item.key]}
                            </div>
                            <div className="text-xs font-bold text-gray-500 mt-1">{item.label}</div>
                        </button>
                    ))}
                </div>

                {/* Branches Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                                className={`bg-white rounded-3xl border ${cfg.border} overflow-hidden shadow-sm hover:shadow-lg transition-all group`}
                            >
                                <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-slate-100 via-red-50/40 to-rose-50">
                                    {showLogo ? (
                                        <img
                                            src={branch.logo!.trim()}
                                            alt=""
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-700/90 via-slate-800 to-slate-900">
                                            <Building2 className="w-20 h-20 text-white/25" />
                                        </div>
                                    )}
                                    <div className={`absolute top-4 left-4 ${cfg.bg} ${cfg.color} px-4 py-2 rounded-xl shadow-sm`}>
                                        <div className="flex items-center gap-2 font-black text-sm">
                                            {cfg.icon}
                                            {cfg.labelVi}
                                        </div>
                                    </div>
                                    <div className="absolute top-3 right-3 flex gap-1.5 z-10">
                                        <button
                                            type="button"
                                            onClick={() => openEditBranch(branch)}
                                            className="p-2.5 rounded-xl bg-white/95 text-gray-600 hover:text-blue-600 hover:bg-white shadow-md backdrop-blur-sm transition-all active:scale-95"
                                            title="Chỉnh sửa"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            type="button"
                                            disabled={deletingBranchId === branch.id}
                                            onClick={() => void removeBranch(branch)}
                                            className="p-2.5 rounded-xl bg-white/95 text-gray-600 hover:text-red-600 hover:bg-white shadow-md backdrop-blur-sm transition-all disabled:opacity-50 active:scale-95"
                                            title="Xóa"
                                        >
                                            {deletingBranchId === branch.id ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Trash2 className="w-4 h-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <h3 className="text-lg font-black text-gray-900 mb-3 line-clamp-2" title={branch.name}>
                                        {branch.name}
                                    </h3>

                                    <div className="bg-gray-50 rounded-xl p-3 space-y-2.5 mb-4 border border-gray-100/80">
                                        <div className="flex items-start gap-2.5 text-sm text-gray-700">
                                            <MapPin className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                                            <span className="line-clamp-3 font-medium leading-snug">{branch.address}</span>
                                        </div>
                                        <div className="flex items-center gap-2.5 text-sm text-gray-700">
                                            <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                                            <span className="font-medium">{branch.phone}</span>
                                        </div>
                                        <div className="flex items-center gap-2.5 text-sm text-gray-700">
                                            <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                                            <span className="truncate font-medium" title={branch.email}>
                                                {branch.email}
                                            </span>
                                        </div>
                                    </div>

                                    {pendingUpdatePropertyIds.has(branch.id) ? (
                                        <div className="bg-blue-50 rounded-xl p-3 mb-4 border border-blue-100">
                                            <p className="text-xs font-bold text-blue-700">Đang chờ duyệt cập nhật</p>
                                            <p className="text-xs font-medium text-blue-500 mt-1">
                                                Thay đổi sẽ hiển thị sau khi admin xét duyệt.
                                            </p>
                                        </div>
                                    ) : null}

                                    {branch.manager ? (
                                        <p className="text-xs font-medium text-gray-500 mb-4 italic line-clamp-2">
                                            📝 {branch.manager}
                                        </p>
                                    ) : null}

                                    <div className="text-[10px] font-bold text-gray-300 mb-4">
                                        Gửi: {formatBranchDate(branch.submittedAt)} · Duyệt: {formatBranchDate(branch.approvedAt)}
                                    </div>

                                    {branch.rejectionNote ? (
                                        <p className="text-xs rounded-xl bg-red-50 border border-red-100 px-3 py-2.5 text-red-700 font-medium">
                                            Lý do từ chối: {branch.rejectionNote}
                                        </p>
                                    ) : null}
                                </div>
                            </div>
                        );
                    })}

                    {/* Empty State Add Button */}
                    {!loadingBranches && (
                        <button
                            type="button"
                            onClick={openCreateBranch}
                            className="border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center h-full min-h-[320px] md:min-h-[380px] text-gray-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50/50 transition-all group shadow-sm hover:shadow-md"
                        >
                            <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-white transition-colors">
                                <Plus className="w-6 h-6" />
                            </div>
                            <span className="font-black text-gray-900">Thêm cơ sở</span>
                            <span className="text-sm mt-1 px-6 text-center text-gray-500 font-medium">
                                Mở rộng mạng lưới điểm dạy của bạn
                            </span>
                        </button>
                    )}
                </div>

                {showBranchForm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
                        <form onSubmit={saveBranch} className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl">
                            <h3 className="text-xl font-black text-gray-900">
                                {editingBranchId ? 'Cập nhật chi nhánh' : 'Gửi đăng ký chi nhánh'}
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                                {editingBranchId
                                    ? 'Thay đổi sẽ được gửi cho admin duyệt. Dữ liệu hiển thị sau khi được xét duyệt.'
                                    : 'Thông tin sẽ được gửi cho admin duyệt. Sau khi duyệt, chi nhánh sẽ hiển thị trong danh sách của bạn.'}
                            </p>
                            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                                <input
                                    type="text"
                                    placeholder="Tên chi nhánh"
                                    value={branchForm.name}
                                    onChange={(e) => setBranchForm((prev) => ({ ...prev, name: e.target.value }))}
                                    className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm md:col-span-2"
                                />
                                <select
                                    value={branchForm.propertyType}
                                    onChange={(e) => setBranchForm((prev) => ({ ...prev, propertyType: e.target.value }))}
                                    className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm md:col-span-2"
                                >
                                    {PROPERTY_TYPE_OPTIONS.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {t(opt.labelKey)}
                                        </option>
                                    ))}
                                </select>
                                <input
                                    type="text"
                                    placeholder="Số điện thoại"
                                    value={branchForm.phone}
                                    onChange={(e) => setBranchForm((prev) => ({ ...prev, phone: e.target.value }))}
                                    className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm"
                                />
                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={branchForm.email}
                                    onChange={(e) => setBranchForm((prev) => ({ ...prev, email: e.target.value }))}
                                    className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm"
                                />
                                <input
                                    type="text"
                                    placeholder="Địa chỉ"
                                    value={branchForm.address}
                                    onChange={(e) => setBranchForm((prev) => ({ ...prev, address: e.target.value }))}
                                    className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm md:col-span-2"
                                />
                                <select
                                    value={branchForm.provinceCode}
                                    onChange={(e) =>
                                        setBranchForm((prev) => ({
                                            ...prev,
                                            provinceCode: e.target.value,
                                            districtCode: '',
                                            wardCode: '',
                                        }))
                                    }
                                    disabled={loadingProvinces}
                                    className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm"
                                >
                                    <option value="">{loadingProvinces ? '...' : 'Tỉnh/Thành phố'}</option>
                                    {provinces.map((p) => (
                                        <option key={p.code} value={p.code}>
                                            {p.name}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    value={branchForm.districtCode}
                                    onChange={(e) =>
                                        setBranchForm((prev) => ({
                                            ...prev,
                                            districtCode: e.target.value,
                                            wardCode: '',
                                        }))
                                    }
                                    disabled={!branchForm.provinceCode || loadingDistricts}
                                    className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm"
                                >
                                    <option value="">{loadingDistricts ? '...' : 'Quận/Huyện'}</option>
                                    {districts.map((d) => (
                                        <option key={d.code} value={d.code}>
                                            {d.name}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    value={branchForm.wardCode}
                                    onChange={(e) => setBranchForm((prev) => ({ ...prev, wardCode: e.target.value }))}
                                    disabled={!branchForm.districtCode || loadingWards}
                                    className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm md:col-span-2"
                                >
                                    <option value="">{loadingWards ? '...' : 'Phường/Xã'}</option>
                                    {wards.map((w) => (
                                        <option key={w.code} value={w.code}>
                                            {w.name}
                                        </option>
                                    ))}
                                </select>
                                <input
                                    type="text"
                                    placeholder="Logo URL (tuỳ chọn)"
                                    value={branchForm.logo}
                                    onChange={(e) => setBranchForm((prev) => ({ ...prev, logo: e.target.value }))}
                                    className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm md:col-span-2"
                                />
                                <input
                                    type="text"
                                    placeholder="Mô tả (tuỳ chọn)"
                                    value={branchForm.description}
                                    onChange={(e) => setBranchForm((prev) => ({ ...prev, description: e.target.value }))}
                                    className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm md:col-span-2"
                                />
                            </div>
                            <div className="mt-5 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowBranchForm(false);
                                        setEditingBranchId(null);
                                    }}
                                    className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-bold text-gray-600"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={!canSaveBranch || savingBranch}
                                    className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-sm font-bold text-white disabled:opacity-40"
                                >
                                    {savingBranch ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                                    {editingBranchId ? 'Lưu thay đổi' : 'Gửi đăng ký'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </RentalLayout>
    );
}
