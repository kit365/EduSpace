class ProfileModel {
  final String id;
  final String keycloakId;
  final String email;
  final String fullName;
  final String phoneNumber;
  final String avatarUrl;
  final String studentId;
  final bool isActive;
  final bool isEmailVerified;
  final List<String> roles;
  final String? createdAt;
  final String location;
  final String shortBio;

  ProfileModel({
    required this.id,
    required this.keycloakId,
    required this.email,
    required this.fullName,
    required this.phoneNumber,
    required this.avatarUrl,
    required this.studentId,
    required this.isActive,
    required this.isEmailVerified,
    required this.roles,
    this.createdAt,
    required this.location,
    required this.shortBio,
  });

  factory ProfileModel.fromJson(Map<String, dynamic> json) {
    return ProfileModel(
      id: json['id']?.toString() ?? '',
      keycloakId: json['keycloakId']?.toString() ?? '',
      email: json['email'] ?? '',
      fullName: json['fullName'] ?? '',
      phoneNumber: json['phoneNumber'] ?? '',
      avatarUrl: json['avatarUrl'] ?? '',
      studentId: json['studentId'] ?? '',
      isActive: json['isActive'] ?? false,
      isEmailVerified: json['isEmailVerified'] ?? false,
      roles: List<String>.from(json['roles'] ?? []),
      createdAt: json['createdAt']?.toString(), // Handle LocalDateTime string
      location: json['location'] ?? '',
      shortBio: json['shortBio'] ?? '',
    );
  }
}
