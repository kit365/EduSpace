package com.eduspace.conversationservice.business.serviceimpl;

import com.eduspace.conversationservice.business.service.ChatService;
import com.eduspace.conversationservice.business.service.OutboxService;
import com.eduspace.conversationservice.business.service.SagaService;
import com.eduspace.conversationservice.infrastructure.client.AccountClient;
import com.eduspace.conversationservice.model.dto.response.ChatMessageResponse;
import com.eduspace.conversationservice.model.dto.response.ConversationResponse;
import com.eduspace.conversationservice.model.entity.ChatMessageEntity;
import com.eduspace.conversationservice.model.entity.ConversationEntity;
import com.eduspace.conversationservice.model.entity.SagaInstanceEntity;
import com.eduspace.conversationservice.model.enums.MessageType;
import com.eduspace.conversationservice.persistence.repository.ChatMessageRepository;
import com.eduspace.conversationservice.persistence.repository.ConversationRepository;
import com.eduspace.conversationservice.persistence.repository.VideoCallRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
@Transactional
public class ChatServiceImpl implements ChatService {

    private final ConversationRepository conversationRepository;
    private final ChatMessageRepository chatMessageRepository;
    @SuppressWarnings("unused")
    private final VideoCallRepository videoCallRepository;

    private final AccountClient accountClient;
    private final SimpMessagingTemplate messagingTemplate;
    private final ObjectMapper objectMapper;
    private final OutboxService outboxService;
    private final SagaService sagaService;

    private final String supportAdminKeycloakId;

    public ChatServiceImpl(
            ConversationRepository conversationRepository,
            ChatMessageRepository chatMessageRepository,
            VideoCallRepository videoCallRepository,
            AccountClient accountClient,
            SimpMessagingTemplate messagingTemplate,
            ObjectMapper objectMapper,
            OutboxService outboxService,
            SagaService sagaService,
            @Value("${app.support.admin-keycloak-id}") String supportAdminKeycloakId
    ) {
        this.conversationRepository = conversationRepository;
        this.chatMessageRepository = chatMessageRepository;
        this.videoCallRepository = videoCallRepository;
        this.accountClient = accountClient;
        this.messagingTemplate = messagingTemplate;
        this.objectMapper = objectMapper;
        this.outboxService = outboxService;
        this.sagaService = sagaService;
        this.supportAdminKeycloakId = supportAdminKeycloakId;
    }

    @Override
    public ConversationResponse getOrCreateConversation(String currentUserId, String otherUserId, boolean isAdminConversation, String bearerToken) {
        String targetOtherUserId = isAdminConversation ? resolveAdminTarget(currentUserId) : otherUserId;

        if (currentUserId.equals(targetOtherUserId) && !isAdminConversation) {
            throw new IllegalArgumentException("Cannot create conversation with yourself");
        }

        SagaInstanceEntity saga = sagaService.startSaga("CreateConversationSaga", "VALIDATE_USERS",
                Map.of("currentUserId", currentUserId, "otherUserId", targetOtherUserId, "isAdminConversation", isAdminConversation));

        try {
            // Validate both users exist (Saga step)
            AccountClient.PublicUserProfile me = accountClient.getPublicProfileByKeycloakId(currentUserId, bearerToken);
            AccountClient.PublicUserProfile other = accountClient.getPublicProfileByKeycloakId(targetOtherUserId, bearerToken);
            if (me == null || other == null) {
                throw new IllegalStateException("User not found");
            }

            ConversationEntity conversation = conversationRepository.findBetweenUsers(currentUserId, targetOtherUserId, isAdminConversation)
                    .orElseGet(() -> {
                        ConversationEntity created = ConversationEntity.builder()
                                .user1Id(currentUserId)
                                .user2Id(targetOtherUserId)
                                .conversationName(generateConversationName(me, other, isAdminConversation))
                                .isAdminConversation(isAdminConversation)
                                .isActive(true)
                                .videoCallEnabled(true)
                                .build();
                        return conversationRepository.save(created);
                    });

            ConversationResponse response = toConversationResponse(conversation, currentUserId, bearerToken);
            outboxService.addEvent("Conversation", conversation.getId(), "ConversationCreated",
                    Map.of("conversationId", conversation.getId(), "user1Id", conversation.getUser1Id(), "user2Id", conversation.getUser2Id(),
                            "isAdminConversation", conversation.getIsAdminConversation(), "createdAt", String.valueOf(conversation.getCreatedAt())));

            sagaService.completeSaga(saga.getId());
            return response;
        } catch (Exception ex) {
            sagaService.failSaga(saga.getId(), ex.getMessage());
            throw ex;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public ConversationResponse getConversationById(String conversationId, String currentUserId, String bearerToken) {
        ConversationEntity conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));
        if (!conversation.isParticipant(currentUserId)) {
            throw new RuntimeException("Forbidden");
        }
        return toConversationResponse(conversation, currentUserId, bearerToken);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ConversationResponse> getUserConversations(String currentUserId, String bearerToken) {
        return conversationRepository.findUserConversations(currentUserId).stream()
                .map(c -> toConversationResponse(c, currentUserId, bearerToken))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ConversationResponse> getAdminConversations(String currentUserId, String bearerToken) {
        return conversationRepository.findAdminConversations(currentUserId).stream()
                .map(c -> toConversationResponse(c, currentUserId, bearerToken))
                .toList();
    }

    @Override
    public ChatMessageResponse sendMessage(String conversationId, String senderUserId, String content, MessageType messageType, String bearerToken) {
        ConversationEntity conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));

        if (conversation.isBlocked()) throw new RuntimeException("Cannot send message - conversation is blocked");
        if (!conversation.isParticipant(senderUserId)) throw new RuntimeException("User is not a participant");

        SagaInstanceEntity saga = sagaService.startSaga("SendMessageSaga", "PERSIST_MESSAGE",
                Map.of("conversationId", conversationId, "senderUserId", senderUserId, "messageType", messageType.name()));

        try {
            ChatMessageEntity message = ChatMessageEntity.builder()
                    .conversation(conversation)
                    .senderId(senderUserId)
                    .content(content)
                    .messageType(messageType)
                    .isRead(false)
                    .isDeleted(false)
                    .build();

            ChatMessageEntity saved = chatMessageRepository.save(message);
            conversation.incrementMessageCount();
            conversationRepository.save(conversation);

            sendRealTimeMessage(saved, bearerToken);

            outboxService.addEvent("ChatMessage", saved.getId(), "MessageSent",
                    Map.of("messageId", saved.getId(), "conversationId", conversationId, "senderId", senderUserId,
                            "messageType", messageType.name(), "sentAt", String.valueOf(saved.getSentAt())));

            sagaService.completeSaga(saga.getId());
            return toMessageResponse(saved, bearerToken);
        } catch (Exception ex) {
            sagaService.failSaga(saga.getId(), ex.getMessage());
            throw ex;
        }
    }

    @Override
    public ChatMessageResponse sendMediaMessage(String conversationId, String senderUserId, String mediaUrl, String mediaType, MessageType messageType, String bearerToken) {
        ConversationEntity conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));

        if (conversation.isBlocked()) throw new RuntimeException("Cannot send message - conversation is blocked");
        if (!conversation.isParticipant(senderUserId)) throw new RuntimeException("User is not a participant");

        ChatMessageEntity message = ChatMessageEntity.builder()
                .conversation(conversation)
                .senderId(senderUserId)
                .content("")
                .messageType(messageType)
                .mediaUrl(mediaUrl)
                .mediaType(mediaType)
                .isRead(false)
                .isDeleted(false)
                .build();

        ChatMessageEntity saved = chatMessageRepository.save(message);
        conversation.incrementMessageCount();
        conversationRepository.save(conversation);

        sendRealTimeMessage(saved, bearerToken);

        outboxService.addEvent("ChatMessage", saved.getId(), "MediaMessageSent",
                Map.of("messageId", saved.getId(), "conversationId", conversationId, "senderId", senderUserId,
                        "messageType", messageType.name(), "mediaType", mediaType, "sentAt", String.valueOf(saved.getSentAt())));

        return toMessageResponse(saved, bearerToken);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChatMessageResponse> getChatHistory(String conversationId, int page, int size, String bearerToken) {
        ConversationEntity conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));

        List<ChatMessageEntity> messages = chatMessageRepository
                .findByConversationAndIsDeletedFalseOrderBySentAtDesc(conversation, PageRequest.of(page, size))
                .getContent();

        // batch enrich senders (only two participants)
        Set<String> senderIds = messages.stream().map(ChatMessageEntity::getSenderId).collect(Collectors.toSet());
        Map<String, AccountClient.PublicUserProfile> profiles = accountClient.getPublicProfilesByKeycloakIds(new ArrayList<>(senderIds), bearerToken)
                .stream()
                .collect(Collectors.toMap(AccountClient.PublicUserProfile::keycloakId, p -> p, (a, b) -> a));

        return messages.stream()
                .map(m -> toMessageResponse(m, profiles))
                .toList();
    }

    @Override
    public void markMessagesAsRead(String conversationId, String readerUserId) {
        ConversationEntity conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));
        if (!conversation.isParticipant(readerUserId)) throw new RuntimeException("Forbidden");

        int updated = chatMessageRepository.markMessagesAsRead(conversation, readerUserId, LocalDateTime.now());
        if (updated > 0) {
            sendReadReceiptNotification(conversationId, readerUserId);
            outboxService.addEvent("Conversation", conversationId, "MessagesRead",
                    Map.of("conversationId", conversationId, "readerId", readerUserId, "readAt", LocalDateTime.now().toString()));
        }
    }

    @Override
    @Transactional(readOnly = true)
    public int getUnreadMessageCount(String conversationId, String userId) {
        ConversationEntity conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));
        if (!conversation.isParticipant(userId)) throw new RuntimeException("Forbidden");
        return chatMessageRepository.countUnreadMessages(conversation, userId);
    }

    @Override
    public void deleteMessage(String messageId, String deleterUserId) {
        ChatMessageEntity message = chatMessageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));

        if (!Objects.equals(message.getSenderId(), deleterUserId)) {
            throw new RuntimeException("You can only delete your own messages");
        }
        message.markAsDeleted();
        chatMessageRepository.save(message);

        String destination = "/topic/conversation/" + message.getConversation().getId() + "/deleted";
        Map<String, Object> deletionData = Map.of(
                "messageId", messageId,
                "deletedAt", LocalDateTime.now().toString()
        );
        messagingTemplate.convertAndSend(destination, deletionData);
        outboxService.addEvent("ChatMessage", messageId, "MessageDeleted", deletionData);
    }

    @Override
    public void editMessage(String messageId, String newContent, String editorUserId) {
        ChatMessageEntity message = chatMessageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));

        if (!Objects.equals(message.getSenderId(), editorUserId)) {
            throw new RuntimeException("You can only edit your own messages");
        }
        message.editContent(newContent);
        chatMessageRepository.save(message);

        String destination = "/topic/conversation/" + message.getConversation().getId() + "/edited";
        Map<String, Object> editData = Map.of(
                "messageId", messageId,
                "newContent", newContent,
                "editedAt", String.valueOf(message.getEditedAt())
        );
        messagingTemplate.convertAndSend(destination, editData);
        outboxService.addEvent("ChatMessage", messageId, "MessageEdited", editData);
    }

    @Override
    public void addReactionToMessage(String messageId, String reactorUserId, String emoji) {
        ChatMessageEntity message = chatMessageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));

        try {
            Map<String, List<String>> reactions;
            if (message.getReactions() != null && !message.getReactions().isBlank()) {
                @SuppressWarnings("unchecked")
                Map<String, List<String>> temp = objectMapper.readValue(message.getReactions(), Map.class);
                reactions = temp;
            } else {
                reactions = new HashMap<>();
            }

            reactions.computeIfAbsent(emoji, k -> new ArrayList<>()).add(reactorUserId);
            message.setReactions(objectMapper.writeValueAsString(reactions));
            chatMessageRepository.save(message);

            String destination = "/topic/conversation/" + message.getConversation().getId() + "/reaction";
            Map<String, Object> reactionData = Map.of(
                    "messageId", messageId,
                    "emoji", emoji,
                    "reactorId", reactorUserId
            );
            messagingTemplate.convertAndSend(destination, reactionData);
            outboxService.addEvent("ChatMessage", messageId, "ReactionAdded", reactionData);
        } catch (Exception e) {
            throw new RuntimeException("Failed to add reaction", e);
        }
    }

    @Override
    public void blockUser(String conversationId, String blockerUserId) {
        ConversationEntity conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));
        if (!conversation.isParticipant(blockerUserId)) throw new RuntimeException("Forbidden");

        conversation.blockBy(blockerUserId);
        conversationRepository.save(conversation);

        sendSystemMessage(conversation, blockerUserId, "blocked this conversation");
        outboxService.addEvent("Conversation", conversationId, "ConversationBlocked",
                Map.of("conversationId", conversationId, "blockedBy", blockerUserId, "blockedAt", LocalDateTime.now().toString()));
    }

    @Override
    public void unblockUser(String conversationId, String unblockerUserId) {
        ConversationEntity conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));
        if (!conversation.isParticipant(unblockerUserId)) throw new RuntimeException("Forbidden");

        conversation.unblockBy(unblockerUserId);
        conversationRepository.save(conversation);

        sendSystemMessage(conversation, unblockerUserId, "unblocked this conversation");
        outboxService.addEvent("Conversation", conversationId, "ConversationUnblocked",
                Map.of("conversationId", conversationId, "unblockedBy", unblockerUserId, "unblockedAt", LocalDateTime.now().toString()));
    }

    private String generateConversationName(AccountClient.PublicUserProfile me, AccountClient.PublicUserProfile other, boolean isAdminConversation) {
        if (isAdminConversation) return "Admin Support - " + (me.fullName() == null ? me.keycloakId() : me.fullName());
        String a = me.fullName() == null ? me.keycloakId() : me.fullName();
        String b = other.fullName() == null ? other.keycloakId() : other.fullName();
        return "Chat: " + a + " & " + b;
    }

    private ConversationResponse toConversationResponse(ConversationEntity conversation, String currentUserId, String bearerToken) {
        String otherId = conversation.otherUserId(currentUserId);
        AccountClient.PublicUserProfile otherProfile = null;
        if (otherId != null && bearerToken != null && !bearerToken.isBlank()) {
            otherProfile = accountClient.getPublicProfileByKeycloakId(otherId, bearerToken);
        }

        int unreadCount = chatMessageRepository.countUnreadMessages(conversation, currentUserId);

        // latest preview
        String preview = "";
        List<ChatMessageEntity> latest = chatMessageRepository.findLatestMessages(conversation, PageRequest.of(0, 1, Sort.by(Sort.Direction.DESC, "sentAt")));
        if (!latest.isEmpty()) {
            ChatMessageEntity last = latest.get(0);
            if (last.getMessageType() == MessageType.IMAGE) {
                preview = "📷 Image";
            } else if (last.getMessageType() == MessageType.SYSTEM) {
                preview = "Call activity";
            } else {
                String c = last.getContent() == null ? "" : last.getContent();
                preview = c.length() > 50 ? c.substring(0, 50) + "..." : c;
            }
        }

        ConversationResponse.OtherUser otherUser = null;
        if (otherProfile != null) {
            otherUser = ConversationResponse.OtherUser.builder()
                    .userId(otherProfile.keycloakId())
                    .fullName(otherProfile.fullName())
                    .email(otherProfile.email())
                    .avatarUrl(otherProfile.avatarUrl())
                    .build();
        } else if (Boolean.TRUE.equals(conversation.getIsAdminConversation())) {
            otherUser = ConversationResponse.OtherUser.builder()
                    .userId(supportAdminKeycloakId)
                    .fullName("EduSpace Support")
                    .email(null)
                    .avatarUrl(null)
                    .build();
        }

        return ConversationResponse.builder()
                .conversationId(conversation.getId())
                .conversationName(conversation.getConversationName())
                .isActive(Boolean.TRUE.equals(conversation.getIsActive()))
                .isAdminConversation(Boolean.TRUE.equals(conversation.getIsAdminConversation()))
                .videoCallEnabled(Boolean.TRUE.equals(conversation.getVideoCallEnabled()))
                .totalMessageCount(conversation.getTotalMessageCount() == null ? 0 : conversation.getTotalMessageCount())
                .callHistoryCount(conversation.getCallHistoryCount() == null ? 0 : conversation.getCallHistoryCount())
                .lastActivity(conversation.getLastActivity())
                .createdAt(conversation.getCreatedAt())
                .isBlocked(conversation.isBlocked())
                .isBlockedByMe(conversation.isBlockedBy(currentUserId))
                .unreadCount(unreadCount)
                .lastMessage(preview)
                .otherUser(otherUser)
                .build();
    }

    private ChatMessageResponse toMessageResponse(ChatMessageEntity message, String bearerToken) {
        Map<String, AccountClient.PublicUserProfile> profiles = accountClient.getPublicProfilesByKeycloakIds(List.of(message.getSenderId()), bearerToken)
                .stream()
                .collect(Collectors.toMap(AccountClient.PublicUserProfile::keycloakId, p -> p, (a, b) -> a));
        return toMessageResponse(message, profiles);
    }

    private ChatMessageResponse toMessageResponse(ChatMessageEntity message, Map<String, AccountClient.PublicUserProfile> profiles) {
        AccountClient.PublicUserProfile senderProfile = profiles.get(message.getSenderId());
        ChatMessageResponse.Sender sender = null;
        if (senderProfile != null) {
            sender = ChatMessageResponse.Sender.builder()
                    .userId(senderProfile.keycloakId())
                    .fullName(senderProfile.fullName())
                    .email(senderProfile.email())
                    .avatarUrl(senderProfile.avatarUrl())
                    .build();
        }

        return ChatMessageResponse.builder()
                .messageId(message.getId())
                .conversationId(message.getConversation().getId())
                .content(message.getContent())
                .messageType(message.getMessageType().name())
                .sentAt(message.getSentAt())
                .isRead(Boolean.TRUE.equals(message.getIsRead()))
                .readAt(message.getReadAt())
                .isDeleted(Boolean.TRUE.equals(message.getIsDeleted()))
                .editedAt(message.getEditedAt())
                .mediaUrl(message.getMediaUrl())
                .mediaType(message.getMediaType())
                .reactions(message.getReactions())
                .replyToMessageId(message.getReplyToMessageId())
                .sender(sender)
                .build();
    }

    private void sendRealTimeMessage(ChatMessageEntity message, String bearerToken) {
        try {
            String destination = "/topic/conversation/" + message.getConversation().getId();

            Map<String, Object> messageData = new HashMap<>();
            messageData.put("messageId", message.getId());
            messageData.put("senderId", message.getSenderId());
            // senderUsername + senderEmail are kept for GreenLoop FE compatibility; we map fullName/email.
            AccountClient.PublicUserProfile sender = null;
            if (bearerToken != null && !bearerToken.isBlank()) {
                sender = accountClient.getPublicProfileByKeycloakId(message.getSenderId(), bearerToken);
            }
            messageData.put("senderUsername", sender != null && sender.fullName() != null ? sender.fullName() : message.getSenderId());
            messageData.put("senderEmail", sender != null ? sender.email() : null);
            messageData.put("content", message.getContent());
            messageData.put("messageType", message.getMessageType().name());
            messageData.put("sentAt", String.valueOf(message.getSentAt()));
            messageData.put("mediaUrl", message.getMediaUrl());
            messageData.put("conversationId", message.getConversation().getId());

            messagingTemplate.convertAndSend(destination, messageData);
            sendConversationUpdateForParticipants(message, sender);
        } catch (Exception e) {
            log.error("Error sending real-time message", e);
        }
    }

    private void sendConversationUpdateForParticipants(ChatMessageEntity message, AccountClient.PublicUserProfile senderProfile) {
        try {
            ConversationEntity conversation = message.getConversation();

            String preview;
            if (message.getMessageType() == MessageType.IMAGE) {
                preview = "🖼️ Image";
            } else if (message.getMessageType() == MessageType.SYSTEM) {
                preview = "Call activity";
            } else {
                String content = message.getContent() == null ? "" : message.getContent();
                preview = content.length() > 50 ? content.substring(0, 50) + "…" : content;
            }

            Map<String, Object> event = new HashMap<>();
            event.put("type", "CONVERSATION_ACTIVITY");
            event.put("conversationId", conversation.getId());
            event.put("lastMessage", preview);
            event.put("lastActivity", String.valueOf(message.getSentAt()));
            event.put("senderId", message.getSenderId());
            event.put("messageType", message.getMessageType().name());

            String topicUser1 = "/topic/user/" + conversation.getUser1Id() + "/conversations";
            String topicUser2 = "/topic/user/" + conversation.getUser2Id() + "/conversations";
            messagingTemplate.convertAndSend(topicUser1, event);
            messagingTemplate.convertAndSend(topicUser2, event);
        } catch (Exception ex) {
            log.error("Error sending conversation update", ex);
        }
    }

    private String resolveAdminTarget(String currentUserId) {
        if (supportAdminKeycloakId == null || supportAdminKeycloakId.isBlank()) {
            return currentUserId;
        }
        if (currentUserId.equals(supportAdminKeycloakId)) {
            // Admin is chatting with themselves; fallback to self conversation
            return currentUserId;
        }
        return supportAdminKeycloakId;
    }

    private void sendReadReceiptNotification(String conversationId, String readerUserId) {
        String destination = "/topic/conversation/" + conversationId + "/read-receipt";
        Map<String, Object> readReceipt = new HashMap<>();
        readReceipt.put("readerId", readerUserId);
        readReceipt.put("readAt", LocalDateTime.now().toString());
        messagingTemplate.convertAndSend(destination, readReceipt);
    }

    private void sendSystemMessage(ConversationEntity conversation, String actorUserId, String actionText) {
        String content = actorUserId + " " + actionText;
        ChatMessageEntity systemMessage = ChatMessageEntity.builder()
                .conversation(conversation)
                .senderId(actorUserId)
                .content(content)
                .messageType(MessageType.SYSTEM)
                .isRead(true)
                .build();
        ChatMessageEntity saved = chatMessageRepository.save(systemMessage);
        sendRealTimeMessage(saved, null); // best-effort without enrichment
    }
}

