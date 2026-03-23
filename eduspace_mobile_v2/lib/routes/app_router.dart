import 'package:flutter/material.dart';
import '../presentation/pages/auth/login_screen.dart';
import '../presentation/pages/home/home_screen.dart';
import '../presentation/pages/profile/profile_screen.dart';
import '../presentation/common/widgets/placeholder_screen.dart';
import '../presentation/pages/room/room_detail_screen.dart';
import '../presentation/pages/booking/booking_flow_screen.dart';
import '../presentation/pages/booking/booking_list_screen.dart';
import '../presentation/pages/booking/booking_detail_screen.dart';
import '../presentation/pages/payment/payment_screen.dart';
import '../presentation/pages/payment/payment_success_screen.dart';
import '../presentation/pages/wallet/wallet_screen.dart';
import '../presentation/pages/wallet/rewards_screen.dart';
import '../data/models/response/room/room_api_models.dart';
import '../data/models/response/booking/booking_detail_model.dart';

class AppRouter {
  static final GlobalKey<NavigatorState> navigatorKey = GlobalKey<NavigatorState>();

  static const String login = '/login';
  static const String home = '/home';
  static const String profile = '/profile';
  static const String wallet = '/wallet';
  static const String rewards = '/rewards';
  static const String roomDetail = '/room/detail';
  static const String bookingFlow = '/booking/flow';
  static const String bookingList = '/booking/list';
  static const String bookingDetail = '/booking/detail';
  static const String payment = '/payment';
  static const String paymentSuccess = '/payment/success';

  static Route<dynamic> generateRoute(RouteSettings settings) {
    switch (settings.name) {
      case login:
        return _go(const LoginScreen());
      case home:
        return _go(const HomeScreen());
      case profile:
        return _go(const ProfileScreen());
      case wallet:
        return _go(const WalletScreen());
      case rewards:
        return _go(const RewardsScreen());
      case roomDetail:
        final room = settings.arguments as RoomResponse;
        return _go(RoomDetailScreen(room: room));
      case bookingFlow:
        final room = settings.arguments as RoomResponse;
        return _go(BookingFlowScreen(room: room));
      case bookingList:
        return _go(const BookingListScreen());
      case bookingDetail:
        final booking = settings.arguments as MockBookingDetail;
        return _go(BookingDetailScreen(booking: booking));
      case payment:
        final args = settings.arguments as PaymentArgs;
        return _go(PaymentScreen(args: args));
      case paymentSuccess:
        final args = settings.arguments as PaymentSuccessArgs;
        return _go(PaymentSuccessScreen(args: args));
      default:
        return _go(const PlaceholderScreen(label: '404 - Not Found', icon: Icons.error_outline));
    }
  }

  static MaterialPageRoute _go(Widget page) =>
      MaterialPageRoute(builder: (_) => page);
}
