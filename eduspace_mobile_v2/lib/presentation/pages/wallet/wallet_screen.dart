import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';

// ─── Models ───────────────────────────────────────────────────
enum TxType { topup, spend, reward, subscription }

enum TxFilter { all, topup, spend, points }

class _Transaction {
  final String title;
  final String subtitle;
  final TxType type;
  final String amount;
  final bool isPositive;
  final bool isPoints;

  const _Transaction({
    required this.title,
    required this.subtitle,
    required this.type,
    required this.amount,
    required this.isPositive,
    this.isPoints = false,
  });
}

final _mockTransactions = <_Transaction>[
  _Transaction(
    title: 'Hoàn tiền đơn #102',
    subtitle: '14:20, 24 Th05 2024',
    type: TxType.topup,
    amount: '+500.000đ',
    isPositive: true,
  ),
  _Transaction(
    title: 'Thanh toán đơn #105',
    subtitle: '09:15, 23 Th05 2024',
    type: TxType.spend,
    amount: '-300.000đ',
    isPositive: false,
  ),
  _Transaction(
    title: 'Thưởng đặt phòng',
    subtitle: 'Hệ thống thưởng',
    type: TxType.reward,
    amount: '+20 điểm',
    isPositive: true,
    isPoints: true,
  ),
  _Transaction(
    title: 'Gia hạn dịch vụ tháng 5',
    subtitle: '22:00, 20 Th05 2024',
    type: TxType.subscription,
    amount: '-150.000đ',
    isPositive: false,
  ),
  _Transaction(
    title: 'Nạp tiền ví',
    subtitle: '18:00, 18 Th05 2024',
    type: TxType.topup,
    amount: '+200.000đ',
    isPositive: true,
  ),
  _Transaction(
    title: 'Thanh toán đơn #98',
    subtitle: '10:30, 15 Th05 2024',
    type: TxType.spend,
    amount: '-120.000đ',
    isPositive: false,
  ),
];

// ─── Screen ───────────────────────────────────────────────────
class WalletScreen extends StatefulWidget {
  const WalletScreen({super.key});

  @override
  State<WalletScreen> createState() => _WalletScreenState();
}

class _WalletScreenState extends State<WalletScreen> {
  TxFilter _filter = TxFilter.all;

  List<_Transaction> get _filtered {
    switch (_filter) {
      case TxFilter.topup:
        return _mockTransactions.where((t) => t.type == TxType.topup).toList();
      case TxFilter.spend:
        return _mockTransactions
            .where(
              (t) => t.type == TxType.spend || t.type == TxType.subscription,
            )
            .toList();
      case TxFilter.points:
        return _mockTransactions.where((t) => t.type == TxType.reward).toList();
      case TxFilter.all:
        return _mockTransactions;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8F6F6),
      body: SafeArea(
        child: CustomScrollView(
          physics: const BouncingScrollPhysics(),
          slivers: [
            SliverToBoxAdapter(child: _buildHeader(context)),
            SliverToBoxAdapter(child: _buildBalanceCards()),
            SliverToBoxAdapter(child: _buildQuickActions(context)),
            SliverToBoxAdapter(child: _buildTransactionSection()),
            SliverList(
              delegate: SliverChildBuilderDelegate(
                (context, i) => _TxTile(item: _filtered[i]),
                childCount: _filtered.length,
              ),
            ),
            const SliverToBoxAdapter(child: SizedBox(height: 32)),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader(BuildContext context) {
    return Container(
      color: Colors.white,
      padding: const EdgeInsets.fromLTRB(20, 20, 20, 16),
      child: Row(
        children: [
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
          const SizedBox(width: 14),
          const Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Ví & Điểm thưởng',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.w900,
                    color: AppColors.navy900,
                  ),
                ),
                Text(
                  'Quản lý số dư và lịch sử giao dịch của bạn',
                  style: TextStyle(
                    fontSize: 12,
                    color: AppColors.textSecondary,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBalanceCards() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
      child: Row(
        children: [
          Expanded(
            child: _BalanceCard(
              label: 'SỐ DƯ VÍ',
              value: '500.000đ',
              badge: '+10% tháng này',
              badgeColor: const Color(0xFF16A34A),
              gradient: const LinearGradient(
                colors: [Colors.white, Color(0xFFFFF5F5)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: _BalanceCard(
              label: 'ĐIỂM TÍCH LŨY',
              value: '1.250 ĐIỂM',
              badge: '+5% hôm nay',
              badgeColor: const Color(0xFF16A34A),
              valueColor: AppColors.primary,
              gradient: LinearGradient(
                colors: [Colors.white, AppColors.primary.withOpacity(0.05)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQuickActions(BuildContext context) {
    final actions = [
      (icon: Icons.add_rounded, label: 'Nạp tiền', filled: true),
      (icon: Icons.payments_outlined, label: 'Thanh toán', filled: false),
      (icon: Icons.card_giftcard_rounded, label: 'Đổi quà', filled: false),
      (icon: Icons.more_horiz_rounded, label: 'Khác', filled: false),
    ];
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 20, 16, 0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: actions.map((a) {
          return GestureDetector(
            onTap: () {
              if (a.label == 'Đổi quà') {
                Navigator.pushNamed(context, '/wallet/rewards');
              }
            },
            child: Column(
              children: [
                Container(
                  width: 58,
                  height: 58,
                  decoration: BoxDecoration(
                    color: a.filled ? AppColors.primary : Colors.white,
                    shape: BoxShape.circle,
                    border: a.filled
                        ? null
                        : Border.all(
                            color: AppColors.primary.withOpacity(0.25),
                          ),
                    boxShadow: [
                      BoxShadow(
                        color: AppColors.primary.withOpacity(
                          a.filled ? 0.3 : 0.08,
                        ),
                        blurRadius: 10,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Icon(
                    a.icon,
                    size: 26,
                    color: a.filled ? Colors.white : AppColors.primary,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  a.label,
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textSecondary,
                  ),
                ),
              ],
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildTransactionSection() {
    final filters = [
      (f: TxFilter.all, label: 'Tất cả'),
      (f: TxFilter.topup, label: 'Nạp tiền'),
      (f: TxFilter.spend, label: 'Chi tiêu'),
      (f: TxFilter.points, label: 'Điểm thưởng'),
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SizedBox(height: 24),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Lịch sử giao dịch',
                style: TextStyle(
                  fontSize: 17,
                  fontWeight: FontWeight.w800,
                  color: AppColors.navy900,
                ),
              ),
              GestureDetector(
                onTap: () {},
                child: const Text(
                  'Xem tất cả',
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                    color: AppColors.primary,
                  ),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 14),
        // Filter tabs
        SizedBox(
          height: 36,
          child: ListView(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            scrollDirection: Axis.horizontal,
            children: filters.map((item) {
              final active = _filter == item.f;
              return GestureDetector(
                onTap: () => setState(() => _filter = item.f),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 180),
                  margin: const EdgeInsets.only(right: 8),
                  padding: const EdgeInsets.symmetric(horizontal: 14),
                  decoration: BoxDecoration(
                    color: active ? AppColors.primary : Colors.white,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                      color: active ? AppColors.primary : AppColors.border,
                    ),
                  ),
                  alignment: Alignment.center,
                  child: Text(
                    item.label,
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      color: active ? Colors.white : AppColors.textSecondary,
                    ),
                  ),
                ),
              );
            }).toList(),
          ),
        ),
        const SizedBox(height: 12),
      ],
    );
  }
}

// ─── Balance Card ─────────────────────────────────────────────
class _BalanceCard extends StatelessWidget {
  final String label;
  final String value;
  final String badge;
  final Color badgeColor;
  final Color valueColor;
  final Gradient gradient;

  const _BalanceCard({
    required this.label,
    required this.value,
    required this.badge,
    required this.badgeColor,
    this.valueColor = AppColors.navy900,
    required this.gradient,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: gradient,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: AppColors.border.withOpacity(0.6)),
        boxShadow: const [
          BoxShadow(
            color: Color(0x08000000),
            blurRadius: 10,
            offset: Offset(0, 3),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: const TextStyle(
              fontSize: 9,
              fontWeight: FontWeight.w800,
              letterSpacing: 1.2,
              color: AppColors.textSecondary,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            value,
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w900,
              color: valueColor == AppColors.navy900
                  ? AppColors.primary
                  : valueColor,
              letterSpacing: -0.3,
            ),
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              Icon(Icons.trending_up_rounded, size: 12, color: badgeColor),
              const SizedBox(width: 3),
              Flexible(
                child: Text(
                  badge,
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w700,
                    color: badgeColor,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

// ─── Transaction Tile ─────────────────────────────────────────
class _TxTile extends StatelessWidget {
  final _Transaction item;
  const _TxTile({required this.item});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.fromLTRB(16, 0, 16, 10),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: const [
          BoxShadow(
            color: Color(0x06000000),
            blurRadius: 8,
            offset: Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        children: [
          _TxIcon(type: item.type),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  item.title,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                    color: AppColors.navy900,
                  ),
                ),
                const SizedBox(height: 3),
                Text(
                  item.subtitle,
                  style: const TextStyle(
                    fontSize: 11,
                    color: AppColors.textSecondary,
                  ),
                ),
              ],
            ),
          ),
          Text(
            item.amount,
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w800,
              color: item.isPoints
                  ? const Color(0xFFF59E0B)
                  : item.isPositive
                  ? const Color(0xFF16A34A)
                  : AppColors.primary,
            ),
          ),
        ],
      ),
    );
  }
}

class _TxIcon extends StatelessWidget {
  final TxType type;
  const _TxIcon({required this.type});

  @override
  Widget build(BuildContext context) {
    final (icon, bg) = switch (type) {
      TxType.topup => (Icons.south_west_rounded, const Color(0xFFDCFCE7)),
      TxType.spend => (Icons.shopping_bag_outlined, const Color(0xFFFEE2E2)),
      TxType.reward => (Icons.star_rounded, const Color(0xFFFEF9C3)),
      TxType.subscription => (
        Icons.calendar_month_outlined,
        const Color(0xFFFEE2E2),
      ),
    };
    final color = switch (type) {
      TxType.topup => const Color(0xFF16A34A),
      TxType.spend => AppColors.primary,
      TxType.reward => const Color(0xFFCA8A04),
      TxType.subscription => AppColors.primary,
    };
    return Container(
      width: 44,
      height: 44,
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Icon(icon, size: 20, color: color),
    );
  }
}
