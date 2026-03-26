class UserEntity {
  final String? id;
  final String? email;
  final String? name;
  final String accessToken;
  final String refreshToken;

  UserEntity({
    this.id,
    this.email,
    this.name,
    required this.accessToken,
    required this.refreshToken,
  });
}
