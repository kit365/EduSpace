import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { RentalLayout } from '../../../layouts/RentalLayout';
import { useBranch } from '../context/BranchContext';
import {
    Users,
    List,
    LayoutGrid,
    MoreVertical,
    Edit2,
    Copy,
    Trash2,
    Search as SearchIcon,
    Filter,
    Eye,
    Loader2,
    ShieldAlert,
    Clock,
    PlusCircle,
    ArrowRight,
    Download,
    Upload,
    ArrowUpDown,
} from 'lucide-react';
import { useProfile } from '../../customer/profile/hooks/useProfile';
import { SpacePublishFlow } from './SpacePublishFlow';
import { showToast } from '@/utils/toast';
import {
    hostPartnerApplicationService,
    type MyHostApplicationStatus,
} from '../services/hostPartnerApplicationService';
import { roomApiService } from '@/client/features/room/services/roomApiService';
import type { RoomDto } from '@/client/features/room/types';
import { isRoomOpenForBooking } from '@/client/features/room/utils/roomOperationalStatus';
import { useAuthStore } from '@/stores/authStore';
import { hasHostPermission } from '@/utils/keycloakTokenRoles';
import { hostPermissions } from '../permissions/hostPermissions';

const ROOM_TYPE_LABELS: Record<string, string> = {
    MEETING_ROOM: 'Phòng họp',
    CLASSROOM: 'Phòng học',
    EVENT_SPACE: 'Hội trường / Sự kiện',
    STUDIO: 'Studio',
    COWORKING: 'Coworking',
};

function formatPriceVnd(n: number | null | undefined): string {
    if (n == null || !Number.isFinite(Number(n))) return '—';
    return `${new Intl.NumberFormat('vi-VN').format(Math.round(Number(n)))}đ/giờ`;
}

function firstImageUrl(images: string | null): string {
    const u = images?.split(',')[0]?.trim();
    if (u) return u;
    return 'https://placehold.co/1200x800/e2e8f0/64748b?text=EduSpace';
}

/** Dòng phụ dưới tên phòng: chỉ địa chỉ chi nhánh (hoặc location từ API nếu chưa có chi nhánh). */
function roomCardLocationLine(room: RoomDto, branchAddress: string | undefined): string {
    const addr = (branchAddress?.trim() || room.location?.trim() || '').trim();
    return addr || '—';
}

function roomBadge(room: RoomDto): { label: string; className: string } {
    if (room.pendingEditStatus === 'PENDING') {
        return { label: 'Chờ duyệt sửa', className: 'bg-sky-600/90 text-white' };
    }
    if (room.approvalStatus === 'PENDING') {
        return { label: 'Chờ duyệt', className: 'bg-amber-500/90 text-white' };
    }
    if (room.approvalStatus === 'REJECTED') {
        return { label: 'Từ chối', className: 'bg-red-500/90 text-white' };
    }
    if (room.status === 'MAINTENANCE' || room.status === 'INACTIVE') {
        return { label: 'Bảo trì', className: 'bg-gray-500/90 text-white' };
    }
    return { label: 'Hoạt động', className: 'bg-green-500/90 text-white' };
}

type StatusFilter = 'all' | 'pending' | 'active' | 'maintenance' | 'rejected';
type ViewMode = 'grid' | 'list';
type SortBy = 'updatedDesc' | 'updatedAsc' | 'priceAsc' | 'priceDesc' | 'nameAsc';
type OperationalFilter = 'all' | 'READY' | 'IN_USE' | 'CLEANING' | 'MAINTENANCE';

export function SpacesPage() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { profile, loading: profileLoading } = useProfile();
    const { selectedBranch, refreshBranches, branches } = useBranch();
    const [rooms, setRooms] = useState<RoomDto[]>([]);
    const [loadingRooms, setLoadingRooms] = useState(false);
    const [hostApp, setHostApp] = useState<MyHostApplicationStatus | null | undefined>(undefined);
    const accessToken = useAuthStore((s) => s.accessToken);
    const hostPermissionsFromAccount = useAuthStore((s) => s.hostPermissionsFromAccount);

    const isHostPartner = profile?.role === 'host';
    const canManageRooms = isHostPartner || hostApp?.status === 'APPROVED';
    const canViewRoom = hasHostPermission(accessToken, hostPermissions.room.view, hostPermissionsFromAccount);
    const canCreateRoom = hasHostPermission(accessToken, hostPermissions.room.create, hostPermissionsFromAccount);
    const canEditRoom = hasHostPermission(accessToken, hostPermissions.room.edit, hostPermissionsFromAccount);
    const canDeleteRoom = hasHostPermission(accessToken, hostPermissions.room.delete, hostPermissionsFromAccount);

    const loadRooms = useCallback(async () => {
        if (!profile?.id) return;
        setLoadingRooms(true);
        try {
            // Theo owner_id trên property — không phụ thuộc BranchContext (tránh rỗng khi context chưa tải / lệch API).
            const list = await roomApiService.getAll({ ownerId: profile.id });
            setRooms(list);
        } catch {
            setRooms([]);
            showToast.error('Không tải được danh sách phòng.');
        } finally {
            setLoadingRooms(false);
        }
    }, [profile?.id]);

    useEffect(() => {
        let cancelled = false;
        hostPartnerApplicationService
            .getMyStatus()
            .then((s) => {
                if (!cancelled) setHostApp(s);
            })
            .catch(() => {
                if (!cancelled) setHostApp(null);
            });
        return () => {
            cancelled = true;
        };
    }, [profile?.id]);

    useEffect(() => {
        if (profileLoading || hostApp === undefined) return;
        if (!canManageRooms) return;
        void loadRooms();
    }, [profileLoading, hostApp, canManageRooms, loadRooms]);

    const creating = searchParams.has('create') && canManageRooms && canCreateRoom;

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const [operationalFilter, setOperationalFilter] = useState<OperationalFilter>('all');
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [sortBy, setSortBy] = useState<SortBy>('updatedDesc');
    const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const filterMenuRef = useRef<HTMLDivElement>(null);
    const toolbarRef = useRef<HTMLDivElement>(null);

    const statusFilterOrder: StatusFilter[] = ['all', 'pending', 'active', 'maintenance', 'rejected'];
    const sortOrder: SortBy[] = ['updatedDesc', 'updatedAsc', 'priceAsc', 'priceDesc', 'nameAsc'];

    const statusFilterLabelMap: Record<StatusFilter, string> = {
        all: 'Tất cả trạng thái',
        pending: 'Chờ duyệt',
        active: 'Đang hoạt động',
        maintenance: 'Bảo trì / Ngưng',
        rejected: 'Từ chối',
    };

    const sortLabelMap: Record<SortBy, string> = {
        updatedDesc: 'Mới cập nhật',
        updatedAsc: 'Cũ hơn',
        priceAsc: 'Giá tăng dần',
        priceDesc: 'Giá giảm dần',
        nameAsc: 'Tên A-Z',
    };

    const cycleStatusFilter = () => {
        setStatusFilter((prev) => {
            const currentIndex = statusFilterOrder.indexOf(prev);
            const nextIndex = (currentIndex + 1) % statusFilterOrder.length;
            return statusFilterOrder[nextIndex];
        });
    };

    const cycleSortBy = () => {
        setSortBy((prev) => {
            const currentIndex = sortOrder.indexOf(prev);
            const nextIndex = (currentIndex + 1) % sortOrder.length;
            return sortOrder[nextIndex];
        });
    };

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            const target = event.target as Node;
            if (filterMenuRef.current && !filterMenuRef.current.contains(target)) {
                setIsFilterMenuOpen(false);
            }
            if (toolbarRef.current && !toolbarRef.current.contains(target)) {
                setIsSearchOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const addressByPropertyId = useMemo(() => {
        const m = new Map<number, string>();
        for (const b of branches) {
            if (b.address?.trim()) m.set(b.id, b.address.trim());
        }
        return m;
    }, [branches]);

    const roomsByPrimaryFilters = useMemo(() => {
        return rooms.filter((room) => {
            const matchesBranch = selectedBranch ? room.propertyId === selectedBranch.id : true;
            const typeLabel = ROOM_TYPE_LABELS[room.roomType] ?? room.roomType;
            const matchesSearch =
                room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                typeLabel.toLowerCase().includes(searchQuery.toLowerCase());
            let matchesStatus = true;
            if (statusFilter === 'pending') matchesStatus = room.approvalStatus === 'PENDING';
            else if (statusFilter === 'active')
                matchesStatus = room.approvalStatus === 'APPROVED' && isRoomOpenForBooking(room.status);
            else if (statusFilter === 'maintenance')
                matchesStatus = room.status === 'MAINTENANCE' || room.status === 'INACTIVE';
            else if (statusFilter === 'rejected') matchesStatus = room.approvalStatus === 'REJECTED';

            return matchesBranch && matchesSearch && matchesStatus;
        });
    }, [rooms, selectedBranch, searchQuery, statusFilter]);

    const operationalTabCounts = useMemo<Record<OperationalFilter, number>>(() => {
        const counts: Record<OperationalFilter, number> = {
            all: roomsByPrimaryFilters.length,
            READY: 0,
            IN_USE: 0,
            CLEANING: 0,
            MAINTENANCE: 0,
        };

        roomsByPrimaryFilters.forEach((room) => {
            if (room.approvalStatus !== 'APPROVED') return;
            if (room.status === 'IN_USE') counts.IN_USE += 1;
            else if (room.status === 'CLEANING') counts.CLEANING += 1;
            else if (room.status === 'MAINTENANCE' || room.status === 'INACTIVE') counts.MAINTENANCE += 1;
            else counts.READY += 1;
        });

        return counts;
    }, [roomsByPrimaryFilters]);

    const filteredRooms = useMemo(() => {
        return roomsByPrimaryFilters.filter((room) => {

            const effectiveOperational: Exclude<OperationalFilter, 'all'> =
                room.status === 'IN_USE'
                    ? 'IN_USE'
                    : room.status === 'CLEANING'
                      ? 'CLEANING'
                      : room.status === 'MAINTENANCE' || room.status === 'INACTIVE'
                        ? 'MAINTENANCE'
                        : 'READY';
            const matchesOperational =
                operationalFilter === 'all'
                    ? true
                    : room.approvalStatus === 'APPROVED' && effectiveOperational === operationalFilter;

            return matchesOperational;
        });
    }, [roomsByPrimaryFilters, operationalFilter]);

    const displayedRooms = useMemo(() => {
        const list = [...filteredRooms];
        const timeOf = (room: RoomDto) => {
            const t = room.updatedAt ? new Date(room.updatedAt).getTime() : 0;
            return Number.isFinite(t) ? t : 0;
        };

        if (sortBy === 'updatedDesc') list.sort((a, b) => timeOf(b) - timeOf(a));
        else if (sortBy === 'updatedAsc') list.sort((a, b) => timeOf(a) - timeOf(b));
        else if (sortBy === 'priceAsc') list.sort((a, b) => (a.pricePerHour ?? 0) - (b.pricePerHour ?? 0));
        else if (sortBy === 'priceDesc') list.sort((a, b) => (b.pricePerHour ?? 0) - (a.pricePerHour ?? 0));
        else if (sortBy === 'nameAsc') list.sort((a, b) => a.name.localeCompare(b.name, 'vi'));

        return list;
    }, [filteredRooms, sortBy]);

    const openCreate = () => {
        if (!canManageRooms || !canCreateRoom) return;
        setSearchParams('?create');
    };

    const refreshHostStatus = () => {
        hostPartnerApplicationService.getMyStatus().then(setHostApp).catch(() => setHostApp(null));
    };

    const closeCreate = () => {
        const next = new URLSearchParams(searchParams);
        next.delete('create');
        setSearchParams(next);
    };

    const handlePublishSuccess = async () => {
        showToast.success('Đã gửi phòng chờ duyệt');
        closeCreate();
        await refreshBranches();
        await loadRooms();
    };

    if (profileLoading || hostApp === undefined) {
        return (
            <RentalLayout title="Phòng của tôi">
                <div className="flex min-h-[50vh] items-center justify-center p-8">
                    <Loader2 className="h-10 w-10 animate-spin text-red-500" />
                </div>
            </RentalLayout>
        );
    }

    if (hostApp === null) {
        return (
            <RentalLayout title="Phòng cho thuê">
                <div className="mx-auto max-w-lg p-8 text-center">
                    <ShieldAlert className="mx-auto mb-6 h-16 w-16 text-gray-400" />
                    <h1 className="mb-4 text-2xl font-black text-gray-900">Đăng nhập</h1>
                    <p className="mb-8 text-gray-600">Đăng nhập để xem trạng thái đơn đối tác và quản lý phòng.</p>
                    <Link
                        to="/auth"
                        className="inline-block rounded-2xl bg-gray-900 px-8 py-4 font-black text-white hover:bg-red-500"
                    >
                        Đăng nhập
                    </Link>
                </div>
            </RentalLayout>
        );
    }

    if (!canManageRooms && hostApp.status === 'NONE') {
        return (
            <RentalLayout title="Phòng cho thuê">
                <div className="mx-auto max-w-lg p-8">
                    <div className="rounded-3xl border border-amber-100 bg-gradient-to-br from-amber-50 to-orange-50 p-10 text-center shadow-sm">
                        <ShieldAlert className="mx-auto mb-6 h-16 w-16 text-amber-600" />
                        <h1 className="mb-4 text-2xl font-black tracking-tight text-gray-900">
                            Trở thành đối tác cho thuê
                        </h1>
                        <p className="mb-8 text-gray-600 font-medium leading-relaxed">
                            Để tạo phòng và quản lý đặt chỗ, bạn cần gửi hồ sơ đăng ký. Sau khi{' '}
                            <strong>admin duyệt</strong>, bạn mới vào được trang này để đăng phòng. Phòng sau
                            khi tạo cũng cần admin duyệt mới hiển thị cho khách.
                        </p>
                        <Link
                            to="/rental/register"
                            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gray-900 px-8 py-4 font-black text-white shadow-xl transition hover:bg-red-500"
                        >
                            Gửi hồ sơ đăng ký
                            <ArrowRight className="h-5 w-5" />
                        </Link>
                    </div>
                </div>
            </RentalLayout>
        );
    }

    if (!canViewRoom) {
        return (
            <RentalLayout title="Phòng của tôi">
                <div className="mx-auto max-w-lg p-8 text-center text-gray-600">
                    Bạn không có quyền xem module phòng.
                </div>
            </RentalLayout>
        );
    }

    if (!canManageRooms && hostApp.status === 'PENDING') {
        return (
            <RentalLayout title="Phòng cho thuê">
                <div className="mx-auto max-w-lg p-8">
                    <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                        <Clock className="mx-auto mb-6 h-16 w-16 text-slate-400" />
                        <h1 className="mb-4 text-2xl font-black text-gray-900">Đang chờ admin duyệt</h1>
                        <p className="font-medium leading-relaxed text-gray-600">
                            Đơn đăng ký đối tác đã gửi. Admin duyệt tại trang quản trị → bạn sẽ vào đây để{' '}
                            <strong>tạo phòng</strong>. Sau khi được duyệt, hãy <strong>đăng xuất và đăng nhập lại</strong>{' '}
                            (hoặc F5) để cập nhật quyền.
                        </p>
                        <button
                            type="button"
                            onClick={() => refreshHostStatus()}
                            className="mt-6 text-sm font-bold text-blue-600 hover:underline"
                        >
                            Làm mới trạng thái
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/rental')}
                            className="mt-4 block w-full text-sm font-bold text-red-500 hover:underline"
                        >
                            Về trang rental
                        </button>
                    </div>
                </div>
            </RentalLayout>
        );
    }

    if (!canManageRooms && hostApp.status === 'REJECTED') {
        return (
            <RentalLayout title="Phòng cho thuê">
                <div className="mx-auto max-w-lg p-8">
                    <div className="rounded-3xl border border-red-100 bg-red-50/50 p-10 text-center shadow-sm">
                        <ShieldAlert className="mx-auto mb-6 h-16 w-16 text-red-500" />
                        <h1 className="mb-4 text-2xl font-black text-gray-900">Đơn chưa được duyệt</h1>
                        {hostApp.rejectedReason ? (
                            <p className="mb-6 rounded-xl bg-white p-4 text-left text-sm text-gray-700">
                                <strong>Ghi chú admin:</strong> {hostApp.rejectedReason}
                            </p>
                        ) : null}
                        <Link
                            to="/rental/register"
                            className="inline-flex items-center gap-2 rounded-2xl bg-gray-900 px-8 py-4 font-black text-white hover:bg-red-500"
                        >
                            Gửi đơn mới
                            <ArrowRight className="h-5 w-5" />
                        </Link>
                    </div>
                </div>
            </RentalLayout>
        );
    }

    if (creating) {
        return (
            <RentalLayout title="Đăng phòng mới">
                <div className="p-4 md:p-6">
                    <button
                        type="button"
                        onClick={closeCreate}
                        className="mb-4 text-sm font-bold text-gray-500 hover:text-gray-900"
                    >
                        ← Quay lại danh sách phòng
                    </button>
                    <SpacePublishFlow
                        key="create-flow"
                        isEdit={false}
                        onCancel={closeCreate}
                        onSuccess={() => void handlePublishSuccess()}
                    />
                </div>
            </RentalLayout>
        );
    }

    return (
        <RentalLayout title="Phòng của tôi">
            <div className="p-8">
                <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-gray-900">Phòng của tôi</h1>
                        <p className="font-medium text-gray-500">
                            Dữ liệu từ máy chủ — phòng chờ duyệt sẽ chưa hiển thị cho khách đặt.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        {canCreateRoom && (
                            <>
                                <button
                                    type="button"
                                    className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-3.5 text-sm font-semibold text-gray-700"
                                >
                                    <Download className="h-4 w-4" />
                                    Export
                                </button>
                                <button
                                    type="button"
                                    className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-3.5 text-sm font-semibold text-gray-700"
                                >
                                    <Upload className="h-4 w-4" />
                                    Import
                                </button>
                                <button
                                    type="button"
                                    onClick={openCreate}
                                    className="inline-flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-red-500 px-4 text-sm font-bold text-white shadow-lg shadow-red-200 transition hover:bg-red-600 active:scale-95"
                                >
                                    <PlusCircle className="h-4 w-4" />
                                    Đăng phòng mới
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <div className="mb-8 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                    <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between" ref={toolbarRef}>
                        <div className="flex flex-wrap items-center gap-2">
                            {(
                                [
                                    { value: 'all', label: 'Tất cả' },
                                    { value: 'READY', label: 'Sẵn sàng' },
                                    { value: 'IN_USE', label: 'Đang có khách' },
                                    { value: 'CLEANING', label: 'Đang dọn' },
                                    { value: 'MAINTENANCE', label: 'Bảo trì' },
                                ] as { value: OperationalFilter; label: string }[]
                            ).map((tab) => (
                                <button
                                    key={tab.value}
                                    type="button"
                                    onClick={() => setOperationalFilter(tab.value)}
                                    className={`inline-flex h-9 cursor-pointer items-center rounded-lg border px-3 text-sm font-semibold transition ${
                                        operationalFilter === tab.value
                                            ? 'border-gray-300 bg-gray-100 text-gray-900'
                                            : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                                    }`}
                                >
                                    <span>{tab.label}</span>
                                    <span className="ml-1.5 rounded-md bg-gray-100 px-1.5 py-0.5 text-[11px] font-bold text-gray-600">
                                        {operationalTabCounts[tab.value]}
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
                                        isSearchOpen || searchQuery
                                            ? 'border-gray-300 bg-gray-100 text-gray-900'
                                            : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                                    }`}
                                    title="Tìm kiếm"
                                    aria-label="Tìm kiếm"
                                >
                                    <SearchIcon className="h-[18px] w-[18px]" />
                                </button>

                                {isSearchOpen && (
                                    <div className="w-64 sm:w-80">
                                        <input
                                            autoFocus
                                            type="text"
                                            placeholder="Tìm theo tên hoặc loại phòng..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
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
                                <ArrowUpDown className="h-[18px] w-[18px]" />
                            </button>

                            <div className="relative" ref={filterMenuRef}>
                                <button
                                    type="button"
                                    onClick={() => setIsFilterMenuOpen((prev) => !prev)}
                                    className={`inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border transition ${
                                        statusFilter !== 'all'
                                            ? 'border-gray-300 bg-gray-100 text-gray-900'
                                            : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                                    }`}
                                    title={`Lọc trạng thái: ${statusFilterLabelMap[statusFilter]}`}
                                    aria-label={`Lọc trạng thái: ${statusFilterLabelMap[statusFilter]}`}
                                >
                                    <Filter className="h-[18px] w-[18px]" />
                                </button>

                                {isFilterMenuOpen && (
                                    <div className="absolute right-0 top-full z-30 mt-2 w-48 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
                                        {(Object.keys(statusFilterLabelMap) as StatusFilter[]).map((value) => (
                                            <button
                                                key={value}
                                                type="button"
                                                onClick={() => {
                                                    setStatusFilter(value);
                                                    setIsFilterMenuOpen(false);
                                                }}
                                                className={`flex w-full cursor-pointer items-center justify-between px-3 py-2 text-left text-sm font-semibold transition ${
                                                    statusFilter === value
                                                        ? 'bg-gray-100 text-gray-900'
                                                        : 'text-gray-600 hover:bg-gray-50'
                                                }`}
                                            >
                                                <span>{statusFilterLabelMap[value]}</span>
                                                {statusFilter === value ? <span>✓</span> : null}
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
                                    title="Dạng lưới"
                                >
                                    <LayoutGrid className="h-[18px] w-[18px]" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setViewMode('list')}
                                    className={`h-7 w-7 cursor-pointer rounded-md p-1 ${viewMode === 'list' ? 'bg-gray-100 text-gray-900' : 'text-gray-500'}`}
                                    title="Dạng danh sách"
                                >
                                    <List className="h-[18px] w-[18px]" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {loadingRooms && rooms.length === 0 ? (
                    <div className="flex min-h-[40vh] items-center justify-center">
                        <Loader2 className="h-10 w-10 animate-spin text-red-500" />
                    </div>
                ) : (
                    <>
                        {viewMode === 'grid' ? (
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {displayedRooms.map((room) => {
                                    const badge = roomBadge(room);
                                    const locationLine = roomCardLocationLine(
                                        room,
                                        addressByPropertyId.get(room.propertyId),
                                    );
                                    return (
                                        <div
                                            key={room.id}
                                            className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white transition hover:shadow-lg"
                                        >
                                            <div className="relative aspect-video shrink-0 overflow-hidden bg-gray-100">
                                                <img
                                                    src={firstImageUrl(room.images)}
                                                    alt={room.name}
                                                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                                />
                                                <div className="absolute right-3 top-3 flex gap-2">
                                                    <span
                                                        className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-widest shadow-sm backdrop-blur-md ${badge.className}`}
                                                    >
                                                        {badge.label}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex flex-1 flex-col p-5">
                                                <div className="mb-2 flex items-start justify-between">
                                                    <div
                                                        className="group/title cursor-pointer"
                                                        onClick={() => navigate(`/rental/spaces/${room.id}`)}
                                                    >
                                                        <h3
                                                            className="line-clamp-1 text-lg font-bold text-gray-900 transition group-hover/title:text-red-500"
                                                            title={room.name}
                                                        >
                                                            {room.name}
                                                        </h3>
                                                        <p
                                                            className="line-clamp-2 text-sm font-medium text-gray-500"
                                                            title={locationLine}
                                                        >
                                                            {locationLine}
                                                        </p>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        className="rounded-lg p-1 text-gray-400 transition hover:bg-gray-50 hover:text-gray-900"
                                                    >
                                                        <MoreVertical className="h-5 w-5" />
                                                    </button>
                                                </div>
                                                <div className="mb-6 mt-2 flex items-center gap-4 text-sm text-gray-600">
                                                    <span className="flex items-center gap-1">
                                                        <Users className="h-4 w-4" /> {room.capacity}
                                                    </span>
                                                </div>
                                                <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-4">
                                                    <div className="text-lg font-black text-red-500">
                                                        {formatPriceVnd(room.pricePerHour)}
                                                    </div>
                                                    <div className="flex gap-1 opacity-0 transition group-hover:opacity-100">
                                                        <button
                                                            type="button"
                                                            onClick={() => navigate(`/rental/spaces/${room.id}`)}
                                                            className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-500"
                                                            title="Chi tiết"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </button>
                                                        {canEditRoom && (
                                                            <button
                                                                type="button"
                                                                onClick={() => navigate(`/rental/spaces/edit/${room.id}`)}
                                                                className="rounded-lg p-2 text-gray-400 transition hover:bg-blue-50 hover:text-blue-500"
                                                                title="Sửa"
                                                            >
                                                                <Edit2 className="h-4 w-4" />
                                                            </button>
                                                        )}
                                                        {canCreateRoom && (
                                                            <button
                                                                type="button"
                                                                className="rounded-lg p-2 text-gray-400 transition hover:bg-green-50 hover:text-green-500"
                                                                title="Nhân bản"
                                                            >
                                                                <Copy className="h-4 w-4" />
                                                            </button>
                                                        )}
                                                        {canDeleteRoom && (
                                                            <button
                                                                type="button"
                                                                className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-500"
                                                                title="Xóa"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {displayedRooms.map((room) => {
                                    const badge = roomBadge(room);
                                    const locationLine = roomCardLocationLine(
                                        room,
                                        addressByPropertyId.get(room.propertyId),
                                    );
                                    return (
                                        <div
                                            key={room.id}
                                            className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-3 transition hover:shadow-md"
                                        >
                                            <img
                                                src={firstImageUrl(room.images)}
                                                alt={room.name}
                                                className="h-20 w-32 rounded-xl object-cover"
                                            />
                                            <div className="min-w-0 flex-1">
                                                <div className="mb-1 flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => navigate(`/rental/spaces/${room.id}`)}
                                                        className="line-clamp-1 text-left text-base font-bold text-gray-900 hover:text-red-500"
                                                    >
                                                        {room.name}
                                                    </button>
                                                    <span
                                                        className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-widest ${badge.className}`}
                                                    >
                                                        {badge.label}
                                                    </span>
                                                </div>
                                                <p className="line-clamp-1 text-sm font-medium text-gray-500">{locationLine}</p>
                                                <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                                                    <span className="flex items-center gap-1">
                                                        <Users className="h-4 w-4" /> {room.capacity}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="mb-2 text-lg font-black text-red-500">
                                                    {formatPriceVnd(room.pricePerHour)}
                                                </div>
                                                <div className="flex justify-end gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => navigate(`/rental/spaces/${room.id}`)}
                                                        className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-500"
                                                        title="Chi tiết"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </button>
                                                    {canEditRoom && (
                                                        <button
                                                            type="button"
                                                            onClick={() => navigate(`/rental/spaces/edit/${room.id}`)}
                                                            className="rounded-lg p-2 text-gray-400 transition hover:bg-blue-50 hover:text-blue-500"
                                                            title="Sửa"
                                                        >
                                                            <Edit2 className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                    {canCreateRoom && (
                                                        <button
                                                            type="button"
                                                            className="rounded-lg p-2 text-gray-400 transition hover:bg-green-50 hover:text-green-500"
                                                            title="Nhân bản"
                                                        >
                                                            <Copy className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                    {canDeleteRoom && (
                                                        <button
                                                            type="button"
                                                            className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-500"
                                                            title="Xóa"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {displayedRooms.length === 0 && !loadingRooms && (
                            <div className="mt-4 rounded-2xl border-2 border-dashed border-gray-200 bg-white py-16 text-center">
                                <p className="mb-4 text-gray-400">
                                    {rooms.length === 0
                                        ? 'Chưa có phòng nào. Hãy đăng phòng mới hoặc thêm chi nhánh nếu cần.'
                                        : 'Chưa có phòng nào khớp bộ lọc hoặc trong chi nhánh đang chọn.'}
                                </p>
                                {canCreateRoom && (
                                    <button
                                        type="button"
                                        onClick={openCreate}
                                        className="font-bold text-red-500 hover:underline"
                                    >
                                        Đăng phòng mới
                                    </button>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </RentalLayout>
    );
}
