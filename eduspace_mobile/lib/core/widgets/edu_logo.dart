import 'package:flutter/material.dart';
import '../constants/app_colors.dart';

/// Logo EduSpace — mũ tốt nghiệp trong vòng tròn đỏ + text
///
/// [vertical] — dùng trên màn hình Login/Register (icon lớn + text dưới)
/// [inline]   — dùng trong AppBar/header (icon nhỏ + text bên cạnh)
///
class EduSpaceLogo extends StatelessWidget {
  final double iconSize;
  final double titleSize;
  final bool inline; // true = ngang, false = dọc (default)

  const EduSpaceLogo({
    super.key,
    this.iconSize = 56,
    this.titleSize = 22,
    this.inline = false,
  });

  Widget _icon() {
    return Container(
      width: iconSize,
      height: iconSize,
      decoration: BoxDecoration(
        color: AppColors.primary,
        shape: BoxShape.circle,
        boxShadow: [
          BoxShadow(
            color: AppColors.primary.withOpacity(0.35),
            blurRadius: 16,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Icon(
        Icons.school_rounded,
        size: iconSize * 0.52,
        color: Colors.white,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (inline) {
      return Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          _icon(),
          const SizedBox(width: 10),
          Text(
            'EduSpace',
            style: TextStyle(
              fontSize: titleSize,
              fontWeight: FontWeight.w900,
              color: AppColors.navy900,
              letterSpacing: -0.3,
            ),
          ),
        ],
      );
    }

    // Vertical layout — dùng trên Auth screens
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        _icon(),
        const SizedBox(height: 14),
        Text(
          'EduSpace',
          style: TextStyle(
            fontSize: titleSize,
            fontWeight: FontWeight.w900,
            letterSpacing: -0.3,
            color: AppColors.navy900,
          ),
        ),
        const SizedBox(height: 4),
        const Text(
          'Classroom & Training Space Rental',
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w500,
            color: AppColors.textSecondary,
          ),
        ),
      ],
    );
  }
}
