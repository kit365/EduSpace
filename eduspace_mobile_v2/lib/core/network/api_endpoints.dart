class ApiEndpoints {
  static const String api = '/api';
  static const String version = '/v1';
  static const String base = '$api$version';

  // Auth
  static const String authBase = '$base/auth';
  static const String login = '$authBase/login';
  static const String register = '$authBase/register';
  static const String logout = '$authBase/logout';
  static const String refresh = '$authBase/refresh';
  static const String verifyEmail = '$authBase/verify-email';

  // Accounts
  static const String accountsBase = '$base/accounts';
  static const String me = '$accountsBase/me';

  // Conversations
  static const String conversationsBase = '$base/conversations';
  static String conversationDetail(String id) => '$conversationsBase/$id';
  static String conversationMessages(String id) => '$conversationsBase/$id/messages';
  static String markAsRead(String id) => '$conversationsBase/$id/read';
  static String blockConversation(String id) => '$conversationsBase/$id/block';
  static String unblockConversation(String id) => '$conversationsBase/$id/unblock';
  static const String unassignedConversations = '$conversationsBase/unassigned';
  static String claimConversation(String id) => '$conversationsBase/$id/claim';
  static const String claimGuestChats = '$conversationsBase/claim-guest';

  // WebSocket
  static const String wsUrl = '/ws';

  // Rooms
  static const String roomsBase = '$base/public/rooms';
  static String roomDetail(String id) => '$roomsBase/$id';

  // Room Categories
  static const String categoriesBase = '$base/public/room-categories';
  static const String featuredCategories = '$categoriesBase/featured';
}
