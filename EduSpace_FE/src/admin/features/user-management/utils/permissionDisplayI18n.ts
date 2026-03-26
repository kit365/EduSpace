/**
 * Tên hiển thị + mô tả quyền theo ngôn ngữ giao diện (vi / en).
 * Không đổi `permissions.name` trong DB — chỉ dùng cho UI Admin.
 */

const normLegacy = (s: string) => s.trim().toLowerCase().replace(/-/g, '_').replace(/\s+/g, '_');

export function getPermissionDisplayName(permissionName: string, language?: string): string {
    const isVi = (language ?? '').toLowerCase().startsWith('vi');
    const n = (permissionName ?? '').trim();
    if (!n) return '';
    const nLegacy = normLegacy(n);

    const mapAction = (action: string): { vi: string; en: string } => {
        const a = action.toLowerCase();
        switch (a) {
            case 'view':
                return { vi: 'Xem', en: 'View' };
            case 'create':
                return { vi: 'Tạo', en: 'Create' };
            case 'edit':
                return { vi: 'Sửa', en: 'Edit' };
            case 'delete':
                return { vi: 'Xóa', en: 'Delete' };
            case 'manage':
                return { vi: 'Quản lý', en: 'Manage' };
            case 'export':
                return { vi: 'Xuất', en: 'Export' };
            case 'assign':
                return { vi: 'Gán', en: 'Assign' };
            default:
                return { vi: action, en: action };
        }
    };

    if (n.startsWith('branch.room.')) {
        const action = n.replace('branch.room.', '');
        const t = mapAction(action);
        if (action.toLowerCase() === 'view') {
            return isVi ? 'Phòng: Xem (danh sách & chi tiết phòng)' : 'Room: View (room list & details)';
        }
        return isVi ? `Phòng: ${t.vi}` : `Room: ${t.en}`;
    }

    if (n.startsWith('branch.branch.')) {
        const action = n.replace('branch.branch.', '');
        const t = mapAction(action);
        return isVi ? `Chi nhánh: ${t.vi}` : `Branch: ${t.en}`;
    }

    if (n.startsWith('branch.finance.')) {
        const rest = n.replace('branch.finance.', '');
        if (rest === 'view')
            return isVi
                ? 'Tài chính: Xem (báo cáo & giao dịch chi nhánh)'
                : 'Finance: View (reports & branch transactions)';
        if (rest === 'manage') return isVi ? 'Tài chính: Quản lý' : 'Finance: Manage';
        if (rest === 'export') return isVi ? 'Tài chính: Xuất' : 'Finance: Export';
        if (rest === 'payout.create')
            return isVi ? 'Tài chính: Tạo yêu cầu rút tiền' : 'Finance: Request withdrawal (payout)';
        return isVi ? `Tài chính: ${rest}` : `Finance: ${rest}`;
    }

    if (n === 'branch.checkin.manage') return isVi ? 'Check-in: Quản lý' : 'Check-in: Manage';
    if (n === 'branch.checkout.manage') return isVi ? 'Check-out: Quản lý' : 'Check-out: Manage';
    if (n === 'branch.room_status.manage') return isVi ? 'Trạng thái phòng: Quản lý' : 'Room status: Manage';
    if (n === 'branch.maintenance.manage') return isVi ? 'Bảo trì: Quản lý' : 'Maintenance: Manage';
    if (n === 'branch.cleaning.manage') return isVi ? 'Vệ sinh: Quản lý' : 'Cleaning: Manage';

    if (n.startsWith('branch.ads.')) {
        const action = n.replace('branch.ads.', '');
        const t = mapAction(action);
        if (action.toLowerCase() === 'manage') return isVi ? 'Quảng cáo: Quản lý' : 'Ads: Manage';
        return isVi ? `Quảng cáo: ${t.vi}` : `Ads: ${t.en}`;
    }

    if (n.startsWith('branch.booking.')) {
        const action = n.replace('branch.booking.', '');
        const t = mapAction(action);
        if (action.toLowerCase() === 'view')
            return isVi ? 'Đặt phòng: Xem (danh sách & chi tiết đặt phòng)' : 'Booking: View (list & booking details)';
        if (action.toLowerCase() === 'manage')
            return isVi
                ? 'Đặt phòng: Quản lý (cập nhật trạng thái & thao tác liên quan đặt phòng)'
                : 'Booking: Manage (update status & booking-related operations)';
        return isVi ? `Đặt phòng: ${t.vi}` : `Booking: ${t.en}`;
    }

    if (n.startsWith('branch.profile.')) {
        const action = n.replace('branch.profile.', '');
        const t = mapAction(action);
        return isVi ? `Hồ sơ & KYC: ${t.vi}` : `Profile & KYC: ${t.en}`;
    }
    if (n.startsWith('branch.staff.')) {
        const action = n.replace('branch.staff.', '');
        const t = mapAction(action);
        return isVi ? `Nhân viên: ${t.vi}` : `Staff: ${t.en}`;
    }

    if (n.startsWith('rbac.permission.')) {
        const action = n.replace('rbac.permission.', '');
        const t = mapAction(action);
        return isVi ? `Danh mục quyền: ${t.vi}` : `Permission catalog: ${t.en}`;
    }
    if (n.startsWith('rbac.template.')) {
        const action = n.replace('rbac.template.', '');
        const t = mapAction(action);
        return isVi ? `Bộ quyền: ${t.vi}` : `Permission templates: ${t.en}`;
    }
    if (n === 'rbac.role.assign') return isVi ? 'Gán quyền cho vai trò' : 'Assign permissions to roles';

    if (nLegacy === 'view_bookings') return isVi ? 'Đặt phòng: Xem' : 'Booking: View';
    if (nLegacy === 'manage_bookings') return isVi ? 'Đặt phòng: Quản lý' : 'Booking: Manage';

    if (nLegacy === 'view_rooms') return isVi ? 'Phòng: Xem' : 'Rooms: View';
    if (nLegacy === 'edit_rooms') return isVi ? 'Phòng: Tạo & Sửa' : 'Rooms: Create & Edit';
    if (nLegacy === 'manage_rooms')
        return isVi ? 'Phòng: Quản lý (tạo / sửa / xóa)' : 'Rooms: Manage (create / edit / delete)';

    if (nLegacy === 'view_hosts') return isVi ? 'Host: Xem danh sách & hồ sơ' : 'Hosts: Browse accounts';
    if (nLegacy === 'approve_hosts') return isVi ? 'Host: Duyệt đơn đối tác' : 'Hosts: Approve applications';
    if (nLegacy === 'manage_room_categories') return isVi ? 'Phòng: Quản lý danh mục' : 'Rooms: Manage categories';
    if (nLegacy === 'manage_points') return isVi ? 'Điểm thưởng: Cấu hình quy tắc tích điểm' : 'Loyalty: Configure point rules';
    if (nLegacy === 'manage_rewards') return isVi ? 'Điểm thưởng: Quản lý danh mục quà' : 'Loyalty: Manage reward catalog';
    if (nLegacy === 'manage_facilities') return isVi ? 'Tiện ích: Quản lý master data' : 'Facilities: Manage master data';
    if (nLegacy === 'view_users') return isVi ? 'Người dùng: Xem danh sách' : 'Users: View list';
    if (nLegacy === 'edit_users') return isVi ? 'Người dùng: Sửa hồ sơ & trạng thái' : 'Users: Edit profiles';
    if (nLegacy === 'delete_users') return isVi ? 'Người dùng: Xóa tài khoản' : 'Users: Delete accounts';
    if (nLegacy === 'manage_roles') return isVi ? 'Vai trò: Quản lý & quyền' : 'Roles: Manage roles & permissions';
    if (nLegacy === 'create_class') return isVi ? 'Lớp học: Tạo môi trường' : 'Classrooms: Create environments';
    if (nLegacy === 'approve_content') return isVi ? 'Nội dung: Duyệt & xuất bản' : 'Content: Approve & publish';
    if (nLegacy === 'manage_payouts') return isVi ? 'Tài chính: Duyệt & xử lý rút tiền' : 'Finance: Approve payouts';
    if (nLegacy === 'view_settings') return isVi ? 'Hệ thống: Xem cài đặt' : 'System: View settings';
    if (nLegacy === 'edit_settings') return isVi ? 'Hệ thống: Sửa cài đặt' : 'System: Edit settings';
    if (nLegacy === 'view_logs') return isVi ? 'Hệ thống: Xem nhật ký & audit' : 'System: View logs & audit';

    if (nLegacy === 'view_reviews') return isVi ? 'Đánh giá: Xem' : 'Reviews: View';
    if (nLegacy === 'manage_own_bookings')
        return isVi ? 'Đặt phòng: Thao tác đơn của tôi' : 'Bookings: Own booking actions';
    if (nLegacy === 'guest_send_messages')
        return isVi ? 'Tin nhắn: Gửi & trả lời' : 'Messages: Send & reply';
    if (nLegacy === 'create_reviews') return isVi ? 'Đánh giá: Viết đánh giá' : 'Reviews: Write review';
    if (nLegacy === 'moderate_reviews') return isVi ? 'Đánh giá: Kiểm duyệt' : 'Reviews: Moderate';
    if (nLegacy === 'manage_disputes')
        return isVi ? 'Tranh chấp: Quản lý' : 'Disputes: Manage';

    if (nLegacy === 'view_revenue')
        return isVi ? 'Tài chính: Xem (dashboard & báo cáo)' : 'Finance: View (dashboard & reports)';
    if (nLegacy === 'view_transactions') return isVi ? 'Tài chính: Xem giao dịch' : 'Finance: View transactions';
    if (nLegacy === 'manage_reports') return isVi ? 'Báo cáo: Quản lý' : 'Reports: Manage';

    if (nLegacy === 'manage_kyc') return isVi ? 'Host & KYC: Quản lý KYC' : 'Host & KYC: Manage KYC';
    if (nLegacy === 'manage_ads') return isVi ? 'Marketing: Quản lý quảng cáo' : 'Marketing: Manage ads';

    if (nLegacy === 'view_dashboard') return isVi ? 'Dashboard: Xem' : 'Dashboard: View';
    if (nLegacy === 'view_messages') return isVi ? 'Tin nhắn: Xem' : 'Messages: View';
    if (nLegacy === 'manage_messages') return isVi ? 'Tin nhắn: Quản lý' : 'Messages: Manage';

    const pretty = n.replaceAll('.', ' ').replaceAll('_', ' ');
    return pretty;
}

export function getPermissionDisplayDescription(permissionName: string, description: string, language?: string): string {
    const isVi = (language ?? '').toLowerCase().startsWith('vi');
    const n = (permissionName ?? '').trim();
    const d = (description ?? '').trim();
    const nLegacy = normLegacy(n);

    if (!n) return d;

    if (nLegacy === 'view_bookings' || nLegacy === 'view-bookings')
        return isVi ? 'Xem hồ sơ đặt phòng.' : 'View booking records.';
    if (nLegacy === 'manage_bookings' || nLegacy === 'manage-bookings')
        return isVi ? 'Thay đổi trạng thái đặt phòng và chi tiết liên quan.' : 'Modify booking status and details.';

    if (n.startsWith('branch.room.')) {
        const action = n.replace('branch.room.', '');
        if (action === 'view') return isVi ? 'Xem danh sách phòng và chi tiết phòng.' : 'View room list and room details.';
        if (action === 'create') return isVi ? 'Tạo phòng mới trong phạm vi chi nhánh được phân quyền.' : 'Create new rooms in assigned branch scope.';
        if (action === 'edit') return isVi ? 'Sửa chi tiết phòng.' : 'Edit room details.';
        if (action === 'delete') return isVi ? 'Xóa phòng.' : 'Delete rooms.';
    }

    if (n.startsWith('branch.booking.')) {
        const action = n.replace('branch.booking.', '');
        if (action === 'view') return isVi ? 'Xem danh sách đặt phòng và chi tiết đặt phòng.' : 'View booking list and booking details.';
        if (action === 'manage')
            return isVi
                ? 'Cập nhật trạng thái đặt phòng và thao tác liên quan đến đặt phòng.'
                : 'Update booking status and related booking operations.';
    }

    if (n === 'branch.ads.manage')
        return isVi
            ? 'Mục “Quảng cáo” trên Host Console (tách khỏi Đặt phòng / Lịch & giờ).'
            : 'Host sidebar “Ads” (separate from Bookings / Schedule).';

    if (n === 'view_rooms') return isVi ? 'Duyệt danh sách phòng và xem các listing.' : 'Browse rooms and listings.';
    if (n === 'edit_rooms') return isVi ? 'Tạo và sửa các listing phòng.' : 'Create and edit room listings.';
    if (n === 'manage_rooms') return isVi ? 'Quản lý phòng (tạo/sửa/xóa).' : 'Manage rooms (create/edit/delete).';

    if (n === 'view_reviews') return isVi ? 'Xem đánh giá của người dùng.' : 'View user reviews.';
    if (n === 'manage_own_bookings')
        return isVi
            ? 'Huỷ, đổi lịch hoặc cập nhật các yêu cầu đặt phòng của chính bạn (khách).'
            : 'Cancel, reschedule, or update your own booking requests as a guest.';
    if (n === 'guest_send_messages')
        return isVi
            ? 'Gửi và trả lời tin nhắn trong cuộc trò chuyện phía khách (không phải quản trị hộp thư).'
            : 'Send and reply in guest conversations (not admin inbox management).';
    if (n === 'create_reviews')
        return isVi
            ? 'Tạo và gửi đánh giá sau khi hoàn thành đặt phòng.'
            : 'Create and submit reviews after completed bookings.';
    if (n === 'moderate_reviews') return isVi ? 'Kiểm duyệt hoặc gỡ đánh giá.' : 'Moderate or remove reviews.';
    if (n === 'manage_disputes') return isVi ? 'Xử lý tranh chấp và leo thang (escalation).' : 'Handle disputes and escalations.';

    if (n.startsWith('branch.finance.')) {
        const action = n.replace('branch.finance.', '');
        if (action === 'view')
            return isVi ? 'Xem báo cáo tài chính và giao dịch của chi nhánh.' : 'View finance reports and branch transactions.';
        if (action === 'manage')
            return isVi ? 'Quản lý tài chính (các thao tác nhạy cảm).' : 'Manage branch finance settings and sensitive finance operations.';
        if (action === 'export') return isVi ? 'Xuất dữ liệu tài chính.' : 'Export finance data.';
        if (action === 'payout.create')
            return isVi
                ? 'Tạo yêu cầu rút tiền (payout) — tương ứng nút “Yêu cầu rút tiền” trên Host.'
                : 'Create a withdrawal/payout request — same as the “Request withdrawal” action on Host.';
    }

    if (n === 'view_revenue') return isVi ? 'Truy cập dashboard tài chính và báo cáo.' : 'Access financial dashboard and reports.';
    if (n === 'view_transactions') return isVi ? 'Theo dõi mọi hoạt động tài chính.' : 'Audit all platform financial activity.';
    if (n === 'manage_reports') return isVi ? 'Xử lý các cờ/báo cáo từ người dùng.' : 'Handle user-generated flags and reports.';

    if (n.startsWith('branch.branch.')) {
        const action = n.replace('branch.branch.', '');
        if (action === 'view') return isVi ? 'Xem danh sách chi nhánh và chi tiết chi nhánh.' : 'View branch list and branch details.';
        if (action === 'create') return isVi ? 'Tạo chi nhánh.' : 'Create branches.';
        if (action === 'edit') return isVi ? 'Sửa chi nhánh.' : 'Edit branches.';
        if (action === 'delete') return isVi ? 'Xóa chi nhánh.' : 'Delete branches.';
    }

    if (n === 'branch.checkout.manage') return isVi ? 'Quản lý thao tác check-out cho chi nhánh được phân quyền.' : 'Manage check-out operations for assigned branch.';
    if (n === 'branch.checkin.manage') return isVi ? 'Quản lý thao tác check-in cho chi nhánh được phân quyền.' : 'Manage check-in operations for assigned branch.';
    if (n === 'branch.room_status.manage')
        return isVi ? 'Cập nhật trạng thái phòng, khóa/dọn phòng/bảo trì.' : 'Update room status, lock/cleanup/maintenance states.';
    if (n === 'branch.maintenance.manage')
        return isVi ? 'Quản lý bảo trì và quy trình sửa chữa.' : 'Manage maintenance tickets and repair workflow.';
    if (n === 'branch.cleaning.manage')
        return isVi ? 'Quản lý công việc vệ sinh và quy trình dọn phòng.' : 'Manage cleaning tasks and room housekeeping workflow.';

    if (n === 'branch.profile.view')
        return isVi ? 'Xem hồ sơ chi nhánh và trạng thái KYC.' : 'View branch profile and KYC status.';
    if (n === 'branch.profile.manage')
        return isVi
            ? 'Gửi/cập nhật giấy tờ và quản lý quy trình xác minh KYC trên Host Console.'
            : 'Submit documents and manage KYC verification on Host Console.';
    if (n.startsWith('branch.staff.')) {
        const action = n.replace('branch.staff.', '');
        if (action === 'view') return isVi ? 'Xem danh sách nhân viên và thông tin cơ bản.' : 'View staff list and basic details.';
        if (action === 'create') return isVi ? 'Tạo tài khoản nhân viên mới cho chi nhánh.' : 'Create new staff accounts for the branch.';
        if (action === 'edit') return isVi ? 'Chỉnh sửa thông tin và quyền của nhân viên.' : 'Edit staff information and permissions.';
        if (action === 'delete') return isVi ? 'Xóa hoặc vô hiệu hóa tài khoản nhân viên.' : 'Delete or deactivate staff accounts.';
    }

    if (n === 'rbac.permission.view') return isVi ? 'Xem danh mục quyền.' : 'View permission catalog.';
    if (n === 'rbac.permission.manage') return isVi ? 'Tạo/cập nhật danh mục quyền.' : 'Create and update permission catalog.';
    if (n === 'rbac.template.view') return isVi ? 'Xem bộ quyền.' : 'View permission templates.';
    if (n === 'rbac.template.manage') return isVi ? 'Tạo/cập nhật/xóa bộ quyền.' : 'Create, update, delete permission templates.';
    if (n === 'rbac.role.assign') return isVi ? 'Gán bộ quyền/danh mục quyền cho vai trò.' : 'Assign templates/permissions to roles.';

    if (n === 'view_dashboard') return isVi ? 'Xem tổng quan dashboard hệ thống.' : 'View system dashboard summary.';
    if (n === 'manage_kyc') return isVi ? 'Quản lý & duyệt KYC người dùng.' : 'Review and approve user KYC.';
    if (n === 'manage_ads') return isVi ? 'Quản lý quảng cáo và các chiến dịch/khuyến mãi.' : 'Manage advertisements and promotions.';
    if (n === 'view_messages') return isVi ? 'Xem tin nhắn hỗ trợ và tin nhắn quản trị.' : 'View support and admin messages.';
    if (n === 'manage_messages') return isVi ? 'Quản lý và trả lời tin nhắn.' : 'Manage and reply to messages.';

    if (n === 'view_hosts') return isVi ? 'Duyệt danh sách và hồ sơ tài khoản host.' : 'Browse host accounts and profiles.';
    if (n === 'approve_hosts')
        return isVi ? 'Phê duyệt đơn đăng ký đối tác host.' : 'Approve host partner applications.';
    if (n === 'manage_room_categories') return isVi ? 'Quản lý danh mục loại phòng.' : 'Manage room categories.';
    if (n === 'manage_points') return isVi ? 'Cấu hình quy tắc tích điểm.' : 'Configure point earning rules.';
    if (n === 'manage_rewards') return isVi ? 'Quản lý danh mục quà tặng.' : 'Manage reward catalog.';
    if (n === 'manage_facilities') return isVi ? 'Quản lý dữ liệu master tiện ích.' : 'Manage facility master data.';
    if (n === 'view_users') return isVi ? 'Xem và tìm kiếm danh sách người dùng.' : 'Ability to browse and search the user list.';
    if (n === 'edit_users') return isVi ? 'Cập nhật hồ sơ và trạng thái tài khoản.' : 'Update user profiles and change account status.';
    if (n === 'delete_users') return isVi ? 'Xóa vĩnh viễn tài khoản khỏi hệ thống.' : 'Permanently remove user accounts from the system.';
    if (n === 'manage_roles')
        return isVi ? 'Tạo và chỉnh sửa vai trò hệ thống cùng quyền gán.' : 'Create and edit system roles and their permissions.';
    if (n === 'create_class') return isVi ? 'Thiết lập môi trường học tập mới.' : 'Set up new educational environments.';
    if (n === 'approve_content') return isVi ? 'Duyệt và xuất bản nội dung do gia sư tạo.' : 'Review and publish tutor-generated materials.';
    if (n === 'manage_payouts') return isVi ? 'Phê duyệt và xử lý yêu cầu rút tiền.' : 'Approve and process tutor withdrawal requests.';
    if (n === 'view_settings') return isVi ? 'Xem cấu hình hệ thống.' : 'View system settings.';
    if (n === 'edit_settings') return isVi ? 'Thay đổi cấu hình hệ thống.' : 'Change system settings.';
    if (n === 'view_logs') return isVi ? 'Xem nhật ký hệ thống và kiểm toán.' : 'View system and audit logs.';

    return d || description;
}

export function getPermissionGroupDisplayName(groupName: string, language?: string): string {
    const isVi = (language ?? '').toLowerCase().startsWith('vi');
    const g = (groupName ?? '').trim();
    const gl = g.toLowerCase();

    if (gl === 'branch.room') return isVi ? 'Phòng' : 'Rooms';
    if (gl === 'branch.branch') return isVi ? 'Chi nhánh' : 'Branches';
    if (gl === 'branch.finance') return isVi ? 'Tài chính' : 'Finance';
    if (gl === 'branch.operations') return isVi ? 'Vận hành' : 'Operations';
    if (gl === 'branch.schedule') return isVi ? 'Đặt phòng' : 'Bookings';
    if (gl === 'branch.settings') return isVi ? 'Hồ sơ & KYC' : 'Profile & KYC';
    if (gl === 'branch.staff') return isVi ? 'Nhân viên' : 'Staff';
    if (gl === 'branch.marketing') return isVi ? 'Quảng cáo' : 'Ads';
    if (gl === 'rbac') return isVi ? 'RBAC' : 'RBAC';

    if (gl === 'reviews') return isVi ? 'Đánh giá' : 'Reviews';
    if (gl === 'disputes') return isVi ? 'Tranh chấp' : 'Disputes';

    if (gl === 'host & kyc') return isVi ? 'Đối tác Host & KYC' : 'Host & KYC';
    if (gl === 'user management') return isVi ? 'Quản lý người dùng' : 'User Management';
    if (gl === 'system') return isVi ? 'Hệ thống' : 'System';
    if (gl === 'loyalty') return isVi ? 'Điểm thưởng' : 'Loyalty';
    if (gl === 'facilities') return isVi ? 'Tiện ích' : 'Facilities';
    if (gl === 'marketing') return isVi ? 'Tiếp thị' : 'Marketing';
    if (gl === 'content & classrooms') return isVi ? 'Nội dung & Lớp học' : 'Content & Classrooms';
    if (gl === 'finance & payouts') return isVi ? 'Tài chính & Thanh toán' : 'Finance & Payouts';

    if (gl === 'bookings' || gl.includes('booking')) return isVi ? 'Đặt phòng' : 'Bookings';
    if (gl === 'rooms & catalog' || gl === 'rooms' || (gl.includes('room') && !gl.includes('classroom')))
        return isVi ? 'Phòng' : 'Rooms';
    if (gl === 'messages' || gl.includes('message')) return isVi ? 'Tin nhắn' : 'Messages';
    if (gl === 'dashboard') return isVi ? 'Tổng quan' : 'Dashboard';
    if (gl.includes('finance')) return isVi ? 'Tài chính' : 'Finance';
    if (gl.includes('payout')) return isVi ? 'Thanh toán' : 'Payouts';
    if (gl.includes('marketing')) return isVi ? 'Tiếp thị' : 'Marketing';

    return g;
}
