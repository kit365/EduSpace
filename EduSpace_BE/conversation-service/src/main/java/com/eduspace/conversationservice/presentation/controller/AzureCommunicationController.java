package com.eduspace.conversationservice.presentation.controller;

import com.eduspace.conversationservice.business.service.AzureCommunicationService;
import com.eduspace.conversationservice.business.service.JwtConversationUserIdResolver;
import com.eduspace.conversationservice.business.service.VideoCallService;
import com.eduspace.conversationservice.exception.AppException;
import com.eduspace.conversationservice.exception.ErrorCode;
import com.eduspace.conversationservice.model.dto.response.ApiResponse;
import com.eduspace.conversationservice.model.dto.response.VideoCallResponse;
import com.eduspace.conversationservice.model.entity.VideoCallEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/azure-communication")
@RequiredArgsConstructor
public class AzureCommunicationController {

    private final AzureCommunicationService azureCommunicationService;
    private final VideoCallService videoCallService;
    private final JwtConversationUserIdResolver jwtUserIdResolver;

    @GetMapping("/status")
    public ApiResponse<Map<String, Object>> status() {
        return ApiResponse.success(azureCommunicationService.getServiceStatus());
    }

    @PostMapping("/users")
    public ApiResponse<Map<String, Object>> createUserAndToken(
            @org.springframework.security.core.annotation.AuthenticationPrincipal Jwt jwt) {
        requireUserId(jwt);
        Map<String, String> token = azureCommunicationService.createUserAndToken();
        return ApiResponse.success(Map.of(
                "success", true,
                "userId", token.get("userId"),
                "token", token.get("token"),
                "expiresOn", token.get("expiresOn")
        ));
    }

    @PostMapping("/users/{userId}/token")
    public ApiResponse<Map<String, Object>> refreshUserToken(
            @PathVariable String userId,
            @org.springframework.security.core.annotation.AuthenticationPrincipal Jwt jwt) {
        requireUserId(jwt);
        Map<String, String> token = azureCommunicationService.refreshUserToken(userId);
        return ApiResponse.success(Map.of(
                "success", true,
                "userId", token.get("userId"),
                "token", token.get("token"),
                "expiresOn", token.get("expiresOn")
        ));
    }

    @DeleteMapping("/users/{userId}/tokens")
    public ApiResponse<Map<String, Object>> revokeUserTokens(
            @PathVariable String userId,
            @org.springframework.security.core.annotation.AuthenticationPrincipal Jwt jwt) {
        requireUserId(jwt);
        azureCommunicationService.revokeUserTokens(userId);
        return ApiResponse.success(Map.of("success", true, "message", "Tokens revoked successfully"));
    }

    @PostMapping("/calls/initiate")
    public ApiResponse<Map<String, Object>> initiate(@RequestBody Map<String, String> request,
                                                     @org.springframework.security.core.annotation.AuthenticationPrincipal Jwt jwt) {
        String uid = requireUserId(jwt);
        String conversationId = request.get("conversationId");
        VideoCallEntity call = videoCallService.initiate(conversationId, uid);

        Map<String, String> callerToken = azureCommunicationService.createUserAndToken();
        Map<String, String> receiverToken = azureCommunicationService.createUserAndToken();

        Map<String, Object> yourToken = new HashMap<>();
        yourToken.put("userId", callerToken.get("userId"));
        yourToken.put("token", callerToken.get("token"));
        yourToken.put("expiresOn", callerToken.get("expiresOn"));

        Map<String, Object> otherToken = new HashMap<>();
        otherToken.put("userId", receiverToken.get("userId"));
        otherToken.put("token", receiverToken.get("token"));
        otherToken.put("expiresOn", receiverToken.get("expiresOn"));

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
        String uid = requireUserId(jwt);
        VideoCallEntity call = videoCallService.answer(callSessionId, uid);
        Map<String, String> token = azureCommunicationService.createUserAndToken();
        Map<String, Object> yourToken = new HashMap<>();
        yourToken.put("userId", token.get("userId"));
        yourToken.put("token", token.get("token"));
        yourToken.put("expiresOn", token.get("expiresOn"));
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
        String uid = requireUserId(jwt);
        String reason = request != null ? request.get("reason") : null;
        videoCallService.decline(callSessionId, uid, reason);
        return ApiResponse.success(Map.of("message", "Call declined"));
    }

    @PostMapping("/calls/{callSessionId}/end")
    public ApiResponse<Map<String, Object>> end(@PathVariable String callSessionId,
                                                @RequestBody(required = false) Map<String, String> request,
                                                @org.springframework.security.core.annotation.AuthenticationPrincipal Jwt jwt) {
        String uid = requireUserId(jwt);
        String reason = request != null ? request.get("reason") : null;
        videoCallService.end(callSessionId, uid, reason);
        return ApiResponse.success(Map.of("message", "Call ended"));
    }

    @GetMapping("/calls/conversation/{conversationId}")
    public ApiResponse<Map<String, Object>> history(@PathVariable String conversationId,
                                                    @org.springframework.security.core.annotation.AuthenticationPrincipal Jwt jwt) {
        String uid = requireUserId(jwt);
        List<VideoCallResponse> calls = videoCallService.history(conversationId, uid).stream()
                .map(this::toResponse)
                .toList();
        return ApiResponse.success(Map.of("calls", calls));
    }

    @GetMapping("/calls/{callSessionId}/join-info")
    public ApiResponse<Map<String, Object>> joinInfo(@PathVariable String callSessionId,
                                                     @org.springframework.security.core.annotation.AuthenticationPrincipal Jwt jwt) {
        String uid = requireUserId(jwt);
        VideoCallEntity call = videoCallService.getBySessionId(callSessionId, uid);
        Map<String, String> token = azureCommunicationService.createUserAndToken();
        return ApiResponse.success(Map.of(
                "success", true,
                "callSessionId", call.getCallSessionId(),
                "userId", token.get("userId"),
                "token", token.get("token"),
                "expiresOn", token.get("expiresOn")
        ));
    }

    private String requireUserId(Jwt jwt) {
        String uid = jwtUserIdResolver.resolveUserId(jwt);
        if (uid == null) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        return uid;
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

