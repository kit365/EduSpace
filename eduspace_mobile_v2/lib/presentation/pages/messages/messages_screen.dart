import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/message/message_provider.dart';
import '../../providers/auth/auth_provider.dart';
import '../../../data/models/response/message/conversation_response.dart';
import '../../../data/models/response/message/chat_message_response.dart';
import '../../../core/constants/app_colors.dart';

// ─── Screen ───────────────────────────────────────────────────────────────────
class MessagesScreen extends StatefulWidget {
  const MessagesScreen({super.key});

  @override
  State<MessagesScreen> createState() => _MessagesScreenState();
}

class _MessagesScreenState extends State<MessagesScreen> {
  String _query = '';

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<MessageProvider>().fetchConversations();
    });
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<MessageProvider>();
    final conversations = provider.conversations;

    final filtered = conversations
        .where((c) =>
            c.conversationName.toLowerCase().contains(_query.toLowerCase()) ||
            (c.otherUser?.fullName.toLowerCase().contains(_query.toLowerCase()) ?? false))
        .toList();

    return Scaffold(
      backgroundColor: const Color(0xFFF8F6F6),
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ── Header ──────────────────────────────────────────
            _buildHeader(),

            // ── Search bar ──────────────────────────────────────
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
              child: _SearchBar(
                onChanged: (v) => setState(() => _query = v),
              ),
            ),

            // ── List ────────────────────────────────────────────
            Expanded(
              child: provider.isLoading
                  ? const Center(child: CircularProgressIndicator())
                  : filtered.isEmpty
                      ? _buildEmpty()
                      : ListView.separated(
                          padding: const EdgeInsets.only(bottom: 20),
                          itemCount: filtered.length,
                          separatorBuilder: (_, index) => const Divider(
                            height: 1,
                            indent: 76,
                            endIndent: 16,
                            color: Color(0xFFEEEEEE),
                          ),
                          itemBuilder: (ctx, i) => _ConversationTile(
                            conversation: filtered[i],
                            isActive: false, 
                            onTap: () {
                              final conv = filtered[i];
                              Navigator.push(
                                ctx,
                                MaterialPageRoute(
                                  builder: (_) => ChatScreen(
                                    conversation: conv,
                                  ),
                                ),
                              );
                            },
                          ),
                        ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 20, 16, 14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: const [
          Text(
            'Messages',
            style: TextStyle(
              fontSize: 28,
              fontWeight: FontWeight.w900,
              color: AppColors.navy900,
              letterSpacing: -0.5,
            ),
          ),
          SizedBox(height: 2),
          Text(
            'Manage your classroom rentals & inquiries',
            style: TextStyle(fontSize: 13, color: AppColors.textSecondary),
          ),
        ],
      ),
    );
  }

  Widget _buildEmpty() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.chat_bubble_outline_rounded,
              size: 56, color: AppColors.primary.withAlpha(76)),
          const SizedBox(height: 14),
          const Text(
            'No conversations found',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w700,
              color: AppColors.navy900,
            ),
          ),
          const SizedBox(height: 4),
          const Text(
            'Try a different search term.',
            style: TextStyle(fontSize: 13, color: AppColors.textSecondary),
          ),
        ],
      ),
    );
  }
}

// ─── Conversation tile ────────────────────────────────────────────────────────
class _ConversationTile extends StatelessWidget {
  final ConversationResponse conversation;
  final bool isActive;
  final VoidCallback onTap;

  const _ConversationTile({
    required this.conversation,
    required this.isActive,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final name = conversation.otherUser?.fullName ?? conversation.conversationName;
    final timeStr = _formatTime(conversation.lastActivity);

    return InkWell(
      onTap: onTap,
      child: Container(
        color: isActive ? AppColors.primary.withAlpha(10) : Colors.white,
        child: Row(
          children: [
            // Active indicator bar
            Container(
              width: 4,
              height: 70,
              color: isActive ? AppColors.primary : Colors.transparent,
            ),
            const SizedBox(width: 12),

            // Avatar + online dot
            Stack(
              children: [
                _Avatar(name: name),
                if (conversation.isActive ?? false)
                  Positioned(
                    bottom: 1,
                    right: 1,
                    child: Container(
                      width: 11,
                      height: 11,
                      decoration: BoxDecoration(
                        color: const Color(0xFF22C55E),
                        shape: BoxShape.circle,
                        border: Border.all(color: Colors.white, width: 2),
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(width: 12),

            // Text content
            Expanded(
              child: Padding(
                padding: const EdgeInsets.symmetric(vertical: 14),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          name,
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w800,
                            color: isActive
                                ? AppColors.primary
                                : AppColors.navy900,
                          ),
                        ),
                        Text(
                          timeStr,
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                            color: isActive
                                ? AppColors.primary
                                : AppColors.textHint,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 3),
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            conversation.lastMessage ?? 'No messages yet',
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(
                              fontSize: 12,
                              color: conversation.unreadCount > 0
                                  ? AppColors.navy900
                                  : AppColors.textSecondary,
                              fontWeight: conversation.unreadCount > 0
                                  ? FontWeight.w600
                                  : FontWeight.w400,
                            ),
                          ),
                        ),
                        if (conversation.unreadCount > 0) ...[
                          const SizedBox(width: 8),
                          Container(
                            width: 20,
                            height: 20,
                            decoration: const BoxDecoration(
                              color: AppColors.primary,
                              shape: BoxShape.circle,
                            ),
                            alignment: Alignment.center,
                            child: Text(
                              '${conversation.unreadCount}',
                              style: const TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.w800,
                                color: Colors.white,
                              ),
                            ),
                          ),
                        ],
                      ],
                    ),
                    const SizedBox(height: 3),
                    Text(
                      conversation.conversationName,
                      style: const TextStyle(
                        fontSize: 10,
                        color: AppColors.textHint,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(width: 16),
          ],
        ),
      ),
    );
  }

  String _formatTime(DateTime? date) {
    if (date == null) return '';
    final now = DateTime.now();
    final diff = now.difference(date);
    if (diff.inDays == 0) {
      final h = date.hour.toString().padLeft(2, '0');
      final m = date.minute.toString().padLeft(2, '0');
      return '$h:$m';
    } else if (diff.inDays < 7) {
      return '${diff.inDays}d ago';
    } else {
      return '${date.day}/${date.month}';
    }
  }
}

// ─── Search bar ───────────────────────────────────────────────────────────────
class _SearchBar extends StatelessWidget {
  final ValueChanged<String> onChanged;
  const _SearchBar({required this.onChanged});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.border),
        boxShadow: const [
          BoxShadow(color: Color(0x06000000), blurRadius: 6, offset: Offset(0, 2)),
        ],
      ),
      child: TextField(
        onChanged: onChanged,
        style: const TextStyle(fontSize: 14),
        decoration: const InputDecoration(
          hintText: 'Search hosts or classrooms...',
          hintStyle: TextStyle(color: AppColors.textHint, fontSize: 13),
          prefixIcon: Icon(Icons.search_rounded, color: AppColors.textHint, size: 20),
          border: InputBorder.none,
          contentPadding: EdgeInsets.symmetric(vertical: 14),
        ),
      ),
    );
  }
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
class _Avatar extends StatelessWidget {
  final String name;
  final double radius;
  const _Avatar({required this.name, this.radius = 24});

  @override
  Widget build(BuildContext context) {
    final initials = name.trim().isEmpty ? '?' : name.trim().split(' ').take(2).map((w) => w.isNotEmpty ? w[0] : '').join();
    return CircleAvatar(
      radius: radius,
      backgroundColor: AppColors.primary.withAlpha(30),
      child: Text(
        initials,
        style: TextStyle(
          fontSize: radius * 0.62,
          fontWeight: FontWeight.w800,
          color: AppColors.primary,
        ),
      ),
    );
  }
}

// ─── Chat Screen ──────────────────────────────────────────────────────────────
class ChatScreen extends StatefulWidget {
  final ConversationResponse conversation;
  const ChatScreen({super.key, required this.conversation});

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final TextEditingController _ctrl = TextEditingController();
  final ScrollController _scroll = ScrollController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final provider = context.read<MessageProvider>();
      provider.fetchChatHistory(widget.conversation.conversationId);
      provider.markAsRead(widget.conversation.conversationId);
    });
  }

  @override
  void dispose() {
    _ctrl.dispose();
    _scroll.dispose();
    super.dispose();
  }

  void _send() {
    final text = _ctrl.text.trim();
    if (text.isEmpty) return;
    
    context.read<MessageProvider>().sendMessage(
      widget.conversation.conversationId,
      text,
    );
    
    _ctrl.clear();
    Future.delayed(const Duration(milliseconds: 100), () {
      if (_scroll.hasClients) {
        _scroll.animateTo(
          _scroll.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final c = widget.conversation;
    final name = c.otherUser?.fullName ?? c.conversationName;
    final messages = context.watch<MessageProvider>().getMessages(c.conversationId);

    return Scaffold(
      backgroundColor: const Color(0xFFF8F6F6),
      appBar: _buildAppBar(context, c, name),
      body: Column(
        children: [
          // ── Message list ────────────────────────────────────
          Expanded(
            child: ListView.builder(
              controller: _scroll,
              reverse: true,
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
              itemCount: messages.length,
              itemBuilder: (_, i) => _buildBubble(messages[i]),
            ),
          ),

          // ── Input bar ───────────────────────────────────────
          _buildInputBar(),
        ],
      ),
    );
  }

  PreferredSizeWidget _buildAppBar(BuildContext context, ConversationResponse c, String name) {
    return AppBar(
      backgroundColor: Colors.white,
      elevation: 0,
      scrolledUnderElevation: 1,
      leading: GestureDetector(
        onTap: () => Navigator.pop(context),
        child: Container(
          margin: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: const Color(0xFFF8F6F6),
            shape: BoxShape.circle,
            border: Border.all(color: AppColors.border),
          ),
          child: const Icon(
            Icons.arrow_back_rounded,
            size: 18,
            color: AppColors.navy900,
          ),
        ),
      ),
      title: Row(
        children: [
          Stack(
            children: [
              _Avatar(name: name, radius: 20),
              if (c.isActive ?? false)
                Positioned(
                  bottom: 0,
                  right: 0,
                  child: Container(
                    width: 10,
                    height: 10,
                    decoration: BoxDecoration(
                      color: const Color(0xFF22C55E),
                      shape: BoxShape.circle,
                      border: Border.all(color: Colors.white, width: 1.5),
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  name,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w800,
                    color: AppColors.navy900,
                  ),
                ),
                Text(
                  (c.isActive ?? false) ? 'Online now' : c.conversationName,
                  style: TextStyle(
                    fontSize: 10,
                    color: (c.isActive ?? false)
                        ? const Color(0xFF22C55E)
                        : AppColors.textHint,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
      actions: [
        IconButton(
          icon: const Icon(Icons.call_rounded, color: AppColors.primary),
          onPressed: () {},
        ),
        IconButton(
          icon: const Icon(Icons.more_vert_rounded, color: AppColors.textSecondary),
          onPressed: () {},
        ),
      ],
    );
  }

  Widget _buildBubble(ChatMessageResponse msg) {
    final myId = context.read<AuthProvider>().profile?.id;
    final isMe = msg.sender?.userId == myId;

    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        mainAxisAlignment:
            isMe ? MainAxisAlignment.end : MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          if (!isMe) ...[
            _Avatar(name: msg.sender?.fullName ?? '?', radius: 15),
            const SizedBox(width: 8),
          ],
          Flexible(
            child: Column(
              crossAxisAlignment: isMe
                  ? CrossAxisAlignment.end
                  : CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 14, vertical: 10),
                  decoration: BoxDecoration(
                    color: isMe
                        ? AppColors.primary
                        : Colors.white,
                    borderRadius: BorderRadius.only(
                      topLeft: const Radius.circular(18),
                      topRight: const Radius.circular(18),
                      bottomLeft:
                          Radius.circular(isMe ? 18 : 4),
                      bottomRight:
                          Radius.circular(isMe ? 4 : 18),
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: isMe
                            ? AppColors.primary.withAlpha(51)
                            : const Color(0x0A000000),
                        blurRadius: 8,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Text(
                    msg.content,
                    style: TextStyle(
                      fontSize: 13,
                      color: isMe ? Colors.white : AppColors.navy900,
                      height: 1.45,
                    ),
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  _formatMsgTime(msg.sentAt),
                  style: const TextStyle(
                    fontSize: 10,
                    color: AppColors.textHint,
                  ),
                ),
              ],
            ),
          ),
          if (isMe) const SizedBox(width: 4),
        ],
      ),
    );
  }

  String _formatMsgTime(DateTime date) {
    final h = date.hour.toString().padLeft(2, '0');
    final m = date.minute.toString().padLeft(2, '0');
    return '$h:$m';
  }

  Widget _buildInputBar() {
    return Container(
      padding: EdgeInsets.only(
        left: 12,
        right: 12,
        top: 10,
        bottom: MediaQuery.of(context).padding.bottom + 10,
      ),
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(top: BorderSide(color: Color(0xFFEEEEEE))),
      ),
      child: Row(
        children: [
          // Attachment
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: const Color(0xFFF3F4F6),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(
              Icons.attach_file_rounded,
              size: 18,
              color: AppColors.textSecondary,
            ),
          ),
          const SizedBox(width: 8),

          // Text field
          Expanded(
            child: Container(
              decoration: BoxDecoration(
                color: const Color(0xFFF8F6F6),
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: AppColors.border),
              ),
              child: TextField(
                controller: _ctrl,
                onSubmitted: (_) => _send(),
                minLines: 1,
                maxLines: 4,
                style: const TextStyle(fontSize: 13),
                decoration: const InputDecoration(
                  hintText: 'Type a message...',
                  hintStyle:
                      TextStyle(color: AppColors.textHint, fontSize: 13),
                  border: InputBorder.none,
                  contentPadding:
                      EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                ),
              ),
            ),
          ),
          const SizedBox(width: 8),

          // Send button
          GestureDetector(
            onTap: _send,
            child: Container(
              width: 42,
              height: 42,
              decoration: BoxDecoration(
                color: AppColors.primary,
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: AppColors.primary.withAlpha(89),
                    blurRadius: 10,
                    offset: const Offset(0, 3),
                  ),
                ],
              ),
              child: const Icon(
                Icons.send_rounded,
                size: 18,
                color: Colors.white,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
