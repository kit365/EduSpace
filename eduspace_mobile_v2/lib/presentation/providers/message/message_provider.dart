import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import '../../../data/models/response/message/conversation_response.dart';
import '../../../data/models/response/message/chat_message_response.dart';
import '../../../data/repositories/message/message_repository.dart';
import '../../../data/services/chat_websocket_service.dart';
import '../../../core/network/api_client.dart';
import '../../../core/storage/local_storage_service.dart';

class MessageProvider extends ChangeNotifier {
  late final MessageRepository _repository;
  final LocalStorageService _storage = LocalStorageService();
  
  ChatWebSocketService? _wsService;
  
  List<ConversationResponse> _conversations = [];
  List<ConversationResponse> get conversations => _conversations;
  
  final Map<String, List<ChatMessageResponse>> _chatHistories = {};
  
  bool _isLoading = false;
  bool get isLoading => _isLoading;

  MessageProvider() {
    final apiClient = ApiClient();
    _repository = MessageRepository(apiClient);
    _initWebSocket();
  }

  void _initWebSocket() async {
    await _storage.init();
    final token = _storage.accessToken;
    final guestId = _storage.guestId;
    
    // Clear old service if exists
    _wsService?.disconnect();
    
    final baseUrl = dotenv.get('API_URL', fallback: 'http://localhost:${dotenv.get('GATEWAY_PORT', fallback: '8080')}');
    
    _wsService = ChatWebSocketService(baseUrl: baseUrl, token: token, guestId: guestId);
    _wsService?.connect();
    
    _wsService?.messages.listen((message) {
      _handleNewMessage(message);
    });

    _wsService?.activities.listen((activity) {
      _handleActivity(activity);
    });

    // If authenticated, automatically try to claim guest chats
    if (token != null && token.isNotEmpty) {
      claimGuestChats();
    }
  }

  Future<void> claimGuestChats() async {
    try {
      debugPrint('--- MessageProvider: Claiming Guest Chats ---');
      await _repository.claimGuestChats();
      // After claiming, we refresh conversations and optionally clear guestId 
      // but backend handles migration so conversations list is enough.
      fetchConversations();
    } catch (e) {
      debugPrint('Error claiming guest chats: $e');
    }
  }

  /// Force a reconnection with a new token (e.g. after login)
  void authenticate(String token) async {
    debugPrint('--- MessageProvider: Authenticating with new token ---');
    await _storage.saveAccessToken(token);
    _initWebSocket(); 
    fetchConversations();
    claimGuestChats();
  }

  void _handleActivity(Map<String, dynamic> activity) {
    final type = activity['type']?.toString();
    final conversationId = activity['conversationId']?.toString();

    debugPrint('--- MessageProvider: Handling activity event: $type ---');

    if (type == 'CONVERSATION_UNASSIGNED' && conversationId != null) {
      _conversations.removeWhere((c) => c.conversationId == conversationId);
      _chatHistories.remove(conversationId);
      notifyListeners();
    } else if (type == 'CONVERSATION_ACTIVITY' && conversationId != null) {
      // Re-fetch or update the specific conversation to show the new assignee
      fetchConversations();
      if (_chatHistories.containsKey(conversationId)) {
        fetchChatHistory(conversationId);
      }
    }
  }

  void _handleNewMessage(ChatMessageResponse message) {
    debugPrint('--- MessageProvider: Handling new message ---');
    debugPrint('Msg ID: ${message.messageId}, Content: ${message.content}');

    if (_chatHistories.containsKey(message.conversationId)) {
      final history = _chatHistories[message.conversationId]!;
      
      // Deduplicate: check if this message is already there
      bool isDuplicate = history.any((m) => m.messageId == message.messageId);
      
      // Also check if this is a server confirmation of a "temp" message
      // We look for a temp message with exactly the same content sent very recently
      if (!isDuplicate) {
        final tempIndex = history.indexWhere((m) => 
          m.messageId.startsWith('temp-') && 
          m.content == message.content &&
          message.sentAt.difference(m.sentAt).inSeconds.abs() < 10
        );
        
        if (tempIndex != -1) {
          debugPrint('Replacing temp message with real message');
          history[tempIndex] = message;
        } else {
          history.insert(0, message);
          debugPrint('Added new message to history');
        }
      } else {
        debugPrint('Message is already in history (duplicate)');
      }
    }
    
    final index = _conversations.indexWhere((c) => c.conversationId == message.conversationId);
    if (index != -1) {
      final old = _conversations[index];
      _conversations[index] = ConversationResponse(
        conversationId: old.conversationId,
        conversationName: old.conversationName,
        isActive: old.isActive,
        isAdminConversation: old.isAdminConversation,
        videoCallEnabled: old.videoCallEnabled,
        totalMessageCount: old.totalMessageCount + 1,
        callHistoryCount: old.callHistoryCount,
        lastActivity: message.sentAt,
        createdAt: old.createdAt,
        isBlocked: old.isBlocked,
        isBlockedByMe: old.isBlockedByMe,
        unreadCount: old.unreadCount + 1,
        lastMessage: message.content,
        otherUser: old.otherUser,
      );
      
      final updated = _conversations.removeAt(index);
      _conversations.insert(0, updated);
    } else {
      fetchConversations();
    }
    
    notifyListeners();
  }

  Future<void> fetchConversations() async {
    _isLoading = true;
    notifyListeners();
    try {
      _conversations = await _repository.getConversations();
    } catch (e) {
      debugPrint('Error fetching conversations: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  List<ChatMessageResponse> getMessages(String conversationId) {
    return _chatHistories[conversationId] ?? [];
  }

  Future<void> fetchChatHistory(String conversationId) async {
    try {
      final messages = await _repository.getChatHistory(conversationId);
      _chatHistories[conversationId] = List.from(messages);
      _wsService?.subscribeToConversation(conversationId);
      notifyListeners();
    } catch (e) {
      debugPrint('Error fetching chat history: $e');
    }
  }

  void sendMessage(String conversationId, String content) {
    if (_wsService == null) return;

    // Optimistic update
    final user = _storage.user;
    if (user != null) {
      final myId = user['id']?.toString() ?? user['userId']?.toString() ?? '';
      final myName = user['fullName']?.toString() ?? 'Me';
      final myAvatar = user['avatarUrl']?.toString();
      final myEmail = user['email']?.toString() ?? '';

      final optimisticMsg = ChatMessageResponse(
        messageId: 'temp-${DateTime.now().millisecondsSinceEpoch}',
        conversationId: conversationId,
        content: content,
        messageType: 'TEXT',
        sentAt: DateTime.now(),
        sender: MessageSender(
          userId: myId,
          fullName: myName,
          email: myEmail,
          avatarUrl: myAvatar,
        ),
      );

      if (_chatHistories.containsKey(conversationId)) {
        _chatHistories[conversationId]!.insert(0, optimisticMsg);
        notifyListeners();
        debugPrint('Optimistic message added: $content');
      }
    }

    _wsService?.sendMessage(conversationId, content);
  }

  Future<void> markAsRead(String conversationId) async {
    try {
      await _repository.markAsRead(conversationId);
      final index = _conversations.indexWhere((c) => c.conversationId == conversationId);
      if (index != -1) {
        final old = _conversations[index];
        _conversations[index] = ConversationResponse(
          conversationId: old.conversationId,
          conversationName: old.conversationName,
          isActive: old.isActive,
          isAdminConversation: old.isAdminConversation,
          videoCallEnabled: old.videoCallEnabled,
          totalMessageCount: old.totalMessageCount,
          callHistoryCount: old.callHistoryCount,
          lastActivity: old.lastActivity,
          createdAt: old.createdAt,
          isBlocked: old.isBlocked,
          isBlockedByMe: old.isBlockedByMe,
          unreadCount: 0,
          lastMessage: old.lastMessage,
          otherUser: old.otherUser,
        );
        notifyListeners();
      }
    } catch (e) {
      debugPrint('Error marking as read: $e');
    }
  }

  @override
  void dispose() {
    _wsService?.disconnect();
    super.dispose();
  }
}
