import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';
import '../../../routes/app_router.dart';
import '../data/booking_detail_model.dart';

// ─── Mock Booking Model ───────────────────────────────────────────────────────
enum _BookingStatus { confirmed, awaitingPayment, completed, cancelled }

class _MockBooking {
  final String id;
  final String roomName;
  final String imageUrl;
  final double pricePerHour;
  final String date;
  final String timeRange;
  final _BookingStatus status;
  final int detailIndex; // index into mockBookingDetails

  const _MockBooking({
    required this.id,
    required this.roomName,
    required this.imageUrl,
    required this.pricePerHour,
    required this.date,
    required this.timeRange,
    required this.status,
    this.detailIndex = 0,
  });
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const List<_MockBooking> _mockBookings = [
  _MockBooking(
    id: '1',
    roomName: 'Advanced Physics Lab',
    imageUrl:
        'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80',
    pricePerHour: 45,
    date: 'Oct 24, 2024',
    timeRange: '10:00 AM - 12:00 PM',
    status: _BookingStatus.confirmed,
    detailIndex: 0,
  ),
  _MockBooking(
    id: '2',
    roomName: 'Creative Arts Studio',
    imageUrl:
        'https://images.unsplash.com/photo-1541746972996-4e0b0f43e02a?w=600&q=80',
    pricePerHour: 30,
    date: 'Oct 28, 2024',
    timeRange: '02:00 PM - 05:00 PM',
    status: _BookingStatus.awaitingPayment,
    detailIndex: 1,
  ),
  _MockBooking(
    id: '3',
    roomName: 'Main Lecture Hall 4',
    imageUrl:
        'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&q=80',
    pricePerHour: 60,
    date: 'Nov 02, 2024',
    timeRange: '09:00 AM - 12:00 PM',
    status: _BookingStatus.confirmed,
    detailIndex: 2,
  ),
  _MockBooking(
    id: '4',
    roomName: 'Innovation Hub A2',
    imageUrl:
        'https://images.unsplash.com/photo-1462826303086-329426d1aef5?w=600&q=80',
    pricePerHour: 40,
    date: 'Sep 15, 2024',
    timeRange: '01:00 PM - 03:00 PM',
    status: _BookingStatus.completed,
  ),
  _MockBooking(
    id: '5',
    roomName: 'Quiet Focus Lab',
    imageUrl:
        'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600&q=80',
    pricePerHour: 28,
    date: 'Sep 10, 2024',
    timeRange: '08:00 AM - 10:00 AM',
    status: _BookingStatus.completed,
  ),
  _MockBooking(
    id: '6',
    roomName: 'Grand Innovation Hall',
    imageUrl:
        'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80',
    pricePerHour: 45,
    date: 'Aug 20, 2024',
    timeRange: '03:00 PM - 05:00 PM',
    status: _BookingStatus.cancelled,
  ),
];

// ─── Screen ───────────────────────────────────────────────────────────────────
class BookingListScreen extends StatefulWidget {
  const BookingListScreen({super.key});

  @override
  State<BookingListScreen> createState() => _BookingListScreenState();
}

class _BookingListScreenState extends State<BookingListScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  int _activeTab = 0;

  static const _tabs = ['Upcoming', 'Completed', 'Cancelled'];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: _tabs.length, vsync: this)
      ..addListener(() {
        if (_tabController.indexIsChanging) return;
        setState(() => _activeTab = _tabController.index);
      });
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  List<_MockBooking> get _filteredBookings {
    switch (_activeTab) {
      case 0:
        return _mockBookings
            .where(
              (b) =>
                  b.status == _BookingStatus.confirmed ||
                  b.status == _BookingStatus.awaitingPayment,
            )
            .toList();
      case 1:
        return _mockBookings
            .where((b) => b.status == _BookingStatus.completed)
            .toList();
      case 2:
        return _mockBookings
            .where((b) => b.status == _BookingStatus.cancelled)
            .toList();
      default:
        return [];
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8F6F6),
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ── Header ─────────────────────────────────────────
            _buildHeader(),

            // ── Segmented Tab Control ──────────────────────────
            _buildTabBar(),

            // ── Booking List ───────────────────────────────────
            Expanded(
              child: AnimatedSwitcher(
                duration: const Duration(milliseconds: 220),
                child: _filteredBookings.isEmpty
                    ? _buildEmptyState()
                    : _buildList(),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ── Header ────────────────────────────────────────────────────
  Widget _buildHeader() {
    return Container(
      color: Colors.white,
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 18),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'My Bookings',
            style: TextStyle(
              fontSize: 28,
              fontWeight: FontWeight.w900,
              color: AppColors.navy900,
              height: 1.15,
            ),
          ),
          const SizedBox(height: 4),
          const Text(
            'Manage your classroom rentals and schedules.',
            style: TextStyle(
              fontSize: 13,
              color: AppColors.textSecondary,
              height: 1.4,
            ),
          ),
        ],
      ),
    );
  }

  // ── Tab Bar ───────────────────────────────────────────────────
  Widget _buildTabBar() {
    return Container(
      color: Colors.white,
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 14),
      child: Container(
        padding: const EdgeInsets.all(4),
        decoration: BoxDecoration(
          color: const Color(0xFFF1F1F1),
          borderRadius: BorderRadius.circular(14),
        ),
        child: Row(
          children: List.generate(
            _tabs.length,
            (i) => Expanded(child: _buildTabItem(i)),
          ),
        ),
      ),
    );
  }

  Widget _buildTabItem(int index) {
    final active = _activeTab == index;
    return GestureDetector(
      onTap: () {
        setState(() => _activeTab = index);
        _tabController.animateTo(index);
      },
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        curve: Curves.easeInOut,
        padding: const EdgeInsets.symmetric(vertical: 10),
        decoration: BoxDecoration(
          color: active ? Colors.white : Colors.transparent,
          borderRadius: BorderRadius.circular(10),
          boxShadow: active
              ? [
                  const BoxShadow(
                    color: Color(0x14000000),
                    blurRadius: 6,
                    offset: Offset(0, 2),
                  ),
                ]
              : null,
        ),
        child: Text(
          _tabs[index],
          textAlign: TextAlign.center,
          style: TextStyle(
            fontSize: 13,
            fontWeight: active ? FontWeight.w800 : FontWeight.w600,
            color: active ? AppColors.navy900 : AppColors.textSecondary,
          ),
        ),
      ),
    );
  }

  // ── Booking List ──────────────────────────────────────────────
  Widget _buildList() {
    final items = _filteredBookings;
    return ListView.builder(
      key: ValueKey(_activeTab),
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 120),
      itemCount: items.length + 1, // +1 for CTA at bottom
      itemBuilder: (context, i) {
        if (i == items.length) return _buildBottomCTA();
        return Padding(
          padding: const EdgeInsets.only(bottom: 14),
          child: _BookingCard(booking: items[i]),
        );
      },
    );
  }

  // ── Empty State ───────────────────────────────────────────────
  Widget _buildEmptyState() {
    final labels = ['upcoming', 'completed', 'cancelled'];
    final icons = [
      Icons.calendar_today_outlined,
      Icons.check_circle_outline_rounded,
      Icons.cancel_outlined,
    ];
    return Center(
      key: ValueKey('empty_$_activeTab'),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            icons[_activeTab],
            size: 56,
            color: AppColors.primary.withOpacity(0.3),
          ),
          const SizedBox(height: 16),
          Text(
            'No ${labels[_activeTab]} bookings',
            style: const TextStyle(
              fontSize: 17,
              fontWeight: FontWeight.w800,
              color: AppColors.navy900,
            ),
          ),
          const SizedBox(height: 6),
          const Text(
            'Your bookings will appear here.',
            style: TextStyle(fontSize: 13, color: AppColors.textSecondary),
          ),
        ],
      ),
    );
  }

  // ── Bottom CTA ────────────────────────────────────────────────
  Widget _buildBottomCTA() {
    return Container(
      margin: const EdgeInsets.only(top: 8),
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: AppColors.primary.withOpacity(0.04),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: AppColors.primary.withOpacity(0.15),
          width: 2,
          style: BorderStyle.solid,
        ),
      ),
      child: Column(
        children: [
          Container(
            width: 52,
            height: 52,
            decoration: BoxDecoration(
              color: AppColors.primary,
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(
                  color: AppColors.primary.withOpacity(0.35),
                  blurRadius: 12,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: const Icon(Icons.add_rounded, color: Colors.white, size: 28),
          ),
          const SizedBox(height: 14),
          const Text(
            'Need another space?',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w800,
              color: AppColors.navy900,
            ),
          ),
          const SizedBox(height: 4),
          const Text(
            'Discover hundreds of specialized classrooms and labs.',
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 12, color: AppColors.textSecondary),
          ),
          const SizedBox(height: 18),
          ElevatedButton(
            onPressed: () {},
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 36, vertical: 14),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(14),
              ),
              elevation: 5,
              shadowColor: AppColors.primary.withOpacity(0.4),
            ),
            child: const Text(
              'Book New Space',
              style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800),
            ),
          ),
        ],
      ),
    );
  }
}

// ─── Booking Card Widget ─────────────────────────────────────────────────────
class _BookingCard extends StatelessWidget {
  final _MockBooking booking;

  const _BookingCard({required this.booking});

  // Status config
  static _StatusConfig _statusConfig(_BookingStatus status) {
    switch (status) {
      case _BookingStatus.confirmed:
        return _StatusConfig(
          label: 'Confirmed',
          textColor: const Color(0xFF16A34A),
          bgColor: const Color(0xFFDCFCE7),
        );
      case _BookingStatus.awaitingPayment:
        return _StatusConfig(
          label: 'Awaiting Payment',
          textColor: const Color(0xFFD97706),
          bgColor: const Color(0xFFFEF3C7),
        );
      case _BookingStatus.completed:
        return _StatusConfig(
          label: 'Completed',
          textColor: const Color(0xFF2563EB),
          bgColor: const Color(0xFFDBEAFE),
        );
      case _BookingStatus.cancelled:
        return _StatusConfig(
          label: 'Cancelled',
          textColor: const Color(0xFFDC2626),
          bgColor: const Color(0xFFFEE2E2),
        );
    }
  }

  @override
  Widget build(BuildContext context) {
    final cfg = _statusConfig(booking.status);
    final isPending = booking.status == _BookingStatus.awaitingPayment;
    final isCancelled = booking.status == _BookingStatus.cancelled;

    return Container(
      clipBehavior: Clip.antiAlias,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: const [
          BoxShadow(
            color: Color(0x0A000000),
            blurRadius: 12,
            offset: Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // ── Image ──────────────────────────────────────────
          SizedBox(
            width: 110,
            height: 150,
            child: Stack(
              fit: StackFit.expand,
              children: [
                Image.network(
                  booking.imageUrl,
                  fit: BoxFit.cover,
                  errorBuilder: (_, __, ___) => Container(
                    color: AppColors.divider,
                    child: const Icon(
                      Icons.image_outlined,
                      size: 36,
                      color: AppColors.textHint,
                    ),
                  ),
                ),
                // dim cancelled images
                if (isCancelled)
                  Container(color: Colors.black.withOpacity(0.35)),
              ],
            ),
          ),

          // ── Content ────────────────────────────────────────
          Expanded(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(14, 14, 14, 12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Status + Price
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          color: cfg.bgColor,
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(
                          cfg.label.toUpperCase(),
                          style: TextStyle(
                            fontSize: 8,
                            fontWeight: FontWeight.w800,
                            color: cfg.textColor,
                            letterSpacing: 0.6,
                          ),
                        ),
                      ),
                      Text(
                        '\$${booking.pricePerHour.toInt()}/hr',
                        style: const TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w900,
                          color: AppColors.primary,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),

                  // Room name
                  Text(
                    booking.roomName,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w800,
                      color: isCancelled
                          ? AppColors.textSecondary
                          : AppColors.navy900,
                      decoration: isCancelled
                          ? TextDecoration.lineThrough
                          : null,
                    ),
                  ),
                  const SizedBox(height: 8),

                  // Date
                  _InfoRow(
                    icon: Icons.calendar_today_outlined,
                    text: booking.date,
                  ),
                  const SizedBox(height: 4),

                  // Time
                  _InfoRow(
                    icon: Icons.schedule_rounded,
                    text: booking.timeRange,
                  ),
                  const SizedBox(height: 12),

                  // Action buttons
                  if (!isCancelled) _buildActions(context, isPending),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActions(BuildContext context, bool isPending) {
    if (isPending) {
      return Row(
        children: [
          Expanded(
            child: _ActionBtn(
              label: 'Pay Now',
              icon: Icons.payments_outlined,
              filled: true,
              onTap: () => _snack(context, 'Opening payment...'),
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: _ActionBtn(
              label: 'Details',
              icon: Icons.info_outline_rounded,
              filled: false,
      onTap: () =>
                Navigator.pushNamed(
                  context,
                  AppRouter.bookingDetail,
                  arguments: mockBookingDetails[booking.detailIndex],
                ),
            ),
          ),
        ],
      );
    }
    return Row(
      children: [
        Expanded(
          child: _ActionBtn(
            label: 'Details',
            icon: Icons.info_outline_rounded,
            filled: true,
      onTap: () =>
              Navigator.pushNamed(
                context,
                AppRouter.bookingDetail,
                arguments: mockBookingDetails[booking.detailIndex],
              ),
          ),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: _ActionBtn(
            label: 'Directions',
            icon: Icons.near_me_outlined,
            filled: false,
            onTap: () => _snack(context, 'Opening maps...'),
          ),
        ),
      ],
    );
  }

  void _snack(BuildContext context, String msg) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(msg),
        backgroundColor: AppColors.primary,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        margin: const EdgeInsets.fromLTRB(16, 0, 16, 8),
        duration: const Duration(seconds: 1),
      ),
    );
  }
}

// ─── Status config ────────────────────────────────────────────────────────────
class _StatusConfig {
  final String label;
  final Color textColor;
  final Color bgColor;

  const _StatusConfig({
    required this.label,
    required this.textColor,
    required this.bgColor,
  });
}

// ─── Small helpers ────────────────────────────────────────────────────────────
class _InfoRow extends StatelessWidget {
  final IconData icon;
  final String text;

  const _InfoRow({required this.icon, required this.text});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, size: 13, color: AppColors.textSecondary),
        const SizedBox(width: 5),
        Text(
          text,
          style: const TextStyle(
            fontSize: 11,
            color: AppColors.textSecondary,
            fontWeight: FontWeight.w500,
          ),
        ),
      ],
    );
  }
}

class _ActionBtn extends StatelessWidget {
  final String label;
  final IconData icon;
  final bool filled;
  final VoidCallback onTap;

  const _ActionBtn({
    required this.label,
    required this.icon,
    required this.filled,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 9),
        decoration: BoxDecoration(
          color: filled ? AppColors.primary : const Color(0xFFF3F4F6),
          borderRadius: BorderRadius.circular(10),
          boxShadow: filled
              ? [
                  BoxShadow(
                    color: AppColors.primary.withOpacity(0.25),
                    blurRadius: 6,
                    offset: const Offset(0, 2),
                  ),
                ]
              : null,
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              icon,
              size: 13,
              color: filled ? Colors.white : AppColors.navy900,
            ),
            const SizedBox(width: 4),
            Text(
              label,
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w800,
                color: filled ? Colors.white : AppColors.navy900,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
