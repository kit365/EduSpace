package com.eduspace.conversationservice.business.serviceimpl;

import com.eduspace.conversationservice.business.service.OutboxService;
import com.eduspace.conversationservice.business.service.VideoCallNotificationService;
import com.eduspace.conversationservice.model.entity.ConversationEntity;
import com.eduspace.conversationservice.model.entity.VideoCallEntity;
import com.eduspace.conversationservice.persistence.repository.ConversationRepository;
import com.eduspace.conversationservice.persistence.repository.VideoCallRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VideoCallServiceImplTest {

    // ── Mocks ─────────────────────────────────────────────────────────────────
    @Mock ConversationRepository       conversationRepository;
    @Mock VideoCallRepository          videoCallRepository;
    @Mock VideoCallNotificationService notificationService;
    @Mock OutboxService                outboxService;

    @InjectMocks
    VideoCallServiceImpl videoCallService;

    // ── Fixtures ──────────────────────────────────────────────────────────────
    private static final String CALLER   = "caller-uuid";
    private static final String RECEIVER = "receiver-uuid";
    private static final String CONV_ID  = "conv-id-1";
    private static final String SESSION  = "session-uuid-abc";

    private ConversationEntity conversation;
    private VideoCallEntity    initiatedCall;

    @BeforeEach
    void setUp() {
        conversation = ConversationEntity.builder()
                .user1Id(CALLER)
                .user2Id(RECEIVER)
                .isActive(true)
                .videoCallEnabled(true)
                .callHistoryCount(0)
                .build();
        ReflectionTestUtils.setField(conversation, "id", CONV_ID);

        initiatedCall = VideoCallEntity.builder()
                .conversation(conversation)
                .callerId(CALLER)
                .receiverId(RECEIVER)
                .callSessionId(SESSION)
                .callStatus(VideoCallEntity.CallStatus.INITIATED)
                .isSuccessful(false)
                .build();
        ReflectionTestUtils.setField(initiatedCall, "id", "call-id-1");
    }

    // =========================================================================
    // initiate
    // =========================================================================
    @Nested
    @DisplayName("initiate")
    class Initiate {

        @Test
        @DisplayName("Creates a new call and notifies receiver")
        void createsCallAndNotifies() {
            when(conversationRepository.findById(CONV_ID)).thenReturn(Optional.of(conversation));
            when(videoCallRepository.findStaleInitiatedCalls(any())).thenReturn(Collections.emptyList());
            when(videoCallRepository.findActiveCallsForUser(CALLER)).thenReturn(Collections.emptyList());
            when(videoCallRepository.save(any())).thenReturn(initiatedCall);
            when(conversationRepository.save(any())).thenReturn(conversation);

            var result = videoCallService.initiate(CONV_ID, CALLER);

            assertThat(result).isNotNull();
            assertThat(result.getCallStatus()).isEqualTo(VideoCallEntity.CallStatus.INITIATED);
            assertThat(result.getCallerId()).isEqualTo(CALLER);
            assertThat(result.getReceiverId()).isEqualTo(RECEIVER);
            verify(notificationService).sendIncomingCall(any(VideoCallEntity.class));
            verify(outboxService).addEvent(eq("VideoCall"), anyString(), eq("CallInitiated"), anyMap());
        }

        @Test
        @DisplayName("Cleans up stale INITIATED calls before creating a new one")
        void cleansUpStaleCalls() {
            VideoCallEntity staleCall = VideoCallEntity.builder()
                    .conversation(conversation)
                    .callerId("some-other")
                    .receiverId(RECEIVER)
                    .callSessionId("old-session")
                    .callStatus(VideoCallEntity.CallStatus.INITIATED)
                    .isSuccessful(false)
                    .build();
            when(conversationRepository.findById(CONV_ID)).thenReturn(Optional.of(conversation));
            when(videoCallRepository.findStaleInitiatedCalls(any())).thenReturn(List.of(staleCall));
            when(videoCallRepository.save(staleCall)).thenReturn(staleCall);
            when(videoCallRepository.findActiveCallsForUser(CALLER)).thenReturn(Collections.emptyList());
            when(videoCallRepository.save(argThat(c -> c != staleCall))).thenReturn(initiatedCall);
            when(conversationRepository.save(any())).thenReturn(conversation);

            videoCallService.initiate(CONV_ID, CALLER);

            assertThat(staleCall.getCallStatus()).isEqualTo(VideoCallEntity.CallStatus.FAILED);
        }

        @Test
        @DisplayName("Throws when conversation not found")
        void throwsWhenConversationNotFound() {
            when(conversationRepository.findById("bad-id")).thenReturn(Optional.empty());

            assertThatThrownBy(() -> videoCallService.initiate("bad-id", CALLER))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("not found");
        }

        @Test
        @DisplayName("Throws when caller is not a participant")
        void throwsWhenNotParticipant() {
            when(conversationRepository.findById(CONV_ID)).thenReturn(Optional.of(conversation));

            assertThatThrownBy(() -> videoCallService.initiate(CONV_ID, "outsider"))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("Forbidden");
        }

        @Test
        @DisplayName("Throws when video calls are disabled for conversation")
        void throwsWhenVideoCallsDisabled() {
            conversation.setVideoCallEnabled(false);
            when(conversationRepository.findById(CONV_ID)).thenReturn(Optional.of(conversation));

            assertThatThrownBy(() -> videoCallService.initiate(CONV_ID, CALLER))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("disabled");
        }

        @Test
        @DisplayName("Throws when caller already has an active call")
        void throwsWhenCallerAlreadyInCall() {
            when(conversationRepository.findById(CONV_ID)).thenReturn(Optional.of(conversation));
            when(videoCallRepository.findStaleInitiatedCalls(any())).thenReturn(Collections.emptyList());
            when(videoCallRepository.findActiveCallsForUser(CALLER)).thenReturn(List.of(initiatedCall));

            assertThatThrownBy(() -> videoCallService.initiate(CONV_ID, CALLER))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("ongoing call");
        }
    }

    // =========================================================================
    // answer
    // =========================================================================
    @Nested
    @DisplayName("answer")
    class Answer {

        @Test
        @DisplayName("Transitions call from INITIATED to ACCEPTED")
        void acceptsInitiatedCall() {
            when(videoCallRepository.findByCallSessionId(SESSION)).thenReturn(Optional.of(initiatedCall));
            when(videoCallRepository.save(any())).thenReturn(initiatedCall);

            var result = videoCallService.answer(SESSION, RECEIVER);

            assertThat(result.getCallStatus()).isEqualTo(VideoCallEntity.CallStatus.ACCEPTED);
            verify(notificationService).sendCallAccepted(any(VideoCallEntity.class));
            verify(outboxService).addEvent(eq("VideoCall"), anyString(), eq("CallAccepted"), anyMap());
        }

        @Test
        @DisplayName("Throws when call is not in INITIATED state")
        void throwsWhenNotInitiated() {
            initiatedCall.acceptCall(); // move to ACCEPTED already
            when(videoCallRepository.findByCallSessionId(SESSION)).thenReturn(Optional.of(initiatedCall));

            assertThatThrownBy(() -> videoCallService.answer(SESSION, RECEIVER))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("cannot be answered");
        }

        @Test
        @DisplayName("Throws when actor is not a participant")
        void throwsWhenNotParticipant() {
            when(videoCallRepository.findByCallSessionId(SESSION)).thenReturn(Optional.of(initiatedCall));

            assertThatThrownBy(() -> videoCallService.answer(SESSION, "intruder"))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("Forbidden");
        }

        @Test
        @DisplayName("Throws when call session not found")
        void throwsWhenCallNotFound() {
            when(videoCallRepository.findByCallSessionId("bad-session")).thenReturn(Optional.empty());

            assertThatThrownBy(() -> videoCallService.answer("bad-session", RECEIVER))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("not found");
        }
    }

    // =========================================================================
    // decline
    // =========================================================================
    @Nested
    @DisplayName("decline")
    class Decline {

        @Test
        @DisplayName("Transitions call to DECLINED and records reason")
        void declinesCall() {
            when(videoCallRepository.findByCallSessionId(SESSION)).thenReturn(Optional.of(initiatedCall));
            when(videoCallRepository.save(any())).thenReturn(initiatedCall);

            var result = videoCallService.decline(SESSION, RECEIVER, "Busy");

            assertThat(result.getCallStatus()).isEqualTo(VideoCallEntity.CallStatus.DECLINED);
            assertThat(result.getEndReason()).isEqualTo("Busy");
            assertThat(result.getEndedAt()).isNotNull();
            verify(notificationService).sendCallDeclined(any(VideoCallEntity.class), eq("Busy"));
            verify(outboxService).addEvent(eq("VideoCall"), anyString(), eq("CallDeclined"), anyMap());
        }

        @Test
        @DisplayName("Uses default reason when reason is null")
        void usesDefaultReason() {
            when(videoCallRepository.findByCallSessionId(SESSION)).thenReturn(Optional.of(initiatedCall));
            when(videoCallRepository.save(any())).thenReturn(initiatedCall);

            videoCallService.decline(SESSION, RECEIVER, null);

            assertThat(initiatedCall.getEndReason()).isEqualTo("User declined");
        }

        @Test
        @DisplayName("Throws Forbidden when non-participant tries to decline")
        void throwsWhenNotParticipant() {
            when(videoCallRepository.findByCallSessionId(SESSION)).thenReturn(Optional.of(initiatedCall));

            assertThatThrownBy(() -> videoCallService.decline(SESSION, "intruder", null))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("Forbidden");
        }
    }

    // =========================================================================
    // end
    // =========================================================================
    @Nested
    @DisplayName("end")
    class End {

        @Test
        @DisplayName("Transitions call to ENDED with duration and marks successful")
        void endsActiveCall() {
            // Put call in ACCEPTED state (active)
            initiatedCall.acceptCall();
            when(videoCallRepository.findByCallSessionId(SESSION)).thenReturn(Optional.of(initiatedCall));
            when(videoCallRepository.save(any())).thenReturn(initiatedCall);

            var result = videoCallService.end(SESSION, CALLER, "Done");

            assertThat(result.getCallStatus()).isEqualTo(VideoCallEntity.CallStatus.ENDED);
            assertThat(result.getEndedAt()).isNotNull();
            assertThat(result.getIsSuccessful()).isTrue();
            verify(notificationService).sendCallEnded(any(VideoCallEntity.class), eq("Done"));
            verify(outboxService).addEvent(eq("VideoCall"), anyString(), eq("CallEnded"), anyMap());
        }

        @Test
        @DisplayName("Is idempotent – second end() returns the same call without updating")
        void isIdempotentWhenAlreadyEnded() {
            initiatedCall.endCall("First end");
            when(videoCallRepository.findByCallSessionId(SESSION)).thenReturn(Optional.of(initiatedCall));

            var result = videoCallService.end(SESSION, CALLER, "Second end");

            assertThat(result.getCallStatus()).isEqualTo(VideoCallEntity.CallStatus.ENDED);
            verify(videoCallRepository, never()).save(any());
            verify(notificationService, never()).sendCallEnded(any(), any());
        }

        @Test
        @DisplayName("Throws Forbidden when non-participant tries to end the call")
        void throwsWhenNotParticipant() {
            when(videoCallRepository.findByCallSessionId(SESSION)).thenReturn(Optional.of(initiatedCall));

            assertThatThrownBy(() -> videoCallService.end(SESSION, "intruder", null))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("Forbidden");
        }
    }

    // =========================================================================
    // history
    // =========================================================================
    @Nested
    @DisplayName("history")
    class History {

        @Test
        @DisplayName("Returns call history for participant")
        void returnsHistoryForParticipant() {
            when(conversationRepository.findById(CONV_ID)).thenReturn(Optional.of(conversation));
            when(videoCallRepository.findCallsByConversation(CONV_ID)).thenReturn(List.of(initiatedCall));

            var result = videoCallService.history(CONV_ID, CALLER);

            assertThat(result).hasSize(1);
            assertThat(result.get(0).getCallSessionId()).isEqualTo(SESSION);
        }

        @Test
        @DisplayName("Returns empty list when no calls exist")
        void returnsEmptyWhenNoCalls() {
            when(conversationRepository.findById(CONV_ID)).thenReturn(Optional.of(conversation));
            when(videoCallRepository.findCallsByConversation(CONV_ID)).thenReturn(Collections.emptyList());

            var result = videoCallService.history(CONV_ID, RECEIVER);

            assertThat(result).isEmpty();
        }

        @Test
        @DisplayName("Throws Forbidden for non-participant")
        void throwsForNonParticipant() {
            when(conversationRepository.findById(CONV_ID)).thenReturn(Optional.of(conversation));

            assertThatThrownBy(() -> videoCallService.history(CONV_ID, "intruder"))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("Forbidden");
        }
    }

    // =========================================================================
    // getBySessionId
    // =========================================================================
    @Nested
    @DisplayName("getBySessionId")
    class GetBySessionId {

        @Test
        @DisplayName("Returns call for participant")
        void returnsCallForParticipant() {
            when(videoCallRepository.findByCallSessionId(SESSION)).thenReturn(Optional.of(initiatedCall));

            var result = videoCallService.getBySessionId(SESSION, CALLER);

            assertThat(result.getCallSessionId()).isEqualTo(SESSION);
        }

        @Test
        @DisplayName("Throws when session not found")
        void throwsWhenNotFound() {
            when(videoCallRepository.findByCallSessionId("bad")).thenReturn(Optional.empty());

            assertThatThrownBy(() -> videoCallService.getBySessionId("bad", CALLER))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("not found");
        }

        @Test
        @DisplayName("Throws Forbidden for non-participant")
        void throwsForNonParticipant() {
            when(videoCallRepository.findByCallSessionId(SESSION)).thenReturn(Optional.of(initiatedCall));

            assertThatThrownBy(() -> videoCallService.getBySessionId(SESSION, "intruder"))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("Forbidden");
        }
    }
}
