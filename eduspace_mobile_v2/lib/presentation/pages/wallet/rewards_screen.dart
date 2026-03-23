import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';

// ─── Models ───────────────────────────────────────────────────
enum RewardCategory { all, service, shopping, food }

class _RewardItem {
  final String tag;
  final String tagColor;
  final String bigLabel;
  final String bigLabelColor;
  final String title;
  final String description;
  final int points;
  final bool locked;
  final String? lockLabel;

  const _RewardItem({
    required this.tag,
    required this.tagColor,
    required this.bigLabel,
    required this.bigLabelColor,
    required this.title,
    required this.description,
    required this.points,
    this.locked = false,
    this.lockLabel,
  });
}

final _mockRewards = <_RewardItem>[
  _RewardItem(
    tag: 'TIỀN PHÒNG',
    tagColor: '#EA2A33',
    bigLabel: '50K OFF',
    bigLabelColor: '#EA2A33',
    title: 'Giảm trực tiếp 50.000đ',
    description: 'Áp dụng cho hóa đơn thuê phòng tháng tới.',
    points: 100,
  ),
  _RewardItem(
    tag: 'DỊCH VỤ',
    tagColor: '#D97706',
    bigLabel: '100K OFF',
    bigLabelColor: '#D97706',
    title: 'Voucher Dịch vụ 100.000đ',
    description: 'Giảm giá vệ sinh phòng hoặc giặt ủi.',
    points: 180,
  ),
  _RewardItem(
    tag: 'TIỆN ÍCH',
    tagColor: '#2563EB',
    bigLabel: 'FREE WATER',
    bigLabelColor: '#2563EB',
    title: 'Miễn phí 1 tháng nước',
    description: 'Áp dụng tối đa 5 khối nước sinh hoạt.',
    points: 300,
  ),
  _RewardItem(
    tag: 'TIỆN ÍCH',
    tagColor: '#16A34A',
    bigLabel: '50% PARKING',
    bigLabelColor: '#16A34A',
    title: 'Giảm 50% phí gửi xe',
    description: 'Sử dụng cho tháng thanh toán kế tiếp.',
    points: 150,
  ),
  _RewardItem(
    tag: 'ĂN UỐNG',
    tagColor: '#7C3AED',
    bigLabel: 'COFFEE 20K',
    bigLabelColor: '#7C3AED',
    title: 'Voucher Highland 20.000đ',
    description: 'Sử dụng tại cửa hàng Highland Coffee đổi điện.',
    points: 40,
  ),
  _RewardItem(
    tag: 'HẠNG VÀNG',
    tagColor: '#9CA3AF',
    bigLabel: 'LOCKED',
    bigLabelColor: '#D1D5DB',
    title: 'Giảm phí điện 200.000đ',
    description: 'Dành riêng cho cư dân hạng Vàng trở lên.',
    points: 400,
    locked: true,
    lockLabel: 'Hạng Vàng',
  ),
];

// ─── Screen ───────────────────────────────────────────────────
class RewardsScreen extends StatefulWidget {
  const RewardsScreen({super.key});

  @override
  State<RewardsScreen> createState() => _RewardsScreenState();
}

class _RewardsScreenState extends State<RewardsScreen> {
  RewardCategory _category = RewardCategory.all;

  List<_RewardItem> get _filtered => switch (_category) {
    RewardCategory.service =>
      _mockRewards.where((r) => r.tag == 'DỊCH VỤ').toList(),
    RewardCategory.shopping =>
      _mockRewards.where((r) => r.tag == 'TIỆN ÍCH').toList(),
    RewardCategory.food =>
      _mockRewards.where((r) => r.tag == 'ĂN UỐNG').toList(),
    RewardCategory.all => _mockRewards,
  };

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8F6F6),
      body: SafeArea(
        child: Column(
          children: [
            _buildHeader(context),
            Expanded(
              child: CustomScrollView(
                physics: const BouncingScrollPhysics(),
                slivers: [
                  SliverToBoxAdapter(child: _buildPointsBalance()),
                  SliverToBoxAdapter(child: _buildCategoryTabs()),
                  SliverPadding(
                    padding: const EdgeInsets.fromLTRB(16, 0, 16, 32),
                    sliver: SliverGrid(
                      delegate: SliverChildBuilderDelegate(
                        (context, i) => _RewardCard(item: _filtered[i]),
                        childCount: _filtered.length,
                      ),
                      gridDelegate:
                          const SliverGridDelegateWithFixedCrossAxisCount(
                            crossAxisCount: 2,
                            mainAxisSpacing: 14,
                            crossAxisSpacing: 14,
                            childAspectRatio: 0.72,
                          ),
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
                  'Đổi quà tặng',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.w900,
                    color: AppColors.navy900,
                  ),
                ),
                Text(
                  'Sử dụng điểm tích lũy để nhận voucher',
                  style: TextStyle(
                    fontSize: 12,
                    color: AppColors.textSecondary,
                  ),
                ),
              ],
            ),
          ),
          OutlinedButton.icon(
            onPressed: () {},
            icon: const Icon(Icons.history_rounded, size: 15),
            label: const Text(
              'Lịch sử',
              style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700),
            ),
            style: OutlinedButton.styleFrom(
              foregroundColor: AppColors.primary,
              side: const BorderSide(color: AppColors.primary),
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPointsBalance() {
    return Container(
      margin: const EdgeInsets.fromLTRB(16, 16, 16, 0),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            AppColors.primary.withOpacity(0.08),
            AppColors.primary.withOpacity(0.03),
          ],
        ),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: AppColors.primary.withOpacity(0.15)),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'SỐ DƯ HIỆN TẠI',
                  style: TextStyle(
                    fontSize: 9,
                    fontWeight: FontWeight.w800,
                    letterSpacing: 1.2,
                    color: AppColors.textSecondary,
                  ),
                ),
                const SizedBox(height: 8),
                RichText(
                  text: const TextSpan(
                    children: [
                      TextSpan(
                        text: '1.250',
                        style: TextStyle(
                          fontSize: 34,
                          fontWeight: FontWeight.w900,
                          color: AppColors.navy900,
                          letterSpacing: -1,
                        ),
                      ),
                      TextSpan(
                        text: ' điểm',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w700,
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: AppColors.primary.withOpacity(0.2)),
            ),
            child: Row(
              children: [
                Container(
                  width: 24,
                  height: 24,
                  decoration: const BoxDecoration(
                    color: AppColors.primary,
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    Icons.star_rounded,
                    size: 14,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(width: 8),
                const Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'THÀNH VIÊN',
                      style: TextStyle(
                        fontSize: 8,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 0.8,
                        color: AppColors.textSecondary,
                      ),
                    ),
                    Text(
                      'Hạng Bạc',
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w800,
                        color: AppColors.navy900,
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

  Widget _buildCategoryTabs() {
    final cats = [
      (c: RewardCategory.all, icon: Icons.grid_view_rounded, label: 'Tất cả'),
      (
        c: RewardCategory.service,
        icon: Icons.home_repair_service_outlined,
        label: 'Dịch vụ',
      ),
      (
        c: RewardCategory.shopping,
        icon: Icons.shopping_bag_outlined,
        label: 'Mua sắm',
      ),
      (
        c: RewardCategory.food,
        icon: Icons.restaurant_outlined,
        label: 'Ăn uống',
      ),
    ];

    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 18, 16, 16),
      child: Row(
        children: cats.map((item) {
          final active = _category == item.c;
          return Expanded(
            child: GestureDetector(
              onTap: () => setState(() => _category = item.c),
              child: Column(
                children: [
                  AnimatedContainer(
                    duration: const Duration(milliseconds: 180),
                    padding: const EdgeInsets.only(bottom: 10),
                    decoration: BoxDecoration(
                      border: Border(
                        bottom: BorderSide(
                          color: active
                              ? AppColors.primary
                              : Colors.transparent,
                          width: 2,
                        ),
                      ),
                    ),
                    child: Column(
                      children: [
                        Icon(
                          item.icon,
                          size: 18,
                          color: active
                              ? AppColors.primary
                              : AppColors.textHint,
                        ),
                        const SizedBox(height: 4),
                        Text(
                          item.label,
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                            color: active
                                ? AppColors.primary
                                : AppColors.textHint,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          );
        }).toList(),
      ),
    );
  }
}

// ─── Reward Card ──────────────────────────────────────────────
class _RewardCard extends StatelessWidget {
  final _RewardItem item;
  const _RewardCard({required this.item});

  Color _parseColor(String hex) {
    final c = hex.replaceAll('#', '');
    return Color(int.parse('FF$c', radix: 16));
  }

  @override
  Widget build(BuildContext context) {
    final tagColor = _parseColor(item.tagColor);
    final labelColor = _parseColor(item.bigLabelColor);
    final bg = tagColor.withOpacity(0.08);

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
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
          // Visual block
          Container(
            height: 110,
            decoration: BoxDecoration(
              color: bg,
              borderRadius: const BorderRadius.vertical(
                top: Radius.circular(18),
              ),
            ),
            child: Stack(
              children: [
                // Tag
                Positioned(
                  top: 10,
                  left: 10,
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 3,
                    ),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.85),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      item.tag,
                      style: TextStyle(
                        fontSize: 8,
                        fontWeight: FontWeight.w800,
                        color: tagColor,
                        letterSpacing: 0.5,
                      ),
                    ),
                  ),
                ),
                // Big label
                Center(
                  child: Text(
                    item.bigLabel,
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: item.locked ? 18 : 20,
                      fontWeight: FontWeight.w900,
                      color: labelColor,
                      letterSpacing: -0.5,
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Info
          Expanded(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(12, 10, 12, 12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    item.title,
                    style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w800,
                      color: AppColors.navy900,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 4),
                  Expanded(
                    child: Text(
                      item.description,
                      style: const TextStyle(
                        fontSize: 10,
                        color: AppColors.textSecondary,
                        height: 1.4,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          const Icon(
                            Icons.stars_rounded,
                            size: 13,
                            color: AppColors.primary,
                          ),
                          const SizedBox(width: 3),
                          Text(
                            '${item.points} điểm',
                            style: const TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w800,
                              color: AppColors.primary,
                            ),
                          ),
                        ],
                      ),
                      GestureDetector(
                        onTap: item.locked ? null : () => _showRedeem(context),
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 10,
                            vertical: 5,
                          ),
                          decoration: BoxDecoration(
                            color: item.locked
                                ? AppColors.border
                                : AppColors.primary,
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Text(
                            item.locked
                                ? (item.lockLabel ?? 'Khóa')
                                : 'Đổi ngay',
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w800,
                              color: item.locked
                                  ? AppColors.textHint
                                  : Colors.white,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _showRedeem(BuildContext context) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (_) => Padding(
        padding: const EdgeInsets.fromLTRB(24, 16, 24, 40),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: AppColors.border,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            const SizedBox(height: 20),
            const Icon(
              Icons.card_giftcard_rounded,
              size: 48,
              color: AppColors.primary,
            ),
            const SizedBox(height: 12),
            Text(
              item.title,
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w900,
                color: AppColors.navy900,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              'Sử dụng ${item.points} điểm để đổi ưu đãi này?',
              style: const TextStyle(
                fontSize: 13,
                color: AppColors.textSecondary,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {
                  Navigator.pop(context);
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: const Text('Đổi quà thành công! 🎉'),
                      backgroundColor: AppColors.primary,
                      behavior: SnackBarBehavior.floating,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      margin: const EdgeInsets.fromLTRB(16, 0, 16, 8),
                    ),
                  );
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                  ),
                ),
                child: const Text(
                  'Xác nhận đổi',
                  style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
