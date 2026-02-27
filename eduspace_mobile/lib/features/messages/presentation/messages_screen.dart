import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';

// ─── Mock data ────────────────────────────────────────────────────────────────
class _Conversation {
  final String id;
  final String hostName;
  final String roomName;
  final String lastMessage;
  final String time;
  final int unread;
  final bool online;

  const _Conversation({
    required this.id,
    required this.hostName,
    required this.roomName,
    required this.lastMessage,
    required this.time,
    this.unread = 0,
    this.online = false,
  });
}

const _mockConversations = [
  _Conversation(
    id: '1',
    hostName: 'Sarah Jenkins',
    roomName: 'Quantum Science Lab • Downtown',
    lastMessage: 'The lab is available next Tuesday for your workshop.',
    time: '10:45 AM',
    unread: 2,
    online: true,
  ),
  _Conversation(
    id: '2',
    hostName: 'Marcus Chen',
    roomName: 'Harmony Music Studios',
    lastMessage: "Great! I've confirmed the booking for the grand piano suite.",
    time: 'Yesterday',
    online: false,
  ),
  _Conversation(
    id: '3',
    hostName: 'Dr. Elena Rodriguez',
    roomName: 'Modern Learning Hub',
    lastMessage: 'Could you provide more details about the technical setup required?',
    time: 'Aug 12',
    online: true,
  ),
  _Conversation(
    id: '4',
    hostName: 'James Wilson',
    roomName: 'St. Jude Community Gym',
    lastMessage: 'Sorry, the basketball court is booked on Saturday evenings.',
    time: 'Aug 10',
    online: false,
  ),
  _Conversation(
    id: '5',
    hostName: 'Lisa Park',
    roomName: 'Riverside Art Loft',
    lastMessage: "You're welcome! Let me know if you need anything else for the class.",
    time: 'Aug 08',
    online: true,
  ),
  _Conversation(
    id: '6',
    hostName: 'David G.',
    roomName: 'Central Tech Library',
    lastMessage: 'Payment received. Here is the access code for the quiet room.',
    time: 'Aug 05',
    online: false,
  ),
];

// ─── Screen ───────────────────────────────────────────────────────────────────
class MessagesScreen extends StatefulWidget {
  const MessagesScreen({super.key});

  @override
  State<MessagesScreen> createState() => _MessagesScreenState();
}

class _MessagesScreenState extends State<MessagesScreen> {
  String _query = '';

  List<_Conversation> get _filtered => _mockConversations
      .where((c) =>
          c.hostName.toLowerCase().contains(_query.toLowerCase()) ||
          c.roomName.toLowerCase().contains(_query.toLowerCase()))
      .toList();

  @override
  Widget build(BuildContext context) {
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
              child: _filtered.isEmpty
                  ? _buildEmpty()
                  : ListView.separated(
                      padding: const EdgeInsets.only(bottom: 20),
                      itemCount: _filtered.length,
                      separatorBuilder: (_, __) => const Divider(
                        height: 1,
                        indent: 76,
                        endIndent: 16,
                        color: Color(0xFFEEEEEE),
                      ),
                      itemBuilder: (ctx, i) => _ConversationTile(
                        conversation: _filtered[i],
                        isActive: i == 0 && _query.isEmpty,
                        onTap: () => Navigator.push(
                          ctx,
                          MaterialPageRoute(
                            builder: (_) => ChatScreen(
                              conversation: _filtered[i],
                            ),
                          ),
                        ),
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
              size: 56, color: AppColors.primary.withOpacity(0.3)),
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
  final _Conversation conversation;
  final bool isActive;
  final VoidCallback onTap;

  const _ConversationTile({
    required this.conversation,
    required this.isActive,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Container(
        color: isActive ? AppColors.primary.withOpacity(0.04) : Colors.white,
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
                _Avatar(name: conversation.hostName),
                if (conversation.online)
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
                          conversation.hostName,
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w800,
                            color: isActive
                                ? AppColors.primary
                                : AppColors.navy900,
                          ),
                        ),
                        Text(
                          conversation.time,
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
                            conversation.lastMessage,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(
                              fontSize: 12,
                              color: conversation.unread > 0
                                  ? AppColors.navy900
                                  : AppColors.textSecondary,
                              fontWeight: conversation.unread > 0
                                  ? FontWeight.w600
                                  : FontWeight.w400,
                            ),
                          ),
                        ),
                        if (conversation.unread > 0) ...[
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
                              '${conversation.unread}',
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
                      conversation.roomName,
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
    final initials = name.trim().split(' ').take(2).map((w) => w[0]).join();
    return CircleAvatar(
      radius: radius,
      backgroundColor: AppColors.primary.withOpacity(0.12),
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
  final _Conversation conversation;
  const ChatScreen({super.key, required this.conversation});

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final TextEditingController _ctrl = TextEditingController();
  final ScrollController _scroll = ScrollController();

  final List<_ChatMsg> _messages = [
    _ChatMsg(
      text: 'Hi! I saw your listing for the Quantum Science Lab. Is it available next Tuesday?',
      fromMe: true,
      time: '10:30 AM',
    ),
    _ChatMsg(
      text: 'Hello! Yes, the lab is available next Tuesday for your workshop. What time were you thinking?',
      fromMe: false,
      time: '10:38 AM',
    ),
    _ChatMsg(
      text: 'We need it from 9 AM to 1 PM. Would that work?',
      fromMe: true,
      time: '10:40 AM',
    ),
    _ChatMsg(
      text: 'The lab is available next Tuesday for your workshop. I can confirm the 9 AM – 1 PM slot. Shall I send you the booking details?',
      fromMe: false,
      time: '10:45 AM',
    ),
  ];

  @override
  void dispose() {
    _ctrl.dispose();
    _scroll.dispose();
    super.dispose();
  }

  void _send() {
    final text = _ctrl.text.trim();
    if (text.isEmpty) return;
    setState(() {
      _messages.add(_ChatMsg(text: text, fromMe: true, time: _nowTime()));
    });
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

  String _nowTime() {
    final now = DateTime.now();
    final h = now.hour.toString().padLeft(2, '0');
    final m = now.minute.toString().padLeft(2, '0');
    return '$h:$m';
  }

  @override
  Widget build(BuildContext context) {
    final c = widget.conversation;

    return Scaffold(
      backgroundColor: const Color(0xFFF8F6F6),
      appBar: _buildAppBar(context, c),
      body: Column(
        children: [
          // ── Message list ────────────────────────────────────
          Expanded(
            child: ListView.builder(
              controller: _scroll,
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
              itemCount: _messages.length,
              itemBuilder: (_, i) => _buildBubble(_messages[i]),
            ),
          ),

          // ── Input bar ───────────────────────────────────────
          _buildInputBar(),
        ],
      ),
    );
  }

  PreferredSizeWidget _buildAppBar(BuildContext context, _Conversation c) {
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
              _Avatar(name: c.hostName, radius: 20),
              if (c.online)
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
                  c.hostName,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w800,
                    color: AppColors.navy900,
                  ),
                ),
                Text(
                  c.online ? 'Online now' : c.roomName,
                  style: TextStyle(
                    fontSize: 10,
                    color: c.online
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

  Widget _buildBubble(_ChatMsg msg) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        mainAxisAlignment:
            msg.fromMe ? MainAxisAlignment.end : MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          if (!msg.fromMe) ...[
            _Avatar(name: widget.conversation.hostName, radius: 15),
            const SizedBox(width: 8),
          ],
          Flexible(
            child: Column(
              crossAxisAlignment: msg.fromMe
                  ? CrossAxisAlignment.end
                  : CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 14, vertical: 10),
                  decoration: BoxDecoration(
                    color: msg.fromMe
                        ? AppColors.primary
                        : Colors.white,
                    borderRadius: BorderRadius.only(
                      topLeft: const Radius.circular(18),
                      topRight: const Radius.circular(18),
                      bottomLeft:
                          Radius.circular(msg.fromMe ? 18 : 4),
                      bottomRight:
                          Radius.circular(msg.fromMe ? 4 : 18),
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: msg.fromMe
                            ? AppColors.primary.withOpacity(0.2)
                            : const Color(0x0A000000),
                        blurRadius: 8,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Text(
                    msg.text,
                    style: TextStyle(
                      fontSize: 13,
                      color: msg.fromMe ? Colors.white : AppColors.navy900,
                      height: 1.45,
                    ),
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  msg.time,
                  style: const TextStyle(
                    fontSize: 10,
                    color: AppColors.textHint,
                  ),
                ),
              ],
            ),
          ),
          if (msg.fromMe) const SizedBox(width: 4),
        ],
      ),
    );
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
                    color: AppColors.primary.withOpacity(0.35),
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

// ─── Message model ────────────────────────────────────────────────────────────
class _ChatMsg {
  final String text;
  final bool fromMe;
  final String time;
  const _ChatMsg({required this.text, required this.fromMe, required this.time});
}
