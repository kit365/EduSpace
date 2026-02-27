class Validators {
  Validators._();

  static String? email(String? value) {
    if (value == null || value.isEmpty) return 'Please enter your email';
    final regex = RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$');
    if (!regex.hasMatch(value)) return 'Invalid email address';
    return null;
  }

  static String? password(String? value) {
    if (value == null || value.isEmpty) return 'Please enter your password';
    if (value.length < 6) return 'Password must be at least 6 characters';
    return null;
  }

  static String? required(String? value, [String? label]) {
    if (value == null || value.trim().isEmpty) {
      return 'Please enter your ${label ?? 'information'}';
    }
    return null;
  }

  static String? phone(String? value) {
    if (value == null || value.isEmpty) return 'Please enter your phone number';
    final regex = RegExp(r'^(0|\+84)[3-9][0-9]{8}$');
    if (!regex.hasMatch(value)) return 'Invalid phone number';
    return null;
  }
}
