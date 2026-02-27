import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../../core/constants/app_colors.dart';
import '../../../routes/app_router.dart';

// ─── Args ─────────────────────────────────────────────────────────────────────
class PaymentSuccessArgs {
  final String roomName;
  final String location;
  final String bookingId;
  final String date;
  final double amountPaid;
  final String imageUrl;

  const PaymentSuccessArgs({
    required this.roomName,
    required this.location,
    required this.bookingId,
    required this.date,
    required this.amountPaid,
    this.imageUrl =
        'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80',
  });
}

// ─── Screen ───────────────────────────────────────────────────────────────────
class PaymentSuccessScreen extends StatefulWidget {
  final PaymentSuccessArgs args;
  const PaymentSuccessScreen({super.key, required this.args});

  @override
  State<PaymentSuccessScreen> createState() => _PaymentSuccessScreenState();
}

class _PaymentSuccessScreenState extends State<PaymentSuccessScreen>
    with TickerProviderStateMixin {
  late AnimationController _scaleCtrl;
  late AnimationController _fadeCtrl;
  late Animation<double> _scaleAnim;
  late Animation<double> _fadeAnim;

  @override
  void initState() {
    super.initState();

    _scaleCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
    );
    _fadeCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 500),
    );

    _scaleAnim = CurvedAnimation(parent: _scaleCtrl, curve: Curves.elasticOut);
    _fadeAnim = CurvedAnimation(parent: _fadeCtrl, curve: Curves.easeOut);

    Future.delayed(const Duration(milliseconds: 100), () {
      _scaleCtrl.forward();
      _fadeCtrl.forward();
    });
  }

  @override
  void dispose() {
    _scaleCtrl.dispose();
    _fadeCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Column(
          children: [
            // ── Top bar ────────────────────────────────────────
            _buildTopBar(context),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.fromLTRB(20, 0, 20, 32),
                child: FadeTransition(
                  opacity: _fadeAnim,
                  child: Column(
                    children: [
                      const SizedBox(height: 24),

                      // ── Success icon with decorative elements
                      _buildSuccessIcon(),
                      const SizedBox(height: 24),

                      // ── Title + subtitle
                      const Text(
                        'Thanh toán thành công!',
                        style: TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.w900,
                          color: AppColors.navy900,
                        ),
                      ),
                      const SizedBox(height: 10),
                      const Text(
                        'Giao dịch thuê phòng học của bạn đã được xử lý thành công. Thông tin chi tiết đã được gửi tới email của bạn.',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontSize: 13,
                          color: AppColors.textSecondary,
                          height: 1.6,
                        ),
                      ),
                      const SizedBox(height: 24),

                      // ── Receipt card
                      _buildReceiptCard(context),
                      const SizedBox(height: 16),

                      // ── Room image
                      _buildRoomImage(),
                      const SizedBox(height: 28),

                      // ── Buttons
                      _buildButtons(context),
                      const SizedBox(height: 20),

                      // ── Support
                      _buildSupportText(context),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ── Top bar ─────────────────────────────────────────────────────
  Widget _buildTopBar(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: const BoxDecoration(
        border: Border(bottom: BorderSide(color: Color(0xFFF1F3F5))),
      ),
      child: Row(
        children: [
          // Logo
          Row(
            children: [
              Icon(Icons.school_rounded, color: AppColors.primary, size: 26),
              const SizedBox(width: 6),
              const Text(
                'EduSpace',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w900,
                  color: AppColors.navy900,
                ),
              ),
            ],
          ),
          const Spacer(),
          // Close
          GestureDetector(
            onTap: () => Navigator.of(
              context,
            ).pushNamedAndRemoveUntil(AppRouter.home, (_) => false),
            child: Container(
              width: 34,
              height: 34,
              decoration: BoxDecoration(
                color: const Color(0xFFF3F4F6),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(
                Icons.close_rounded,
                size: 18,
                color: AppColors.textSecondary,
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ── Success icon ─────────────────────────────────────────────────
  Widget _buildSuccessIcon() {
    return SizedBox(
      height: 130,
      width: 130,
      child: Stack(
        alignment: Alignment.center,
        children: [
          // Outer glow ring
          Container(
            width: 120,
            height: 120,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: AppColors.primary.withOpacity(0.08),
            ),
          ),
          // Middle ring
          Container(
            width: 96,
            height: 96,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: AppColors.primary.withOpacity(0.12),
            ),
          ),
          // Animated check circle
          ScaleTransition(
            scale: _scaleAnim,
            child: Container(
              width: 70,
              height: 70,
              decoration: BoxDecoration(
                color: AppColors.primary,
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: AppColors.primary.withOpacity(0.4),
                    blurRadius: 20,
                    offset: const Offset(0, 6),
                  ),
                ],
              ),
              child: const Icon(
                Icons.check_rounded,
                size: 38,
                color: Colors.white,
              ),
            ),
          ),
          // Bell badge top-right
          Positioned(
            top: 6,
            right: 8,
            child: ScaleTransition(
              scale: _scaleAnim,
              child: Container(
                width: 26,
                height: 26,
                decoration: BoxDecoration(
                  color: AppColors.primary,
                  shape: BoxShape.circle,
                  border: Border.all(color: Colors.white, width: 2),
                ),
                child: const Icon(
                  Icons.notifications_active_rounded,
                  size: 13,
                  color: Colors.white,
                ),
              ),
            ),
          ),
          // Decorative dots
          ..._buildConfettiDots(),
        ],
      ),
    );
  }

  List<Widget> _buildConfettiDots() {
    final c = AppColors.primary;
    return [
      Positioned(
        top: 2,
        left: 14,
        child: _dot(6, c.withOpacity(0.3)),
      ),
      Positioned(
        top: 20,
        left: 4,
        child: _dot(4, c.withOpacity(0.4)),
      ),
      Positioned(
        top: 8,
        right: 4,
        child: _dot(5, c.withOpacity(0.25)),
      ),
      Positioned(
        bottom: 10,
        left: 8,
        child: _dot(5, c.withOpacity(0.3)),
      ),
      Positioned(
        bottom: 6,
        right: 12,
        child: _dot(4, c.withOpacity(0.4)),
      ),
    ];
  }

  Widget _dot(double size, Color color) => Container(
        width: size,
        height: size,
        decoration: BoxDecoration(color: color, shape: BoxShape.circle),
      );

  // ── Receipt card ─────────────────────────────────────────────────
  Widget _buildReceiptCard(BuildContext context) {
    final a = widget.args;
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFEEEEEE)),
        boxShadow: const [
          BoxShadow(
            color: Color(0x08000000),
            blurRadius: 12,
            offset: Offset(0, 3),
          ),
        ],
      ),
      child: Column(
        children: [
          _ReceiptRow(
            label: 'Số tiền đã trả',
            value: '${_formatAmount(a.amountPaid)}đ',
            valueStyle: const TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w800,
              color: AppColors.navy900,
            ),
          ),
          const _ReceiptDivider(),
          _ReceiptRow(
            label: 'Mã đặt phòng',
            valueWidget: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  a.bookingId,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                    color: AppColors.navy900,
                  ),
                ),
                const SizedBox(width: 6),
                GestureDetector(
                  onTap: () {
                    Clipboard.setData(ClipboardData(text: a.bookingId));
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: const Text('Đã sao chép mã đặt phòng'),
                        backgroundColor: AppColors.primary,
                        behavior: SnackBarBehavior.floating,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        margin: const EdgeInsets.fromLTRB(16, 0, 16, 8),
                        duration: const Duration(seconds: 1),
                      ),
                    );
                  },
                  child: Container(
                    padding: const EdgeInsets.all(4),
                    decoration: BoxDecoration(
                      color: AppColors.primary.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: const Icon(
                      Icons.copy_rounded,
                      size: 13,
                      color: AppColors.primary,
                    ),
                  ),
                ),
              ],
            ),
          ),
          const _ReceiptDivider(),
          _ReceiptRow(
            label: 'Ngày đặt',
            value: a.date,
            valueStyle: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w700,
              color: AppColors.navy900,
            ),
          ),
        ],
      ),
    );
  }

  // ── Room image ────────────────────────────────────────────────────
  Widget _buildRoomImage() {
    final a = widget.args;
    return ClipRRect(
      borderRadius: BorderRadius.circular(16),
      child: SizedBox(
        height: 140,
        width: double.infinity,
        child: Stack(
          fit: StackFit.expand,
          children: [
            Image.network(
              a.imageUrl,
              fit: BoxFit.cover,
              errorBuilder: (_, __, ___) => Container(
                color: AppColors.primary.withOpacity(0.1),
                child: Icon(
                  Icons.meeting_room_rounded,
                  size: 48,
                  color: AppColors.primary.withOpacity(0.3),
                ),
              ),
            ),
            // Dark gradient at bottom
            Container(
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [Colors.transparent, Color(0xCC000000)],
                  stops: [0.45, 1.0],
                ),
              ),
            ),
            // Room label
            Positioned(
              bottom: 12,
              left: 12,
              right: 12,
              child: Row(
                children: [
                  const Icon(
                    Icons.location_on_rounded,
                    size: 14,
                    color: AppColors.primary,
                  ),
                  const SizedBox(width: 4),
                  Expanded(
                    child: Text(
                      '${a.roomName} • ${a.location}',
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                        color: Colors.white,
                      ),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ── Buttons ───────────────────────────────────────────────────────
  Widget _buildButtons(BuildContext context) {
    return Column(
      children: [
        // Xem đơn đặt
        SizedBox(
          width: double.infinity,
          child: ElevatedButton.icon(
            onPressed: () =>
                Navigator.pushNamed(context, AppRouter.bookingList),
            icon: const Icon(Icons.receipt_long_rounded, size: 18),
            label: const Text(
              'Xem đơn đặt',
              style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800),
            ),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 16),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
              ),
              elevation: 6,
              shadowColor: AppColors.primary.withOpacity(0.3),
            ),
          ),
        ),
        const SizedBox(height: 12),
        // Về trang chủ
        SizedBox(
          width: double.infinity,
          child: OutlinedButton.icon(
            onPressed: () => Navigator.of(
              context,
            ).pushNamedAndRemoveUntil(AppRouter.home, (_) => false),
            icon: const Icon(Icons.home_rounded, size: 18),
            label: const Text(
              'Về trang chủ',
              style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800),
            ),
            style: OutlinedButton.styleFrom(
              foregroundColor: AppColors.primary,
              side: const BorderSide(color: AppColors.primary, width: 1.5),
              padding: const EdgeInsets.symmetric(vertical: 16),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
              ),
            ),
          ),
        ),
      ],
    );
  }

  // ── Support text ──────────────────────────────────────────────────
  Widget _buildSupportText(BuildContext context) {
    return RichText(
      text: TextSpan(
        style: const TextStyle(fontSize: 12, color: AppColors.textHint),
        children: [
          const TextSpan(text: 'Bạn cần hỗ trợ? '),
          WidgetSpan(
            child: GestureDetector(
              onTap: () => ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: const Text('Đang kết nối hỗ trợ...'),
                  backgroundColor: AppColors.primary,
                  behavior: SnackBarBehavior.floating,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  margin: const EdgeInsets.fromLTRB(16, 0, 16, 8),
                  duration: const Duration(seconds: 1),
                ),
              ),
              child: const Text(
                'Liên hệ ngay',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                  color: AppColors.primary,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  String _formatAmount(double amount) {
    final str = amount.toInt().toString();
    final result = StringBuffer();
    for (var i = 0; i < str.length; i++) {
      if (i > 0 && (str.length - i) % 3 == 0) result.write('.');
      result.write(str[i]);
    }
    return result.toString();
  }
}



// ─── Receipt sub-widgets ──────────────────────────────────────────────────────
class _ReceiptRow extends StatelessWidget {
  final String label;
  final String? value;
  final Widget? valueWidget;
  final TextStyle? valueStyle;

  const _ReceiptRow({
    required this.label,
    this.value,
    this.valueWidget,
    this.valueStyle,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: const TextStyle(
              fontSize: 13,
              color: AppColors.textSecondary,
              fontWeight: FontWeight.w500,
            ),
          ),
          valueWidget ??
              Text(
                value ?? '',
                style:
                    valueStyle ??
                    const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                      color: AppColors.navy900,
                    ),
              ),
        ],
      ),
    );
  }
}

class _ReceiptDivider extends StatelessWidget {
  const _ReceiptDivider();

  @override
  Widget build(BuildContext context) {
    return const Divider(height: 1, color: Color(0xFFF3F4F6));
  }
}
