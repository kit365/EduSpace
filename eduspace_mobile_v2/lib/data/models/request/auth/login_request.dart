class LoginRequest {
  final String email;
  final String password;
  final String? otp;

  LoginRequest({
    required this.email,
    required this.password,
    this.otp,
  });

  Map<String, dynamic> toJson() {
    return {
      'email': email,
      'password': password,
      if (otp != null) 'otp': otp,
    };
  }
}
