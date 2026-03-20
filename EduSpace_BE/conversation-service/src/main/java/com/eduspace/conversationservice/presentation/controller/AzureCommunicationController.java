package com.eduspace.conversationservice.presentation.controller;

import com.eduspace.conversationservice.business.service.VideoCallService;
import com.eduspace.conversationservice.model.dto.response.ApiResponse;
import com.eduspace.conversationservice.model.dto.response.VideoCallResponse;
import com.eduspace.conversationservice.model.entity.VideoCallEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/azure-communication")
@RequiredArgsConstructor
public class AzureCommunicationController {

    private final VideoCallService videoCallService;

    @GetMapping("/status")
    public ApiResponse<Map<String, Object>> status() {
        // Placeholder. Real ACS wiring can be added via config later.
        return ApiResponse.success(Map.of("status", "enabled", "provider", "stub"));
    }

    @PostMapping("/calls/initiate")
    public ApiResponse<Map<String, Object>> initiate(@RequestBody Map<String, String> request,
                                                     @org.springframework.security.core.annotation.AuthenticationPrincipal Jwt jwt) {
        String conversationId = request.get("conversationId");
        VideoCallEntity call = videoCallService.initiate(conversationId, jwt.getSubject());

        // Stub tokens (so FE can keep flow); replace with real ACS integration later.
        Map<String, Object> yourToken = Map.of(
                "userId", jwt.getSubject(),
                "token", "stub-token-" + call.getCallSessionId(),
                "expiresOn", Instant.now().plus(60, ChronoUnit.MINUTES).toString()
        );
        Map<String, Object> otherToken = Map.of(
                "userId", call.getReceiverId(),
                "token", "stub-token-" + call.getCallSessionId() + "-other",
                "expiresOn", Instant.now().plus(60, ChronoUnit.MINUTES).toString()
        );

        return ApiResponse.success(Map.of(
                "success", true,
                "callId", call.getId(),
                "callSessionId", call.getCallSessionId(),
                "callStatus", call.getCallStatus().name(),
                "yourToken", yourToken,
                "otherToken", otherToken
        ));
    }

    @PostMapping("/calls/{callSessionId}/answer")
    public ApiResponse<Map<String, Object>> answer(@PathVariable String callSessionId,
                                                   @org.springframework.security.core.annotation.AuthenticationPrincipal Jwt jwt) {
        VideoCallEntity call = videoCallService.answer(callSessionId, jwt.getSubject());
        Map<String, Object> yourToken = Map.of(
                "userId", jwt.getSubject(),
                "token", "stub-token-" + call.getCallSessionId() + "-answer",
                "expiresOn", Instant.now().plus(60, ChronoUnit.MINUTES).toString()
        );
        return ApiResponse.success(Map.of(
                "success", true,
                "message", "Call answered",
                "callSessionId", call.getCallSessionId(),
                "yourToken", yourToken
        ));
    }

    @PostMapping("/calls/{callSessionId}/decline")
    public ApiResponse<Map<String, Object>> decline(@PathVariable String callSessionId,
                                                    @RequestBody(required = false) Map<String, String> request,
                                                    @org.springframework.security.core.annotation.AuthenticationPrincipal Jwt jwt) {
        String reason = request != null ? request.get("reason") : null;
        videoCallService.decline(callSessionId, jwt.getSubject(), reason);
        return ApiResponse.success(Map.of("message", "Call declined"));
    }

    @PostMapping("/calls/{callSessionId}/end")
    public ApiResponse<Map<String, Object>> end(@PathVariable String callSessionId,
                                                @RequestBody(required = false) Map<String, String> request,
                                                @org.springframework.security.core.annotation.AuthenticationPrincipal Jwt jwt) {
        String reason = request != null ? request.get("reason") : null;
        videoCallService.end(callSessionId, jwt.getSubject(), reason);
        return ApiResponse.success(Map.of("message", "Call ended"));
    }

    @GetMapping("/calls/conversation/{conversationId}")
    public ApiResponse<Map<String, Object>> history(@PathVariable String conversationId,
                                                    @org.springframework.security.core.annotation.AuthenticationPrincipal Jwt jwt) {
        List<VideoCallResponse> calls = videoCallService.history(conversationId, jwt.getSubject()).stream()
                .map(this::toResponse)
                .toList();
        return ApiResponse.success(Map.of("calls", calls));
    }

    @GetMapping("/calls/{callSessionId}/join-info")
    public ApiResponse<Map<String, Object>> joinInfo(@PathVariable String callSessionId,
                                                     @org.springframework.security.core.annotation.AuthenticationPrincipal Jwt jwt) {
        VideoCallEntity call = videoCallService.getBySessionId(callSessionId, jwt.getSubject());
        return ApiResponse.success(Map.of(
                "success", true,
                "callSessionId", call.getCallSessionId(),
                "token", "stub-token-" + call.getCallSessionId() + "-join",
                "expiresOn", Instant.now().plus(60, ChronoUnit.MINUTES).toString()
        ));
    }

    private VideoCallResponse toResponse(VideoCallEntity call) {
        return VideoCallResponse.builder()
                .callId(call.getId())
                .callSessionId(call.getCallSessionId())
                .callStatus(call.getCallStatus().name())
                .startedAt(call.getStartedAt())
                .endedAt(call.getEndedAt())
                .durationMinutes(call.getDurationMinutes())
                .endReason(call.getEndReason())
                .isSuccessful(call.getIsSuccessful())
                .callerUserId(call.getCallerId())
                .receiverUserId(call.getReceiverId())
                .conversationId(call.getConversation().getId())
                .build();
    }
}

