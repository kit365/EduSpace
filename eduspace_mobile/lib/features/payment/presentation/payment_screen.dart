import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/widgets/edu_logo.dart';
import '../../../routes/app_router.dart';
import 'payment_success_screen.dart';

// ─── Argument model ───────────────────────────────────────────────────────────
class PaymentArgs {
  final String roomName;
  final String date;
  final String timeRange;
  final double totalAmount;

  const PaymentArgs({
    required this.roomName,
    required this.date,
    required this.timeRange,
    required this.totalAmount,
  });
}

// ─── Payment methods ──────────────────────────────────────────────────────────
const double _walletBalance = 500000;

enum _PaymentMethod { eduWallet, momo, vnpay }

// ─── Screen ───────────────────────────────────────────────────────────────────
class PaymentScreen extends StatefulWidget {
  final PaymentArgs args;

  const PaymentScreen({super.key, required this.args});

  @override
  State<PaymentScreen> createState() => _PaymentScreenState();
}

class _PaymentScreenState extends State<PaymentScreen> {
  _PaymentMethod _selected = _PaymentMethod.momo;
  bool _processing = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Column(
          children: [
            // ── App Bar ─────────────────────────────────────────
            _buildAppBar(context),

            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.fromLTRB(20, 0, 20, 24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SizedBox(height: 10),

                    // Breadcrumb
                    _buildBreadcrumb(context),
                    const SizedBox(height: 14),

                    // Title
                    const Text(
                      'Thanh toán',
                      style: TextStyle(
                        fontSize: 28,
                        fontWeight: FontWeight.w900,
                        color: AppColors.navy900,
                        letterSpacing: -0.5,
                      ),
                    ),
                    const SizedBox(height: 20),

                    // Order Summary Card
                    _buildOrderSummary(),
                    const SizedBox(height: 24),

                    // Payment Method Label
                    const Text(
                      'CHỌN PHƯƠNG THỨC',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 1.6,
                        color: AppColors.navy900,
                      ),
                    ),
                    const SizedBox(height: 12),

                    // EduSpace Wallet
                    _PaymentOption(
                      selected: _selected == _PaymentMethod.eduWallet,
                      onTap: () =>
                          setState(() => _selected = _PaymentMethod.eduWallet),
                      logo: _EduWalletLogo(),
                      title: 'Ví EduSpace (Số dư: 500.000đ)',
                      subtitle: widget.args.totalAmount > _walletBalance
                          ? 'Số dư không đủ'
                          : 'Thanh toán nhanh từ ví',
                      disabled: widget.args.totalAmount > _walletBalance,
                    ),
                    const SizedBox(height: 12),

                    // MoMo
                    _PaymentOption(
                      selected: _selected == _PaymentMethod.momo,
                      onTap: () =>
                          setState(() => _selected = _PaymentMethod.momo),
                      logo: _MoMoLogo(),
                      title: 'Thanh toán qua Ví MoMo',
                      subtitle: 'Nhanh chóng, tiện lợi, an toàn',
                    ),
                    const SizedBox(height: 12),

                    // VNPay
                    _PaymentOption(
                      selected: _selected == _PaymentMethod.vnpay,
                      onTap: () =>
                          setState(() => _selected = _PaymentMethod.vnpay),
                      logo: _VNPayLogo(),
                      title: 'Thanh toán qua VNPay',
                      subtitle: 'QR Code, Thẻ nội địa & Quốc tế',
                    ),
                    const SizedBox(height: 28),

                    // Confirm Button
                    _buildConfirmButton(context),
                    const SizedBox(height: 16),

                    // Terms text
                    _buildTermsText(),
                    const SizedBox(height: 24),

                    // Secure badge
                    _buildSecureBadge(),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ── AppBar ─────────────────────────────────────────────────────
  Widget _buildAppBar(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(bottom: BorderSide(color: Color(0xFFF1F3F5))),
      ),
      child: Row(
        children: [
          // Back
          GestureDetector(
            onTap: () => Navigator.pop(context),
            child: Container(
              width: 38,
              height: 38,
              decoration: BoxDecoration(
                color: const Color(0xFFF8F6F6),
                shape: BoxShape.circle,
                border: Border.all(color: AppColors.border),
              ),
              child: const Icon(
                Icons.arrow_back_rounded,
                size: 18,
                color: AppColors.navy900,
              ),
            ),
          ),
          const Expanded(
            child: Center(
              child: EduSpaceLogo(inline: true, iconSize: 28, titleSize: 16),
            ),
          ),
          // Avatar placeholder
          Container(
            width: 38,
            height: 38,
            decoration: BoxDecoration(
              color: AppColors.primary.withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.person_rounded,
              size: 20,
              color: AppColors.primary,
            ),
          ),
        ],
      ),
    );
  }

  // ── Breadcrumb ─────────────────────────────────────────────────
  Widget _buildBreadcrumb(BuildContext context) {
    return Row(
      children: [
        GestureDetector(
          onTap: () => Navigator.pop(context),
          child: const Text(
            'Trang chủ',
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: AppColors.primary,
            ),
          ),
        ),
        const Padding(
          padding: EdgeInsets.symmetric(horizontal: 4),
          child: Icon(
            Icons.chevron_right_rounded,
            size: 14,
            color: AppColors.textHint,
          ),
        ),
        const Text(
          'Thanh toán',
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w600,
            color: AppColors.textSecondary,
          ),
        ),
      ],
    );
  }

  // ── Order Summary ──────────────────────────────────────────────
  Widget _buildOrderSummary() {
    final a = widget.args;
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFF1F3F5)),
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
          // Header
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
            decoration: const BoxDecoration(
              color: Color(0xFFFAFAFA),
              borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
              border: Border(bottom: BorderSide(color: Color(0xFFF1F3F5))),
            ),
            child: const Row(
              children: [
                Text(
                  'TÓM TẮT ĐƠN HÀNG',
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w800,
                    letterSpacing: 1.2,
                    color: AppColors.textSecondary,
                  ),
                ),
              ],
            ),
          ),

          // Detail rows
          Padding(
            padding: const EdgeInsets.all(18),
            child: Column(
              children: [
                // Room name
                _SummaryInfoRow(
                  icon: Icons.meeting_room_rounded,
                  label: 'Phòng đặt',
                  value: a.roomName,
                ),
                const SizedBox(height: 14),

                // Date + time side by side
                Row(
                  children: [
                    Expanded(
                      child: _SummaryInfoRow(
                        icon: Icons.calendar_today_rounded,
                        label: 'Ngày đặt',
                        value: a.date,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: _SummaryInfoRow(
                        icon: Icons.schedule_rounded,
                        label: 'Thời gian',
                        value: a.timeRange,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),

          // Total
          Container(
            margin: const EdgeInsets.fromLTRB(16, 0, 16, 16),
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            decoration: BoxDecoration(
              color: const Color(0xFFFAFAFA),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(
                color: const Color(0xFFE5E7EB),
                style: BorderStyle.solid,
              ),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Tổng cộng',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textSecondary,
                  ),
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(
                      '${_formatAmount(a.totalAmount)}đ',
                      style: const TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.w900,
                        color: AppColors.primary,
                        letterSpacing: -0.5,
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 2,
                      ),
                      decoration: BoxDecoration(
                        color: AppColors.primary.withOpacity(0.08),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: const Text(
                        'ĐANG CHỜ',
                        style: TextStyle(
                          fontSize: 8,
                          fontWeight: FontWeight.w800,
                          color: AppColors.primary,
                          letterSpacing: 0.6,
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ── Confirm Button ─────────────────────────────────────────────
  Widget _buildConfirmButton(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      child: ElevatedButton(
        onPressed: _processing ? null : () => _onConfirm(context),
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: Colors.white,
          disabledBackgroundColor: AppColors.primary.withOpacity(0.6),
          padding: const EdgeInsets.symmetric(vertical: 18),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(18),
          ),
          elevation: 8,
          shadowColor: AppColors.primary.withOpacity(0.3),
        ),
        child: _processing
            ? const SizedBox(
                width: 22,
                height: 22,
                child: CircularProgressIndicator(
                  strokeWidth: 2.5,
                  color: Colors.white,
                ),
              )
            : const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.lock_rounded, size: 18),
                  SizedBox(width: 10),
                  Text(
                    'Xác nhận thanh toán',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 0.2,
                    ),
                  ),
                ],
              ),
      ),
    );
  }

  // ── Terms Text ─────────────────────────────────────────────────
  Widget _buildTermsText() {
    return RichText(
      textAlign: TextAlign.center,
      text: const TextSpan(
        style: TextStyle(fontSize: 11, color: AppColors.textHint, height: 1.6),
        children: [
          TextSpan(text: 'Bằng việc nhấn xác nhận, bạn đồng ý với các '),
          TextSpan(
            text: 'Điều khoản & Điều kiện',
            style: TextStyle(
              color: AppColors.primary,
              fontWeight: FontWeight.w600,
            ),
          ),
          TextSpan(text: ' của EduSpace.'),
        ],
      ),
    );
  }

  // ── Secure Badge ───────────────────────────────────────────────
  Widget _buildSecureBadge() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Icon(
          Icons.verified_user_outlined,
          size: 16,
          color: AppColors.textHint.withOpacity(0.5),
        ),
        const SizedBox(width: 6),
        Text(
          'SECURE PAYMENT GATEWAY',
          style: TextStyle(
            fontSize: 9,
            fontWeight: FontWeight.w800,
            letterSpacing: 2.0,
            color: AppColors.textHint.withOpacity(0.5),
          ),
        ),
      ],
    );
  }

  // ── Confirm action ──────────────────────────────────────────────
  Future<void> _onConfirm(BuildContext context) async {
    setState(() => _processing = true);
    await Future.delayed(const Duration(milliseconds: 1500));
    if (!mounted) return;
    setState(() => _processing = false);

    final now = DateTime.now();
    final _ = switch (_selected) {
      _PaymentMethod.eduWallet => 'Ví EduSpace',
      _PaymentMethod.momo => 'MoMo',
      _PaymentMethod.vnpay => 'VNPay',
    };
    final dateStr = '${now.day} Tháng ${now.month}, ${now.year}';
    final bookingId = '#EDU-${100000 + now.millisecond * 100 + now.second}';

    Navigator.pushNamed(
      context,
      AppRouter.paymentSuccess,
      arguments: PaymentSuccessArgs(
        roomName: widget.args.roomName,
        location: 'Cơ sở Quận 1',
        bookingId: bookingId,
        date: dateStr,
        amountPaid: widget.args.totalAmount,
      ),
    );
  }

  // ── Helpers ─────────────────────────────────────────────────────
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

// ─── Payment Option Widget ────────────────────────────────────────────────────
class _PaymentOption extends StatelessWidget {
  final bool selected;
  final VoidCallback onTap;
  final Widget logo;
  final String title;
  final String subtitle;
  final bool disabled;

  const _PaymentOption({
    required this.selected,
    required this.onTap,
    required this.logo,
    required this.title,
    required this.subtitle,
    this.disabled = false,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: disabled ? null : onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 180),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: selected ? AppColors.primary.withOpacity(0.04) : Colors.white,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(
            color: selected ? AppColors.primary : const Color(0xFFE5E7EB),
            width: selected ? 2 : 1.5,
          ),
          boxShadow: [
            BoxShadow(
              color: selected
                  ? AppColors.primary.withOpacity(0.08)
                  : const Color(0x06000000),
              blurRadius: 10,
              offset: const Offset(0, 3),
            ),
          ],
        ),
        child: Row(
          children: [
            // Logo
            logo,
            const SizedBox(width: 14),

            // Title + sub
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                      color: selected ? AppColors.navy900 : AppColors.navy900,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    subtitle,
                    style: const TextStyle(
                      fontSize: 11,
                      color: AppColors.textSecondary,
                    ),
                  ),
                ],
              ),
            ),

            // Radio indicator
            AnimatedContainer(
              duration: const Duration(milliseconds: 180),
              width: 22,
              height: 22,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(
                  color: selected ? AppColors.primary : const Color(0xFFD1D5DB),
                  width: 2,
                ),
              ),
              child: Center(
                child: AnimatedScale(
                  scale: selected ? 1.0 : 0.0,
                  duration: const Duration(milliseconds: 180),
                  child: Container(
                    width: 10,
                    height: 10,
                    decoration: const BoxDecoration(
                      color: AppColors.primary,
                      shape: BoxShape.circle,
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ─── Logo widgets ─────────────────────────────────────────────────────────────
class _EduWalletLogo extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      width: 50,
      height: 50,
      decoration: BoxDecoration(
        color: AppColors.primary,
        borderRadius: BorderRadius.circular(13),
      ),
      child: const Icon(
        Icons.account_balance_wallet_rounded,
        size: 26,
        color: Colors.white,
      ),
    );
  }
}

class _MoMoLogo extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      width: 50,
      height: 50,
      decoration: BoxDecoration(
        color: const Color(0xFFA50064),
        borderRadius: BorderRadius.circular(13),
      ),
      alignment: Alignment.center,
      child: const Text(
        'MoMo',
        style: TextStyle(
          fontSize: 10,
          fontWeight: FontWeight.w800,
          color: Colors.white,
          letterSpacing: 0.3,
        ),
      ),
    );
  }
}

class _VNPayLogo extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      width: 50,
      height: 50,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(13),
        border: Border.all(color: const Color(0xFFE5E7EB)),
      ),
      child: Center(
        child: Container(
          margin: const EdgeInsets.all(6),
          decoration: BoxDecoration(
            color: const Color(0xFF1A3FA4),
            borderRadius: BorderRadius.circular(8),
          ),
          alignment: Alignment.center,
          child: const Text(
            'VNPAY',
            style: TextStyle(
              fontSize: 8,
              fontWeight: FontWeight.w900,
              color: Colors.white,
              letterSpacing: 0.5,
            ),
          ),
        ),
      ),
    );
  }
}

// ─── Summary row ──────────────────────────────────────────────────────────────
class _SummaryInfoRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;

  const _SummaryInfoRow({
    required this.icon,
    required this.label,
    required this.value,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 18, color: AppColors.primary),
        const SizedBox(width: 10),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: const TextStyle(
                  fontSize: 10,
                  color: AppColors.textHint,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                value,
                style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                  color: AppColors.navy900,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

// ─── Success Bottom Sheet ─────────────────────────────────────────────────────
class _SuccessSheet extends StatelessWidget {
  final String method;
  final String roomName;
  final VoidCallback onDone;

  const _SuccessSheet({
    required this.method,
    required this.roomName,
    required this.onDone,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      padding: const EdgeInsets.fromLTRB(24, 12, 24, 40),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Handle bar
          Container(
            width: 40,
            height: 4,
            decoration: BoxDecoration(
              color: const Color(0xFFE5E7EB),
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          const SizedBox(height: 28),

          // Success icon
          Container(
            width: 80,
            height: 80,
            decoration: BoxDecoration(
              color: const Color(0xFFDCFCE7),
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFF16A34A).withOpacity(0.2),
                  blurRadius: 20,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: const Icon(
              Icons.check_rounded,
              size: 44,
              color: Color(0xFF16A34A),
            ),
          ),
          const SizedBox(height: 20),

          const Text(
            'Thanh toán thành công!',
            style: TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.w900,
              color: AppColors.navy900,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Đặt phòng "$roomName" đã được xác nhận.\nThanh toán qua $method.',
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 13,
              color: AppColors.textSecondary,
              height: 1.5,
            ),
          ),
          const SizedBox(height: 28),

          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: onDone,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(14),
                ),
                elevation: 4,
                shadowColor: AppColors.primary.withOpacity(0.3),
              ),
              child: const Text(
                'Về Trang Chủ',
                style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
