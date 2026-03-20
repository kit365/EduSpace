package com.eduspace.conversationservice.business.service;

import com.eduspace.conversationservice.model.entity.VideoCallEntity;

public interface VideoCallNotificationService {
    void sendIncomingCall(VideoCallEntity call);
    void sendCallAccepted(VideoCallEntity call);
    void sendCallDeclined(VideoCallEntity call, String reason);
    void sendCallEnded(VideoCallEntity call, String reason);
}

