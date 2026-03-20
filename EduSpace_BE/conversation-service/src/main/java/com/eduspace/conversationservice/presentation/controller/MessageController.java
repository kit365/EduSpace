package com.eduspace.conversationservice.presentation.controller;

import com.eduspace.conversationservice.business.service.ChatService;
import com.eduspace.conversationservice.model.dto.request.AddReactionRequest;
import com.eduspace.conversationservice.model.dto.request.EditMessageRequest;
import com.eduspace.conversationservice.model.dto.response.ApiResponse;
import com.eduspace.conversationservice.presentation.constants.ApiPaths;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping(ApiPaths.Message.BASE_PATH)
@RequiredArgsConstructor
public class MessageController {

    private final ChatService chatService;

    @DeleteMapping(ApiPaths.Message.BY_ID)
    public ApiResponse<Map<String, Object>> deleteMessage(@PathVariable String messageId,
                                                          @org.springframework.security.core.annotation.AuthenticationPrincipal Jwt jwt) {
        chatService.deleteMessage(messageId, jwt.getSubject());
        return ApiResponse.success(Map.of("message", "Message deleted"));
    }

    @PutMapping(ApiPaths.Message.BY_ID)
    public ApiResponse<Map<String, Object>> editMessage(@PathVariable String messageId,
                                                        @Valid @RequestBody EditMessageRequest request,
                                                        @org.springframework.security.core.annotation.AuthenticationPrincipal Jwt jwt) {
        chatService.editMessage(messageId, request.getContent(), jwt.getSubject());
        return ApiResponse.success(Map.of("message", "Message edited"));
    }

    @PostMapping(ApiPaths.Message.REACTIONS)
    public ApiResponse<Map<String, Object>> addReaction(@PathVariable String messageId,
                                                        @Valid @RequestBody AddReactionRequest request,
                                                        @org.springframework.security.core.annotation.AuthenticationPrincipal Jwt jwt) {
        chatService.addReactionToMessage(messageId, jwt.getSubject(), request.getEmoji());
        return ApiResponse.success(Map.of("message", "Reaction added"));
    }
}

