import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';
import '../../../routes/app_router.dart';
import '../../room/data/room_model.dart';
import '../../payment/presentation/payment_screen.dart';

// ─── Add-on model ────────────────────────────────────────────────────────────
class _AddOn {
  final String icon;
  final IconData iconData;
  final String title;
  final String subtitle;
  final double price;
  bool selected;

  _AddOn({
    required this.icon,
    required this.iconData,
    required this.title,
    required this.subtitle,
    required this.price,
    this.selected = false,
  });
}

// ─── Equipment model ────────────────────────────────────────────────────────
class _Equipment {
  final IconData iconData;
  final String title;
  final String subtitle;
  final double pricePerUnit;
  int quantity;
  final int maxQty;

  _Equipment({
    required this.iconData,
    required this.title,
    required this.subtitle,
    required this.pricePerUnit,
    this.quantity = 0,
    this.maxQty = 5,
  });

  double get totalPrice => pricePerUnit * quantity;
  bool get isSelected => quantity > 0;
}

// ─── Time slot model ─────────────────────────────────────────────────────────
class _TimeSlot {
  final String time;
  final String label;
  final bool isBooked;

  const _TimeSlot({
    required this.time,
    required this.label,
    this.isBooked = false,
  });
}

// ─────────────────────────────────────────────────────────────────────────────

class BookingFlowScreen extends StatefulWidget {
  final RoomModel room;

  const BookingFlowScreen({super.key, required this.room});

  @override
  State<BookingFlowScreen> createState() => _BookingFlowScreenState();
}

class _BookingFlowScreenState extends State<BookingFlowScreen> {
  // ── Calendar ──────────────────────────────────────────────────
  late DateTime _focusedMonth;
  DateTime? _selectedDate;

  // ── Time Slots ────────────────────────────────────────────────
  int? _selectedSlotIndex;
  final List<_TimeSlot> _slots = const [
    _TimeSlot(time: '08:00 AM', label: 'Morning'),
    _TimeSlot(time: '10:00 AM', label: 'Morning'),
    _TimeSlot(time: '12:00 PM', label: 'Afternoon'),
    _TimeSlot(time: '02:00 PM', label: 'Afternoon', isBooked: true),
    _TimeSlot(time: '04:00 PM', label: 'Evening'),
    _TimeSlot(time: '06:00 PM', label: 'Evening'),
  ];

  // ── Add-ons ───────────────────────────────────────────────────
  late List<_AddOn> _addOns;

  // ── Equipment rentals ─────────────────────────────────────────
  late List<_Equipment> _equipment;

  // ── Taxes & fees (fixed) ──────────────────────────────────────
  static const double _taxFee = 10.50;
  static const int _rentalHours = 2;

  @override
  void initState() {
    super.initState();
    final now = DateTime.now();
    _focusedMonth = DateTime(now.year, now.month);
    _selectedDate = DateTime(now.year, now.month, now.day);

    _addOns = [
      _AddOn(
        icon: 'coffee',
        iconData: Icons.coffee_rounded,
        title: 'Premium Tea Break',
        subtitle: 'Coffee, snacks & beverages',
        price: 15.00,
        selected: false,
      ),
      _AddOn(
        icon: 'cleaning',
        iconData: Icons.cleaning_services_rounded,
        title: 'Deep Cleaning Service',
        subtitle: 'Post-event professional cleaning',
        price: 25.00,
        selected: true,
      ),
      _AddOn(
        icon: 'videocam',
        iconData: Icons.videocam_rounded,
        title: 'Video Recording',
        subtitle: 'Full session HD recording',
        price: 40.00,
        selected: false,
      ),
    ];

    _equipment = [
      _Equipment(
        iconData: Icons.videocam_rounded,
        title: 'Projector',
        subtitle: 'HD 1080p, HDMI & wireless',
        pricePerUnit: 20.00,
      ),
      _Equipment(
        iconData: Icons.laptop_rounded,
        title: 'Laptop',
        subtitle: 'Core i5, 16GB RAM, Win 11',
        pricePerUnit: 15.00,
        maxQty: 10,
      ),
      _Equipment(
        iconData: Icons.speaker_rounded,
        title: 'Speaker System',
        subtitle: 'Bluetooth, 50W stereo',
        pricePerUnit: 12.00,
        maxQty: 3,
      ),
      _Equipment(
        iconData: Icons.draw_rounded,
        title: 'Interactive Whiteboard',
        subtitle: 'Digital, 65-inch touch screen',
        pricePerUnit: 18.00,
        maxQty: 2,
      ),
      _Equipment(
        iconData: Icons.camera_alt_rounded,
        title: 'Webcam HD',
        subtitle: '4K, wide-angle, auto-focus',
        pricePerUnit: 8.00,
        maxQty: 4,
      ),
      _Equipment(
        iconData: Icons.mic_rounded,
        title: 'Wireless Microphone',
        subtitle: 'Lavalier + handheld set',
        pricePerUnit: 10.00,
        maxQty: 6,
      ),
    ];
  }

  // ── Computed totals ───────────────────────────────────────────
  double get _rentalCost => widget.room.pricePerHour * _rentalHours;

  double get _addOnCost =>
      _addOns.where((a) => a.selected).fold(0, (sum, a) => sum + a.price);

  double get _equipmentCost =>
      _equipment.fold(0, (sum, e) => sum + e.totalPrice);

  double get _totalCost => _rentalCost + _addOnCost + _equipmentCost + _taxFee;

  // ── Calendar helpers ──────────────────────────────────────────
  String _monthLabel(DateTime d) {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    return '${months[d.month - 1]} ${d.year}';
  }

  void _prevMonth() => setState(
    () => _focusedMonth = DateTime(_focusedMonth.year, _focusedMonth.month - 1),
  );

  void _nextMonth() => setState(
    () => _focusedMonth = DateTime(_focusedMonth.year, _focusedMonth.month + 1),
  );

  bool _isToday(DateTime d) {
    final now = DateTime.now();
    return d.year == now.year && d.month == now.month && d.day == now.day;
  }

  bool _isSelected(DateTime d) =>
      _selectedDate != null &&
      d.year == _selectedDate!.year &&
      d.month == _selectedDate!.month &&
      d.day == _selectedDate!.day;

  bool _isPast(DateTime d) {
    final today = DateTime.now();
    return d.isBefore(DateTime(today.year, today.month, today.day));
  }

  // ─────────────────────────────────────────────────────────────
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8F6F6),
      appBar: _buildAppBar(),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Breadcrumb
            _buildBreadcrumb(),
            const SizedBox(height: 8),

            // Page title
            const Text(
              'Reserve Your Space',
              style: TextStyle(
                fontSize: 26,
                fontWeight: FontWeight.w900,
                color: AppColors.navy900,
                height: 1.2,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              'Complete the steps below to finalize your booking at ${widget.room.name}.',
              style: const TextStyle(
                fontSize: 13,
                color: AppColors.textSecondary,
                height: 1.5,
              ),
            ),
            const SizedBox(height: 20),

            // Step 1 – Calendar
            _StepCard(step: 1, title: 'Select Date', child: _buildCalendar()),
            const SizedBox(height: 16),

            // Step 2 – Time Slots
            _StepCard(
              step: 2,
              title: 'Choose Time Slot',
              child: _buildTimeSlots(),
            ),
            const SizedBox(height: 16),

            // Step 3 – Add-ons
            _StepCard(
              step: 3,
              title: 'Enhance Your Session',
              child: _buildAddOns(),
            ),
            const SizedBox(height: 16),

            // Step 4 – Equipment Rental
            _StepCard(
              step: 4,
              title: 'Rent Equipment',
              child: _buildEquipment(),
            ),
            const SizedBox(height: 16),

            // Step 5 – Summary
            _buildSummaryCard(),

            const SizedBox(height: 24),
          ],
        ),
      ),
      // Mobile sticky bottom bar
      bottomNavigationBar: _buildBottomBar(),
    );
  }

  // ── AppBar ────────────────────────────────────────────────────
  PreferredSizeWidget _buildAppBar() {
    return AppBar(
      backgroundColor: const Color(0xFFF8F6F6),
      elevation: 0,
      scrolledUnderElevation: 0,
      leading: GestureDetector(
        onTap: () => Navigator.pop(context),
        child: Container(
          margin: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: Colors.white,
            shape: BoxShape.circle,
            boxShadow: const [
              BoxShadow(color: Color(0x14000000), blurRadius: 6),
            ],
          ),
          child: const Icon(
            Icons.arrow_back_rounded,
            size: 20,
            color: AppColors.navy900,
          ),
        ),
      ),
      actions: [
        Container(
          margin: const EdgeInsets.only(right: 16, top: 10, bottom: 10),
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          decoration: BoxDecoration(
            color: AppColors.primary.withOpacity(0.08),
            borderRadius: BorderRadius.circular(20),
          ),
          child: Row(
            children: [
              const Icon(
                Icons.lock_outline_rounded,
                size: 13,
                color: AppColors.primary,
              ),
              const SizedBox(width: 4),
              Text(
                'Secure Checkout',
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                  color: AppColors.primary.withOpacity(0.9),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  // ── Breadcrumb ────────────────────────────────────────────────
  Widget _buildBreadcrumb() {
    return Row(
      children: [
        _BreadcrumbItem(label: 'Home', onTap: () {}),
        const _BreadcrumbChevron(),
        _BreadcrumbItem(
          label: 'Classroom Details',
          onTap: () => Navigator.pop(context),
        ),
        const _BreadcrumbChevron(),
        const Text(
          'Booking Flow',
          style: TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.w700,
            color: AppColors.primary,
          ),
        ),
      ],
    );
  }

  // ── Calendar ──────────────────────────────────────────────────
  Widget _buildCalendar() {
    final firstDay = DateTime(_focusedMonth.year, _focusedMonth.month, 1);
    final daysInMonth = DateTime(
      _focusedMonth.year,
      _focusedMonth.month + 1,
      0,
    ).day;
    final startWeekday = firstDay.weekday % 7; // 0=Sun

    return Column(
      children: [
        // Month navigation
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            _CalNavButton(icon: Icons.chevron_left_rounded, onTap: _prevMonth),
            Text(
              _monthLabel(_focusedMonth),
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w800,
                color: AppColors.navy900,
              ),
            ),
            _CalNavButton(icon: Icons.chevron_right_rounded, onTap: _nextMonth),
          ],
        ),
        const SizedBox(height: 12),

        // Day labels
        GridView.count(
          crossAxisCount: 7,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          mainAxisSpacing: 4,
          crossAxisSpacing: 4,
          children: [
            for (final d in ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'])
              Center(
                child: Text(
                  d,
                  style: const TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w800,
                    color: AppColors.textHint,
                    letterSpacing: 0.5,
                  ),
                ),
              ),

            // Empty leading cells
            for (int i = 0; i < startWeekday; i++) const SizedBox(),

            // Day cells
            for (int day = 1; day <= daysInMonth; day++)
              _buildDayCell(
                DateTime(_focusedMonth.year, _focusedMonth.month, day),
              ),
          ],
        ),
      ],
    );
  }

  Widget _buildDayCell(DateTime date) {
    final selected = _isSelected(date);
    final today = _isToday(date);
    final past = _isPast(date);

    return GestureDetector(
      onTap: past ? null : () => setState(() => _selectedDate = date),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 180),
        decoration: BoxDecoration(
          color: selected
              ? AppColors.primary
              : today
              ? AppColors.primary.withOpacity(0.08)
              : Colors.transparent,
          borderRadius: BorderRadius.circular(10),
          boxShadow: selected
              ? [
                  BoxShadow(
                    color: AppColors.primary.withOpacity(0.3),
                    blurRadius: 8,
                    offset: const Offset(0, 3),
                  ),
                ]
              : null,
        ),
        child: Center(
          child: Text(
            '${date.day}',
            style: TextStyle(
              fontSize: 13,
              fontWeight: selected || today ? FontWeight.w800 : FontWeight.w500,
              color: selected
                  ? Colors.white
                  : past
                  ? AppColors.textHint
                  : today
                  ? AppColors.primary
                  : AppColors.navy900,
            ),
          ),
        ),
      ),
    );
  }

  // ── Time Slots ────────────────────────────────────────────────
  Widget _buildTimeSlots() {
    return GridView.count(
      crossAxisCount: 3,
      shrinkWrap: true,
      mainAxisSpacing: 10,
      crossAxisSpacing: 10,
      childAspectRatio: 1.7,
      physics: const NeverScrollableScrollPhysics(),
      children: List.generate(_slots.length, (i) => _buildSlotCard(i)),
    );
  }

  Widget _buildSlotCard(int index) {
    final slot = _slots[index];
    final selected = _selectedSlotIndex == index;

    if (slot.isBooked) {
      return Container(
        decoration: BoxDecoration(
          color: const Color(0xFFF9FAFB),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.border),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              slot.time,
              style: const TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w700,
                color: AppColors.textHint,
                decoration: TextDecoration.lineThrough,
              ),
            ),
            const SizedBox(height: 2),
            const Text(
              'BOOKED',
              style: TextStyle(
                fontSize: 9,
                fontWeight: FontWeight.w800,
                color: Color(0xFFEF4444),
                letterSpacing: 0.5,
              ),
            ),
          ],
        ),
      );
    }

    return GestureDetector(
      onTap: () => setState(() => _selectedSlotIndex = index),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 180),
        decoration: BoxDecoration(
          color: selected ? AppColors.primary.withOpacity(0.08) : Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: selected ? AppColors.primary : AppColors.border,
            width: selected ? 2 : 1,
          ),
          boxShadow: selected
              ? [
                  BoxShadow(
                    color: AppColors.primary.withOpacity(0.15),
                    blurRadius: 8,
                  ),
                ]
              : [const BoxShadow(color: Color(0x08000000), blurRadius: 4)],
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              slot.time,
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w800,
                color: selected ? AppColors.primary : AppColors.navy900,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              selected ? 'SELECTED' : slot.label.toUpperCase(),
              style: TextStyle(
                fontSize: 9,
                fontWeight: FontWeight.w700,
                color: selected ? AppColors.primary : AppColors.textHint,
                letterSpacing: 0.5,
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ── Add-ons ───────────────────────────────────────────────────
  Widget _buildAddOns() {
    return Column(
      children: _addOns.map((addOn) => _buildAddOnItem(addOn)).toList(),
    );
  }

  Widget _buildAddOnItem(_AddOn addOn) {
    return GestureDetector(
      onTap: () => setState(() => addOn.selected = !addOn.selected),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 180),
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: addOn.selected
              ? AppColors.primary.withOpacity(0.04)
              : Colors.white,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: addOn.selected
                ? AppColors.primary.withOpacity(0.3)
                : AppColors.border,
            width: addOn.selected ? 1.5 : 1,
          ),
        ),
        child: Row(
          children: [
            // Icon
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                color: AppColors.primary.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(addOn.iconData, size: 22, color: AppColors.primary),
            ),
            const SizedBox(width: 12),
            // Labels
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    addOn.title,
                    style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                      color: AppColors.navy900,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    addOn.subtitle,
                    style: const TextStyle(
                      fontSize: 11,
                      color: AppColors.textSecondary,
                    ),
                  ),
                ],
              ),
            ),
            // Price + checkbox
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(
                  '+\$${addOn.price.toStringAsFixed(2)}',
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w800,
                    color: AppColors.primary,
                  ),
                ),
                const SizedBox(height: 4),
                AnimatedContainer(
                  duration: const Duration(milliseconds: 150),
                  width: 22,
                  height: 22,
                  decoration: BoxDecoration(
                    color: addOn.selected
                        ? AppColors.primary
                        : Colors.transparent,
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(
                      color: addOn.selected
                          ? AppColors.primary
                          : AppColors.textHint,
                      width: 2,
                    ),
                  ),
                  child: addOn.selected
                      ? const Icon(
                          Icons.check_rounded,
                          size: 14,
                          color: Colors.white,
                        )
                      : null,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  // ── Equipment Rental ──────────────────────────────────────────
  Widget _buildEquipment() {
    return Column(
      children: [
        // Hint row
        Container(
          margin: const EdgeInsets.only(bottom: 14),
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
          decoration: BoxDecoration(
            color: const Color(0xFFF0F9FF),
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: const Color(0xFFBAE6FD)),
          ),
          child: Row(
            children: const [
              Icon(
                Icons.info_outline_rounded,
                size: 15,
                color: Color(0xFF0284C7),
              ),
              SizedBox(width: 8),
              Expanded(
                child: Text(
                  'Tap + / − to choose quantity. Price is per session.',
                  style: TextStyle(
                    fontSize: 11,
                    color: Color(0xFF0369A1),
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
            ],
          ),
        ),
        ..._equipment.map((eq) => _buildEquipmentItem(eq)).toList(),
      ],
    );
  }

  Widget _buildEquipmentItem(_Equipment eq) {
    return AnimatedContainer(
      duration: const Duration(milliseconds: 180),
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: eq.isSelected
            ? AppColors.primary.withOpacity(0.04)
            : Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: eq.isSelected
              ? AppColors.primary.withOpacity(0.3)
              : AppColors.border,
          width: eq.isSelected ? 1.5 : 1,
        ),
      ),
      child: Row(
        children: [
          // Icon
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: eq.isSelected
                  ? AppColors.primary.withOpacity(0.12)
                  : AppColors.primary.withOpacity(0.06),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(
              eq.iconData,
              size: 22,
              color: eq.isSelected
                  ? AppColors.primary
                  : AppColors.textSecondary,
            ),
          ),
          const SizedBox(width: 12),
          // Labels
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  eq.title,
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                    color: eq.isSelected
                        ? AppColors.navy900
                        : AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  eq.subtitle,
                  style: const TextStyle(
                    fontSize: 11,
                    color: AppColors.textSecondary,
                  ),
                ),
                const SizedBox(height: 3),
                Text(
                  '\$${eq.pricePerUnit.toStringAsFixed(2)}/unit',
                  style: const TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    color: AppColors.primary,
                  ),
                ),
              ],
            ),
          ),
          // Quantity stepper
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              _StepperBtn(
                icon: Icons.remove_rounded,
                onTap: eq.quantity > 0
                    ? () => setState(() => eq.quantity--)
                    : null,
              ),
              AnimatedContainer(
                duration: const Duration(milliseconds: 150),
                width: 34,
                alignment: Alignment.center,
                child: Text(
                  '${eq.quantity}',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w900,
                    color: eq.isSelected
                        ? AppColors.primary
                        : AppColors.textHint,
                  ),
                ),
              ),
              _StepperBtn(
                icon: Icons.add_rounded,
                onTap: eq.quantity < eq.maxQty
                    ? () => setState(() => eq.quantity++)
                    : null,
                filled: true,
              ),
            ],
          ),
        ],
      ),
    );
  }

  // ── Summary Card ──────────────────────────────────────────────
  Widget _buildSummaryCard() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.primary.withOpacity(0.04),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.primary.withOpacity(0.2), width: 2),
      ),
      child: Stack(
        children: [
          // Background ghost icon
          Positioned(
            top: 0,
            right: 0,
            child: Icon(
              Icons.receipt_long_outlined,
              size: 80,
              color: AppColors.primary.withOpacity(0.08),
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Row(
                children: [
                  Container(
                    width: 32,
                    height: 32,
                    decoration: const BoxDecoration(
                      color: AppColors.primary,
                      shape: BoxShape.circle,
                    ),
                    child: const Center(
                      child: Text(
                        '5',
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w800,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  const Text(
                    'Booking Summary',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w800,
                      color: AppColors.navy900,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),

              // Line items
              _SummaryRow(
                label: 'Classroom Rental ($_rentalHours hours)',
                value: '\$${_rentalCost.toStringAsFixed(2)}',
              ),
              ..._addOns
                  .where((a) => a.selected)
                  .map(
                    (a) => _SummaryRow(
                      label: a.title,
                      value: '+\$${a.price.toStringAsFixed(2)}',
                    ),
                  ),
              ..._equipment
                  .where((e) => e.isSelected)
                  .map(
                    (e) => _SummaryRow(
                      label: '${e.title} ×${e.quantity}',
                      value: '+\$${e.totalPrice.toStringAsFixed(2)}',
                    ),
                  ),
              _SummaryRow(
                label: 'Taxes & Fees',
                value: '\$${_taxFee.toStringAsFixed(2)}',
              ),
              const SizedBox(height: 12),
              const Divider(color: Color(0x22EC1313), height: 1),
              const SizedBox(height: 12),

              // Total
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  const Text(
                    'Total Price',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w800,
                      color: AppColors.navy900,
                    ),
                  ),
                  Text(
                    '\$${_totalCost.toStringAsFixed(2)}',
                    style: const TextStyle(
                      fontSize: 30,
                      fontWeight: FontWeight.w900,
                      color: AppColors.primary,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),

              // CTA
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _onContinueToPayment,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 18),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
                    elevation: 6,
                    shadowColor: AppColors.primary.withOpacity(0.4),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: const [
                      Text(
                        'CONTINUE TO PAYMENT',
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w900,
                          letterSpacing: 1.2,
                        ),
                      ),
                      SizedBox(width: 8),
                      Icon(Icons.arrow_forward_rounded, size: 18),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 10),

              // Security note
              const Center(
                child: Text(
                  'SECURE 256-BIT SSL ENCRYPTED CHECKOUT',
                  style: TextStyle(
                    fontSize: 9,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textHint,
                    letterSpacing: 0.8,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // ── Bottom Bar ────────────────────────────────────────────────
  Widget _buildBottomBar() {
    return Container(
      padding: EdgeInsets.only(
        left: 20,
        right: 20,
        top: 14,
        bottom: MediaQuery.of(context).padding.bottom + 14,
      ),
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(top: BorderSide(color: Color(0xFFE5E7EB))),
        boxShadow: [
          BoxShadow(
            color: Color(0x10000000),
            blurRadius: 12,
            offset: Offset(0, -4),
          ),
        ],
      ),
      child: Row(
        children: [
          Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'TOTAL',
                style: TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.w800,
                  color: AppColors.textHint,
                  letterSpacing: 0.8,
                ),
              ),
              Text(
                '\$${_totalCost.toStringAsFixed(2)}',
                style: const TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.w900,
                  color: AppColors.primary,
                ),
              ),
            ],
          ),
          const SizedBox(width: 16),
          Expanded(
            child: ElevatedButton(
              onPressed: _onContinueToPayment,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                elevation: 4,
                shadowColor: AppColors.primary.withOpacity(0.4),
              ),
              child: const Text(
                'Book Now',
                style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800),
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ── Actions ───────────────────────────────────────────────────
  void _onContinueToPayment() {
    if (_selectedDate == null) {
      _showSnack('Please select a date first');
      return;
    }
    if (_selectedSlotIndex == null) {
      _showSnack('Please choose a time slot');
      return;
    }

    // Build payment args from current selections
    final slot = _slots[_selectedSlotIndex!];
    final dateStr =
        '${_selectedDate!.day.toString().padLeft(2, "0")}/${_selectedDate!.month.toString().padLeft(2, "0")}/${_selectedDate!.year}';

    Navigator.pushNamed(
      context,
      AppRouter.payment,
      arguments: PaymentArgs(
        roomName: widget.room.name,
        date: dateStr,
        timeRange: slot.time,
        totalAmount: _totalCost,
      ),
    );
  }

  void _showSnack(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(msg),
        backgroundColor: AppColors.primary,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        margin: const EdgeInsets.fromLTRB(16, 0, 16, 8),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Small helper widgets
// ─────────────────────────────────────────────────────────────────────────────

class _StepCard extends StatelessWidget {
  final int step;
  final String title;
  final Widget child;

  const _StepCard({
    required this.step,
    required this.title,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: const [
          BoxShadow(
            color: Color(0x08000000),
            blurRadius: 12,
            offset: Offset(0, 3),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 32,
                height: 32,
                decoration: const BoxDecoration(
                  color: AppColors.primary,
                  shape: BoxShape.circle,
                ),
                child: Center(
                  child: Text(
                    '$step',
                    style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w800,
                      color: Colors.white,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Text(
                title,
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w800,
                  color: AppColors.navy900,
                ),
              ),
            ],
          ),
          const SizedBox(height: 18),
          child,
        ],
      ),
    );
  }
}

class _SummaryRow extends StatelessWidget {
  final String label;
  final String value;

  const _SummaryRow({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: const TextStyle(
              fontSize: 13,
              color: AppColors.textSecondary,
            ),
          ),
          Text(
            value,
            style: const TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: AppColors.navy900,
            ),
          ),
        ],
      ),
    );
  }
}

class _CalNavButton extends StatelessWidget {
  final IconData icon;
  final VoidCallback onTap;

  const _CalNavButton({required this.icon, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 36,
        height: 36,
        decoration: BoxDecoration(
          color: AppColors.primary.withOpacity(0.06),
          shape: BoxShape.circle,
        ),
        child: Icon(icon, size: 20, color: AppColors.primary),
      ),
    );
  }
}

class _BreadcrumbItem extends StatelessWidget {
  final String label;
  final VoidCallback onTap;

  const _BreadcrumbItem({required this.label, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Text(
        label,
        style: const TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w500,
          color: AppColors.textSecondary,
        ),
      ),
    );
  }
}

class _BreadcrumbChevron extends StatelessWidget {
  const _BreadcrumbChevron();

  @override
  Widget build(BuildContext context) {
    return const Padding(
      padding: EdgeInsets.symmetric(horizontal: 4),
      child: Icon(
        Icons.chevron_right_rounded,
        size: 14,
        color: AppColors.textHint,
      ),
    );
  }
}

class _StepperBtn extends StatelessWidget {
  final IconData icon;
  final VoidCallback? onTap;
  final bool filled;

  const _StepperBtn({
    required this.icon,
    required this.onTap,
    this.filled = false,
  });

  @override
  Widget build(BuildContext context) {
    final enabled = onTap != null;
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        width: 30,
        height: 30,
        decoration: BoxDecoration(
          color: filled && enabled
              ? AppColors.primary
              : enabled
              ? AppColors.primary.withOpacity(0.08)
              : AppColors.divider,
          borderRadius: BorderRadius.circular(8),
        ),
        child: Icon(
          icon,
          size: 16,
          color: filled && enabled
              ? Colors.white
              : enabled
              ? AppColors.primary
              : AppColors.textHint,
        ),
      ),
    );
  }
}
