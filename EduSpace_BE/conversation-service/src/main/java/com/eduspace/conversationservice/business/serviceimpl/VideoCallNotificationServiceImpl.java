package com.eduspace.conversationservice.business.serviceimpl;

import com.eduspace.conversationservice.business.service.VideoCallNotificationService;
import com.eduspace.conversationservice.model.entity.VideoCallEntity;
import com.eduspace.conversationservice.infrastructure.constants.WebSocketTopics;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class VideoCallNotificationServiceImpl implements VideoCallNotificationService {

    private final SimpMessagingTemplate messagingTemplate;

    @Override
    public void sendIncomingCall(VideoCallEntity call) {
        messagingTemplate.convertAndSend(WebSocketTopics.VIDEO_CALL, payload(call, "INCOMING_CALL", null));
    }

    @Override
    public void sendCallAccepted(VideoCallEntity call) {
        messagingTemplate.convertAndSend(WebSocketTopics.VIDEO_CALL, payload(call, "CALL_ACCEPTED", null));
    }

    @Override
    public void sendCallDeclined(VideoCallEntity call, String reason) {
        messagingTemplate.convertAndSend(WebSocketTopics.VIDEO_CALL, payload(call, "CALL_DECLINED", reason));
    }

    @Override
    public void sendCallEnded(VideoCallEntity call, String reason) {
        messagingTemplate.convertAndSend(WebSocketTopics.VIDEO_CALL, payload(call, "CALL_ENDED", reason));
    }

    private Map<String, Object> payload(VideoCallEntity call, String type, String reason) {
        Map<String, Object> data = new HashMap<>();
        data.put("type", type);
        data.put("callId", call.getId());
        data.put("callSessionId", call.getCallSessionId());
        data.put("callStatus", call.getCallStatus().name());
        data.put("callerUserId", call.getCallerId());
        data.put("receiverUserId", call.getReceiverId());
        data.put("conversationId", call.getConversation().getId());
        if (reason != null) data.put("reason", reason);
        if (call.getDurationMinutes() != null) data.put("callDuration", call.getDurationMinutes());
        return data;
    }
}

