import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';
import '../data/room_model.dart';

class RoomDetailScreen extends StatefulWidget {
  final RoomModel room;

  const RoomDetailScreen({super.key, required this.room});

  @override
  State<RoomDetailScreen> createState() => _RoomDetailScreenState();
}

class _RoomDetailScreenState extends State<RoomDetailScreen> {
  int _currentImageIndex = 0;
  bool _isFavorite = false;
  bool _isDescExpanded = false;
  final PageController _pageController = PageController();

  // Mock reviews
  static const List<_MockReview> _reviews = [
    _MockReview(
      name: 'Sarah L.',
      avatar: 'S',
      rating: 5,
      date: 'Nov 12, 2024',
      text:
          'Absolutely stunning space! The acoustics were perfect for our team presentation and the staff was incredibly helpful.',
    ),
    _MockReview(
      name: 'David K.',
      avatar: 'D',
      rating: 5,
      date: 'Oct 28, 2024',
      text:
          'Best workspace I\'ve booked in HCMC. Clean, modern, and the WiFi was blazing fast. Will definitely return!',
    ),
    _MockReview(
      name: 'Minh T.',
      avatar: 'M',
      rating: 4,
      date: 'Oct 15, 2024',
      text:
          'Great room for our study group. The projector and whiteboard made collaboration easy.',
    ),
  ];

  @override
  void initState() {
    super.initState();
    _isFavorite = widget.room.isFavorite;
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final room = widget.room;
    final images = room.imageUrls.isNotEmpty ? room.imageUrls : [room.imageUrl];

    return Scaffold(
      backgroundColor: const Color(0xFFF8F6F6),
      body: Stack(
        children: [
          // ── Scrollable content ──────────────────────────────────
          CustomScrollView(
            slivers: [
              // ── Image Carousel SliverAppBar ──────────────────────
              SliverAppBar(
                expandedHeight: 320,
                pinned: true,
                backgroundColor: Colors.white,
                elevation: 0,
                leading: _CircleIconButton(
                  icon: Icons.arrow_back_rounded,
                  onTap: () => Navigator.pop(context),
                ),
                actions: [
                  _CircleIconButton(
                    icon: _isFavorite
                        ? Icons.favorite_rounded
                        : Icons.favorite_border_rounded,
                    iconColor: _isFavorite
                        ? AppColors.primary
                        : AppColors.navy900,
                    onTap: () => setState(() => _isFavorite = !_isFavorite),
                  ),
                  _CircleIconButton(icon: Icons.share_rounded, onTap: () {}),
                  const SizedBox(width: 4),
                ],
                flexibleSpace: FlexibleSpaceBar(
                  background: Stack(
                    children: [
                      // Image carousel
                      PageView.builder(
                        controller: _pageController,
                        itemCount: images.length,
                        onPageChanged: (i) =>
                            setState(() => _currentImageIndex = i),
                        itemBuilder: (context, i) => Image.network(
                          images[i],
                          fit: BoxFit.cover,
                          errorBuilder: (_, __, ___) => Container(
                            color: AppColors.divider,
                            child: const Icon(
                              Icons.image_outlined,
                              size: 64,
                              color: AppColors.textHint,
                            ),
                          ),
                        ),
                      ),
                      // Gradient at bottom
                      Align(
                        alignment: Alignment.bottomCenter,
                        child: Container(
                          height: 80,
                          decoration: const BoxDecoration(
                            gradient: LinearGradient(
                              begin: Alignment.topCenter,
                              end: Alignment.bottomCenter,
                              colors: [Colors.transparent, Color(0x80000000)],
                            ),
                          ),
                        ),
                      ),
                      // Dots indicator
                      if (images.length > 1)
                        Positioned(
                          bottom: 14,
                          left: 0,
                          right: 0,
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: List.generate(
                              images.length,
                              (i) => AnimatedContainer(
                                duration: const Duration(milliseconds: 200),
                                margin: const EdgeInsets.symmetric(
                                  horizontal: 3,
                                ),
                                width: i == _currentImageIndex ? 20 : 6,
                                height: 6,
                                decoration: BoxDecoration(
                                  color: i == _currentImageIndex
                                      ? Colors.white
                                      : Colors.white54,
                                  borderRadius: BorderRadius.circular(4),
                                ),
                              ),
                            ),
                          ),
                        ),
                      // FEATURED badge
                      if (room.isFeatured)
                        Positioned(
                          top: 80,
                          left: 16,
                          child: Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 10,
                              vertical: 5,
                            ),
                            decoration: BoxDecoration(
                              color: AppColors.primary,
                              borderRadius: BorderRadius.circular(8),
                              boxShadow: [
                                BoxShadow(
                                  color: AppColors.primary.withOpacity(0.4),
                                  blurRadius: 8,
                                  offset: const Offset(0, 2),
                                ),
                              ],
                            ),
                            child: const Text(
                              '🔥 FEATURED',
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.w800,
                                color: Colors.white,
                                letterSpacing: 0.8,
                              ),
                            ),
                          ),
                        ),
                      // Photos counter
                      Positioned(
                        bottom: 14,
                        right: 16,
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 4,
                          ),
                          decoration: BoxDecoration(
                            color: Colors.black54,
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(
                                Icons.photo_library_outlined,
                                color: Colors.white,
                                size: 12,
                              ),
                              const SizedBox(width: 4),
                              Text(
                                '${_currentImageIndex + 1}/${images.length}',
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 11,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              // ── Body Content ─────────────────────────────────────
              SliverToBoxAdapter(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // ── Main Info Card ──────────────────────────────
                    _SectionCard(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Name + Rating
                          Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Expanded(
                                child: Text(
                                  room.name,
                                  style: const TextStyle(
                                    fontSize: 22,
                                    fontWeight: FontWeight.w900,
                                    color: AppColors.navy900,
                                    height: 1.2,
                                  ),
                                ),
                              ),
                              const SizedBox(width: 12),
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 10,
                                  vertical: 6,
                                ),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFFEF9C3),
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    const Icon(
                                      Icons.star_rounded,
                                      size: 16,
                                      color: Color(0xFFCA8A04),
                                    ),
                                    const SizedBox(width: 4),
                                    Text(
                                      room.rating.toStringAsFixed(1),
                                      style: const TextStyle(
                                        fontSize: 14,
                                        fontWeight: FontWeight.w800,
                                        color: Color(0xFFCA8A04),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 6),

                          // Reviews count
                          Row(
                            children: [
                              const Icon(
                                Icons.reviews_outlined,
                                size: 14,
                                color: AppColors.textSecondary,
                              ),
                              const SizedBox(width: 4),
                              Text(
                                '${room.reviewCount} reviews',
                                style: const TextStyle(
                                  fontSize: 13,
                                  color: AppColors.textSecondary,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),

                          // Address
                          Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Icon(
                                Icons.location_on_outlined,
                                size: 16,
                                color: AppColors.primary,
                              ),
                              const SizedBox(width: 6),
                              Expanded(
                                child: Text(
                                  room.address.isNotEmpty
                                      ? room.address
                                      : 'Ho Chi Minh City',
                                  style: const TextStyle(
                                    fontSize: 13,
                                    color: AppColors.textSecondary,
                                    height: 1.4,
                                  ),
                                ),
                              ),
                              const SizedBox(width: 8),
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 8,
                                  vertical: 4,
                                ),
                                decoration: BoxDecoration(
                                  color: AppColors.primary.withOpacity(0.08),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Text(
                                  '${room.distanceMi} mi',
                                  style: const TextStyle(
                                    fontSize: 11,
                                    fontWeight: FontWeight.w700,
                                    color: AppColors.primary,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),

                    // ── Quick Stats ─────────────────────────────────
                    _SectionCard(
                      child: Row(
                        children: [
                          _StatItem(
                            icon: Icons.people_alt_outlined,
                            label: 'Capacity',
                            value: '${room.capacity} people',
                          ),
                          _VerticalDivider(),
                          _StatItem(
                            icon: Icons.straighten_outlined,
                            label: 'Area',
                            value: '${room.sqft} sqft',
                          ),
                          _VerticalDivider(),
                          _StatItem(
                            icon: Icons.attach_money_rounded,
                            label: 'Price',
                            value: '\$${room.pricePerHour.toInt()}/hr',
                            valueColor: AppColors.primary,
                          ),
                        ],
                      ),
                    ),

                    // ── Amenities ───────────────────────────────────
                    _SectionCard(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const _SectionTitle('Amenities & Features'),
                          const SizedBox(height: 16),
                          GridView.count(
                            crossAxisCount: 2,
                            crossAxisSpacing: 10,
                            mainAxisSpacing: 10,
                            childAspectRatio: 3.5,
                            shrinkWrap: true,
                            physics: const NeverScrollableScrollPhysics(),
                            children: room.amenities
                                .map((a) => _AmenityBadge(label: a))
                                .toList(),
                          ),
                        ],
                      ),
                    ),

                    // ── Description ─────────────────────────────────
                    _SectionCard(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const _SectionTitle('About This Space'),
                          const SizedBox(height: 12),
                          AnimatedCrossFade(
                            firstChild: Text(
                              room.description,
                              maxLines: 3,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(
                                fontSize: 14,
                                color: AppColors.textSecondary,
                                height: 1.6,
                              ),
                            ),
                            secondChild: Text(
                              room.description,
                              style: const TextStyle(
                                fontSize: 14,
                                color: AppColors.textSecondary,
                                height: 1.6,
                              ),
                            ),
                            crossFadeState: _isDescExpanded
                                ? CrossFadeState.showSecond
                                : CrossFadeState.showFirst,
                            duration: const Duration(milliseconds: 200),
                          ),
                          const SizedBox(height: 8),
                          GestureDetector(
                            onTap: () => setState(
                              () => _isDescExpanded = !_isDescExpanded,
                            ),
                            child: Text(
                              _isDescExpanded ? 'Show less' : 'Read more',
                              style: const TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w700,
                                color: AppColors.primary,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),

                    // ── Availability Preview ────────────────────────
                    _SectionCard(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const _SectionTitle('Availability'),
                              Text(
                                'Today · Nov 6',
                                style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600,
                                  color: AppColors.primary.withOpacity(0.8),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 16),
                          _TimeSlotRow(),
                        ],
                      ),
                    ),

                    // ── Reviews ─────────────────────────────────────
                    _SectionCard(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const _SectionTitle('Reviews'),
                              GestureDetector(
                                onTap: () {},
                                child: const Text(
                                  'See all',
                                  style: TextStyle(
                                    fontSize: 13,
                                    fontWeight: FontWeight.w700,
                                    color: AppColors.primary,
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 6),

                          // Overall rating bar
                          _RatingOverview(
                            rating: room.rating,
                            reviewCount: room.reviewCount,
                          ),
                          const SizedBox(height: 20),
                          const Divider(color: AppColors.divider, height: 1),
                          const SizedBox(height: 16),

                          // Review cards
                          ...List.generate(
                            _reviews.length,
                            (i) => _ReviewCard(review: _reviews[i]),
                          ),
                        ],
                      ),
                    ),

                    // ── Map CTA ─────────────────────────────────────
                    _SectionCard(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const _SectionTitle('Location'),
                          const SizedBox(height: 12),
                          ClipRRect(
                            borderRadius: BorderRadius.circular(12),
                            child: Container(
                              height: 140,
                              decoration: BoxDecoration(
                                color: AppColors.divider,
                                border: Border.all(color: AppColors.border),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Stack(
                                fit: StackFit.expand,
                                children: [
                                  Image.network(
                                    'https://maps.googleapis.com/maps/api/staticmap?center=10.7769,106.7009&zoom=15&size=400x220&maptype=roadmap&markers=color:red%7C10.7769,106.7009&key=AIzaSyD-PLACEHOLDER',
                                    fit: BoxFit.cover,
                                    errorBuilder: (_, __, ___) => Container(
                                      color: const Color(0xFFE8EAF6),
                                      child: Column(
                                        mainAxisAlignment:
                                            MainAxisAlignment.center,
                                        children: [
                                          Icon(
                                            Icons.map_outlined,
                                            size: 40,
                                            color: AppColors.primary
                                                .withOpacity(0.4),
                                          ),
                                          const SizedBox(height: 6),
                                          const Text(
                                            'View on Map',
                                            style: TextStyle(
                                              fontSize: 13,
                                              fontWeight: FontWeight.w600,
                                              color: AppColors.textSecondary,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ),
                                  Positioned(
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    child: Container(
                                      padding: const EdgeInsets.all(12),
                                      color: Colors.black.withOpacity(0.4),
                                      child: Text(
                                        room.address.isNotEmpty
                                            ? room.address
                                            : 'Ho Chi Minh City',
                                        style: const TextStyle(
                                          color: Colors.white,
                                          fontSize: 12,
                                          fontWeight: FontWeight.w600,
                                        ),
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),

                    // Bottom padding for FAB
                    const SizedBox(height: 100),
                  ],
                ),
              ),
            ],
          ),

          // ── Sticky Bottom Bar ──────────────────────────────────
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: _BottomBar(
              pricePerHour: widget.room.pricePerHour,
              onBook: () {
                Navigator.pushNamed(
                  context,
                  '/booking/new',
                  arguments: widget.room,
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Small reusable widgets
// ─────────────────────────────────────────────────────────────────────────────

class _CircleIconButton extends StatelessWidget {
  final IconData icon;
  final Color? iconColor;
  final VoidCallback onTap;

  const _CircleIconButton({
    required this.icon,
    this.iconColor,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.all(8),
        width: 38,
        height: 38,
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.92),
          shape: BoxShape.circle,
          boxShadow: const [BoxShadow(color: Color(0x20000000), blurRadius: 6)],
        ),
        child: Icon(icon, size: 20, color: iconColor ?? AppColors.navy900),
      ),
    );
  }
}

class _SectionCard extends StatelessWidget {
  final Widget child;

  const _SectionCard({required this.child});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.fromLTRB(16, 12, 16, 0),
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: const [
          BoxShadow(
            color: Color(0x08000000),
            blurRadius: 10,
            offset: Offset(0, 3),
          ),
        ],
      ),
      child: child,
    );
  }
}

class _SectionTitle extends StatelessWidget {
  final String text;

  const _SectionTitle(this.text);

  @override
  Widget build(BuildContext context) {
    return Text(
      text,
      style: const TextStyle(
        fontSize: 16,
        fontWeight: FontWeight.w800,
        color: AppColors.navy900,
      ),
    );
  }
}

class _StatItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final Color? valueColor;

  const _StatItem({
    required this.icon,
    required this.label,
    required this.value,
    this.valueColor,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Column(
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: AppColors.primary.withOpacity(0.07),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, size: 22, color: AppColors.primary),
          ),
          const SizedBox(height: 8),
          Text(
            value,
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w800,
              color: valueColor ?? AppColors.navy900,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            label,
            style: const TextStyle(
              fontSize: 11,
              color: AppColors.textHint,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }
}

class _VerticalDivider extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      height: 50,
      width: 1,
      color: AppColors.divider,
      margin: const EdgeInsets.symmetric(horizontal: 4),
    );
  }
}

class _AmenityBadge extends StatelessWidget {
  final String label;

  const _AmenityBadge({required this.label});

  static IconData _icon(String label) {
    switch (label.toLowerCase()) {
      case 'wifi':
      case 'free wifi':
        return Icons.wifi_rounded;
      case 'a/c':
      case 'air conditioning':
        return Icons.ac_unit_rounded;
      case 'projector':
        return Icons.videocam_outlined;
      case 'coffee':
        return Icons.coffee_rounded;
      case 'whiteboard':
        return Icons.draw_outlined;
      case 'tv screen':
        return Icons.tv_rounded;
      default:
        return Icons.check_circle_outline_rounded;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: AppColors.primary.withOpacity(0.06),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColors.primary.withOpacity(0.15)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(_icon(label), size: 15, color: AppColors.primary),
          const SizedBox(width: 6),
          Text(
            label,
            style: const TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w700,
              color: AppColors.primary,
            ),
          ),
        ],
      ),
    );
  }
}

// ── Time Slots Preview ────────────────────────────────────────────────────────

class _TimeSlotRow extends StatefulWidget {
  @override
  State<_TimeSlotRow> createState() => _TimeSlotRowState();
}

class _TimeSlotRowState extends State<_TimeSlotRow> {
  int? _selected;

  static const slots = [
    (time: '08:00', label: 'Morning', booked: false),
    (time: '10:00', label: 'Morning', booked: false),
    (time: '12:00', label: 'Afternoon', booked: true),
    (time: '14:00', label: 'Afternoon', booked: false),
    (time: '16:00', label: 'Evening', booked: false),
    (time: '18:00', label: 'Evening', booked: true),
  ];

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: List.generate(slots.length, (i) {
        final slot = slots[i];
        final isSelected = _selected == i;
        final isBooked = slot.booked;

        return GestureDetector(
          onTap: isBooked ? null : () => setState(() => _selected = i),
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 200),
            width: 90,
            padding: const EdgeInsets.symmetric(vertical: 10),
            decoration: BoxDecoration(
              color: isBooked
                  ? AppColors.divider
                  : isSelected
                  ? AppColors.primary
                  : Colors.white,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: isBooked
                    ? AppColors.border
                    : isSelected
                    ? AppColors.primary
                    : AppColors.border,
                width: isSelected ? 2 : 1,
              ),
              boxShadow: isSelected
                  ? [
                      BoxShadow(
                        color: AppColors.primary.withOpacity(0.3),
                        blurRadius: 8,
                        offset: const Offset(0, 2),
                      ),
                    ]
                  : null,
            ),
            child: Column(
              children: [
                Text(
                  slot.time,
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w800,
                    color: isBooked
                        ? AppColors.textHint
                        : isSelected
                        ? Colors.white
                        : AppColors.navy900,
                    decoration: isBooked ? TextDecoration.lineThrough : null,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  isBooked ? 'Booked' : slot.label,
                  style: TextStyle(
                    fontSize: 9,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 0.5,
                    color: isBooked
                        ? AppColors.error.withOpacity(0.7)
                        : isSelected
                        ? Colors.white70
                        : AppColors.textHint,
                  ),
                ),
              ],
            ),
          ),
        );
      }),
    );
  }
}

// ── Rating Overview ───────────────────────────────────────────────────────────

class _RatingOverview extends StatelessWidget {
  final double rating;
  final int reviewCount;

  const _RatingOverview({required this.rating, required this.reviewCount});

  static const _barData = [
    (stars: 5, fraction: 0.75),
    (stars: 4, fraction: 0.15),
    (stars: 3, fraction: 0.06),
    (stars: 2, fraction: 0.03),
    (stars: 1, fraction: 0.01),
  ];

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        // Big number
        Column(
          children: [
            Text(
              rating.toStringAsFixed(1),
              style: const TextStyle(
                fontSize: 48,
                fontWeight: FontWeight.w900,
                color: AppColors.navy900,
                height: 1.0,
              ),
            ),
            Row(
              mainAxisSize: MainAxisSize.min,
              children: List.generate(
                5,
                (i) => Icon(
                  i < rating.floor()
                      ? Icons.star_rounded
                      : Icons.star_border_rounded,
                  size: 14,
                  color: const Color(0xFFCA8A04),
                ),
              ),
            ),
            const SizedBox(height: 2),
            Text(
              '$reviewCount reviews',
              style: const TextStyle(
                fontSize: 11,
                color: AppColors.textHint,
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
        const SizedBox(width: 20),
        // Bars
        Expanded(
          child: Column(
            children: _barData.map((d) {
              return Padding(
                padding: const EdgeInsets.symmetric(vertical: 2),
                child: Row(
                  children: [
                    Text(
                      '${d.stars}',
                      style: const TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        color: AppColors.textSecondary,
                      ),
                    ),
                    const SizedBox(width: 4),
                    const Icon(
                      Icons.star_rounded,
                      size: 11,
                      color: Color(0xFFCA8A04),
                    ),
                    const SizedBox(width: 6),
                    Expanded(
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(4),
                        child: LinearProgressIndicator(
                          value: d.fraction,
                          backgroundColor: AppColors.divider,
                          color: const Color(0xFFCA8A04),
                          minHeight: 6,
                        ),
                      ),
                    ),
                  ],
                ),
              );
            }).toList(),
          ),
        ),
      ],
    );
  }
}

// ── Review Card ───────────────────────────────────────────────────────────────

class _MockReview {
  final String name;
  final String avatar;
  final int rating;
  final String date;
  final String text;

  const _MockReview({
    required this.name,
    required this.avatar,
    required this.rating,
    required this.date,
    required this.text,
  });
}

class _ReviewCard extends StatelessWidget {
  final _MockReview review;

  const _ReviewCard({required this.review});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Row(
            children: [
              CircleAvatar(
                radius: 18,
                backgroundColor: AppColors.primary.withOpacity(0.12),
                child: Text(
                  review.avatar,
                  style: const TextStyle(
                    fontWeight: FontWeight.w800,
                    color: AppColors.primary,
                    fontSize: 14,
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      review.name,
                      style: const TextStyle(
                        fontWeight: FontWeight.w700,
                        fontSize: 14,
                        color: AppColors.navy900,
                      ),
                    ),
                    Text(
                      review.date,
                      style: const TextStyle(
                        fontSize: 11,
                        color: AppColors.textHint,
                      ),
                    ),
                  ],
                ),
              ),
              // Stars
              Row(
                mainAxisSize: MainAxisSize.min,
                children: List.generate(
                  review.rating,
                  (_) => const Icon(
                    Icons.star_rounded,
                    size: 14,
                    color: Color(0xFFCA8A04),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            review.text,
            style: const TextStyle(
              fontSize: 13,
              color: AppColors.textSecondary,
              height: 1.5,
            ),
          ),
          const SizedBox(height: 12),
          const Divider(color: AppColors.divider, height: 1),
        ],
      ),
    );
  }
}

// ── Bottom Bar ────────────────────────────────────────────────────────────────

class _BottomBar extends StatelessWidget {
  final double pricePerHour;
  final VoidCallback onBook;

  const _BottomBar({required this.pricePerHour, required this.onBook});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(top: BorderSide(color: AppColors.border)),
        boxShadow: [
          BoxShadow(
            color: Color(0x15000000),
            blurRadius: 16,
            offset: Offset(0, -4),
          ),
        ],
      ),
      child: SafeArea(
        top: false,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(20, 14, 20, 14),
          child: Row(
            children: [
              // Price
              Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'PRICE PER HOUR',
                    style: TextStyle(
                      fontSize: 9,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 1.2,
                      color: AppColors.textHint,
                    ),
                  ),
                  const SizedBox(height: 2),
                  RichText(
                    text: TextSpan(
                      children: [
                        TextSpan(
                          text: '\$${pricePerHour.toInt()}',
                          style: const TextStyle(
                            fontSize: 26,
                            fontWeight: FontWeight.w900,
                            color: AppColors.primary,
                          ),
                        ),
                        const TextSpan(
                          text: ' /hr',
                          style: TextStyle(
                            fontSize: 13,
                            color: AppColors.textHint,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(width: 20),
              // Book button
              Expanded(
                child: ElevatedButton(
                  onPressed: onBook,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
                    elevation: 4,
                    shadowColor: AppColors.primary.withOpacity(0.5),
                  ),
                  child: const Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        'Reserve Now',
                        style: TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w800,
                          letterSpacing: 0.5,
                        ),
                      ),
                      SizedBox(width: 8),
                      Icon(Icons.arrow_forward_rounded, size: 18),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
