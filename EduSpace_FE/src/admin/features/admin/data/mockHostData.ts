import type { HostProfile } from '../../../../types/host';

// ─── MOCK HOST PROFILES ───────────────────────────────────────
export const MOCK_HOST_PROFILES: HostProfile[] = [
    {
        id: 'H-001',
        name: 'Trần Thị Bích Ngọc',
        email: 'ngoc.ttb@eduhub.vn',
        phone: '0901234567',
        avatar: 'https://i.pravatar.cc/150?img=23',
        hostType: 'business',
        businessName: 'Công ty TNHH EduHub Việt Nam',
        businessLicense: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
        taxCode: '0312345678',
        kycStatus: 'verified',
        kycDocuments: [
            {
                id: 'KYC-D-001', type: 'cccd_front', label: 'CCCD - Mặt trước',
                url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
                status: 'approved', uploadedAt: '2024-06-15T10:00:00'
            },
            {
                id: 'KYC-D-002', type: 'cccd_back', label: 'CCCD - Mặt sau',
                url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
                status: 'approved', uploadedAt: '2024-06-15T10:00:00'
            },
            {
                id: 'KYC-D-003', type: 'business_license', label: 'Giấy phép kinh doanh',
                url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
                status: 'approved', uploadedAt: '2024-06-15T10:00:00'
            }
        ],
        kycReviewedBy: 'Admin Lê Quân',
        kycReviewedAt: '2024-06-16T14:30:00',
        accountStatus: 'active',
        joinedAt: '2024-05-20',
        lastLoginAt: '2026-02-21T08:15:00',
        address: '123 Nguyễn Huệ, Quận 1, TP.HCM',
        location: 'Quận 1, TP.HCM',
        totalSpaces: 8,
        activeSpaces: 6,
        pendingSpaces: 2,
        totalBookings: 342,
        completedBookings: 310,
        cancelledBookings: 12,
        totalRevenue: 890_000_000,
        monthlyRevenue: 67_500_000,
        averageRating: 4.8,
        totalReviews: 256,
        responseRate: 98,
        responseTime: '< 30 phút',
        trustLevel: 'premium',
        trustScore: 95,
        disputeCount: 3,
        resolvedDisputeCount: 3,
        commissionRate: 8,
        isCustomCommission: true,
        recentActivities: [
            { id: 'A-001', type: 'booking_completed', message: 'Đơn đặt phòng BK-2026-0342 đã hoàn thành', timestamp: '2026-02-21T16:00:00', performedBy: 'system' },
            { id: 'A-002', type: 'payout_completed', message: 'Đã nhận thanh toán 12,500,000đ', timestamp: '2026-02-20T09:00:00', performedBy: 'Admin Lê Quân' },
            { id: 'A-003', type: 'space_submitted', message: 'Gửi listing mới: Workshop Studio Sáng Tạo', timestamp: '2026-02-18T14:20:00' },
            { id: 'A-004', type: 'space_approved', message: 'Listing "Phòng họp Premium A" đã được duyệt', timestamp: '2026-02-15T11:00:00', performedBy: 'Admin Lê Quân' },
            { id: 'A-005', type: 'booking_received', message: 'Đơn đặt phòng mới BK-2026-0340 từ Nguyễn Văn Minh', timestamp: '2026-02-14T08:30:00', performedBy: 'system' },
        ]
    },
    {
        id: 'H-002',
        name: 'Hoàng Lan Anh',
        email: 'lananh.h@gmail.com',
        phone: '0934567890',
        avatar: 'https://i.pravatar.cc/150?img=45',
        hostType: 'individual',
        kycStatus: 'pending',
        kycDocuments: [
            {
                id: 'KYC-D-004', type: 'cccd_front', label: 'CCCD - Mặt trước',
                url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
                status: 'pending', uploadedAt: '2026-02-10T09:00:00'
            },
            {
                id: 'KYC-D-005', type: 'cccd_back', label: 'CCCD - Mặt sau',
                url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
                status: 'pending', uploadedAt: '2026-02-10T09:00:00'
            }
        ],
        accountStatus: 'pending',
        joinedAt: '2026-01-15',
        lastLoginAt: '2026-02-20T19:45:00',
        address: '456 Lê Văn Sỹ, Quận 3, TP.HCM',
        location: 'Quận 3, TP.HCM',
        totalSpaces: 2,
        activeSpaces: 0,
        pendingSpaces: 2,
        totalBookings: 0,
        completedBookings: 0,
        cancelledBookings: 0,
        totalRevenue: 0,
        monthlyRevenue: 0,
        averageRating: 0,
        totalReviews: 0,
        responseRate: 0,
        responseTime: 'N/A',
        trustLevel: 'new',
        trustScore: 20,
        disputeCount: 0,
        resolvedDisputeCount: 0,
        commissionRate: 10,
        isCustomCommission: false,
        recentActivities: [
            { id: 'A-010', type: 'kyc_submitted', message: 'Đã gửi hồ sơ KYC để xác thực', timestamp: '2026-02-10T09:00:00' },
            { id: 'A-011', type: 'space_submitted', message: 'Gửi listing mới: Phòng học nhỏ Q3', timestamp: '2026-02-08T15:00:00' },
        ]
    },
    {
        id: 'H-003',
        name: 'Lê Minh Tuấn',
        email: 'tuan.lm@workshopspace.vn',
        phone: '0978123456',
        avatar: 'https://i.pravatar.cc/150?img=12',
        hostType: 'business',
        businessName: 'Workshop Space Sài Gòn',
        businessLicense: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
        taxCode: '0309876543',
        kycStatus: 'verified',
        kycDocuments: [
            {
                id: 'KYC-D-006', type: 'cccd_front', label: 'CCCD - Mặt trước',
                url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
                status: 'approved', uploadedAt: '2024-09-01T10:00:00'
            },
            {
                id: 'KYC-D-007', type: 'cccd_back', label: 'CCCD - Mặt sau',
                url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
                status: 'approved', uploadedAt: '2024-09-01T10:00:00'
            },
            {
                id: 'KYC-D-008', type: 'business_license', label: 'Giấy phép kinh doanh',
                url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
                status: 'approved', uploadedAt: '2024-09-01T10:00:00'
            }
        ],
        kycReviewedBy: 'Admin Lê Quân',
        kycReviewedAt: '2024-09-02T10:00:00',
        accountStatus: 'active',
        joinedAt: '2024-08-10',
        lastLoginAt: '2026-02-21T12:00:00',
        address: '789 Điện Biên Phủ, Bình Thạnh, TP.HCM',
        location: 'Bình Thạnh, TP.HCM',
        totalSpaces: 5,
        activeSpaces: 4,
        pendingSpaces: 1,
        totalBookings: 189,
        completedBookings: 175,
        cancelledBookings: 8,
        totalRevenue: 520_000_000,
        monthlyRevenue: 42_000_000,
        averageRating: 4.5,
        totalReviews: 142,
        responseRate: 92,
        responseTime: '< 1 giờ',
        trustLevel: 'trusted',
        trustScore: 82,
        disputeCount: 5,
        resolvedDisputeCount: 4,
        commissionRate: 10,
        isCustomCommission: false,
        recentActivities: [
            { id: 'A-020', type: 'booking_completed', message: 'Đơn BK-2026-0291 đã hoàn thành', timestamp: '2026-02-21T10:00:00', performedBy: 'system' },
            { id: 'A-021', type: 'dispute_resolved', message: 'Dispute DSP-015 đã được giải quyết', timestamp: '2026-02-19T16:00:00', performedBy: 'Admin Lê Quân' },
            { id: 'A-022', type: 'space_submitted', message: 'Gửi listing mới: Hội trường Workshop 200m²', timestamp: '2026-02-17T09:30:00' },
        ]
    },
    {
        id: 'H-004',
        name: 'Phạm Thanh Hà',
        email: 'ha.pt@startedu.com',
        phone: '0912345678',
        avatar: 'https://i.pravatar.cc/150?img=32',
        hostType: 'business',
        businessName: 'StartEdu Academy',
        businessLicense: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
        taxCode: '0313579246',
        kycStatus: 'rejected',
        kycDocuments: [
            {
                id: 'KYC-D-009', type: 'cccd_front', label: 'CCCD - Mặt trước',
                url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
                status: 'approved', uploadedAt: '2026-01-20T10:00:00'
            },
            {
                id: 'KYC-D-010', type: 'business_license', label: 'Giấy phép kinh doanh',
                url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
                status: 'rejected', uploadedAt: '2026-01-20T10:00:00',
                reviewNote: 'Giấy phép đã hết hạn. Vui lòng cung cấp bản cập nhật.'
            }
        ],
        accountStatus: 'suspended',
        joinedAt: '2026-01-10',
        lastLoginAt: '2026-02-15T20:00:00',
        address: '321 CMT8, Quận 10, TP.HCM',
        location: 'Quận 10, TP.HCM',
        totalSpaces: 3,
        activeSpaces: 0,
        pendingSpaces: 0,
        totalBookings: 45,
        completedBookings: 30,
        cancelledBookings: 10,
        totalRevenue: 85_000_000,
        monthlyRevenue: 0,
        averageRating: 3.2,
        totalReviews: 28,
        responseRate: 65,
        responseTime: '> 2 giờ',
        trustLevel: 'standard',
        trustScore: 45,
        disputeCount: 8,
        resolvedDisputeCount: 5,
        commissionRate: 15,
        isCustomCommission: true,
        recentActivities: [
            { id: 'A-030', type: 'account_suspended', message: 'Tài khoản bị tạm khóa do vi phạm chính sách', timestamp: '2026-02-10T14:00:00', performedBy: 'Admin Lê Quân' },
            { id: 'A-031', type: 'dispute_opened', message: 'Dispute mới DSP-022: Phòng không đúng mô tả', timestamp: '2026-02-08T11:00:00', performedBy: 'Nguyễn Văn Minh' },
            { id: 'A-032', type: 'kyc_rejected', message: 'Hồ sơ KYC bị từ chối: Giấy phép hết hạn', timestamp: '2026-01-22T09:00:00', performedBy: 'Admin Lê Quân' },
        ]
    },
    {
        id: 'H-005',
        name: 'Võ Quốc Bảo',
        email: 'bao.vq@colearn.space',
        phone: '0945678901',
        avatar: 'https://i.pravatar.cc/150?img=15',
        hostType: 'individual',
        kycStatus: 'verified',
        kycDocuments: [
            {
                id: 'KYC-D-011', type: 'cccd_front', label: 'CCCD - Mặt trước',
                url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
                status: 'approved', uploadedAt: '2025-03-10T10:00:00'
            },
            {
                id: 'KYC-D-012', type: 'cccd_back', label: 'CCCD - Mặt sau',
                url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
                status: 'approved', uploadedAt: '2025-03-10T10:00:00'
            }
        ],
        kycReviewedBy: 'Admin Lê Quân',
        kycReviewedAt: '2025-03-11T15:00:00',
        accountStatus: 'active',
        joinedAt: '2025-02-28',
        lastLoginAt: '2026-02-21T14:30:00',
        address: '55 Hoàng Diệu 2, TP. Thủ Đức',
        location: 'TP. Thủ Đức',
        totalSpaces: 3,
        activeSpaces: 3,
        pendingSpaces: 0,
        totalBookings: 128,
        completedBookings: 120,
        cancelledBookings: 3,
        totalRevenue: 310_000_000,
        monthlyRevenue: 28_000_000,
        averageRating: 4.6,
        totalReviews: 95,
        responseRate: 95,
        responseTime: '< 45 phút',
        trustLevel: 'trusted',
        trustScore: 88,
        disputeCount: 1,
        resolvedDisputeCount: 1,
        commissionRate: 10,
        isCustomCommission: false,
        recentActivities: [
            { id: 'A-040', type: 'booking_received', message: 'Đơn mới BK-2026-0315 từ Lê Thị Hoa', timestamp: '2026-02-21T07:00:00', performedBy: 'system' },
            { id: 'A-041', type: 'payout_requested', message: 'Yêu cầu rút tiền 15,000,000đ', timestamp: '2026-02-19T10:00:00' },
            { id: 'A-042', type: 'booking_completed', message: 'Đơn BK-2026-0310 đã hoàn thành', timestamp: '2026-02-18T17:00:00', performedBy: 'system' },
        ]
    }
];
