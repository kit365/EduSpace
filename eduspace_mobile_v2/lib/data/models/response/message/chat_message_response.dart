import 'package:flutter/foundation.dart';

class ChatMessageResponse {
  final String messageId;
  final String conversationId;
  final String content;
  final String messageType;
  final DateTime sentAt;
  final bool? isRead;
  final DateTime? readAt;
  final bool? isDeleted;
  final DateTime? editedAt;
  final String? mediaUrl;
  final String? mediaType;
  final Map<String, dynamic>? reactions;
  final String? replyToMessageId;
  final MessageSender? sender;

  ChatMessageResponse({
    required this.messageId,
    required this.conversationId,
    required this.content,
    required this.messageType,
    required this.sentAt,
    this.isRead,
    this.readAt,
    this.isDeleted,
    this.editedAt,
    this.mediaUrl,
    this.mediaType,
    this.reactions,
    this.replyToMessageId,
    this.sender,
  });

  factory ChatMessageResponse.fromJson(Map<String, dynamic> json) {
    try {
      debugPrint('--- ChatMessageResponse: Parsing JSON ---');
      debugPrint(json.toString());

      // Handle both REST (nested sender) and WebSocket (flat senderId/senderUsername)
      MessageSender? sender;
      if (json['sender'] != null) {
        sender = MessageSender.fromJson(json['sender'] as Map<String, dynamic>);
      } else if (json['senderId'] != null) {
        sender = MessageSender(
          userId: json['senderId']?.toString() ?? '',
          fullName: json['senderUsername']?.toString() ?? '',
          email: json['senderEmail']?.toString() ?? '',
          avatarUrl: (json['avatarUrl'] ?? json['mediaUrl'])?.toString(),
        );
      }

      final msgId = (json['messageId'] ?? json['id'] ?? '').toString();
      if (msgId.isEmpty) {
        // debugPrint('--- WARNING: Received ChatMessage with EMPTY messageId! JSON: $json');
      }

      return ChatMessageResponse(
        messageId: msgId,
        conversationId: (json['conversationId'] ?? '').toString(),
        content: (json['content'] ?? '').toString(),
        messageType: (json['messageType'] ?? 'TEXT').toString(),
        sentAt: json['sentAt'] != null ? _parseDateTime(json['sentAt']) : DateTime.now(),
        isRead: json['isRead'] == true,
        readAt: json['readAt'] != null ? _parseDateTime(json['readAt']) : null,
        isDeleted: json['isDeleted'] == true,
        editedAt: json['editedAt'] != null ? _parseDateTime(json['editedAt']) : null,
        mediaUrl: json['mediaUrl']?.toString(),
        mediaType: json['mediaType']?.toString(),
        reactions: json['reactions'] is Map<String, dynamic> ? json['reactions'] as Map<String, dynamic> : null,
        replyToMessageId: json['replyToMessageId']?.toString(),
        sender: sender,
      );
    } catch (e, stack) {
      // debugPrint('--- ERROR Parsing ChatMessageResponse: $e');
      // debugPrint(stack.toString());
      rethrow;
    }
  }

  static DateTime _parseDateTime(dynamic value) {
    if (value == null) return DateTime.now();
    try {
      if (value is String) {
        // Handle "2026-03-22 15:30:22.000" or ISO format
        return DateTime.parse(value);
      } else if (value is int) {
        return DateTime.fromMillisecondsSinceEpoch(value);
      }
    } catch (e) {
      // debugPrint('Error parsing DateTime ($value): $e');
    }
    return DateTime.now();
  }

  Map<String, dynamic> toJson() {
    return {
      'messageId': messageId,
      'conversationId': conversationId,
      'content': content,
      'messageType': messageType,
      'sentAt': sentAt.toIso8601String(),
      'isRead': isRead,
      'readAt': readAt?.toIso8601String(),
      'isDeleted': isDeleted,
      'editedAt': editedAt?.toIso8601String(),
      'mediaUrl': mediaUrl,
      'mediaType': mediaType,
      'reactions': reactions,
      'replyToMessageId': replyToMessageId,
      'sender': sender?.toJson(),
    };
  }
}

class MessageSender {
  final String userId;
  final String fullName;
  final String email;
  final String? avatarUrl;

  MessageSender({
    required this.userId,
    required this.fullName,
    required this.email,
    this.avatarUrl,
  });

  factory MessageSender.fromJson(Map<String, dynamic> json) {
    return MessageSender(
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
