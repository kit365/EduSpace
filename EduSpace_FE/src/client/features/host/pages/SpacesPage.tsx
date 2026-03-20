import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { RentalLayout } from '../../../layouts/RentalLayout';
import { useBranch } from '../context/BranchContext';
import { MOCK_HOST_SPACES } from '../data/mockData';
import {
    Users,
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
} from 'lucide-react';
import { useProfile } from '../../customer/profile/hooks/useProfile';
import { SpacePublishFlow } from './SpacePublishFlow';
import { showToast } from '@/utils/toast';
import {
    hostPartnerApplicationService,
    type MyHostApplicationStatus,
} from '../services/hostPartnerApplicationService';

export function SpacesPage() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { profile, loading: profileLoading } = useProfile();
    const { selectedBranch } = useBranch();
    const [spaces, setSpaces] = useState(MOCK_HOST_SPACES);
    const [hostApp, setHostApp] = useState<MyHostApplicationStatus | null | undefined>(undefined);

    const isHostPartner = profile?.role === 'host';
    const canManageRooms =
        isHostPartner || hostApp?.status === 'APPROVED';

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
        setSpaces(MOCK_HOST_SPACES);
    }, [selectedBranch]);

    const creating = searchParams.get('create') === '1' && canManageRooms;

    const openCreate = () => {
        if (!canManageRooms) return;
        setSearchParams({ create: '1' });
    };

    const refreshHostStatus = () => {
        hostPartnerApplicationService.getMyStatus().then(setHostApp).catch(() => setHostApp(null));
    };

    const closeCreate = () => {
        setSearchParams({});
    };

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'maintenance'>('all');

    const filteredSpaces = spaces.filter((s) => {
        const matchesBranch = selectedBranch ? s.branchId === selectedBranch.id : true;
        const matchesSearch =
            s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.type.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' ? true : s.status === statusFilter;
        return matchesBranch && matchesSearch && matchesStatus;
    });

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
                        onSuccess={() => {
                            showToast.success('Đã gửi phòng chờ duyệt');
                            closeCreate();
                        }}
                    />
                </div>
            </RentalLayout>
        );
    }

    return (
        <RentalLayout title="Phòng của tôi">
            <div className="p-8">
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-gray-900">Phòng của tôi</h1>
                        <p className="font-medium text-gray-500">
                            Quản lý phòng đã đăng. Phòng chờ duyệt sẽ chưa hiển thị cho khách đặt.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={openCreate}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-500 px-6 py-3 font-bold text-white shadow-lg shadow-red-200 transition hover:bg-red-600 active:scale-95"
                    >
                        <PlusCircle className="h-5 w-5" />
                        Đăng phòng mới
                    </button>
                </div>

                <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:flex-row">
                    <div className="relative flex-1">
                        <SearchIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Tìm theo tên hoặc loại phòng..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full rounded-xl border-none bg-gray-50 py-3 pl-11 pr-4 text-sm font-medium outline-none transition focus:ring-2 focus:ring-red-500/20"
                        />
                    </div>
                    <div className="relative md:w-64">
                        <Filter className="pointer-events-none absolute left-4 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'maintenance')}
                            className="w-full cursor-pointer appearance-none rounded-xl border-none bg-gray-50 py-3 pl-11 pr-10 text-sm font-bold text-gray-700 outline-none transition focus:ring-2 focus:ring-red-500/20"
                        >
                            <option value="all">Tất cả trạng thái</option>
                            <option value="active">Đang hoạt động</option>
                            <option value="maintenance">Đang bảo trì</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredSpaces.map((space) => (
                        <div
                            key={space.id}
                            className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white transition hover:shadow-lg"
                        >
                            <div className="relative aspect-video shrink-0 overflow-hidden bg-gray-100">
                                <img
                                    src={space.image}
                                    alt={space.name}
                                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                />
                                <div className="absolute right-3 top-3 flex gap-2">
                                    <span
                                        className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-widest shadow-sm backdrop-blur-md ${
                                            space.status === 'active'
                                                ? 'bg-green-500/90 text-white'
                                                : 'bg-amber-500/90 text-white'
                                        }`}
                                    >
                                        {space.status === 'active' ? 'Hoạt động' : 'Bảo trì'}
                                    </span>
                                </div>
                            </div>
                            <div className="flex flex-1 flex-col p-5">
                                <div className="mb-2 flex items-start justify-between">
                                    <div
                                        className="group/title cursor-pointer"
                                        onClick={() => navigate(`/rental/spaces/${space.id}`)}
                                    >
                                        <h3
                                            className="line-clamp-1 text-lg font-bold text-gray-900 transition group-hover/title:text-red-500"
                                            title={space.name}
                                        >
                                            {space.name}
                                        </h3>
                                        <p className="text-sm font-medium text-gray-500">{space.type}</p>
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
                                        <Users className="h-4 w-4" /> {space.capacity}
                                    </span>
                                </div>
                                <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-4">
                                    <div className="text-lg font-black text-red-500">{space.price}</div>
                                    <div className="flex gap-1 opacity-0 transition group-hover:opacity-100">
                                        <button
                                            type="button"
                                            onClick={() => navigate(`/rental/spaces/${space.id}`)}
                                            className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-500"
                                            title="Chi tiết"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => navigate(`/rental/spaces/edit/${space.id}`)}
                                            className="rounded-lg p-2 text-gray-400 transition hover:bg-blue-50 hover:text-blue-500"
                                            title="Sửa"
                                        >
                                            <Edit2 className="h-4 w-4" />
                                        </button>
                                        <button
                                            type="button"
                                            className="rounded-lg p-2 text-gray-400 transition hover:bg-green-50 hover:text-green-500"
                                            title="Nhân bản"
                                        >
                                            <Copy className="h-4 w-4" />
                                        </button>
                                        <button
                                            type="button"
                                            className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-500"
                                            title="Xóa"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {filteredSpaces.length === 0 && (
                        <div className="col-span-full rounded-2xl border-2 border-dashed border-gray-200 bg-white py-16 text-center">
                            <p className="mb-4 text-gray-400">Chưa có phòng trong chi nhánh này.</p>
                            <button
                                type="button"
                                onClick={openCreate}
                                className="font-bold text-red-500 hover:underline"
                            >
                                Đăng phòng mới
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </RentalLayout>
    );
}
