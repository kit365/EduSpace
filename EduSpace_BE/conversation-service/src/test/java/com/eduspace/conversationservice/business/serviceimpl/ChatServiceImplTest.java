package com.eduspace.conversationservice.business.serviceimpl;

import com.eduspace.conversationservice.business.service.OutboxService;
import com.eduspace.conversationservice.business.service.SagaService;
import com.eduspace.conversationservice.exception.AppException;
import com.eduspace.conversationservice.exception.ErrorCode;
import com.eduspace.conversationservice.infrastructure.client.AccountClient;
import com.eduspace.conversationservice.infrastructure.mapper.ChatMessageMapper;
import com.eduspace.conversationservice.infrastructure.mapper.ConversationMapper;
import com.eduspace.conversationservice.infrastructure.messaging.producer.ChatEventProducer;
import com.eduspace.conversationservice.model.dto.response.ApiResponse;
import com.eduspace.conversationservice.model.dto.response.ChatMessageResponse;
import com.eduspace.conversationservice.model.dto.response.ConversationResponse;
import com.eduspace.conversationservice.model.entity.ChatMessageEntity;
import com.eduspace.conversationservice.model.entity.ConversationEntity;
import com.eduspace.conversationservice.model.entity.SagaInstanceEntity;
import com.eduspace.conversationservice.model.entity.StaffAssignmentOfferEntity;
import com.eduspace.conversationservice.model.enums.MessageType;
import com.eduspace.conversationservice.model.event.DomainEventConstants;
import com.eduspace.conversationservice.persistence.repository.ChatMessageRepository;
import com.eduspace.conversationservice.persistence.repository.ConversationRepository;
import com.eduspace.conversationservice.persistence.repository.StaffAssignmentOfferRepository;
import com.eduspace.conversationservice.persistence.repository.VideoCallRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ChatServiceImplTest {

    @Mock ConversationRepository conversationRepository;
    @Mock ChatMessageRepository chatMessageRepository;
    @Mock VideoCallRepository videoCallRepository;
    @Mock AccountClient accountClient;
    @Mock SimpMessagingTemplate messagingTemplate;
    @Mock OutboxService outboxService;
    @Mock SagaService sagaService;
    @Mock ChatEventProducer chatEventProducer;
    @Mock ConversationMapper conversationMapper;
    @Mock ChatMessageMapper chatMessageMapper;
    @Mock StaffAssignmentOfferRepository offerRepository;

    ChatServiceImpl chatService;

    private static final String USER_A = "user-a-uuid";
    private static final String USER_B = "user-b-uuid";

    private ConversationEntity conversation;
    private SagaInstanceEntity saga;
    private AccountClient.PublicUserProfile profileA;
    private AccountClient.PublicUserProfile profileB;

    @BeforeEach
    void setUp() {
        chatService = new ChatServiceImpl(
                conversationRepository,
                chatMessageRepository,
                videoCallRepository,
                accountClient,
                messagingTemplate,
                outboxService,
                sagaService,
                chatEventProducer,
                conversationMapper,
                chatMessageMapper,
                offerRepository
        );
        ReflectionTestUtils.setField(chatService, "supportAdminKeycloakId", "admin-keycloak-id-0000");

        conversation = ConversationEntity.builder()
                .user1Id(USER_A)
                .user2Id(USER_B)
                .conversationName("Chat: A & B")
                .isActive(true)
                .isAdminConversation(false)
                .videoCallEnabled(true)
                .build();
        ReflectionTestUtils.setField(conversation, "id", "conv-1");

        saga = SagaInstanceEntity.builder()
                .sagaType("TestSaga")
                .currentStep("STEP_1")
                .build();
        ReflectionTestUtils.setField(saga, "id", "saga-1");

        profileA = new AccountClient.PublicUserProfile(USER_A, "Alice", "alice@test.com", null);
        profileB = new AccountClient.PublicUserProfile(USER_B, "Bob", "bob@test.com", null);
    }

    private void stubProfileLookups() {
        when(accountClient.getPublicProfileByIdentifier(USER_A)).thenReturn(ApiResponse.success(profileA));
        when(accountClient.getPublicProfileByIdentifier(USER_B)).thenReturn(ApiResponse.success(profileB));
    }

    @Nested
    @DisplayName("getOrCreateConversation")
    class GetOrCreateConversation {

        @Test
        @DisplayName("Creates a new conversation when none exists")
        void createsNewConversation() {
            when(conversationRepository.findConversationBetween(USER_A, USER_B, false)).thenReturn(Optional.empty());
            stubProfileLookups();
            when(conversationMapper.toEntity(eq(USER_A), eq(USER_B), anyString(), eq(false), eq(true), isNull()))
                    .thenReturn(conversation);
            when(conversationRepository.save(any(ConversationEntity.class))).thenReturn(conversation);
            when(chatMessageRepository.countByConversationAndIsDeletedFalseAndIsReadFalseAndSenderIdNot(eq(conversation), eq(USER_A)))
                    .thenReturn(0);
            when(chatMessageRepository.findByConversationAndIsDeletedFalseOrderBySentAtDesc(eq(conversation), eq(PageRequest.of(0, 1))))
                    .thenReturn(new PageImpl<>(List.of()));
            when(conversationMapper.toResponse(any(ConversationEntity.class), eq(USER_A), nullable(ConversationResponse.OtherUser.class), eq(0), anyString()))
                    .thenReturn(ConversationResponse.builder().conversationId("conv-1").build());

            var result = chatService.getOrCreateConversation(USER_A, USER_B, false);

            assertThat(result).isNotNull();
            assertThat(result.getConversationId()).isEqualTo("conv-1");
            verify(conversationRepository).save(any(ConversationEntity.class));
            verify(outboxService).addEvent(eq(DomainEventConstants.AGGREGATE_CONVERSATION), anyString(),
                    eq(DomainEventConstants.CONVERSATION_CREATED), anyMap());
            verifyNoInteractions(sagaService);
        }

        @Test
        @DisplayName("Returns existing conversation when one already exists")
        void returnsExistingConversation() {
            when(conversationRepository.findConversationBetween(USER_A, USER_B, false)).thenReturn(Optional.of(conversation));
            when(accountClient.getPublicProfileByIdentifier(USER_B)).thenReturn(ApiResponse.success(profileB));
            when(chatMessageRepository.countByConversationAndIsDeletedFalseAndIsReadFalseAndSenderIdNot(eq(conversation), eq(USER_A)))
                    .thenReturn(0);
            when(chatMessageRepository.findByConversationAndIsDeletedFalseOrderBySentAtDesc(eq(conversation), eq(PageRequest.of(0, 1))))
                    .thenReturn(new PageImpl<>(List.of()));
            when(conversationMapper.toResponse(any(ConversationEntity.class), eq(USER_A), nullable(ConversationResponse.OtherUser.class), eq(0), anyString()))
                    .thenReturn(ConversationResponse.builder().conversationId("conv-1").build());

            var result = chatService.getOrCreateConversation(USER_A, USER_B, false);

            assertThat(result.getConversationId()).isEqualTo("conv-1");
            verify(conversationRepository, never()).save(any());
        }

        @Test
        @DisplayName("Throws when user tries to create conversation with themselves")
        void throwsWhenSameUser() {
            assertThatThrownBy(() -> chatService.getOrCreateConversation(USER_A, USER_A, false))
                    .isInstanceOf(AppException.class)
                    .extracting(ex -> ((AppException) ex).getErrorCode())
                    .isEqualTo(ErrorCode.SELF_CHAT_NOT_ALLOWED);
        }

        @Test
        @DisplayName("Throws when AccountClient cannot resolve either profile")
        void failsWhenUserNotFound() {
            when(conversationRepository.findConversationBetween(USER_A, USER_B, false)).thenReturn(Optional.empty());
            when(accountClient.getPublicProfileByIdentifier(anyString())).thenReturn(ApiResponse.success(null));

            assertThatThrownBy(() -> chatService.getOrCreateConversation(USER_A, USER_B, false))
                    .isInstanceOf(AppException.class)
                    .extracting(ex -> ((AppException) ex).getErrorCode())
                    .isEqualTo(ErrorCode.USER_NOT_FOUND);

            verifyNoInteractions(sagaService);
        }

        @Test
        @DisplayName("Rejects guest/system ids for normal conversation")
        void rejectsReservedPeerForNormalConversation() {
            assertThatThrownBy(() -> chatService.getOrCreateConversation(USER_A, "GUEST-1234", false))
                    .isInstanceOf(AppException.class)
                    .extracting(ex -> ((AppException) ex).getErrorCode())
                    .isEqualTo(ErrorCode.INVALID_REQUEST);
        }
    }

    @Nested
    @DisplayName("sendMessage")
    class SendMessage {

        private ChatMessageEntity savedMessage;

        @BeforeEach
        void setup() {
            savedMessage = ChatMessageEntity.builder()
                    .conversation(conversation)
                    .senderId(USER_A)
                    .content("Hello")
                    .messageType(MessageType.TEXT)
                    .isRead(false)
                    .isDeleted(false)
                    .build();
            ReflectionTestUtils.setField(savedMessage, "id", "msg-1");
        }

        @Test
        @DisplayName("Persists message and returns response")
        void persistsMessage() {
            when(sagaService.startSaga(anyString(), anyString(), anyMap())).thenReturn(saga);
            when(conversationRepository.findById("conv-1")).thenReturn(Optional.of(conversation));
            when(chatMessageRepository.save(any())).thenReturn(savedMessage);
            when(conversationRepository.save(any())).thenReturn(conversation);
            when(accountClient.getPublicProfileByIdentifier(USER_A)).thenReturn(ApiResponse.success(profileA));
            when(accountClient.getPublicProfilesByIdentifiers(any(AccountClient.BatchRequest.class)))
                    .thenReturn(ApiResponse.success(List.of(profileA)));
            when(chatMessageMapper.toResponse(eq(savedMessage), anyMap()))
                    .thenReturn(ChatMessageResponse.builder().messageId("msg-1").build());

            var result = chatService.sendMessage("conv-1", USER_A, "Hello", MessageType.TEXT);

            assertThat(result).isNotNull();
            assertThat(result.getMessageId()).isEqualTo("msg-1");
            verify(chatMessageRepository).save(any(ChatMessageEntity.class));
            verify(sagaService).completeSaga("saga-1");
        }

        @Test
        @DisplayName("Throws when conversation is blocked")
        void throwsWhenBlocked() {
            conversation.blockBy(USER_A);
            when(conversationRepository.findById("conv-1")).thenReturn(Optional.of(conversation));

            assertThatThrownBy(() -> chatService.sendMessage("conv-1", USER_A, "Hi", MessageType.TEXT))
                    .isInstanceOf(AppException.class)
                    .extracting(ex -> ((AppException) ex).getErrorCode())
                    .isEqualTo(ErrorCode.CONVERSATION_BLOCKED);

            verifyNoInteractions(sagaService);
        }

        @Test
        @DisplayName("Throws when sender is not a participant")
        void throwsWhenNotParticipant() {
            when(conversationRepository.findById("conv-1")).thenReturn(Optional.of(conversation));

            assertThatThrownBy(() -> chatService.sendMessage("conv-1", "outsider-id", "Hi", MessageType.TEXT))
                    .isInstanceOf(AppException.class)
                    .extracting(ex -> ((AppException) ex).getErrorCode())
                    .isEqualTo(ErrorCode.ACCESS_DENIED);

            verifyNoInteractions(sagaService);
        }

        @Test
        @DisplayName("Throws when conversation not found")
        void throwsWhenConversationNotFound() {
            when(conversationRepository.findById("unknown")).thenReturn(Optional.empty());

            assertThatThrownBy(() -> chatService.sendMessage("unknown", USER_A, "Hi", MessageType.TEXT))
                    .isInstanceOf(AppException.class)
                    .extracting(ex -> ((AppException) ex).getErrorCode())
                    .isEqualTo(ErrorCode.CONVERSATION_NOT_FOUND);

            verifyNoInteractions(sagaService);
        }
    }

    @Nested
    @DisplayName("markMessagesAsRead")
    class MarkMessagesAsRead {

        @Test
        @DisplayName("Sends read receipt when messages were updated")
        void sendsReadReceiptWhenUpdated() {
            when(conversationRepository.findById("conv-1")).thenReturn(Optional.of(conversation));
            when(chatMessageRepository.markMessagesAsRead(any(), eq(USER_A), any())).thenReturn(3);

            chatService.markMessagesAsRead("conv-1", USER_A);

            verify(messagingTemplate).convertAndSend(contains("/read-receipt"), any(Object.class));
            verify(outboxService).addEvent(eq(DomainEventConstants.AGGREGATE_CONVERSATION), anyString(),
                    eq(DomainEventConstants.MESSAGE_READ), anyMap());
        }

        @Test
        @DisplayName("Does NOT send read receipt when nothing was updated")
        void doesNotSendReceiptWhenNothingUpdated() {
            when(conversationRepository.findById("conv-1")).thenReturn(Optional.of(conversation));
            when(chatMessageRepository.markMessagesAsRead(any(), eq(USER_A), any())).thenReturn(0);

            chatService.markMessagesAsRead("conv-1", USER_A);

            verify(messagingTemplate, never()).convertAndSend(anyString(), any(Object.class));
        }

        @Test
        @DisplayName("Throws when reader is not a participant")
        void throwsWhenNotParticipant() {
            when(conversationRepository.findById("conv-1")).thenReturn(Optional.of(conversation));

            assertThatThrownBy(() -> chatService.markMessagesAsRead("conv-1", "outsider"))
                    .isInstanceOf(AppException.class)
                    .extracting(ex -> ((AppException) ex).getErrorCode())
                    .isEqualTo(ErrorCode.ACCESS_DENIED);
        }
    }

    @Nested
    @DisplayName("getUnreadMessageCount")
    class GetUnreadMessageCount {

        @Test
        @DisplayName("Returns correct count for participant")
        void returnsCorrectCount() {
            when(conversationRepository.findById("conv-1")).thenReturn(Optional.of(conversation));
            when(chatMessageRepository.countByConversationAndIsDeletedFalseAndIsReadFalseAndSenderIdNot(conversation, USER_A))
                    .thenReturn(5);

            int count = chatService.getUnreadMessageCount("conv-1", USER_A);

            assertThat(count).isEqualTo(5);
        }

        @Test
        @DisplayName("Throws Forbidden for non-participant")
        void throwsForNonParticipant() {
            when(conversationRepository.findById("conv-1")).thenReturn(Optional.of(conversation));

            assertThatThrownBy(() -> chatService.getUnreadMessageCount("conv-1", "stranger"))
                    .isInstanceOf(AppException.class)
                    .extracting(ex -> ((AppException) ex).getErrorCode())
                    .isEqualTo(ErrorCode.ACCESS_DENIED);
        }
    }

    @Nested
    @DisplayName("deleteMessage")
    class DeleteMessage {

        @Test
        @DisplayName("Soft-deletes message owned by sender")
        void softDeletesMessage() {
            ChatMessageEntity msg = ChatMessageEntity.builder()
                    .conversation(conversation)
                    .senderId(USER_A)
                    .content("Hello")
                    .messageType(MessageType.TEXT)
                    .isDeleted(false)
                    .build();
            ReflectionTestUtils.setField(msg, "id", "msg-del-1");
            when(chatMessageRepository.findById("msg-del-1")).thenReturn(Optional.of(msg));
            when(chatMessageRepository.save(any())).thenReturn(msg);

            chatService.deleteMessage("msg-del-1", USER_A);

            assertThat(msg.getIsDeleted()).isTrue();
            verify(chatMessageRepository).save(msg);
            verify(messagingTemplate).convertAndSend(contains("/deleted"), any(Object.class));
        }

        @Test
        @DisplayName("Throws when deleter is not the sender")
        void throwsWhenNotOwner() {
            ChatMessageEntity msg = ChatMessageEntity.builder()
                    .conversation(conversation)
                    .senderId(USER_A)
                    .content("Hello")
                    .messageType(MessageType.TEXT)
                    .isDeleted(false)
                    .build();
            ReflectionTestUtils.setField(msg, "id", "msg-del-2");
            when(chatMessageRepository.findById("msg-del-2")).thenReturn(Optional.of(msg));

            assertThatThrownBy(() -> chatService.deleteMessage("msg-del-2", USER_B))
                    .isInstanceOf(AppException.class)
                    .extracting(ex -> ((AppException) ex).getErrorCode())
                    .isEqualTo(ErrorCode.ONLY_OWNER_CAN_DELETE);
        }
    }

    @Nested
    @DisplayName("editMessage")
    class EditMessage {

        @Test
        @DisplayName("Updates content for message owner")
        void updatesContent() {
            ChatMessageEntity msg = ChatMessageEntity.builder()
                    .conversation(conversation)
                    .senderId(USER_A)
                    .content("Old content")
                    .messageType(MessageType.TEXT)
                    .isDeleted(false)
                    .build();
            ReflectionTestUtils.setField(msg, "id", "msg-edit-1");
            when(chatMessageRepository.findById("msg-edit-1")).thenReturn(Optional.of(msg));
            when(chatMessageRepository.save(any())).thenReturn(msg);

            chatService.editMessage("msg-edit-1", "New content", USER_A);

            assertThat(msg.getContent()).isEqualTo("New content");
            assertThat(msg.getEditedAt()).isNotNull();
            verify(messagingTemplate).convertAndSend(contains("/edited"), any(Object.class));
        }

        @Test
        @DisplayName("Throws when editor is not the sender")
        void throwsWhenNotOwner() {
            ChatMessageEntity msg = ChatMessageEntity.builder()
                    .conversation(conversation)
                    .senderId(USER_A)
                    .content("Old content")
                    .messageType(MessageType.TEXT)
                    .isDeleted(false)
                    .build();
            ReflectionTestUtils.setField(msg, "id", "msg-edit-2");
            when(chatMessageRepository.findById("msg-edit-2")).thenReturn(Optional.of(msg));

            assertThatThrownBy(() -> chatService.editMessage("msg-edit-2", "New content", USER_B))
                    .isInstanceOf(AppException.class)
                    .extracting(ex -> ((AppException) ex).getErrorCode())
                    .isEqualTo(ErrorCode.ONLY_OWNER_CAN_EDIT);
        }
    }

    @Nested
    @DisplayName("addReactionToMessage")
    class AddReaction {

        @Test
        @DisplayName("Adds a reaction to a message with no existing reactions")
        void addsReactionToEmptyMessage() {
            ChatMessageEntity msg = ChatMessageEntity.builder()
                    .conversation(conversation)
                    .senderId(USER_A)
                    .content("Nice!")
                    .messageType(MessageType.TEXT)
                    .reactions(null)
                    .isDeleted(false)
                    .build();
            ReflectionTestUtils.setField(msg, "id", "msg-react-1");
            when(chatMessageRepository.findById("msg-react-1")).thenReturn(Optional.of(msg));
            when(chatMessageRepository.save(any())).thenReturn(msg);

            chatService.addReactionToMessage("msg-react-1", USER_B, "👍");

            assertThat(msg.getReactions()).containsEntry("👍", List.of(USER_B));
            verify(messagingTemplate).convertAndSend(contains("/reaction"), any(Object.class));
        }

        @Test
        @DisplayName("Appends a reaction when reactions already exist")
        void appendsReactionToExisting() {
            Map<String, List<String>> existing = new HashMap<>();
            existing.put("❤️", new java.util.ArrayList<>(List.of(USER_A)));
            ChatMessageEntity msg = ChatMessageEntity.builder()
                    .conversation(conversation)
                    .senderId(USER_A)
                    .content("Nice!")
                    .messageType(MessageType.TEXT)
                    .reactions(existing)
                    .isDeleted(false)
                    .build();
            ReflectionTestUtils.setField(msg, "id", "msg-react-2");
            when(chatMessageRepository.findById("msg-react-2")).thenReturn(Optional.of(msg));
            when(chatMessageRepository.save(any())).thenReturn(msg);

            chatService.addReactionToMessage("msg-react-2", USER_B, "👍");

            assertThat(msg.getReactions()).containsKeys("❤️", "👍");
            assertThat(msg.getReactions().get("👍")).contains(USER_B);
        }
    }

    @Nested
    @DisplayName("blockUser and unblockUser")
    class BlockUnblock {

        @Test
        @DisplayName("Blocks the conversation for participant")
        void blocksConversation() {
            when(conversationRepository.findById("conv-1")).thenReturn(Optional.of(conversation));
            when(conversationRepository.save(any())).thenReturn(conversation);
            when(chatMessageRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            chatService.blockUser("conv-1", USER_A);

            assertThat(conversation.isBlocked()).isTrue();
            assertThat(conversation.isBlockedBy(USER_A)).isTrue();
            verify(outboxService).addEvent(eq(DomainEventConstants.AGGREGATE_CONVERSATION), anyString(),
                    eq(DomainEventConstants.CONVERSATION_BLOCKED), anyMap());
        }

        @Test
        @DisplayName("Unblocks a previously blocked conversation")
        void unblocksConversation() {
            conversation.blockBy(USER_A);
            assertThat(conversation.isBlocked()).isTrue();

            when(conversationRepository.findById("conv-1")).thenReturn(Optional.of(conversation));
            when(conversationRepository.save(any())).thenReturn(conversation);
            when(chatMessageRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            chatService.unblockUser("conv-1", USER_A);

            assertThat(conversation.isBlocked()).isFalse();
            verify(outboxService).addEvent(eq(DomainEventConstants.AGGREGATE_CONVERSATION), anyString(),
                    eq(DomainEventConstants.CONVERSATION_UNBLOCKED), anyMap());
        }

        @Test
        @DisplayName("Throws Forbidden when non-participant tries to block")
        void throwsWhenNotParticipant() {
            when(conversationRepository.findById("conv-1")).thenReturn(Optional.of(conversation));

            assertThatThrownBy(() -> chatService.blockUser("conv-1", "intruder"))
                    .isInstanceOf(AppException.class)
                    .extracting(ex -> ((AppException) ex).getErrorCode())
                    .isEqualTo(ErrorCode.ACCESS_DENIED);
        }
    }

    @Nested
    @DisplayName("getChatHistory")
    class GetChatHistory {

        @Test
        @DisplayName("Returns paginated message list enriched with sender profiles")
        void returnsPaginatedMessages() {
            ChatMessageEntity msg = ChatMessageEntity.builder()
                    .conversation(conversation)
                    .senderId(USER_A)
                    .content("Hello")
                    .messageType(MessageType.TEXT)
                    .isDeleted(false)
                    .isRead(false)
                    .build();
            ReflectionTestUtils.setField(msg, "id", "msg-hist-1");

            when(conversationRepository.findById("conv-1")).thenReturn(Optional.of(conversation));
            when(chatMessageRepository.findByConversationAndIsDeletedFalseOrderBySentAtDesc(any(), any(Pageable.class)))
                    .thenReturn(new PageImpl<>(List.of(msg)));
            when(accountClient.getPublicProfilesByIdentifiers(any(AccountClient.BatchRequest.class)))
                    .thenReturn(ApiResponse.success(List.of(profileA)));
            when(chatMessageMapper.toResponse(eq(msg), anyMap()))
                    .thenReturn(ChatMessageResponse.builder()
                            .messageId("msg-hist-1")
                            .sender(ChatMessageResponse.Sender.builder().userId(USER_A).build())
                            .build());

            var history = chatService.getChatHistory("conv-1", 0, 50, USER_A);

            assertThat(history).hasSize(1);
            assertThat(history.get(0).getMessageId()).isEqualTo("msg-hist-1");
            assertThat(history.get(0).getSender()).isNotNull();
            assertThat(history.get(0).getSender().getUserId()).isEqualTo(USER_A);
        }
    }

    @Nested
    @DisplayName("acceptAssignmentOffer")
    class AcceptAssignmentOffer {
        @Test
        @DisplayName("Accepts pending offer and assigns admin to conversation")
        void acceptsPendingOffer() {
            conversation.setUser2Id("admin-keycloak-id-0000");
            conversation.setIsAdminConversation(true);
            StaffAssignmentOfferEntity offer = StaffAssignmentOfferEntity.builder()
                    .id("offer-1")
                    .conversationId("conv-1")
                    .sagaId("saga-1")
                    .staffId(USER_B)
                    .status(StaffAssignmentOfferEntity.Status.PENDING)
                    .expiresAt(LocalDateTime.now().plusMinutes(1))
                    .build();
            when(conversationRepository.findById("conv-1")).thenReturn(Optional.of(conversation));
            when(offerRepository.findByIdAndConversationId("offer-1", "conv-1")).thenReturn(Optional.of(offer));
            when(conversationRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
            when(offerRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
            when(offerRepository.findByConversationIdAndStatus("conv-1", StaffAssignmentOfferEntity.Status.PENDING))
                    .thenReturn(List.of(offer));
            when(accountClient.getPublicProfileByIdentifier(USER_A)).thenReturn(ApiResponse.success(profileA));
            when(chatMessageRepository.countByConversationAndIsDeletedFalseAndIsReadFalseAndSenderIdNot(any(), eq(USER_B)))
                    .thenReturn(0);
            when(chatMessageRepository.findByConversationAndIsDeletedFalseOrderBySentAtDesc(any(), any(PageRequest.class)))
                    .thenReturn(new PageImpl<>(List.of()));
            when(conversationMapper.toResponse(any(), eq(USER_B), any(), eq(0), anyString()))
                    .thenReturn(ConversationResponse.builder().conversationId("conv-1").build());

            ConversationResponse response = chatService.acceptAssignmentOffer("conv-1", "offer-1", USER_B);

            assertThat(response.getConversationId()).isEqualTo("conv-1");
            assertThat(conversation.getUser2Id()).isEqualTo(USER_B);
            assertThat(offer.getStatus()).isEqualTo(StaffAssignmentOfferEntity.Status.ACCEPTED);
            verify(sagaService).completeSaga("saga-1");
        }

        @Test
        @DisplayName("Rejects accept when another admin tries to accept")
        void rejectsWrongAdmin() {
            StaffAssignmentOfferEntity offer = StaffAssignmentOfferEntity.builder()
                    .id("offer-2")
                    .conversationId("conv-1")
                    .sagaId("saga-1")
                    .staffId(USER_B)
                    .status(StaffAssignmentOfferEntity.Status.PENDING)
                    .expiresAt(LocalDateTime.now().plusMinutes(1))
                    .build();
            when(conversationRepository.findById("conv-1")).thenReturn(Optional.of(conversation));
            when(offerRepository.findByIdAndConversationId("offer-2", "conv-1")).thenReturn(Optional.of(offer));

            assertThatThrownBy(() -> chatService.acceptAssignmentOffer("conv-1", "offer-2", "other-admin"))
                    .isInstanceOf(AppException.class)
                    .extracting(ex -> ((AppException) ex).getErrorCode())
                    .isEqualTo(ErrorCode.ACCESS_DENIED);
        }
    }
}
