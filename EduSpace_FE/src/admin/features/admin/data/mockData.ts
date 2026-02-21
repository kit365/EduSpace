import { User, Shield, CreditCard, Activity, AlertTriangle, CheckCircle } from 'lucide-react';
import type { User as UserType } from '../../../../types/user';
import type { Transaction, SystemWallet, PayoutRequest } from '../../../../types/finance';
import type { Dispute } from '../../../../types/dispute';

// ─── DASHBOARD STATS ─────────────────────────────────────────
export const ADMIN_STATS = [
  { label: 'Tổng người dùng', value: '1,234', change: '+12%', icon: User, color: 'text-blue-500', bg: 'bg-blue-50' },
  { label: 'Host đã duyệt', value: '56', change: '+5', icon: Shield, color: 'text-green-500', bg: 'bg-green-50' },
  { label: 'Doanh thu hệ thống', value: '452.3M ₫', change: '+8%', icon: CreditCard, color: 'text-purple-500', bg: 'bg-purple-50' },
  { label: 'Sức khỏe hệ thống', value: '98%', change: 'Ổn định', icon: Activity, color: 'text-orange-500', bg: 'bg-orange-50' },
];

// ─── USER MANAGEMENT ──────────────────────────────────────────
export const MOCK_USERS: UserType[] = [
  {
    id: '1', name: 'Nguyễn Văn Minh', email: 'minh.nv@gmail.com', phone: '0901234567',
    avatar: 'https://i.pravatar.cc/150?img=11',
    role: 'renter', accountStatus: 'active', kycStatus: 'not_submitted', isVerified: false,
    joinedAt: '2024-06-15', location: 'TP.HCM',
    bio: 'Gia sư Toán, Lý cấp 3 - 5 năm kinh nghiệm'
  },
  {
    id: '2', name: 'Trần Thị Bích Ngọc', email: 'ngoc.ttb@gmail.com', phone: '0912345678',
    avatar: 'https://i.pravatar.cc/150?img=47',
    role: 'host', accountStatus: 'active', kycStatus: 'verified', isVerified: true,
    verificationDocs: ['cccd_front.jpg', 'cccd_back.jpg', 'business_license.pdf'],
    commissionRate: 8,  // VIP host
    joinedAt: '2023-11-20', location: 'Quận 1, TP.HCM',
    bio: 'Chủ chuỗi phòng họp EduHub - 12 phòng trên toàn TP.HCM'
  },
  {
    id: '3', name: 'Lê Hoàng Quân', email: 'quan.lh@eduspace.vn',
    role: 'admin', accountStatus: 'active', kycStatus: 'verified', isVerified: true,
    joinedAt: '2022-01-01', location: 'TP.HCM'
  },
  {
    id: '4', name: 'Phạm Đức Anh', email: 'anh.pd@gmail.com', phone: '0923456789',
    avatar: 'https://i.pravatar.cc/150?img=33',
    role: 'renter', accountStatus: 'suspended', kycStatus: 'not_submitted', isVerified: false,
    joinedAt: '2024-01-10', location: 'Hà Nội',
    bio: 'Diễn giả chuyên đề Kỹ năng mềm'
  },
  {
    id: '5', name: 'Hoàng Lan Anh', email: 'lananh.h@gmail.com', phone: '0934567890',
    avatar: 'https://i.pravatar.cc/150?img=45',
    role: 'host', accountStatus: 'pending', kycStatus: 'pending', isVerified: false,
    verificationDocs: ['cccd_front.jpg', 'cccd_back.jpg'],
    joinedAt: '2024-08-01', location: 'Quận 7, TP.HCM',
    bio: 'Chủ phòng dạy học The Learning Space'
  },
  {
    id: '6', name: 'Võ Minh Tuấn', email: 'tuan.vm@eduhub.vn', phone: '0945678901',
    avatar: 'https://i.pravatar.cc/150?img=15',
    role: 'staff', accountStatus: 'active', kycStatus: 'not_submitted', isVerified: false,
    parentHostId: '2',
    joinedAt: '2024-03-15', location: 'Quận 1, TP.HCM',
    bio: 'Nhân viên lễ tân EduHub - Chi nhánh Q1'
  }
];

// ─── ROLE DEFINITIONS ─────────────────────────────────────────
export const MOCK_ROLES = [
  {
    id: 'admin', name: 'Quản trị viên (Admin)', users: 3,
    permissions: ['Toàn quyền hệ thống', 'Duyệt Host & Phòng', 'Quản lý tài chính', 'Xử lý tranh chấp']
  },
  {
    id: 'host', name: 'Chủ phòng (Host)', users: 56,
    permissions: ['Đăng tin phòng', 'Quản lý lịch đặt', 'Xem doanh thu', 'Tạo tài khoản Staff', 'Rút tiền']
  },
  {
    id: 'staff', name: 'Nhân viên (Staff)', users: 28,
    permissions: ['Check-in khách', 'Thu tiền dịch vụ', 'Thêm phí phát sinh', 'Xem lịch đặt phòng']
  },
  {
    id: 'renter', name: 'Người thuê (Renter)', users: 1147,
    permissions: ['Tìm & Đặt phòng', 'Thanh toán trực tuyến', 'Nhắn tin', 'Đánh giá & Báo cáo']
  },
];

// ─── SYSTEM LOGS ──────────────────────────────────────────────
export const MOCK_LOGS = [
  { id: '1', action: 'Renter đăng nhập', user: 'Nguyễn Văn Minh', time: '2 phút trước', status: 'Thành công' },
  { id: '2', action: 'Host tạo phòng mới', user: 'Trần Thị Bích Ngọc', time: '15 phút trước', status: 'Chờ duyệt' },
  { id: '3', action: 'Backup hệ thống', user: 'System', time: '1 giờ trước', status: 'Thành công' },
  { id: '4', action: 'Admin duyệt Host KYC', user: 'Lê Hoàng Quân', time: '3 giờ trước', status: 'Đã duyệt' },
  { id: '5', action: 'Staff check-in booking', user: 'Võ Minh Tuấn', time: '4 giờ trước', status: 'Thành công' },
  { id: '6', action: 'Renter nộp báo cáo tranh chấp', user: 'Phạm Đức Anh', time: '5 giờ trước', status: 'Mới' },
  { id: '7', action: 'Host yêu cầu rút tiền', user: 'Trần Thị Bích Ngọc', time: '6 giờ trước', status: 'Đang xử lý' },
];

// ─── FINANCE: SYSTEM WALLET ───────────────────────────────────
export const MOCK_SYSTEM_WALLET: SystemWallet = {
  totalBalance: 1_250_000_000,
  escrowBalance: 320_000_000,
  commissionEarned: 45_200_000,
  pendingPayouts: 85_000_000,
};

// ─── FINANCE: TRANSACTIONS ────────────────────────────────────
export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 'TXN-001', type: 'booking_payment', amount: 3_000_000, currency: 'VND',
    fromUserId: '1', fromUserName: 'Nguyễn Văn Minh',
    toUserId: 'system', toUserName: 'EduSpace Escrow',
    bookingId: 'BK-2024-0015',
    status: 'escrow', description: 'Thanh toán đặt phòng Studio A-12 (3h)',
    createdAt: '2024-12-15T10:30:00'
  },
  {
    id: 'TXN-002', type: 'commission', amount: 250_000, currency: 'VND',
    fromUserId: '2', fromUserName: 'Trần Thị Bích Ngọc',
    toUserId: 'system', toUserName: 'EduSpace',
    bookingId: 'BK-2024-0014',
    status: 'completed', description: 'Phí hoa hồng 8% - Booking BK-2024-0014',
    createdAt: '2024-12-14T16:00:00', completedAt: '2024-12-14T16:00:00'
  },
  {
    id: 'TXN-003', type: 'payout', amount: 2_500_000, currency: 'VND',
    fromUserId: 'system', fromUserName: 'EduSpace',
    toUserId: '2', toUserName: 'Trần Thị Bích Ngọc',
    status: 'completed', description: 'Chi trả cho Host sau khi trừ hoa hồng',
    createdAt: '2024-12-14T16:05:00', completedAt: '2024-12-15T09:00:00'
  },
  {
    id: 'TXN-004', type: 'refund', amount: 1_200_000, currency: 'VND',
    fromUserId: 'system', fromUserName: 'EduSpace',
    toUserId: '4', toUserName: 'Phạm Đức Anh',
    bookingId: 'BK-2024-0012',
    status: 'completed', description: 'Hoàn tiền do Host huỷ phòng',
    createdAt: '2024-12-13T11:00:00', completedAt: '2024-12-13T14:00:00'
  },
  {
    id: 'TXN-005', type: 'service_charge', amount: 150_000, currency: 'VND',
    fromUserId: '1', fromUserName: 'Nguyễn Văn Minh',
    toUserId: '2', toUserName: 'Trần Thị Bích Ngọc',
    bookingId: 'BK-2024-0010',
    status: 'completed', description: 'Phí thuê máy chiếu thêm (Staff thu tại quầy)',
    createdAt: '2024-12-12T14:30:00', completedAt: '2024-12-12T14:30:00'
  }
];

// ─── FINANCE: PAYOUT REQUESTS ─────────────────────────────────
export const MOCK_PAYOUT_REQUESTS: PayoutRequest[] = [
  {
    id: 'PO-001', hostId: '2', hostName: 'Trần Thị Bích Ngọc',
    amount: 8_500_000, commission: 680_000, netAmount: 7_820_000,
    bankInfo: 'Vietcombank ****6789', status: 'pending',
    requestedAt: '2024-12-15T08:00:00'
  },
  {
    id: 'PO-002', hostId: '5', hostName: 'Hoàng Lan Anh',
    amount: 3_200_000, commission: 320_000, netAmount: 2_880_000,
    bankInfo: 'MB Bank ****1234', status: 'processing',
    requestedAt: '2024-12-14T10:00:00'
  }
];

// ─── DISPUTES ─────────────────────────────────────────────────
export const MOCK_DISPUTES: Dispute[] = [
  {
    id: 'DSP-001', bookingId: 'BK-2024-0012',
    reporterId: '4', reporterName: 'Phạm Đức Anh', reporterRole: 'renter',
    againstId: '5', againstName: 'Hoàng Lan Anh', againstRole: 'host',
    category: 'room_mismatch', title: 'Phòng không đúng mô tả',
    description: 'Phòng đăng là 30 chỗ ngồi nhưng thực tế chỉ có 15. Máy chiếu không hoạt động.',
    evidence: ['evidence_1.jpg', 'evidence_2.jpg'],
    status: 'open', priority: 'high',
    createdAt: '2024-12-14T09:00:00', updatedAt: '2024-12-14T09:00:00'
  },
  {
    id: 'DSP-002', bookingId: 'BK-2024-0008',
    reporterId: '2', reporterName: 'Trần Thị Bích Ngọc', reporterRole: 'host',
    againstId: '1', againstName: 'Nguyễn Văn Minh', againstRole: 'renter',
    category: 'behavior', title: 'Renter gây hư hỏng thiết bị',
    description: 'Khách đã làm hỏng bảng trắng điện tử và không chịu bồi thường. Thiệt hại ước tính 5 triệu VNĐ.',
    status: 'under_review', priority: 'medium',
    createdAt: '2024-12-10T15:00:00', updatedAt: '2024-12-12T10:00:00'
  },
  {
    id: 'DSP-003', bookingId: 'BK-2024-0005',
    reporterId: '1', reporterName: 'Nguyễn Văn Minh', reporterRole: 'renter',
    againstId: '2', againstName: 'Trần Thị Bích Ngọc', againstRole: 'host',
    category: 'cancellation', title: 'Host huỷ phòng sát giờ',
    description: 'Host huỷ phòng 30 phút trước giờ buổi dạy bắt đầu. Không có phòng thay thế. Đã mất học viên.',
    status: 'resolved_refund', priority: 'critical', resolution: 'Hoàn tiền 100% và cảnh cáo Host.',
    resolvedBy: 'Lê Hoàng Quân', refundAmount: 2_400_000,
    createdAt: '2024-12-01T07:00:00', updatedAt: '2024-12-02T14:00:00', resolvedAt: '2024-12-02T14:00:00'
  },
];

// ─── KYC PENDING REVIEWS ──────────────────────────────────────
export const MOCK_KYC_REQUESTS = [
  {
    id: 'KYC-001',
    userId: '5', userName: 'Hoàng Lan Anh', userEmail: 'lananh.h@gmail.com',
    avatar: 'https://i.pravatar.cc/150?img=45',
    documents: [
      { type: 'CCCD (Mặt trước)', url: 'cccd_front.jpg', status: 'pending' },
      { type: 'CCCD (Mặt sau)', url: 'cccd_back.jpg', status: 'pending' },
    ],
    submittedAt: '2024-12-14T08:00:00',
    status: 'pending' as const,
    note: 'Chủ phòng dạy học The Learning Space - Q7'
  },
  {
    id: 'KYC-002',
    userId: '7', userName: 'Đỗ Thanh Tùng', userEmail: 'tung.dt@gmail.com',
    avatar: 'https://i.pravatar.cc/150?img=12',
    documents: [
      { type: 'CCCD (Mặt trước)', url: 'cccd_front_2.jpg', status: 'pending' },
      { type: 'CCCD (Mặt sau)', url: 'cccd_back_2.jpg', status: 'pending' },
      { type: 'Giấy phép kinh doanh', url: 'business_license.pdf', status: 'pending' },
    ],
    submittedAt: '2024-12-15T10:30:00',
    status: 'pending' as const,
    note: 'Startup EdTech - chuỗi 3 phòng workshop tại Q.Bình Thạnh'
  }
];

// ─── PENDING ROOM APPROVALS ───────────────────────────────────
export const MOCK_PENDING_ROOMS = [
  {
    id: 101, name: 'Workshop Studio Sáng Tạo', hostId: '2', hostName: 'Trần Thị Bích Ngọc',
    type: 'workshop', capacity: 25, price: 800_000, location: 'Quận 1, TP.HCM',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400',
    submittedAt: '2024-12-14T09:00:00', approvalStatus: 'pending_review' as const,
    description: 'Phòng workshop đa năng, trang bị máy chiếu 4K, bảng trắng điện tử, WiFi tốc độ cao.'
  },
  {
    id: 102, name: 'Phòng Seminar Hội Trường B', hostId: '5', hostName: 'Hoàng Lan Anh',
    type: 'seminar_hall', capacity: 80, price: 2_500_000, location: 'Quận 7, TP.HCM',
    image: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=400',
    submittedAt: '2024-12-15T11:00:00', approvalStatus: 'pending_review' as const,
    description: 'Hội trường lớn cho seminar, có sân khấu, hệ thống âm thanh chuyên nghiệp.'
  }
];
