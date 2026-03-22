package com.eduspace.conversationservice.business.service;

import com.eduspace.conversationservice.model.entity.VideoCallEntity;

import java.util.List;

public interface VideoCallService {
    VideoCallEntity initiate(String conversationId, String callerUserId);
    VideoCallEntity answer(String callSessionId, String actorUserId);
    VideoCallEntity decline(String callSessionId, String actorUserId, String reason);
    VideoCallEntity end(String callSessionId, String actorUserId, String reason);
    List<VideoCallEntity> history(String conversationId, String actorUserId);
    VideoCallEntity getBySessionId(String callSessionId, String actorUserId);
}

