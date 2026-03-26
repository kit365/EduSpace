import '../../../core/network/api_client.dart';
import '../../../core/network/api_endpoints.dart';
import '../../models/response/message/conversation_response.dart';
import '../../models/response/message/chat_message_response.dart';

class MessageRepository {
  final ApiClient _apiClient;

  MessageRepository(this._apiClient);

  Future<List<ConversationResponse>> getConversations() async {
    final response = await _apiClient.get<List<ConversationResponse>>(
      ApiEndpoints.conversationsBase,
      fromJson: (json) {
        if (json is List) {
          return json.map((e) => ConversationResponse.fromJson(e)).toList();
        }
        return [];
      },
    );
    return response.data ?? [];
  }

  Future<List<ChatMessageResponse>> getChatHistory(String conversationId, {int page = 0, int size = 50}) async {
    final response = await _apiClient.get<List<ChatMessageResponse>>(
      ApiEndpoints.conversationMessages(conversationId),
      queryParameters: {'page': page, 'size': size},
      fromJson: (json) {
        if (json is List) {
          return json.map((e) => ChatMessageResponse.fromJson(e)).toList();
        }
        return [];
      },
    );
    return response.data ?? [];
  }

  Future<void> markAsRead(String conversationId) async {
    await _apiClient.post(ApiEndpoints.markAsRead(conversationId));
  }

  Future<void> claimGuestChats() async {
    await _apiClient.post(ApiEndpoints.claimGuestChats);
  }
}
