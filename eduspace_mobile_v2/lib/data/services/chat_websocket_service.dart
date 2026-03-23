import 'dart:async';
import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:stomp_dart_client/stomp_dart_client.dart';
import '../../core/network/api_endpoints.dart';
import '../models/response/message/chat_message_response.dart';

class ChatWebSocketService {
  final String baseUrl;
  final String? token;
  final String? guestId;
  StompClient? _client;
  
  final _messageController = StreamController<ChatMessageResponse>.broadcast();
  Stream<ChatMessageResponse> get messages => _messageController.stream;
  
  final _activityController = StreamController<Map<String, dynamic>>.broadcast();
  Stream<Map<String, dynamic>> get activities => _activityController.stream;

  final Map<String, String> _subscribedConversations = {};
  bool get connected => _client?.connected ?? false;
  final List<String> _pendingSubscriptions = [];

  ChatWebSocketService({required this.baseUrl, this.token, this.guestId});

  void connect() {
    String wsUrl = baseUrl.replaceFirst('https', 'wss').replaceFirst('http', 'ws');
    if (wsUrl.endsWith('/')) {
      wsUrl = wsUrl.substring(0, wsUrl.length - 1);
    }
    // Append /websocket for raw WebSocket connection to SockJS endpoint
    final fullWsUrl = '$wsUrl${ApiEndpoints.wsUrl}/websocket';
    
    debugPrint('Connecting to WebSocket: $fullWsUrl');
    
    final stompHeaders = <String, String>{};
    if (token != null) {
      stompHeaders['Authorization'] = 'Bearer $token';
    }
    if (guestId != null) {
      stompHeaders['X-Guest-ID'] = guestId!;
    }

    _client = StompClient(
      config: StompConfig(
        url: fullWsUrl,
        onConnect: _onConnect,
        onStompError: (frame) => debugPrint('Stomp Error: ${frame.body}'),
        onWebSocketError: (error) => debugPrint('WebSocket Error: $error'),
        stompConnectHeaders: stompHeaders.isNotEmpty ? stompHeaders : null,
        // Handshake should be public to avoid 401 on upgrade
        webSocketConnectHeaders: null,
      ),
    );
    _client?.activate();
  }

  void _onConnect(StompFrame frame) {
    debugPrint('Connected to WebSocket');
    
    // Subscribe to user-specific topics (for assignment/unassignment)
    subscribeToUserTopics();

    // Process pending subscriptions (ones that were requested while offline)
    final pending = List<String>.from(_pendingSubscriptions);
    _pendingSubscriptions.clear();
    for (var id in pending) {
      subscribeToConversation(id);
    }

    // Resubscribe to already active conversations (e.g. after reconnection)
    final actives = List<String>.from(_subscribedConversations.keys);
    _subscribedConversations.clear(); // Clear so subscribeToConversation doesn't skip
    for (var id in actives) {
      subscribeToConversation(id);
    }
  }

  void subscribeToUserTopics() {
    if (token == null) return;
    
    try {
      final parts = token!.split('.');
      if (parts.length != 3) return;
      
      final payload = utf8.decode(base64.decode(base64.normalize(parts[1])));
      final map = json.decode(payload);
      final userId = map['sub']?.toString();
      
      if (userId != null) {
        debugPrint('Subscribing to user-specific topics for $userId');
        
        // Topic for conversation updates (new assignment, activity, unassignment)
        _client?.subscribe(
          destination: '/topic/user/$userId/conversations',
          callback: (frame) {
            if (frame.body != null) {
              debugPrint('Received Personal Activity update');
              try {
                final data = json.decode(frame.body!);
                _activityController.add(data);
              } catch (e) {
                debugPrint('Error parsing activity event: $e');
              }
            }
          },
        );
      }
    } catch (e) {
      debugPrint('Error subscribing to user topics: $e');
    }
  }

  void subscribeToConversation(String conversationId) {
    if (_subscribedConversations.containsKey(conversationId)) return;
    
    if (_client == null || !_client!.connected) {
      if (!_pendingSubscriptions.contains(conversationId)) {
        _pendingSubscriptions.add(conversationId);
      }
      debugPrint('Queueing subscription for $conversationId (not connected)');
      return;
    }
    
    debugPrint('Subscribing to /topic/conversation/$conversationId');
    _client?.subscribe(
      destination: '/topic/conversation/$conversationId',
      callback: (frame) {
        if (frame.body != null) {
          debugPrint('Received WebSocket message for $conversationId');
          try {
            final data = json.decode(frame.body!);
            final message = ChatMessageResponse.fromJson(data);
            _messageController.add(message);
          } catch (e) {
            debugPrint('Error parsing WebSocket message: $e');
          }
        }
      },
    );
    _subscribedConversations[conversationId] = conversationId;
  }

  void sendMessage(String conversationId, String content, {String type = 'TEXT'}) {
    if (_client == null || !_client!.connected) {
      debugPrint('Cannot send message: WebSocket not connected');
      return;
    }
    
    debugPrint('Sending message to /app/chat/$conversationId/send');
    _client?.send(
      destination: '/app/chat/$conversationId/send',
      body: json.encode({
        'content': content,
        'messageType': type,
      }),
    );
  }

  void disconnect() {
    _client?.deactivate();
    _messageController.close();
  }
}
