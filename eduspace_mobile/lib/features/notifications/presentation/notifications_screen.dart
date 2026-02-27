import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';

// ─── Data Models ─────────────────────────────────────────────

enum NotifType { booking, message, payment, reminder, review }

class NotifItem {
  final String id;
  final String title;
  final String body;
  final String timeAgo;
  final NotifType type;
  final bool isRead;
  final String? avatarUrl;

  const NotifItem({
    required this.id,
    required this.title,
    required this.body,
    required this.timeAgo,
    required this.type,
    this.isRead = false,
    this.avatarUrl,
  });

  NotifItem copyWith({bool? isRead}) => NotifItem(
    id: id,
    title: title,
    body: body,
    timeAgo: timeAgo,
    type: type,
    isRead: isRead ?? this.isRead,
    avatarUrl: avatarUrl,
  );
}

final _mockNotifications = <NotifItem>[
  // Today
  NotifItem(
    id: 'n1',
    title: 'Booking Confirmed',
    body:
        'Your classroom rental at Downtown Innovation Hub for tomorrow has been confirmed.',
    timeAgo: '2 mins ago',
    type: NotifType.booking,
    isRead: false,
  ),
  NotifItem(
    id: 'n2',
    title: 'New Message from Host',
    body:
        '"Hi! I\'ve prepared the whiteboard markers and the projector for your session tomorrow."',
    timeAgo: '45 mins ago',
    type: NotifType.message,
    isRead: false,
    avatarUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
  ),
  // Yesterday
  NotifItem(
    id: 'n3',
    title: 'Payment Successful',
    body: 'Transaction #EDU-99281 for \$120.00 was processed successfully.',
    timeAgo: '1 day ago',
    type: NotifType.payment,
    isRead: true,
  ),
  NotifItem(
    id: 'n4',
    title: 'Class Reminder',
    body:
        'Don\'t forget your scheduled class "Advanced UX Design" tomorrow at 10:00 AM.',
    timeAgo: '1 day ago',
    type: NotifType.reminder,
    isRead: true,
  ),
  NotifItem(
    id: 'n5',
    title: 'How was your stay?',
    body:
        'Share your experience at the Creative Studio. Your feedback helps the community!',
    timeAgo: '2 days ago',
    type: NotifType.review,
    isRead: true,
  ),
];

// ─── Screen ──────────────────────────────────────────────────

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen>
    with SingleTickerProviderStateMixin {
  late final TabController _tabController;
  late List<NotifItem> _items;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _tabController.addListener(() => setState(() {}));
    _items = List.of(_mockNotifications);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  void _markAllRead() {
    setState(() {
      _items = _items.map((n) => n.copyWith(isRead: true)).toList();
    });
  }

  void _markRead(String id) {
    setState(() {
      _items = _items
          .map((n) => n.id == id ? n.copyWith(isRead: true) : n)
          .toList();
    });
  }

  List<NotifItem> get _filtered {
    switch (_tabController.index) {
      case 1:
        return _items.where((n) => !n.isRead && !_isArchived(n)).toList();
      case 2:
        return _items.where((n) => _isArchived(n)).toList();
      default:
        return _items.where((n) => !_isArchived(n)).toList();
    }
  }

  bool _isArchived(NotifItem n) => false; // extend as needed

  int get _unreadCount => _items.where((n) => !n.isRead).length;

  @override
  Widget build(BuildContext context) {
    final filtered = _filtered;

    // Group by section label
    final today = filtered
        .where((n) => n.timeAgo.contains('min') || n.timeAgo == 'Just now')
        .toList();
    final yesterday = filtered
        .where((n) => n.timeAgo.contains('1 day'))
        .toList();
    final older = filtered
        .where(
          (n) =>
              !n.timeAgo.contains('min') &&
              n.timeAgo != 'Just now' &&
              !n.timeAgo.contains('1 day'),
        )
        .toList();

    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Column(
          children: [
            _buildHeader(),
            _buildTabBar(),
            Expanded(
              child: filtered.isEmpty
                  ? _buildEmpty()
                  : ListView(
                      physics: const BouncingScrollPhysics(),
                      children: [
                        if (today.isNotEmpty) ...[
                          _buildSectionLabel('Today'),
                          ...today.map(
                            (n) => _NotifTile(
                              item: n,
                              onTap: () => _markRead(n.id),
                            ),
                          ),
                        ],
                        if (yesterday.isNotEmpty) ...[
                          _buildSectionLabel('Yesterday'),
                          ...yesterday.map(
                            (n) => _NotifTile(
                              item: n,
                              onTap: () => _markRead(n.id),
                            ),
                          ),
                        ],
                        if (older.isNotEmpty) ...[
                          _buildSectionLabel('Earlier'),
                          ...older.map(
                            (n) => _NotifTile(
                              item: n,
                              onTap: () => _markRead(n.id),
                            ),
                          ),
                        ],
                        const SizedBox(height: 24),
                      ],
                    ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(24, 20, 24, 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              const Text(
                'Notifications',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.w800,
                  color: AppColors.navy900,
                ),
              ),
              if (_unreadCount > 0) ...[
                const SizedBox(width: 8),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 7,
                    vertical: 2,
                  ),
                  decoration: BoxDecoration(
                    color: AppColors.primary,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    '$_unreadCount',
                    style: const TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w800,
                      color: Colors.white,
                    ),
                  ),
                ),
              ],
            ],
          ),
          if (_unreadCount > 0)
            GestureDetector(
              onTap: _markAllRead,
              child: const Text(
                'Mark all as read',
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                  color: AppColors.primary,
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildTabBar() {
    final tabs = ['All', 'Unread', 'Archive'];
    return Container(
      decoration: const BoxDecoration(
        border: Border(bottom: BorderSide(color: AppColors.border, width: 1)),
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 24),
        child: Row(
          children: List.generate(tabs.length, (i) {
            final active = _tabController.index == i;
            return GestureDetector(
              onTap: () => _tabController.animateTo(i),
              behavior: HitTestBehavior.opaque,
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                margin: const EdgeInsets.only(right: 24),
                padding: const EdgeInsets.only(bottom: 12),
                decoration: BoxDecoration(
                  border: Border(
                    bottom: BorderSide(
                      color: active ? AppColors.primary : Colors.transparent,
                      width: 2,
                    ),
                  ),
                ),
                child: Text(
                  tabs[i],
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: active ? FontWeight.w700 : FontWeight.w500,
                    color: active ? AppColors.primary : AppColors.textHint,
                  ),
                ),
              ),
            );
          }),
        ),
      ),
    );
  }

  Widget _buildSectionLabel(String label) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(24, 20, 24, 4),
      child: Text(
        label.toUpperCase(),
        style: const TextStyle(
          fontSize: 10,
          fontWeight: FontWeight.w800,
          letterSpacing: 1.2,
          color: AppColors.textHint,
        ),
      ),
    );
  }

  Widget _buildEmpty() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 72,
            height: 72,
            decoration: BoxDecoration(
              color: AppColors.primaryLight,
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.notifications_none_rounded,
              size: 36,
              color: AppColors.primary,
            ),
          ),
          const SizedBox(height: 16),
          const Text(
            'No notifications yet',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w700,
              color: AppColors.navy900,
            ),
          ),
          const SizedBox(height: 6),
          const Text(
            "You're all caught up!",
            style: TextStyle(fontSize: 13, color: AppColors.textSecondary),
          ),
        ],
      ),
    );
  }
}

// ─── Notification Tile ────────────────────────────────────────

class _NotifTile extends StatelessWidget {
  final NotifItem item;
  final VoidCallback onTap;

  const _NotifTile({required this.item, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final unread = !item.isRead;

    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 250),
        color: unread ? AppColors.primaryLight.withOpacity(0.5) : Colors.white,
        child: Container(
          decoration: const BoxDecoration(
            border: Border(
              bottom: BorderSide(color: Color(0xFFF1F5F9), width: 1),
            ),
          ),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildIcon(),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            item.title,
                            style: const TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w700,
                              color: AppColors.navy900,
                            ),
                          ),
                        ),
                        if (unread)
                          Container(
                            width: 8,
                            height: 8,
                            decoration: const BoxDecoration(
                              color: AppColors.primary,
                              shape: BoxShape.circle,
                            ),
                          ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      item.body,
                      style: TextStyle(
                        fontSize: 13,
                        height: 1.4,
                        color: AppColors.textSecondary,
                        fontStyle: item.type == NotifType.message
                            ? FontStyle.italic
                            : FontStyle.normal,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      item.timeAgo,
                      style: const TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w500,
                        color: AppColors.textHint,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildIcon() {
    if (item.avatarUrl != null) {
      return ClipRRect(
        borderRadius: BorderRadius.circular(14),
        child: Image.network(
          item.avatarUrl!,
          width: 48,
          height: 48,
          fit: BoxFit.cover,
          errorBuilder: (_, __, ___) => _iconBox(_iconData()),
        ),
      );
    }
    return _iconBox(_iconData());
  }

  Widget _iconBox(IconData icon) {
    return Container(
      width: 48,
      height: 48,
      decoration: BoxDecoration(
        color: AppColors.primaryLight,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.primary.withOpacity(0.15)),
      ),
      child: Icon(icon, color: AppColors.primary, size: 22),
    );
  }

  IconData _iconData() {
    switch (item.type) {
      case NotifType.booking:
        return Icons.event_available_rounded;
      case NotifType.message:
        return Icons.chat_bubble_outline_rounded;
      case NotifType.payment:
        return Icons.payments_outlined;
      case NotifType.reminder:
        return Icons.alarm_rounded;
      case NotifType.review:
        return Icons.star_rate_rounded;
    }
  }
}
