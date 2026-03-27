package com.eduspace.conversationservice.model.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class VideoCallResponse {
    String callId;
    String callSessionId;
    String callStatus;
    LocalDateTime startedAt;
    LocalDateTime endedAt;
    Integer durationMinutes;
    String endReason;
    Boolean isSuccessful;
    String callerUserId;
    String receiverUserId;
    String conversationId;

    public String getCallId() { return callId; }
    public void setCallId(String callId) { this.callId = callId; }
    public String getCallSessionId() { return callSessionId; }
    public void setCallSessionId(String callSessionId) { this.callSessionId = callSessionId; }
    public String getCallStatus() { return callStatus; }
    public void setCallStatus(String callStatus) { this.callStatus = callStatus; }
    public LocalDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(LocalDateTime startedAt) { this.startedAt = startedAt; }
    public LocalDateTime getEndedAt() { return endedAt; }
    public void setEndedAt(LocalDateTime endedAt) { this.endedAt = endedAt; }
    public Integer getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }
    public String getEndReason() { return endReason; }
    public void setEndReason(String endReason) { this.endReason = endReason; }
    public Boolean getIsSuccessful() { return isSuccessful; }
    public void setIsSuccessful(Boolean successful) { isSuccessful = successful; }
    public String getCallerUserId() { return callerUserId; }
    public void setCallerUserId(String callerUserId) { this.callerUserId = callerUserId; }
    public String getReceiverUserId() { return receiverUserId; }
    public void setReceiverUserId(String receiverUserId) { this.receiverUserId = receiverUserId; }
    public String getConversationId() { return conversationId; }
    public void setConversationId(String conversationId) { this.conversationId = conversationId; }
}

