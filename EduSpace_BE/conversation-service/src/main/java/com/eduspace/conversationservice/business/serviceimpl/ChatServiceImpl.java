package com.eduspace.conversationservice.business.serviceimpl;
import com.eduspace.conversationservice.business.service.ChatService;
import com.eduspace.conversationservice.business.service.OutboxService;
import com.eduspace.conversationservice.business.service.SagaService;
import com.eduspace.conversationservice.infrastructure.client.AccountClient;
import com.eduspace.conversationservice.exception.AppException;
import com.eduspace.conversationservice.exception.ErrorCode;
import com.eduspace.conversationservice.infrastructure.messaging.producer.ChatEventProducer;
import com.eduspace.conversationservice.model.dto.response.ApiResponse;
import com.eduspace.conversationservice.model.dto.response.ChatMessageResponse;
import com.eduspace.conversationservice.model.dto.response.ConversationResponse;
import com.eduspace.conversationservice.model.entity.ChatMessageEntity;
import com.eduspace.conversationservice.model.entity.ConversationEntity;
import com.eduspace.conversationservice.model.entity.SagaInstanceEntity;
import com.eduspace.conversationservice.model.entity.StaffAssignmentOfferEntity;
import com.eduspace.conversationservice.model.enums.MessageType;
import com.eduspace.conversationservice.model.enums.SagaStep;
import com.eduspace.conversationservice.model.enums.SagaType;
import com.eduspace.conversationservice.persistence.repository.ChatMessageRepository;
import com.eduspace.conversationservice.persistence.repository.ConversationRepository;
import com.eduspace.conversationservice.persistence.repository.StaffAssignmentOfferRepository;
import com.eduspace.conversationservice.persistence.repository.VideoCallRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import java.time.LocalDateTime;
import com.eduspace.conversationservice.infrastructure.mapper.ConversationMapper;
import com.eduspace.conversationservice.infrastructure.mapper.ChatMessageMapper;
import com.eduspace.conversationservice.model.event.DomainEventConstants;
import com.eduspace.conversationservice.infrastructure.constants.WebSocketTopics;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class ChatServiceImpl implements ChatService {
    private static final Logger log = LoggerFactory.getLogger(ChatServiceImpl.class);

    private final ConversationRepository conversationRepository;
    private final ChatMessageRepository chatMessageRepository;
    @SuppressWarnings("unused")
    private final VideoCallRepository videoCallRepository;
    private final AccountClient accountClient;
    private final SimpMessagingTemplate messagingTemplate;
    private final OutboxService outboxService;
    private final SagaService sagaService;
    private final ChatEventProducer chatEventProducer;
    private final ConversationMapper conversationMapper;
    private final ChatMessageMapper chatMessageMapper;
    private final StaffAssignmentOfferRepository offerRepository;

    public ChatServiceImpl(
            ConversationRepository conversationRepository,
            ChatMessageRepository chatMessageRepository,
            VideoCallRepository videoCallRepository,
            AccountClient accountClient,
            SimpMessagingTemplate messagingTemplate,
            OutboxService outboxService,
            SagaService sagaService,
            ChatEventProducer chatEventProducer,
            ConversationMapper conversationMapper,
            ChatMessageMapper chatMessageMapper,
            StaffAssignmentOfferRepository offerRepository) {
        this.conversationRepository = conversationRepository;
        this.chatMessageRepository = chatMessageRepository;
        this.videoCallRepository = videoCallRepository;
        this.accountClient = accountClient;
        this.messagingTemplate = messagingTemplate;
        this.outboxService = outboxService;
        this.sagaService = sagaService;
        this.chatEventProducer = chatEventProducer;
        this.conversationMapper = conversationMapper;
        this.chatMessageMapper = chatMessageMapper;
        this.offerRepository = offerRepository;
    }

    @Value("${app.support.admin-keycloak-id:none}")
    private String supportAdminKeycloakId;

    @Override
    @Transactional
    public ConversationResponse getOrCreateConversation(String currentUserId, String otherUserId, boolean isAdminConversation) {
        if (currentUserId == null) {
            log.error("currentUserId is null in getOrCreateConversation. Cannot proceed.");
            throw new AppException(ErrorCode.UNAUTHORIZED); 
        }
        if (otherUserId == null || otherUserId.isBlank()) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }
        final String userId = normalizeParticipantIdForStorage(currentUserId);
        final String peerId = normalizeParticipantIdForStorage(otherUserId);
        if (peerId == null || peerId.isBlank()) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        boolean effectiveIsAdmin = isAdminConversation
                || "admin-keycloak-id-0000".equals(peerId)
                || "admin-support".equals(peerId);

        if (peerId.equals(userId) && !effectiveIsAdmin) {
            throw new AppException(ErrorCode.SELF_CHAT_NOT_ALLOWED);
        }
        if (!effectiveIsAdmin && isInvalidNormalConversationPeer(peerId)) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        if (effectiveIsAdmin) {
            Optional<ConversationEntity> existingSupport = conversationRepository
                    .findFirstByUser1IdAndIsAdminConversationTrueOrderByLastActivityDesc(userId);
            if (existingSupport.isPresent()) {
                ConversationEntity existing = existingSupport.get();
                maybeTriggerSupportRematch(existing, userId);
                return toConversationResponse(existing, userId);
            }
        }

        return conversationRepository.findConversationBetween(userId, peerId, effectiveIsAdmin)
                .map(conversation -> toConversationResponse(conversation, userId))
                .orElseGet(() -> {
                    try {
                        UserProfiles profiles = validateAndGetProfiles(userId, peerId, effectiveIsAdmin);

                        ConversationEntity conversation = effectiveIsAdmin
                                ? createAdminSupportConversation(userId, peerId, profiles)
                                : createNormalConversation(userId, peerId, profiles);

                        emitConversationCreatedEvent(conversation);
                        return toConversationResponse(conversation, userId);
                    } catch (DataIntegrityViolationException ex) {
                        log.warn("Duplicate admin support conversation prevented for user {}: {}", userId, ex.getMessage());
                        return conversationRepository
                                .findFirstByUser1IdAndIsAdminConversationTrueOrderByLastActivityDesc(userId)
                                .map(c -> toConversationResponse(c, userId))
                                .orElseThrow(() -> new AppException(ErrorCode.CONVERSATION_NOT_FOUND));
                    }
                });
    }

    private UserProfiles validateAndGetProfiles(String currentUserId, String otherUserId, boolean isAdminConversation) {
        AccountClient.PublicUserProfile meProfile = fetchProfileSafe(currentUserId);
        AccountClient.PublicUserProfile otherProfile = fetchProfileSafe(otherUserId);

        // Fallback for admin conversations if profile fetching failed
        if (isAdminConversation) {
            if (meProfile == null) meProfile = new AccountClient.PublicUserProfile(currentUserId, "Guest User", null, null);
            if (otherProfile == null) otherProfile = new AccountClient.PublicUserProfile(otherUserId, "Admin Support", null, null);
        }

        if (meProfile == null || otherProfile == null) {
            log.error("Profile validation failed: me={} other={}", meProfile, otherProfile);
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }
        
        return new UserProfiles(meProfile, otherProfile);
    }

    private ConversationEntity createNormalConversation(String creatorId, String otherId, UserProfiles profiles) {
        String otherKeycloakId = profiles.other().keycloakId() != null ? profiles.other().keycloakId() : otherId;
        ConversationEntity conversation = conversationMapper.toEntity(
                creatorId, 
                otherKeycloakId, 
                generateConversationName(profiles.me(), profiles.other(), false),
                false,
                true,
                null
        );
        return conversationRepository.save(conversation);
    }

    private ConversationEntity createAdminSupportConversation(String userId, String adminId, UserProfiles profiles) {
        String sagaId = UUID.randomUUID().toString();
        
        ConversationEntity conversation = conversationMapper.toEntity(
                userId, 
                profiles.other().keycloakId(), 
                generateConversationName(profiles.me(), profiles.other(), true),
                true,
                true,
                sagaId
        );
        
        // Single save for both conversation and sagaId reference
        conversation = conversationRepository.save(conversation);

        // Start saga with the pre-generated ID
        sagaService.startSaga(
                sagaId,
                SagaType.FIND_STAFF.getValue(), 
                SagaStep.VALIDATE_USERS.getValue(),
                Map.of("conversationId", conversation.getId(), "currentUserId", userId)
        );

        // Send immediate feedback message
        sendSystemMessage(conversation, userId, "is looking for a specialist to help you...");

        // Publish only after commit so Kafka consumers see conversation + saga rows (READ COMMITTED).
        final String conversationId = conversation.getId();
        scheduleAssignStaffKafkaSend(sagaId, conversationId, userId);

        return conversation;
    }

    private void maybeTriggerSupportRematch(ConversationEntity conversation, String userId) {
        if (!Boolean.TRUE.equals(conversation.getIsAdminConversation())) {
            return;
        }
        if (!isPlaceholderAdminQueue(conversation)) {
            return;
        }
        boolean hasPendingOffer = offerRepository
                .findByConversationIdAndStatus(conversation.getId(), StaffAssignmentOfferEntity.Status.PENDING)
                .stream()
                .anyMatch(offer -> offer.getExpiresAt() != null && offer.getExpiresAt().isAfter(LocalDateTime.now()));
        if (hasPendingOffer) {
            return;
        }

        String sagaId = UUID.randomUUID().toString();
        conversation.setSagaId(sagaId);
        conversationRepository.save(conversation);

        sagaService.startSaga(
                sagaId,
                SagaType.FIND_STAFF.getValue(),
                SagaStep.VALIDATE_USERS.getValue(),
                Map.of("conversationId", conversation.getId(), "currentUserId", userId, "retry", true)
        );
        sendSystemMessage(conversation, userId, "is looking for a specialist to help you...");
        scheduleAssignStaffKafkaSend(sagaId, conversation.getId(), userId);
    }

    /**
     * Sends ASSIGN_STAFF_REQUEST after the surrounding transaction commits. If there is no active
     * transaction (e.g. some tests), sends immediately and may throw on failure.
     */
    private void scheduleAssignStaffKafkaSend(String sagaId, String conversationId, String userId) {
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    sendAssignStaffKafkaOrFailSaga(sagaId, conversationId, userId, false);
                }
            });
        } else {
            sendAssignStaffKafkaOrFailSaga(sagaId, conversationId, userId, true);
        }
    }

    private void sendAssignStaffKafkaOrFailSaga(String sagaId, String conversationId, String userId, boolean rethrowOnFailure) {
        try {
            chatEventProducer.sendAssignStaffRequest(sagaId, conversationId, userId);
        } catch (Exception ex) {
            log.error("Failed to send assign-staff Kafka event for saga {}", sagaId, ex);
            try {
                sagaService.failSaga(sagaId, "Failed to send Kafka event: " + ex.getMessage());
            } catch (Exception e2) {
                log.error("Failed to mark saga failed for saga {}", sagaId, e2);
            }
            if (rethrowOnFailure) {
                if (ex instanceof RuntimeException runtimeException) {
                    throw runtimeException;
                }
                throw new IllegalStateException(ex);
            }
        }
    }

    private void emitConversationCreatedEvent(ConversationEntity conversation) {
        outboxService.addEvent(
                DomainEventConstants.AGGREGATE_CONVERSATION, 
                conversation.getId(), 
                DomainEventConstants.CONVERSATION_CREATED,
                Map.of(
                    "conversationId", conversation.getId(), 
                    "user1Id", conversation.getUser1Id(), 
                    "user2Id", conversation.getUser2Id(),
                    "isAdminConversation", conversation.getIsAdminConversation(), 
                    "createdAt", String.valueOf(conversation.getCreatedAt())
                ));
    }

    private void emitSupportAssignedActivity(ConversationEntity conversation, String adminUserId) {
        Map<String, Object> eventPayload = new HashMap<>();
        eventPayload.put("type", "CONVERSATION_ACTIVITY");
        eventPayload.put("conversationId", conversation.getId());
        eventPayload.put("lastMessage", "Staff assigned");
        eventPayload.put("lastActivity", LocalDateTime.now().toString());
        eventPayload.put("isAdminConversation", true);
        eventPayload.put("senderId", adminUserId);
        eventPayload.put("messageType", "SYSTEM");

        String subPath = WebSocketTopics.CONVERSATIONS;
        String topicUser1 = WebSocketTopics.USER + conversation.getUser1Id() + subPath;
        String topicUser2 = WebSocketTopics.USER + adminUserId + subPath;
        messagingTemplate.convertAndSend(topicUser1, eventPayload);
        messagingTemplate.convertAndSend(topicUser2, eventPayload);

        outboxService.addEvent(DomainEventConstants.AGGREGATE_CONVERSATION, conversation.getId(),
                "CONVERSATION_ACTIVITY", eventPayload, conversation.getUser1Id());
        outboxService.addEvent(DomainEventConstants.AGGREGATE_CONVERSATION, conversation.getId(),
                "CONVERSATION_ACTIVITY", eventPayload, adminUserId);
    }

    private record UserProfiles(AccountClient.PublicUserProfile me, AccountClient.PublicUserProfile other) {}


    @Override
    @Transactional(readOnly = true)
    public ConversationResponse getConversationById(String conversationId, String currentUserId) {
        ConversationEntity conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new AppException(ErrorCode.CONVERSATION_NOT_FOUND));
        if (!canAccessConversation(conversation, currentUserId)) {
            throw new AppException(ErrorCode.ACCESS_DENIED);
        }
        return toConversationResponse(conversation, currentUserId);
    }

    @Override
    @Transactional
    public ConversationResponse acceptAssignmentOffer(String conversationId, String offerId, String adminUserId) {
        if (adminUserId == null || adminUserId.isBlank()) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        ConversationEntity conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new AppException(ErrorCode.CONVERSATION_NOT_FOUND));
        StaffAssignmentOfferEntity offer = offerRepository.findByIdAndConversationId(offerId, conversationId)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_REQUEST));

        if (!adminUserId.equals(offer.getStaffId())) {
            throw new AppException(ErrorCode.ACCESS_DENIED);
        }

        if (offer.getStatus() == StaffAssignmentOfferEntity.Status.ACCEPTED) {
            return toConversationResponse(conversation, adminUserId);
        }
        if (offer.getStatus() == StaffAssignmentOfferEntity.Status.EXPIRED) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }
        if (offer.getExpiresAt() != null && offer.getExpiresAt().isBefore(LocalDateTime.now())) {
            offer.setStatus(StaffAssignmentOfferEntity.Status.EXPIRED);
            offerRepository.save(offer);
            sagaService.failSaga(offer.getSagaId(), "Offer expired before admin accepted");
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }
        if (!isPlaceholderAdminQueue(conversation) && !adminUserId.equals(conversation.getUser2Id())) {
            throw new AppException(ErrorCode.ACCESS_DENIED);
        }

        conversation.setUser2Id(adminUserId);
        conversation.setIsActive(true);
        conversationRepository.save(conversation);

        offer.setStatus(StaffAssignmentOfferEntity.Status.ACCEPTED);
        offer.setAcceptedAt(LocalDateTime.now());
        offerRepository.save(offer);
        offerRepository.findByConversationIdAndStatus(conversationId, StaffAssignmentOfferEntity.Status.PENDING).stream()
                .filter(o -> !o.getId().equals(offerId))
                .forEach(o -> {
                    o.setStatus(StaffAssignmentOfferEntity.Status.EXPIRED);
                    offerRepository.save(o);
                });

        sagaService.completeSaga(offer.getSagaId());
        emitSupportAssignedActivity(conversation, adminUserId);

        return toConversationResponse(conversation, adminUserId);
    }

    @Override
    @Transactional
    public ConversationResponse declineAssignmentOffer(String conversationId, String offerId, String adminUserId) {
        if (adminUserId == null || adminUserId.isBlank()) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        ConversationEntity conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new AppException(ErrorCode.CONVERSATION_NOT_FOUND));
        StaffAssignmentOfferEntity offer = offerRepository.findByIdAndConversationId(offerId, conversationId)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_REQUEST));

        if (!adminUserId.equals(offer.getStaffId())) {
            throw new AppException(ErrorCode.ACCESS_DENIED);
        }
        if (offer.getStatus() != StaffAssignmentOfferEntity.Status.PENDING) {
            return toConversationResponse(conversation, adminUserId);
        }
        if (offer.getExpiresAt() != null && offer.getExpiresAt().isBefore(LocalDateTime.now())) {
            offer.setStatus(StaffAssignmentOfferEntity.Status.EXPIRED);
            offerRepository.save(offer);
            sagaService.failSaga(offer.getSagaId(), "Offer expired before admin declined");
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        offer.setStatus(StaffAssignmentOfferEntity.Status.DECLINED);
        offerRepository.save(offer);
        sagaService.failSaga(offer.getSagaId(), "Offer declined by admin");

        // Queue conversation for a fresh assignment attempt immediately.
        String nextSagaId = UUID.randomUUID().toString();
        conversation.setUser2Id(resolvePlaceholderAdminId());
        conversation.setSagaId(nextSagaId);
        conversation.setIsActive(true);
        conversationRepository.save(conversation);
        sagaService.startSaga(
                nextSagaId,
                SagaType.FIND_STAFF.getValue(),
                SagaStep.VALIDATE_USERS.getValue(),
                Map.of("conversationId", conversation.getId(), "currentUserId", conversation.getUser1Id(), "retry", true));
        scheduleAssignStaffKafkaSend(nextSagaId, conversation.getId(), conversation.getUser1Id());
        emitSupportReassigningActivity(conversation, adminUserId);

        return toConversationResponse(conversation, adminUserId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ConversationResponse> getUserConversations(String currentUserId) {
        return conversationRepository.findByUser1IdOrUser2IdOrderByLastActivityDesc(currentUserId, currentUserId).stream()
                .map(c -> toConversationResponse(c, currentUserId))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ConversationResponse> getAdminConversations(String currentUserId) {
        LinkedHashMap<String, ConversationResponse> byId = new LinkedHashMap<>();
        conversationRepository.findByIsAdminConversationTrueAndUser1IdOrUser2IdOrderByLastActivityDesc(currentUserId, currentUserId)
                .forEach(c -> byId.put(c.getId(), toConversationResponse(c, currentUserId)));
        String placeholder = resolvePlaceholderAdminId();
        if (placeholder != null && !placeholder.isBlank()) {
            conversationRepository.findByIsAdminConversationTrueAndUser2IdOrderByLastActivityDesc(placeholder)
                    .stream()
                    .filter(c -> !byId.containsKey(c.getId()))
                    .forEach(c -> byId.put(c.getId(), toConversationResponse(c, currentUserId)));
        }
        return byId.values().stream()
                .sorted(Comparator.comparing(ConversationResponse::getLastActivityCompat, Comparator.nullsLast(Comparator.reverseOrder())))
                .toList();
    }

    @Override
    @Transactional
    public int claimGuestSupportConversations(String keycloakUserId, String guestId) {
        if (guestId == null || !guestId.startsWith("GUEST-")) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }
        if (guestId.equals(keycloakUserId)) {
            return 0;
        }
        int updated = conversationRepository.updateUser1IdForGuestSupport(guestId, keycloakUserId);
        chatMessageRepository.updateSenderIdForGuest(guestId, keycloakUserId);
        log.info("Claimed guest {} -> {} ({} conversations)", guestId, keycloakUserId, updated);
        return updated;
    }

    private String resolvePlaceholderAdminId() {
        if (supportAdminKeycloakId == null || supportAdminKeycloakId.isBlank()
                || "none".equalsIgnoreCase(supportAdminKeycloakId)) {
            return "admin-keycloak-id-0000";
        }
        return supportAdminKeycloakId;
    }

    /**
     * Scope guard for standard user-host DM: only real account ids are accepted.
     * Guest/system placeholders are reserved for support workflows.
     */
    private boolean isInvalidNormalConversationPeer(String peerId) {
        if (peerId == null || peerId.isBlank()) {
            return true;
        }
        if (peerId.startsWith("GUEST-")) {
            return true;
        }
        return "admin-keycloak-id-0000".equals(peerId)
                || "admin-support".equals(peerId)
                || "system-admin-placeholder".equals(peerId)
                || "system-admin-self-support".equals(peerId);
    }

    private boolean isStaffJwt() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (!(auth instanceof JwtAuthenticationToken jwtAuth)) {
            return false;
        }
        return jwtAuth.getAuthorities().stream().anyMatch(a -> {
            String r = a.getAuthority();
            return "ROLE_ADMIN".equals(r) || "ROLE_SUPER_ADMIN".equals(r);
        });
    }

    private boolean isPlaceholderAdminQueue(ConversationEntity conversation) {
        if (!Boolean.TRUE.equals(conversation.getIsAdminConversation())) {
            return false;
        }
        String ph = resolvePlaceholderAdminId();
        return ph != null && ph.equals(conversation.getUser2Id());
    }

    /** Participant, or staff JWT viewing an unassigned support queue item (user2 still placeholder). */
    private boolean canAccessConversation(ConversationEntity conversation, String userId) {
        if (conversation.isParticipant(userId)) {
            return true;
        }
        return isStaffJwt() && isPlaceholderAdminQueue(conversation);
    }

    /** Only actual participants can send (admin must accept assignment first). */
    private boolean canSendMessage(ConversationEntity conversation, String senderUserId) {
        return conversation.isParticipant(senderUserId);
    }

    @Override
    public ChatMessageResponse sendMessage(String conversationId, String senderUserId, String content, MessageType messageType) {
        ConversationEntity conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new AppException(ErrorCode.CONVERSATION_NOT_FOUND));

        if (conversation.isBlocked()) throw new AppException(ErrorCode.CONVERSATION_BLOCKED);
        if (!canSendMessage(conversation, senderUserId)) throw new AppException(ErrorCode.ACCESS_DENIED);

        SagaInstanceEntity saga = sagaService.startSaga(SagaType.SEND_MESSAGE.getValue(), SagaStep.PERSIST_MESSAGE.getValue(),
                Map.of("conversationId", conversationId, "senderUserId", senderUserId, "messageType", messageType.name()));

        try {
            ChatMessageEntity message = new ChatMessageEntity();
            message.setConversation(conversation);
            message.setSenderId(senderUserId);
            message.setContent(content);
            message.setMessageType(messageType);
            message.setIsRead(false);
            message.setIsDeleted(false);

            ChatMessageEntity saved = chatMessageRepository.save(message);
            conversation.incrementMessageCount();
            conversationRepository.save(conversation);

            sendRealTimeMessage(saved);

            outboxService.addEvent(DomainEventConstants.AGGREGATE_CHAT_MESSAGE, saved.getId(), DomainEventConstants.MESSAGE_SENT,
                    Map.of("messageId", saved.getId(), "conversationId", conversationId, "senderId", senderUserId,
                            "messageType", messageType.name(), "sentAt", String.valueOf(saved.getSentAt())));

            sagaService.completeSaga(saga.getId());
            return toMessageResponse(saved);
        } catch (Exception ex) {
            sagaService.failSaga(saga.getId(), ex.getMessage());
            throw ex;
        }
    }

    @Override
    public ChatMessageResponse sendMediaMessage(String conversationId, String senderUserId, String mediaUrl, String mediaType, MessageType messageType) {
        ConversationEntity conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new AppException(ErrorCode.CONVERSATION_NOT_FOUND));

        if (conversation.isBlocked()) throw new AppException(ErrorCode.CONVERSATION_BLOCKED);
        if (!canSendMessage(conversation, senderUserId)) throw new AppException(ErrorCode.ACCESS_DENIED);

        ChatMessageEntity message = new ChatMessageEntity();
        message.setConversation(conversation);
        message.setSenderId(senderUserId);
        message.setContent("");
        message.setMessageType(messageType);
        message.setMediaUrl(mediaUrl);
        message.setMediaType(mediaType);
        message.setIsRead(false);
        message.setIsDeleted(false);

        ChatMessageEntity saved = chatMessageRepository.save(message);
        conversation.incrementMessageCount();
        conversationRepository.save(conversation);

        sendRealTimeMessage(saved);

        outboxService.addEvent(DomainEventConstants.AGGREGATE_CHAT_MESSAGE, saved.getId(), DomainEventConstants.MESSAGE_SENT,
                Map.of("messageId", saved.getId(), "conversationId", conversationId, "senderId", senderUserId,
                        "messageType", messageType.name(), "mediaType", mediaType, "sentAt", String.valueOf(saved.getSentAt())));

        return toMessageResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChatMessageResponse> getChatHistory(String conversationId, int page, int size, String readerUserId) {
        if (readerUserId == null) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        ConversationEntity conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new AppException(ErrorCode.CONVERSATION_NOT_FOUND));
        if (!canAccessConversation(conversation, readerUserId)) {
            throw new AppException(ErrorCode.ACCESS_DENIED);
        }

        List<ChatMessageEntity> messages = chatMessageRepository
                .findByConversationAndIsDeletedFalseOrderBySentAtDesc(conversation, PageRequest.of(page, size))
                .getContent();

        Set<String> senderIds = messages.stream().map(ChatMessageEntity::getSenderId).collect(Collectors.toSet());
        Map<String, AccountClient.PublicUserProfile> profiles = fetchProfilesSafe(senderIds);

        return messages.stream()
                .map(m -> toMessageResponse(m, profiles))
                .toList();
    }

    @Override
    public void notifyStaffAssignmentFailed(String conversationId, String failureDetail) {
        ConversationEntity conversation = conversationRepository.findById(conversationId).orElse(null);
        if (conversation == null) {
            log.warn("notifyStaffAssignmentFailed: conversation {} not found", conversationId);
            return;
        }
        String msg = "Hiện tại không có nhân viên trống, vui lòng để lại lời nhắn hoặc thử lại sau.";
        if (failureDetail != null && !failureDetail.isBlank()) {
            msg = msg + " (" + failureDetail + ")";
        }
        ChatMessageEntity systemMessage = new ChatMessageEntity();
        systemMessage.setConversation(conversation);
        systemMessage.setSenderId(conversation.getUser1Id());
        systemMessage.setContent(msg);
        systemMessage.setMessageType(MessageType.SYSTEM);
        systemMessage.setIsRead(true);
        systemMessage.setIsDeleted(false);
        ChatMessageEntity saved = chatMessageRepository.save(systemMessage);
        conversation.incrementMessageCount();
        conversationRepository.save(conversation);
        sendRealTimeMessage(saved);
    }

    @Override
    public void markMessagesAsRead(String conversationId, String readerUserId) {
        ConversationEntity conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new AppException(ErrorCode.CONVERSATION_NOT_FOUND));
        if (!canAccessConversation(conversation, readerUserId)) throw new AppException(ErrorCode.ACCESS_DENIED);

        int updated = chatMessageRepository.markMessagesAsRead(conversation, readerUserId, LocalDateTime.now());
        if (updated > 0) {
            sendReadReceiptNotification(conversationId, readerUserId);
            outboxService.addEvent(DomainEventConstants.AGGREGATE_CONVERSATION, conversationId, DomainEventConstants.MESSAGE_READ,
                    Map.of("conversationId", conversationId, "readerId", readerUserId, "readAt", LocalDateTime.now().toString()));
        }
    }

    @Override
    @Transactional(readOnly = true)
    public int getUnreadMessageCount(String conversationId, String userId) {
        ConversationEntity conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new AppException(ErrorCode.CONVERSATION_NOT_FOUND));
        if (!canAccessConversation(conversation, userId)) throw new AppException(ErrorCode.ACCESS_DENIED);
        return chatMessageRepository.countByConversationAndIsDeletedFalseAndIsReadFalseAndSenderIdNot(conversation, userId);
    }

    @Override
    public void deleteMessage(String messageId, String deleterUserId) {
        ChatMessageEntity message = chatMessageRepository.findById(messageId)
                .orElseThrow(() -> new AppException(ErrorCode.MESSAGE_NOT_FOUND));

        if (!Objects.equals(message.getSenderId(), deleterUserId)) {
            throw new AppException(ErrorCode.ONLY_OWNER_CAN_DELETE);
        }
        message.markAsDeleted();
        chatMessageRepository.save(message);

        String destination = WebSocketTopics.CONVERSATION + message.getConversation().getId() + WebSocketTopics.DELETED;
        Map<String, Object> deletionData = Map.of(
                "messageId", messageId,
                "deletedAt", LocalDateTime.now().toString()
        );
        messagingTemplate.convertAndSend(destination, deletionData);
        outboxService.addEvent(DomainEventConstants.AGGREGATE_CHAT_MESSAGE, messageId, DomainEventConstants.MESSAGE_DELETED, deletionData);
    }

    @Override
    public void editMessage(String messageId, String newContent, String editorUserId) {
        ChatMessageEntity message = chatMessageRepository.findById(messageId)
                .orElseThrow(() -> new AppException(ErrorCode.MESSAGE_NOT_FOUND));

        if (!Objects.equals(message.getSenderId(), editorUserId)) {
            throw new AppException(ErrorCode.ONLY_OWNER_CAN_EDIT);
        }
        message.editContent(newContent);
        chatMessageRepository.save(message);

        String destination = WebSocketTopics.CONVERSATION + message.getConversation().getId() + WebSocketTopics.EDITED;
        Map<String, Object> editData = Map.of(
                "messageId", messageId,
                "newContent", newContent,
                "editedAt", String.valueOf(message.getEditedAt())
        );
        messagingTemplate.convertAndSend(destination, editData);
        outboxService.addEvent(DomainEventConstants.AGGREGATE_CHAT_MESSAGE, messageId, DomainEventConstants.MESSAGE_EDITED, editData);
    }

    @Override
    public void addReactionToMessage(String messageId, String reactorUserId, String emoji) {
        ChatMessageEntity message = chatMessageRepository.findById(messageId)
                .orElseThrow(() -> new AppException(ErrorCode.MESSAGE_NOT_FOUND));

        Map<String, List<String>> reactions = message.getReactions();
        if (reactions == null) {
            reactions = new HashMap<>();
        }

        reactions.computeIfAbsent(emoji, k -> new ArrayList<>()).add(reactorUserId);
        message.setReactions(reactions);
        chatMessageRepository.save(message);

        String destination = WebSocketTopics.CONVERSATION + message.getConversation().getId() + WebSocketTopics.REACTION;
        Map<String, Object> reactionData = Map.of(
                "messageId", messageId,
                "emoji", emoji,
                "reactorId", reactorUserId
        );
        messagingTemplate.convertAndSend(destination, reactionData);
        outboxService.addEvent(DomainEventConstants.AGGREGATE_CHAT_MESSAGE, messageId, DomainEventConstants.REACTION_ADDED, reactionData);
    }

    @Override
    public void blockUser(String conversationId, String blockerUserId) {
        ConversationEntity conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new AppException(ErrorCode.CONVERSATION_NOT_FOUND));
        if (!conversation.isParticipant(blockerUserId)) throw new AppException(ErrorCode.ACCESS_DENIED);

        conversation.blockBy(blockerUserId);
        conversationRepository.save(conversation);

        sendSystemMessage(conversation, blockerUserId, "blocked this conversation");
        outboxService.addEvent(DomainEventConstants.AGGREGATE_CONVERSATION, conversationId, DomainEventConstants.CONVERSATION_BLOCKED,
                Map.of("conversationId", conversationId, "blockedBy", blockerUserId, "blockedAt", LocalDateTime.now().toString()));
    }

    @Override
    public void unblockUser(String conversationId, String unblockerUserId) {
        ConversationEntity conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new AppException(ErrorCode.CONVERSATION_NOT_FOUND));
        if (!conversation.isParticipant(unblockerUserId)) throw new AppException(ErrorCode.ACCESS_DENIED);

        conversation.unblockBy(unblockerUserId);
        conversationRepository.save(conversation);

        sendSystemMessage(conversation, unblockerUserId, "unblocked this conversation");
        outboxService.addEvent(DomainEventConstants.AGGREGATE_CONVERSATION, conversationId, DomainEventConstants.CONVERSATION_UNBLOCKED,
                Map.of("conversationId", conversationId, "unblockedBy", unblockerUserId, "unblockedAt", LocalDateTime.now().toString()));
    }

    private String generateConversationName(AccountClient.PublicUserProfile me, AccountClient.PublicUserProfile other, boolean isAdminConversation) {
        if (isAdminConversation) return "Admin Support - " + (me.fullName() == null ? me.keycloakId() : me.fullName());
        String a = me.fullName() == null ? me.keycloakId() : me.fullName();
        String b = other.fullName() == null ? other.keycloakId() : other.fullName();
        return "Chat: " + a + " & " + b;
    }

    private ConversationResponse toConversationResponse(ConversationEntity conversation, String currentUserId) {
        String otherId = conversation.otherUserId(currentUserId);
        if (otherId == null && Boolean.TRUE.equals(conversation.getIsAdminConversation())) {
            String ph = resolvePlaceholderAdminId();
            if (ph != null && ph.equals(conversation.getUser2Id())) {
                otherId = conversation.getUser1Id();
            }
        }
        AccountClient.PublicUserProfile otherProfile = fetchProfileSafe(otherId);
        if (Boolean.TRUE.equals(conversation.getIsAdminConversation())
                && otherId != null
                && otherId.startsWith("GUEST-")
                && isAnonymousGuestProfile(otherProfile)) {
            AccountClient.PublicUserProfile resolved = resolveRealParticipantProfileFromRecentMessages(conversation, currentUserId);
            if (resolved != null) {
                otherProfile = resolved;
            }
        }

        if (otherProfile == null && Boolean.TRUE.equals(conversation.getIsAdminConversation()) && otherId != null) {
            if (otherId.startsWith("GUEST-")) {
                otherProfile = new AccountClient.PublicUserProfile(otherId, "Guest", null, null);
            } else if ("admin-keycloak-id-0000".equals(otherId) || "admin-support".equals(otherId)) {
                otherProfile = new AccountClient.PublicUserProfile(otherId, "Admin Support", null, null);
            } else {
                otherProfile = new AccountClient.PublicUserProfile(otherId, "User", null, null);
            }
        }

        int unreadCount = chatMessageRepository.countByConversationAndIsDeletedFalseAndIsReadFalseAndSenderIdNot(conversation, currentUserId);

        // latest preview
        String preview = "";
        List<ChatMessageEntity> latest = chatMessageRepository.findByConversationAndIsDeletedFalseOrderBySentAtDesc(conversation, PageRequest.of(0, 1)).getContent();
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

        ConversationResponse.OtherUser otherUser = conversationMapper.mapOtherUser(otherProfile, Boolean.TRUE.equals(conversation.getIsAdminConversation()), supportAdminKeycloakId);
        ConversationResponse response = conversationMapper.toResponse(conversation, currentUserId, otherUser, unreadCount, preview);
        if (Boolean.TRUE.equals(conversation.getIsAdminConversation())) {
            offerRepository.findFirstByConversationIdAndStatusOrderByCreatedAtDesc(
                            conversation.getId(),
                            StaffAssignmentOfferEntity.Status.PENDING)
                    .filter(o -> o.getExpiresAt() != null && o.getExpiresAt().isAfter(LocalDateTime.now()))
                    .ifPresent(o -> response.setPendingAssignmentOffer(
                            ConversationResponse.PendingAssignmentOffer.builder()
                                    .offerId(o.getId())
                                    .targetAdminId(o.getStaffId())
                                    .expiresAt(o.getExpiresAt())
                                    .build()));
        }
        return response;
    }

    private void emitSupportReassigningActivity(ConversationEntity conversation, String declinedAdminId) {
        Map<String, Object> eventPayload = new HashMap<>();
        eventPayload.put("type", "CONVERSATION_ACTIVITY");
        eventPayload.put("conversationId", conversation.getId());
        eventPayload.put("lastMessage", "Assignment declined, searching another available admin");
        eventPayload.put("lastActivity", LocalDateTime.now().toString());
        eventPayload.put("isAdminConversation", true);
        eventPayload.put("senderId", declinedAdminId);
        eventPayload.put("messageType", "SYSTEM");

        String customerTopic = WebSocketTopics.USER + conversation.getUser1Id() + WebSocketTopics.CONVERSATIONS;
        String adminTopic = WebSocketTopics.USER + declinedAdminId + WebSocketTopics.CONVERSATIONS;
        messagingTemplate.convertAndSend(customerTopic, eventPayload);
        messagingTemplate.convertAndSend(adminTopic, eventPayload);
        outboxService.addEvent(
                DomainEventConstants.AGGREGATE_CONVERSATION,
                conversation.getId(),
                "CONVERSATION_ACTIVITY",
                eventPayload,
                conversation.getUser1Id());
        outboxService.addEvent(
                DomainEventConstants.AGGREGATE_CONVERSATION,
                conversation.getId(),
                "CONVERSATION_ACTIVITY",
                eventPayload,
                declinedAdminId);
    }

    private boolean isAnonymousGuestProfile(AccountClient.PublicUserProfile profile) {
        if (profile == null || profile.fullName() == null) {
            return true;
        }
        String name = profile.fullName().trim().toLowerCase(Locale.ROOT);
        return name.isBlank() || "anonymous guest".equals(name) || "guest".equals(name);
    }

    private AccountClient.PublicUserProfile resolveRealParticipantProfileFromRecentMessages(
            ConversationEntity conversation,
            String currentUserId
    ) {
        List<ChatMessageEntity> recent = chatMessageRepository
                .findByConversationAndIsDeletedFalseOrderBySentAtDesc(conversation, PageRequest.of(0, 30))
                .getContent();
        for (ChatMessageEntity message : recent) {
            String senderId = message.getSenderId();
            if (senderId == null || senderId.isBlank()) {
                continue;
            }
            if (senderId.equals(currentUserId)) {
                continue;
            }
            if ("admin-support".equals(senderId) || "admin-keycloak-id-0000".equals(senderId)) {
                continue;
            }
            if (senderId.startsWith("GUEST-")) {
                continue;
            }
            AccountClient.PublicUserProfile profile = fetchProfileSafe(senderId);
            if (profile != null && profile.keycloakId() != null && !profile.keycloakId().isBlank()) {
                return profile;
            }
        }
        return null;
    }

    private ChatMessageResponse toMessageResponse(ChatMessageEntity message) {
        Map<String, AccountClient.PublicUserProfile> profiles = fetchProfilesSafe(Set.of(message.getSenderId()));
        return chatMessageMapper.toResponse(message, profiles);
    }

    private ChatMessageResponse toMessageResponse(ChatMessageEntity message, Map<String, AccountClient.PublicUserProfile> profiles) {
        return chatMessageMapper.toResponse(message, profiles);
    }

    private void sendRealTimeMessage(ChatMessageEntity message) {
        try {
            String destination = WebSocketTopics.CONVERSATION + message.getConversation().getId();

            Map<String, Object> messageData = new HashMap<>();
            messageData.put("messageId", message.getId());
            messageData.put("senderId", message.getSenderId());
            
            AccountClient.PublicUserProfile sender = fetchProfileSafe(message.getSenderId());
            
            messageData.put("senderUsername", sender != null && sender.fullName() != null ? sender.fullName() : message.getSenderId());
            messageData.put("senderEmail", sender != null ? sender.email() : null);
            messageData.put("content", message.getContent());
            messageData.put("messageType", message.getMessageType().name());
            messageData.put("sentAt", String.valueOf(message.getSentAt()));
            messageData.put("mediaUrl", message.getMediaUrl());
            messageData.put("conversationId", message.getConversation().getId());

            messagingTemplate.convertAndSend(destination, messageData);
            sendConversationUpdateForParticipants(message);
        } catch (Exception e) {
            log.error("Error sending real-time message", e);
        }
    }

    private void sendConversationUpdateForParticipants(ChatMessageEntity message) {
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

            String topicUser1 = WebSocketTopics.USER + conversation.getUser1Id() + WebSocketTopics.CONVERSATIONS;
            String topicUser2 = WebSocketTopics.USER + conversation.getUser2Id() + WebSocketTopics.CONVERSATIONS;
            messagingTemplate.convertAndSend(topicUser1, event);
            messagingTemplate.convertAndSend(topicUser2, event);
        } catch (Exception ex) {
            log.error("Error sending conversation update", ex);
        }
    }

    private String resolveAdminTarget(String currentUserId) {
        if (supportAdminKeycloakId == null || supportAdminKeycloakId.isBlank() || "none".equals(supportAdminKeycloakId)) {
            log.warn("Admin support ID not configured. Falling back to self-chat placeholder.");
            return "system-admin-placeholder";
        }
        
        if (currentUserId.equals(supportAdminKeycloakId)) {
            log.info("Admin {} is initiating support chat. Using placeholder to avoid self-chat.", currentUserId);
            return "system-admin-self-support";
        }
        
        return supportAdminKeycloakId;
    }

    private void sendReadReceiptNotification(String conversationId, String readerUserId) {
        String destination = WebSocketTopics.CONVERSATION + conversationId + WebSocketTopics.READ_RECEIPT;
        Map<String, Object> readReceipt = new HashMap<>();
        readReceipt.put("readerId", readerUserId);
        readReceipt.put("readAt", LocalDateTime.now().toString());
        messagingTemplate.convertAndSend(destination, readReceipt);
    }

    private void sendSystemMessage(ConversationEntity conversation, String actorUserId, String actionText) {
        String content = actorUserId + " " + actionText;
        ChatMessageEntity systemMessage = new ChatMessageEntity();
        systemMessage.setConversation(conversation);
        systemMessage.setSenderId(actorUserId);
        systemMessage.setContent(content);
        systemMessage.setMessageType(MessageType.SYSTEM);
        systemMessage.setIsRead(true);
        ChatMessageEntity saved = chatMessageRepository.save(systemMessage);
        sendRealTimeMessage(saved);
    }

    /**
     * Persist conversations with Keycloak {@code sub}, never raw email. Resolves email via account-service when needed.
     */
    private String normalizeParticipantIdForStorage(String id) {
        if (id == null || !id.contains("@") || id.startsWith("GUEST-")) {
            return id;
        }
        try {
            ApiResponse<AccountClient.PublicUserProfile> res = accountClient.getPublicProfileByIdentifier(id);
            if (res != null && res.success() && res.data() != null && res.data().keycloakId() != null) {
                log.debug("Normalized participant id (email) to keycloakId for storage");
                return res.data().keycloakId();
            }
        } catch (Exception ex) {
            log.warn("Could not normalize participant id {}: {}", id, ex.getMessage());
        }
        return id;
    }

    private AccountClient.PublicUserProfile fetchProfileSafe(String userId) {
        if (userId == null) return null;
        
        // Handle virtual IDs locally
        if ("admin-support".equals(userId) || "admin-keycloak-id-0000".equals(userId)) {
            return new AccountClient.PublicUserProfile(userId, "Admin Support", null, null);
        }

        try {
            ApiResponse<AccountClient.PublicUserProfile> res = accountClient.getPublicProfileByIdentifier(userId);
            if (res != null && res.success() && res.data() != null) {
                return res.data();
            }
        } catch (Exception ex) {
            log.warn("Failed to fetch profile for user {}: {}", userId, ex.getMessage());
        }
        if (userId.startsWith("GUEST-")) {
            return new AccountClient.PublicUserProfile(userId, "Anonymous Guest", null, null);
        }
        return null;
    }

    private Map<String, AccountClient.PublicUserProfile> fetchProfilesSafe(Set<String> userIds) {
        if (userIds == null || userIds.isEmpty()) return Collections.emptyMap();

        Map<String, AccountClient.PublicUserProfile> result = new HashMap<>();
        Set<String> realIds = new HashSet<>();

        for (String id : userIds) {
            if ("admin-support".equals(id) || "admin-keycloak-id-0000".equals(id)) {
                result.put(id, new AccountClient.PublicUserProfile(id, "Admin Support", null, null));
            } else {
                realIds.add(id);
            }
        }

        if (!realIds.isEmpty()) {
            try {
                ApiResponse<List<AccountClient.PublicUserProfile>> res = accountClient.getPublicProfilesByIdentifiers(new AccountClient.BatchRequest(new ArrayList<>(realIds)));
                if (res != null && res.success() && res.data() != null) {
                    res.data().forEach(p -> result.put(p.keycloakId(), p));
                }
            } catch (Exception ex) {
                log.warn("Failed to batch fetch profiles: {}", ex.getMessage());
            }
        }

        for (String id : userIds) {
            if (id != null && id.startsWith("GUEST-") && !result.containsKey(id)) {
                result.put(id, new AccountClient.PublicUserProfile(id, "Anonymous Guest", null, null));
            }
        }

        return result;
    }
}

