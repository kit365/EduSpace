/**
 * Level-2 operational permissions assignable to STAFF — must match
 * {@link com.eduspace.accountservice.common.StaffOperationalAllowlist} on the backend.
 */
export type StaffCatalogItem = {
    key: string;
    labelVi: string;
    labelEn: string;
    descriptionVi: string;
    descriptionEn: string;
};

export type StaffCatalogGroup = {
    id: string;
    titleVi: string;
    titleEn: string;
    items: StaffCatalogItem[];
};

export const staffOperationalCatalog: StaffCatalogGroup[] = [
    {
        id: 'messages',
        titleVi: 'Tin nhắn',
        titleEn: 'Messages',
        items: [
            {
                key: 'view_messages',
                labelVi: 'Xem tin nhắn',
                labelEn: 'View messages',
                descriptionVi: 'Xem hội thoại và tin nhắn chi nhánh.',
                descriptionEn: 'View conversations and branch messages.',
            },
            {
                key: 'manage_messages',
                labelVi: 'Quản lý & trả lời',
                labelEn: 'Manage & reply',
                descriptionVi: 'Trả lời và quản lý tin nhắn.',
                descriptionEn: 'Reply to and manage messages.',
            },
        ],
    },
    {
        id: 'rooms',
        titleVi: 'Phòng & trạng thái',
        titleEn: 'Rooms & status',
        items: [
            {
                key: 'branch.room.view',
                labelVi: 'Xem phòng & listing',
                labelEn: 'View rooms & listings',
                descriptionVi: 'Xem danh sách phòng và chi tiết.',
                descriptionEn: 'View room list and details.',
            },
            {
                key: 'branch.room_status.manage',
                labelVi: 'Cập nhật trạng thái phòng',
                labelEn: 'Update room status',
                descriptionVi: 'Khóa, dọn, bảo trì, trạng thái vận hành.',
                descriptionEn: 'Lock, housekeeping, maintenance states.',
            },
            {
                key: 'branch.cleaning.manage',
                labelVi: 'Vệ sinh & dọn phòng',
                labelEn: 'Cleaning',
                descriptionVi: 'Quản lý công việc vệ sinh.',
                descriptionEn: 'Manage cleaning tasks.',
            },
            {
                key: 'branch.maintenance.manage',
                labelVi: 'Bảo trì',
                labelEn: 'Maintenance',
                descriptionVi: 'Quản lý bảo trì và sửa chữa.',
                descriptionEn: 'Manage maintenance workflow.',
            },
        ],
    },
    {
        id: 'bookings',
        titleVi: 'Đặt phòng & lịch',
        titleEn: 'Bookings & schedule',
        items: [
            {
                key: 'branch.booking.view',
                labelVi: 'Xem đặt phòng & lịch',
                labelEn: 'View bookings',
                descriptionVi: 'Xem lịch và chi tiết đặt phòng.',
                descriptionEn: 'View booking calendar and details.',
            },
            {
                key: 'branch.booking.manage',
                labelVi: 'Quản lý đặt phòng',
                labelEn: 'Manage bookings',
                descriptionVi: 'Cập nhật trạng thái đặt phòng.',
                descriptionEn: 'Update booking status and operations.',
            },
            {
                key: 'branch.checkin.manage',
                labelVi: 'Check-in khách',
                labelEn: 'Guest check-in',
                descriptionVi: 'Thao tác check-in tại quầy.',
                descriptionEn: 'Perform guest check-in.',
            },
            {
                key: 'branch.checkout.manage',
                labelVi: 'Check-out & thu tiền',
                labelEn: 'Checkout & payment',
                descriptionVi: 'Check-out và thu tiền tại quầy.',
                descriptionEn: 'Checkout and collect payment at desk.',
            },
        ],
    },
    {
        id: 'finance',
        titleVi: 'Tài chính (chi nhánh)',
        titleEn: 'Branch finance',
        items: [
            {
                key: 'branch.finance.view',
                labelVi: 'Xem doanh thu & giao dịch',
                labelEn: 'View revenue & transactions',
                descriptionVi: 'Xem báo cáo và giao dịch chi nhánh.',
                descriptionEn: 'View branch finance reports and transactions.',
            },
            {
                key: 'branch.finance.manage',
                labelVi: 'Quản lý tài chính',
                labelEn: 'Manage finance',
                descriptionVi: 'Thao tác tài chính nhạy cảm.',
                descriptionEn: 'Sensitive finance operations.',
            },
            {
                key: 'branch.finance.export',
                labelVi: 'Xuất dữ liệu tài chính',
                labelEn: 'Export finance data',
                descriptionVi: 'Xuất báo cáo tài chính.',
                descriptionEn: 'Export finance reports.',
            },
            {
                key: 'view_dashboard',
                labelVi: 'Tổng quan dashboard',
                labelEn: 'Dashboard summary',
                descriptionVi: 'Xem tổng quan Host.',
                descriptionEn: 'View host dashboard summary.',
            },
        ],
    },
];

export const staffOperationalPermissionKeys: string[] = staffOperationalCatalog.flatMap((g) =>
    g.items.map((i) => i.key),
);
