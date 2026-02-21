import { UserProfile, NotificationSettings, PaymentMethod } from '../types';

export const USER_PROFILE: UserProfile = {
  id: 1,
  name: 'Nguyễn Văn An',
  email: 'nguyenvanan@example.com',
  phone: '+84 901 234 567',
  avatar: 'https://i.pravatar.cc/150?img=12',
  bio: 'IELTS Trainer & Education Consultant với 5+ năm kinh nghiệm',
  location: 'Quận 1, TP. Hồ Chí Minh',
  memberSince: 'Tháng 1, 2023',
  role: 'renter',
  verified: true,
  kycStatus: 'not_submitted',
  totalBookings: 24,
  totalReviews: 18,
  rating: 4.8,
  totalSpent: 45_600_000
};

export const NOTIFICATION_SETTINGS: NotificationSettings = {
  emailBookingConfirm: true,
  emailMessages: true,
  emailPromotions: false,
  pushNotifications: true
};

export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 1,
    type: 'card',
    last4: '4242',
    name: 'Visa ending in 4242',
    isDefault: true
  },
  {
    id: 2,
    type: 'bank',
    last4: '9876',
    name: 'Vietcombank ****9876',
    isDefault: false
  },
  {
    id: 3,
    type: 'momo',
    last4: '4567',
    name: 'MoMo ****4567',
    isDefault: false
  }
];
