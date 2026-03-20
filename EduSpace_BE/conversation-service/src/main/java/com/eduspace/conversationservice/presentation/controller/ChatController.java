package com.eduspace.conversationservice.presentation.controller;

import com.eduspace.conversationservice.business.service.ChatService;
import com.eduspace.conversationservice.business.service.MediaStorageService;
import com.eduspace.conversationservice.model.dto.request.*;
import com.eduspace.conversationservice.model.dto.response.ApiResponse;
import com.eduspace.conversationservice.model.dto.response.ChatMessageResponse;
import com.eduspace.conversationservice.model.dto.response.ConversationResponse;
import com.eduspace.conversationservice.model.enums.MessageType;
import com.eduspace.conversationservice.presentation.constants.ApiPaths;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping(ApiPaths.Chat.BASE_PATH)
@RequiredArgsConstructor
@Slf4j
public class ChatController {

    private final ChatService chatService;
    private final MediaStorageService mediaStorageService;
    private final ObjectMapper objectMapper;

    private String currentUserId(Jwt jwt) {
        return jwt.getSubject();
    }

    private String bearer(Jwt jwt) {
        return jwt.getTokenValue();
    }

    @PostMapping
    public ApiResponse<Map<String, Object>> createConversation(@Valid @RequestBody CreateConversationRequest request,
                                                              @org.springframework.security.core.annotation.AuthenticationPrincipal Jwt jwt) {
        ConversationResponse conversation = chatService.getOrCreateConversation(
                currentUserId(jwt),
                request.getOtherUserId(),
                request.isAdminConversation(),
                bearer(jwt)
        );
        return ApiResponse.success(Map.of(
                "conversationId", conversation.getConversationId(),
                "conversation", conversation
        ));
    }

    @GetMapping
    public ApiResponse<Map<String, Object>> getUserConversations(@org.springframework.security.core.annotation.AuthenticationPrincipal Jwt jwt) {
        List<ConversationResponse> conversations = chatService.getUserConversations(currentUserId(jwt), bearer(jwt));
        return ApiResponse.success(Map.of("conversations", conversations));
    }

    @GetMapping(ApiPaths.Chat.ADMIN)
    public ApiResponse<Map<String, Object>> getAdminConversations(@org.springframework.security.core.annotation.AuthenticationPrincipal Jwt jwt) {
        List<ConversationResponse> conversations = chatService.getAdminConversations(currentUserId(jwt), bearer(jwt));
        return ApiResponse.success(Map.of("conversations", conversations));
    }

    @GetMapping("/{conversationId}")
    public ApiResponse<Map<String, Object>> getConversation(@PathVariable String conversationId,
                                                            @org.springframework.security.core.annotation.AuthenticationPrincipal Jwt jwt) {
        ConversationResponse conversation = chatService.getConversationById(conversationId, currentUserId(jwt), bearer(jwt));
        return ApiResponse.success(Map.of("conversation", conversation));
    }

    @PostMapping("/{conversationId}/messages")
    public ApiResponse<Map<String, Object>> sendMessage(@PathVariable String conversationId,
                                                        @Valid @RequestBody SendMessageRequest request,
                                                        @org.springframework.security.core.annotation.AuthenticationPrincipal Jwt jwt) {
        MessageType type = MessageType.valueOf(request.getMessageType());
        ChatMessageResponse message = chatService.sendMessage(conversationId, currentUserId(jwt), request.getContent(), type, bearer(jwt));
        return ApiResponse.success(Map.of("message", message));
    }

    @PostMapping(value = "/{conversationId}/messages/image", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<Map<String, Object>> sendImageMessage(@PathVariable String conversationId,
                                                             @RequestParam("image") MultipartFile image,
                                                             @org.springframework.security.core.annotation.AuthenticationPrincipal Jwt jwt) {
        String imageUrl = mediaStorageService.storeImage(image);
        ChatMessageResponse message = chatService.sendMediaMessage(conversationId, currentUserId(jwt), imageUrl, "image", MessageType.IMAGE, bearer(jwt));
        return ApiResponse.success(Map.of("message", message));
    }

    @PostMapping(value = "/{conversationId}/messages/images", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<Map<String, Object>> sendMultipleImages(@PathVariable String conversationId,
                                                               @RequestParam("images") MultipartFile[] images,
                                                               @org.springframework.security.core.annotation.AuthenticationPrincipal Jwt jwt) {
        if (images == null || images.length == 0) {
            return ApiResponse.error(400, "BAD_REQUEST", "No images provided");
        }
        if (images.length > 8) {
            return ApiResponse.error(400, "BAD_REQUEST", "Maximum 8 images allowed");
        }

        try {
            List<String> urls = java.util.Arrays.stream(images)
                    .map(mediaStorageService::storeImage)
                    .toList();
            String mediaUrlJson = objectMapper.writeValueAsString(urls);
            ChatMessageResponse message = chatService.sendMediaMessage(conversationId, currentUserId(jwt), mediaUrlJson, "image", MessageType.IMAGE, bearer(jwt));
            return ApiResponse.success(Map.of("message", message));
        } catch (Exception e) {
            log.error("Failed to send images", e);
            return ApiResponse.error(500, "INTERNAL_ERROR", "Failed to send images");
        }
    }

    @GetMapping("/{conversationId}/messages")
    public ApiResponse<Map<String, Object>> getChatHistory(@PathVariable String conversationId,
                                                           @RequestParam(defaultValue = "0") int page,
                                                           @RequestParam(defaultValue = "50") int size,
                                                           @org.springframework.security.core.annotation.AuthenticationPrincipal Jwt jwt) {
        List<ChatMessageResponse> messages = chatService.getChatHistory(conversationId, page, size, bearer(jwt));
        return ApiResponse.success(Map.of("messages", messages, "page", page, "size", size));
    }

    @PostMapping("/{conversationId}/read")
    public ApiResponse<Map<String, Object>> markAsRead(@PathVariable String conversationId,
                                                       @org.springframework.security.core.annotation.AuthenticationPrincipal Jwt jwt) {
        chatService.markMessagesAsRead(conversationId, currentUserId(jwt));
        return ApiResponse.success(Map.of("message", "Messages marked as read"));
    }

    @GetMapping("/{conversationId}/unread-count")
    public ApiResponse<Map<String, Object>> unreadCount(@PathVariable String conversationId,
                                                        @org.springframework.security.core.annotation.AuthenticationPrincipal Jwt jwt) {
        int unread = chatService.getUnreadMessageCount(conversationId, currentUserId(jwt));
        return ApiResponse.success(Map.of("unreadCount", unread));
    }

    @PostMapping("/{conversationId}/block")
    public ApiResponse<Map<String, Object>> block(@PathVariable String conversationId,
                                                  @org.springframework.security.core.annotation.AuthenticationPrincipal Jwt jwt) {
        chatService.blockUser(conversationId, currentUserId(jwt));
        return ApiResponse.success(Map.of("message", "User blocked"));
    }

    @PostMapping("/{conversationId}/unblock")
    public ApiResponse<Map<String, Object>> unblock(@PathVariable String conversationId,
                                                    @org.springframework.security.core.annotation.AuthenticationPrincipal Jwt jwt) {
        chatService.unblockUser(conversationId, currentUserId(jwt));
        return ApiResponse.success(Map.of("message", "User unblocked"));
    }

    // ==================== WebSocket Handlers ====================
    @MessageMapping("/chat/{conversationId}/send")
    @SendTo("/topic/conversation/{conversationId}")
    public Map<String, Object> handleWebSocketMessage(@DestinationVariable String conversationId,
                                                      Map<String, String> message,
                                                      Authentication authentication) {
        try {
            Jwt jwt = jwtFromAuth(authentication);
            String content = message.get("content");
            MessageType type = MessageType.valueOf(message.getOrDefault("messageType", "TEXT"));
            ChatMessageResponse saved = chatService.sendMessage(conversationId, jwt.getSubject(), content, type, jwt.getTokenValue());

            // WS payload shape compatible with GreenLoop FE useWebSocket transform
            return Map.of(
                    "messageId", saved.getMessageId(),
                    "conversationId", saved.getConversationId(),
                    "content", saved.getContent(),
                    "messageType", saved.getMessageType(),
                    "sentAt", String.valueOf(saved.getSentAt()),
                    "mediaUrl", saved.getMediaUrl(),
                    "senderId", saved.getSender() != null ? saved.getSender().getUserId() : jwt.getSubject(),
                    "senderUsername", saved.getSender() != null ? saved.getSender().getFullName() : jwt.getSubject(),
                    "senderEmail", saved.getSender() != null ? saved.getSender().getEmail() : null
            );
        } catch (Exception e) {
            log.error("Error handling WebSocket message", e);
            return Map.of("error", true, "message", "Failed to send message: " + e.getMessage());
        }
    }

    private Jwt jwtFromAuth(Authentication authentication) {
        if (authentication instanceof JwtAuthenticationToken token) {
            return token.getToken();
        }
        throw new IllegalStateException("WebSocket auth missing JWT");
    }
}

