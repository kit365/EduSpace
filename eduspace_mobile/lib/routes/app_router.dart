import 'package:flutter/material.dart';
import '../features/auth/presentation/login_screen.dart';
import '../features/auth/presentation/register_screen.dart';
import '../features/room/data/room_model.dart';
import '../features/home/presentation/home_screen.dart';
import '../features/room/presentation/room_detail_screen.dart';
import '../features/booking/presentation/booking_flow_screen.dart';
import '../features/booking/presentation/booking_list_screen.dart';
import '../features/booking/presentation/booking_detail_screen.dart';
import '../features/booking/data/booking_detail_model.dart';
import '../features/payment/presentation/payment_screen.dart';
import '../features/payment/presentation/payment_success_screen.dart';
import '../features/wallet/presentation/wallet_screen.dart';
import '../features/wallet/presentation/rewards_screen.dart';

class AppRouter {
  // Route names
  static const String login = '/login';
  static const String register = '/register';
  static const String home = '/home';
  static const String roomDetail = '/room';
  static const String bookingFlow = '/booking/new';
  static const String bookingList = '/bookings';
  static const String bookingDetail = '/booking/detail';
  static const String payment = '/payment';
  static const String paymentSuccess = '/payment/success';
  static const String profile = '/profile';
  static const String wallet = '/wallet';
  static const String rewards = '/wallet/rewards';

  static Route<dynamic> generateRoute(RouteSettings settings) {
    switch (settings.name) {
      case login:
        return _go(const LoginScreen());

      case register:
        return _go(const RegisterScreen());

      // Các màn hình chưa làm → placeholder
      case home:
        return _go(const HomeScreen());
      case roomDetail:
        final room = settings.arguments as RoomModel?;
        if (room != null) return _go(RoomDetailScreen(room: room));
        return _go(const _ComingSoon(label: 'Room Detail'));
      case bookingFlow:
        final room = settings.arguments as RoomModel?;
        if (room != null) return _go(BookingFlowScreen(room: room));
        return _go(const _ComingSoon(label: 'Booking Flow'));
      case bookingList:
        return _go(const BookingListScreen());
      case bookingDetail:
        final detail = settings.arguments as MockBookingDetail?;
        if (detail != null) return _go(BookingDetailScreen(booking: detail));
        return _go(BookingDetailScreen(booking: mockBookingDetails[0]));
      case payment:
        final args = settings.arguments as PaymentArgs?;
        if (args != null) return _go(PaymentScreen(args: args));
        return _go(
          PaymentScreen(
            args: const PaymentArgs(
              roomName: 'Phòng Hội Thảo A1',
              date: '15/01/2026',
              timeRange: '08:00 - 12:00',
              totalAmount: 3500000,
            ),
          ),
        );
      case paymentSuccess:
        final args = settings.arguments as PaymentSuccessArgs?;
        if (args != null) return _go(PaymentSuccessScreen(args: args));
        return _go(
          PaymentSuccessScreen(
            args: const PaymentSuccessArgs(
              roomName: 'Phòng Hội Thảo A1',
              location: 'Cơ sở Quận 1',
              bookingId: '#EDU-982341',
              date: '24 Tháng 10, 2024',
              amountPaid: 1500000,
            ),
          ),
        );
      case profile:
        return _go(const _ComingSoon(label: 'Profile'));
      case wallet:
        return _go(const WalletScreen());
      case rewards:
        return _go(const RewardsScreen());

      default:
        return _go(const _ComingSoon(label: '404 — Not Found'));
    }
  }

  static MaterialPageRoute _go(Widget page) =>
      MaterialPageRoute(builder: (_) => page);
}

class _ComingSoon extends StatelessWidget {
  final String label;
  const _ComingSoon({required this.label});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(label)),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.construction_rounded,
              size: 64,
              color: Color(0xFFEF4444),
            ),
            const SizedBox(height: 16),
            Text(
              label,
              style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            const Text('Coming soon...', style: TextStyle(color: Colors.grey)),
            const SizedBox(height: 24),
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('← Go Back'),
            ),
          ],
        ),
      ),
    );
  }
}
