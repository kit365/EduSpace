class ConversationResponse {
  final String conversationId;
  final String conversationName;
  final bool? isActive;
  final bool? isAdminConversation;
  final bool? videoCallEnabled;
  final int totalMessageCount;
  final int callHistoryCount;
  final DateTime? lastActivity;
  final DateTime? createdAt;
  final bool? isBlocked;
  final bool? isBlockedByMe;
  final int unreadCount;
  final String? lastMessage;
  final OtherUser? otherUser;

  ConversationResponse({
    required this.conversationId,
    required this.conversationName,
    this.isActive,
    this.isAdminConversation,
    this.videoCallEnabled,
    this.totalMessageCount = 0,
    this.callHistoryCount = 0,
    this.lastActivity,
    this.createdAt,
    this.isBlocked,
    this.isBlockedByMe,
    this.unreadCount = 0,
    this.lastMessage,
    this.otherUser,
  });

  factory ConversationResponse.fromJson(Map<String, dynamic> json) {
    return ConversationResponse(
      conversationId: json['conversationId'] ?? '',
      conversationName: json['conversationName'] ?? '',
      isActive: json['isActive'],
      isAdminConversation: json['isAdminConversation'],
      videoCallEnabled: json['videoCallEnabled'],
      totalMessageCount: json['totalMessageCount'] ?? 0,
      callHistoryCount: json['callHistoryCount'] ?? 0,
      lastActivity: json['lastActivity'] != null ? DateTime.parse(json['lastActivity']) : null,
      createdAt: json['createdAt'] != null ? DateTime.parse(json['createdAt']) : null,
      isBlocked: json['isBlocked'],
      isBlockedByMe: json['isBlockedByMe'],
      unreadCount: json['unreadCount'] ?? 0,
      lastMessage: json['lastMessage'],
      otherUser: json['otherUser'] != null ? OtherUser.fromJson(json['otherUser']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'conversationId': conversationId,
      'conversationName': conversationName,
      'isActive': isActive,
      'isAdminConversation': isAdminConversation,
      'videoCallEnabled': videoCallEnabled,
      'totalMessageCount': totalMessageCount,
      'callHistoryCount': callHistoryCount,
      'lastActivity': lastActivity?.toIso8601String(),
      'createdAt': createdAt?.toIso8601String(),
      'isBlocked': isBlocked,
      'isBlockedByMe': isBlockedByMe,
      'unreadCount': unreadCount,
      'lastMessage': lastMessage,
      'otherUser': otherUser?.toJson(),
    };
  }
}

class OtherUser {
  final String userId;
  final String fullName;
  final String email;
  final String? avatarUrl;

  OtherUser({
    required this.userId,
    required this.fullName,
    required this.email,
    this.avatarUrl,
  });

  factory OtherUser.fromJson(Map<String, dynamic> json) {
    return OtherUser(
      userId: json['userId'] ?? '',
      fullName: json['fullName'] ?? '',
      email: json['email'] ?? '',
      avatarUrl: json['avatarUrl'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'userId': userId,
      'fullName': fullName,
      'email': email,
      'avatarUrl': avatarUrl,
    };
  }
}
