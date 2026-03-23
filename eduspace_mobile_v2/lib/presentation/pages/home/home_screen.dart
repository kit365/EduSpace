import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';
import '../../../data/models/response/room/room_api_models.dart';
import '../../../domain/repositories/room/room_repository.dart';
import '../../../data/repositories/room/room_repository_impl.dart';
import '../../common/widgets/placeholder_screen.dart';
import '../messages/messages_screen.dart';
import '../profile/profile_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _currentTab = 0;

  final List<Widget> _screens = [
    const _HomeTab(),
    const PlaceholderScreen(
        label: 'Bookings', icon: Icons.calendar_today_outlined),
    const PlaceholderScreen(label: 'Inbox', icon: Icons.notifications_outlined),
    const MessagesScreen(),
    const ProfileScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: _screens[_currentTab],
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentTab,
        onTap: (index) => setState(() => _currentTab = index),
        type: BottomNavigationBarType.fixed,
        selectedItemColor: AppColors.primary,
        unselectedItemColor: AppColors.textHint,
        backgroundColor: AppColors.surface,
        elevation: 8,
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home_rounded), label: 'Home'),
          BottomNavigationBarItem(
              icon: Icon(Icons.calendar_today_outlined), label: 'Bookings'),
          BottomNavigationBarItem(
              icon: Icon(Icons.notifications_outlined), label: 'Inbox'),
          BottomNavigationBarItem(
              icon: Icon(Icons.chat_bubble_outline), label: 'Messages'),
          BottomNavigationBarItem(
              icon: Icon(Icons.person_outline), label: 'Profile'),
        ],
      ),
    );
  }
}

class _HomeTab extends StatefulWidget {
  const _HomeTab();

  @override
  State<_HomeTab> createState() => _HomeTabState();
}

class _HomeTabState extends State<_HomeTab> {
  final RoomRepository _roomRepository = RoomRepositoryImpl();
  List<RoomCategoryResponse> _categories = [];
  List<RoomResponse> _rooms = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchData();
  }

  Future<void> _fetchData() async {
    try {
      final categoriesResponse = await _roomRepository.getFeaturedCategories();
      final roomsResponse = await _roomRepository.getRooms(size: 10);

      if (mounted) {
        setState(() {
          _categories = categoriesResponse.data ?? [];
          _rooms = roomsResponse.data ?? [];
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
      }
      debugPrint('Error fetching home data: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    return SafeArea(
      child: CustomScrollView(
        slivers: [
          const SliverToBoxAdapter(child: _Header()),
          const SliverToBoxAdapter(child: _HeaderSearch()),
          const SliverToBoxAdapter(child: _HeroBanner()),
          SliverToBoxAdapter(child: _CategoriesRow(categories: _categories)),
          SliverPadding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            sliver: SliverToBoxAdapter(
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Phòng nổi bật',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: AppColors.navy900,
                    ),
                  ),
                  TextButton(
                    onPressed: () {},
                    child: const Text('Xem tất cả'),
                  ),
                ],
              ),
            ),
          ),
          SliverList(
            delegate: SliverChildBuilderDelegate(
              (context, index) => Padding(
                padding: const EdgeInsets.fromLTRB(20, 0, 20, 16),
                child: _RoomCard(room: _rooms[index]),
              ),
              childCount: _rooms.length,
            ),
          ),
        ],
      ),
    );
  }
}

class _Header extends StatelessWidget {
  const _Header();

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 10, 20, 10),
      child: Row(
        children: [
          const CircleAvatar(
            radius: 20,
            backgroundImage: NetworkImage(
              'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80',
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(
                      'Hồ Chí Minh',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: AppColors.navy900.withOpacity(0.8),
                      ),
                    ),
                    const Icon(Icons.keyboard_arrow_down,
                        size: 16, color: AppColors.primary),
                  ],
                ),
                const Text(
                  'Chào buổi sáng, Kiet!',
                  style: TextStyle(
                    fontSize: 12,
                    color: AppColors.textSecondary,
                  ),
                ),
              ],
            ),
          ),
          Stack(
            children: [
              IconButton(
                padding: EdgeInsets.zero,
                constraints: const BoxConstraints(),
                icon: const Icon(Icons.notifications_none_rounded,
                    color: AppColors.navy900),
                onPressed: () {},
              ),
              Positioned(
                right: 2,
                top: 2,
                child: Container(
                  width: 8,
                  height: 8,
                  decoration: const BoxDecoration(
                    color: AppColors.primary,
                    shape: BoxShape.circle,
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

class _HeaderSearch extends StatelessWidget {
  const _HeaderSearch();

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16),
        height: 50,
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(12),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Row(
          children: [
            const Icon(Icons.search, color: AppColors.primary),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                'Tìm kiếm phòng học, studio...',
                style: TextStyle(
                  color: AppColors.textHint,
                  fontSize: 14,
                ),
              ),
            ),
            const VerticalDivider(
              indent: 12,
              endIndent: 12,
              color: AppColors.divider,
            ),
            const Icon(Icons.tune_rounded, color: AppColors.primary, size: 20),
          ],
        ),
      ),
    );
  }
}

class _HeroBanner extends StatelessWidget {
  const _HeroBanner();

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(20),
      child: Container(
        height: 160,
        width: double.infinity,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(20),
          gradient: LinearGradient(
            colors: [
              AppColors.primary,
              AppColors.primary.withOpacity(0.8),
            ],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          image: DecorationImage(
            image: const NetworkImage(
              'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80',
            ),
            fit: BoxFit.cover,
            colorFilter: ColorFilter.mode(
              AppColors.primary.withOpacity(0.6),
              BlendMode.multiply,
            ),
          ),
        ),
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: const Text(
                  'ƯU ĐÃI ĐẶC BIỆT',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 1,
                  ),
                ),
              ),
              const SizedBox(height: 12),
              const Text(
                'Giảm 30% cho lần\nđặt đầu tiên',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 22,
                  fontWeight: FontWeight.bold,
                  height: 1.2,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _CategoriesRow extends StatelessWidget {
  final List<RoomCategoryResponse> categories;

  const _CategoriesRow({required this.categories});

  @override
  Widget build(BuildContext context) {
    if (categories.isEmpty) return const SizedBox.shrink();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Padding(
          padding: EdgeInsets.symmetric(horizontal: 20),
          child: Text(
            'Phân loại',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: AppColors.navy900,
            ),
          ),
        ),
        const SizedBox(height: 16),
        SizedBox(
          height: 100,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            itemCount: categories.length,
            itemBuilder: (context, index) {
              final category = categories[index];
              final isSelected = index == 0;
              return Padding(
                padding: const EdgeInsets.symmetric(horizontal: 4),
                child: Column(
                  children: [
                    Container(
                      width: 60,
                      height: 60,
                      decoration: BoxDecoration(
                        color: isSelected ? AppColors.primary : AppColors.surface,
                        borderRadius: BorderRadius.circular(16),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.03),
                            blurRadius: 10,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: Icon(
                        _getCategoryIcon(category.iconName),
                        color: isSelected ? Colors.white : AppColors.primary,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      category.name,
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight:
                            isSelected ? FontWeight.w600 : FontWeight.normal,
                        color:
                            isSelected ? AppColors.primary : AppColors.textSecondary,
                      ),
                    ),
                  ],
                ),
              );
            },
          ),
        ),
        const SizedBox(height: 20),
      ],
    );
  }

  IconData _getCategoryIcon(String? iconName) {
    switch (iconName?.toLowerCase()) {
      case 'meeting':
        return Icons.meeting_room_outlined;
      case 'labs':
        return Icons.science_outlined;
      case 'lecture':
        return Icons.groups_outlined;
      case 'it':
        return Icons.computer_outlined;
      case 'studio':
        return Icons.palette_outlined;
      case 'library':
        return Icons.local_library_outlined;
      default:
        return Icons.category_outlined;
    }
  }
}

class _RoomCard extends StatelessWidget {
  final RoomResponse room;

  const _RoomCard({required this.room});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 15,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Stack(
            children: [
              ClipRRect(
                borderRadius:
                    const BorderRadius.vertical(top: Radius.circular(20)),
                child: room.imageUrl != null
                    ? Image.network(
                        room.imageUrl!,
                        height: 180,
                        width: double.infinity,
                        fit: BoxFit.cover,
                        errorBuilder: (_, __, ___) => _buildPlaceholderImage(),
                      )
                    : _buildPlaceholderImage(),
              ),
              Positioned(
                top: 12,
                right: 12,
                child: Container(
                  padding: const EdgeInsets.all(8),
                  decoration: const BoxDecoration(
                    color: Colors.white,
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    Icons.favorite_border,
                    size: 18,
                    color: Colors.grey,
                  ),
                ),
              ),
            ],
          ),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Text(
                        room.name,
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: AppColors.navy900,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    Row(
                      children: [
                        const Icon(Icons.star_rounded,
                            color: Colors.amber, size: 20),
                        const SizedBox(width: 4),
                        Text(
                          room.rating.toStringAsFixed(1),
                          style: const TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 14,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    const Icon(Icons.location_on_outlined,
                        size: 14, color: AppColors.textSecondary),
                    const SizedBox(width: 4),
                    Expanded(
                      child: Text(
                        room.address.isNotEmpty ? room.address : 'Chưa có địa chỉ',
                        style: const TextStyle(
                          fontSize: 12,
                          color: AppColors.textSecondary,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    _FeatureChip(
                      icon: Icons.people_outline,
                      label: '${room.capacity} seats',
                    ),
                    const Spacer(),
                    RichText(
                      text: TextSpan(
                        children: [
                          TextSpan(
                            text: '${room.pricePerHour.toInt()}k',
                            style: const TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: AppColors.primary,
                            ),
                          ),
                          const TextSpan(
                            text: '/giờ',
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
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPlaceholderImage() {
    return Container(
      height: 180,
      width: double.infinity,
      color: AppColors.divider,
      child: const Icon(Icons.image_outlined, size: 48, color: AppColors.textHint),
    );
  }
}

class _FeatureChip extends StatelessWidget {
  final IconData icon;
  final String label;

  const _FeatureChip({required this.icon, required this.label});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: AppColors.divider,
        borderRadius: BorderRadius.circular(6),
      ),
      child: Row(
        children: [
          Icon(icon, size: 14, color: AppColors.textSecondary),
          const SizedBox(width: 4),
          Text(
            label,
            style: const TextStyle(
              fontSize: 11,
              color: AppColors.textSecondary,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }
}
