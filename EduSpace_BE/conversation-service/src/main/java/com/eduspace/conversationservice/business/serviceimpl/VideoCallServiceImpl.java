package com.eduspace.conversationservice.business.serviceimpl;

import com.eduspace.conversationservice.business.service.ChatService;
import com.eduspace.conversationservice.business.service.OutboxService;
import com.eduspace.conversationservice.business.service.VideoCallNotificationService;
import com.eduspace.conversationservice.business.service.VideoCallService;
import com.eduspace.conversationservice.model.entity.ConversationEntity;
import com.eduspace.conversationservice.model.entity.VideoCallEntity;
import com.eduspace.conversationservice.persistence.repository.ConversationRepository;
import com.eduspace.conversationservice.persistence.repository.VideoCallRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class VideoCallServiceImpl implements VideoCallService {

    private final ConversationRepository conversationRepository;
    private final VideoCallRepository videoCallRepository;
    private final VideoCallNotificationService notificationService;
    private final OutboxService outboxService;

    @Override
    public VideoCallEntity initiate(String conversationId, String callerUserId) {
        ConversationEntity conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));
        if (!conversation.isParticipant(callerUserId)) throw new RuntimeException("Forbidden");
        if (!Boolean.TRUE.equals(conversation.getVideoCallEnabled())) throw new RuntimeException("Video calls disabled");

        String receiverId = conversation.otherUserId(callerUserId);
        if (receiverId == null) throw new RuntimeException("Receiver not found");

        // Cleanup stale INITIATED calls older than 5 minutes
        videoCallRepository.findStaleInitiatedCalls(LocalDateTime.now().minusMinutes(5))
                .forEach(call -> {
                    call.setCallStatus(VideoCallEntity.CallStatus.FAILED);
                    call.setEndedAt(LocalDateTime.now());
                    videoCallRepository.save(call);
                });

        // Prevent overlapping active calls for caller
        if (!videoCallRepository.findActiveCallsForUser(callerUserId).isEmpty()) {
            throw new RuntimeException("User already has an ongoing call");
        }

        VideoCallEntity call = VideoCallEntity.builder()
                .conversation(conversation)
                .callerId(callerUserId)
                .receiverId(receiverId)
                .callSessionId(UUID.randomUUID().toString())
                .callStatus(VideoCallEntity.CallStatus.INITIATED)
                .build();
        VideoCallEntity saved = videoCallRepository.save(call);

        conversation.incrementCallCount();
        conversationRepository.save(conversation);

        notificationService.sendIncomingCall(saved);
        outboxService.addEvent("VideoCall", saved.getId(), "CallInitiated",
                java.util.Map.of("callSessionId", saved.getCallSessionId(), "conversationId", conversationId,
                        "callerUserId", callerUserId, "receiverUserId", receiverId, "status", saved.getCallStatus().name()));
        return saved;
    }

    @Override
    public VideoCallEntity answer(String callSessionId, String actorUserId) {
        VideoCallEntity call = videoCallRepository.findByCallSessionId(callSessionId)
                .orElseThrow(() -> new RuntimeException("Call not found"));
        ensureParticipant(call, actorUserId);

        if (call.getCallStatus() != VideoCallEntity.CallStatus.INITIATED) {
            throw new RuntimeException("Call cannot be answered in state: " + call.getCallStatus());
        }

        call.acceptCall();
        VideoCallEntity saved = videoCallRepository.save(call);

        notificationService.sendCallAccepted(saved);
        outboxService.addEvent("VideoCall", saved.getId(), "CallAccepted",
                java.util.Map.of("callSessionId", saved.getCallSessionId(), "actorUserId", actorUserId));
        return saved;
    }

    @Override
    public VideoCallEntity decline(String callSessionId, String actorUserId, String reason) {
        VideoCallEntity call = videoCallRepository.findByCallSessionId(callSessionId)
                .orElseThrow(() -> new RuntimeException("Call not found"));
        ensureParticipant(call, actorUserId);

        call.declineCall(reason == null ? "User declined" : reason);
        VideoCallEntity saved = videoCallRepository.save(call);

        notificationService.sendCallDeclined(saved, reason);
        outboxService.addEvent("VideoCall", saved.getId(), "CallDeclined",
                java.util.Map.of("callSessionId", saved.getCallSessionId(), "actorUserId", actorUserId, "reason", reason));
        return saved;
    }

    @Override
    public VideoCallEntity end(String callSessionId, String actorUserId, String reason) {
        VideoCallEntity call = videoCallRepository.findByCallSessionId(callSessionId)
                .orElseThrow(() -> new RuntimeException("Call not found"));
        ensureParticipant(call, actorUserId);

        if (call.getCallStatus() == VideoCallEntity.CallStatus.ENDED) return call;

        call.endCall(reason == null ? "User ended call" : reason);
        VideoCallEntity saved = videoCallRepository.save(call);

        notificationService.sendCallEnded(saved, reason);
        outboxService.addEvent("VideoCall", saved.getId(), "CallEnded",
                java.util.Map.of("callSessionId", saved.getCallSessionId(), "actorUserId", actorUserId, "reason", reason,
                        "durationMinutes", saved.getDurationMinutes()));
        return saved;
    }

    @Override
    @Transactional(readOnly = true)
    public List<VideoCallEntity> history(String conversationId, String actorUserId) {
        ConversationEntity conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));
        if (!conversation.isParticipant(actorUserId)) throw new RuntimeException("Forbidden");
        return videoCallRepository.findCallsByConversation(conversationId);
    }

    @Override
    @Transactional(readOnly = true)
    public VideoCallEntity getBySessionId(String callSessionId, String actorUserId) {
        VideoCallEntity call = videoCallRepository.findByCallSessionId(callSessionId)
                .orElseThrow(() -> new RuntimeException("Call not found"));
        ensureParticipant(call, actorUserId);
        return call;
    }

    private void ensureParticipant(VideoCallEntity call, String actorUserId) {
        String caller = call.getCallerId();
        String receiver = call.getReceiverId();
        if (!actorUserId.equals(caller) && !actorUserId.equals(receiver)) {
            throw new RuntimeException("Forbidden");
        }
    }
}

