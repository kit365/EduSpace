package com.eduspace.conversationservice.presentation.controller;

import com.eduspace.conversationservice.business.service.ChatService;
import com.eduspace.conversationservice.business.service.JwtConversationUserIdResolver;
import com.eduspace.conversationservice.business.service.MediaStorageService;
import com.eduspace.conversationservice.exception.AppException;
import com.eduspace.conversationservice.exception.ErrorCode;
import com.eduspace.conversationservice.exception.SuccessCode;
import com.eduspace.conversationservice.model.dto.request.CreateConversationRequest;
import com.eduspace.conversationservice.model.dto.request.SendMessageRequest;
import com.eduspace.conversationservice.model.dto.response.ApiResponse;
import com.eduspace.conversationservice.model.dto.response.ChatMessageResponse;
import com.eduspace.conversationservice.model.dto.response.ConversationResponse;
import com.eduspace.conversationservice.model.enums.MessageType;
import com.eduspace.conversationservice.presentation.constants.ConversationPaths;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import jakarta.servlet.http.HttpServletRequest;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping(ConversationPaths.BASE_PATH)
public class ChatController {
    private static final Logger log = LoggerFactory.getLogger(ChatController.class);

    private final ChatService chatService;
    private final MediaStorageService mediaStorageService;
    private final ObjectMapper objectMapper;
    private final HttpServletRequest httpServletRequest;
    private final JwtConversationUserIdResolver jwtUserIdResolver;

    public ChatController(
            ChatService chatService,
            MediaStorageService mediaStorageService,
            ObjectMapper objectMapper,
            HttpServletRequest httpServletRequest,
            JwtConversationUserIdResolver jwtUserIdResolver) {
        this.chatService = chatService;
        this.mediaStorageService = mediaStorageService;
        this.objectMapper = objectMapper;
        this.httpServletRequest = httpServletRequest;
        this.jwtUserIdResolver = jwtUserIdResolver;
    }

    private String currentUserId(org.springframework.security.core.Authentication authentication) {
        if (authentication != null) {
            if (authentication instanceof JwtAuthenticationToken jwtToken) {
                Jwt jwt = jwtToken.getToken();
                String uid = jwtUserIdResolver.resolveUserId(jwt);
                if (uid != null && !uid.isBlank()) {
                    return uid.trim();
                }
            } else if (authentication.getPrincipal() instanceof String principal && principal.startsWith("GUEST-")) {
                log.debug("Using Guest ID from authentication principal: {}", principal);
                return principal;
            }
        }

        // Fallback to header for REST requests where authentication might be null or anonymous
        String guestId = httpServletRequest.getHeader("X-Guest-ID");
        if (guestId == null) guestId = httpServletRequest.getHeader("x-guest-id");
        
        if (guestId != null && !guestId.isBlank()) {
            log.debug("Using Guest ID from header: {}", guestId);
            return guestId;
        }
        
        return null;
    }

    @PostMapping
    public ApiResponse<ConversationResponse> createConversation(@Valid @RequestBody CreateConversationRequest request) {
        String userId = currentUserId(SecurityContextHolder.getContext().getAuthentication());
        if (userId == null) {
            throw new IllegalArgumentException("User identification missing (No JWT and no Guest ID)");
        }

        if (SecurityContextHolder.getContext().getAuthentication() instanceof JwtAuthenticationToken == false && !request.isAdminConversation()) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "Guests can only create support conversations");
        }

        ConversationResponse conversation = chatService.getOrCreateConversation(
                userId,
                request.getOtherUserId(),
                request.isAdminConversation());
        return ApiResponse.success(conversation, SuccessCode.CONVERSATION_CREATE_SUCCESS,
                "Conversation created/retrieved");
    }

    @GetMapping
    public ApiResponse<List<ConversationResponse>> getUserConversations() {
        String userId = currentUserId(SecurityContextHolder.getContext().getAuthentication());
        if (userId == null)
            return ApiResponse.success(List.of(), SuccessCode.CONVERSATION_GET_SUCCESS,
                    "No conversations for guest without ID");
        List<ConversationResponse> conversations = chatService.getUserConversations(userId);
        return ApiResponse.success(conversations, SuccessCode.CONVERSATION_GET_SUCCESS, "User conversations retrieved");
    }

    @GetMapping(ConversationPaths.ADMIN)
    public ApiResponse<List<ConversationResponse>> getAdminConversations() {
        String userId = currentUserId(SecurityContextHolder.getContext().getAuthentication());
        if (userId == null) {
            return ApiResponse.success(List.of(), SuccessCode.CONVERSATION_GET_SUCCESS,
                    "Admin conversations retrieved");
        }
        List<ConversationResponse> conversations = chatService.getAdminConversations(userId);
        return ApiResponse.success(conversations, SuccessCode.CONVERSATION_GET_SUCCESS,
                "Admin conversations retrieved");
    }

    @PostMapping(ConversationPaths.CLAIM_GUEST)
    public ApiResponse<Integer> claimGuestSupportConversations(@AuthenticationPrincipal Jwt jwt) {
        String keycloakUserId = jwt != null ? jwtUserIdResolver.resolveUserId(jwt) : null;
        if (jwt == null || keycloakUserId == null) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        String guestId = httpServletRequest.getHeader("X-Guest-ID");
        if (guestId == null) {
            guestId = httpServletRequest.getHeader("x-guest-id");
        }
        if (guestId == null || guestId.isBlank()) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }
        int updated = chatService.claimGuestSupportConversations(keycloakUserId, guestId.trim());
        return ApiResponse.success(updated, SuccessCode.CONVERSATION_GET_SUCCESS,
                "Guest support conversations claimed");
    }

    @GetMapping("/{conversationId}")
    public ApiResponse<ConversationResponse> getConversation(@PathVariable String conversationId) {
        String userId = currentUserId(SecurityContextHolder.getContext().getAuthentication());
        ConversationResponse conversation = chatService.getConversationById(conversationId, userId);
        return ApiResponse.success(conversation, SuccessCode.CONVERSATION_GET_SUCCESS,
                "Conversation details retrieved");
    }

    @PostMapping(ConversationPaths.ACCEPT_ASSIGNMENT_OFFER)
    public ApiResponse<ConversationResponse> acceptAssignmentOffer(@PathVariable String conversationId,
            @PathVariable String offerId) {
        String userId = currentUserId(SecurityContextHolder.getContext().getAuthentication());
        if (userId == null) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        ConversationResponse conversation = chatService.acceptAssignmentOffer(conversationId, offerId, userId);
        return ApiResponse.success(conversation, SuccessCode.CONVERSATION_GET_SUCCESS, "Assignment accepted");
    }

    @PostMapping(ConversationPaths.DECLINE_ASSIGNMENT_OFFER)
    public ApiResponse<ConversationResponse> declineAssignmentOffer(@PathVariable String conversationId,
            @PathVariable String offerId) {
        String userId = currentUserId(SecurityContextHolder.getContext().getAuthentication());
        if (userId == null) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        ConversationResponse conversation = chatService.declineAssignmentOffer(conversationId, offerId, userId);
        return ApiResponse.success(conversation, SuccessCode.CONVERSATION_GET_SUCCESS, "Assignment declined");
    }

    @PostMapping(ConversationPaths.MESSAGES)
    public ApiResponse<ChatMessageResponse> sendMessage(@PathVariable String conversationId,
            @Valid @RequestBody SendMessageRequest request) {
        String userId = currentUserId(SecurityContextHolder.getContext().getAuthentication());
        if (userId == null)
            throw new IllegalArgumentException("User identification missing");
        MessageType type = MessageType.valueOf(request.getMessageType());
        ChatMessageResponse message = chatService.sendMessage(conversationId, userId, request.getContent(), type);
        return ApiResponse.success(message, SuccessCode.MESSAGE_SEND_SUCCESS, "Message sent");
    }

    @PostMapping(value = ConversationPaths.SEND_IMAGE, consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<ChatMessageResponse> sendImageMessage(@PathVariable String conversationId,
            @RequestParam("image") MultipartFile image) {
        String userId = currentUserId(SecurityContextHolder.getContext().getAuthentication());
        if (userId == null)
            throw new IllegalArgumentException("User identification missing");
        String imageUrl = mediaStorageService.storeImage(image);
        ChatMessageResponse message = chatService.sendMediaMessage(conversationId, userId, imageUrl, "image",
                MessageType.IMAGE);
        return ApiResponse.success(message, SuccessCode.MESSAGE_SEND_SUCCESS, "Image message sent");
    }

    @PostMapping(value = ConversationPaths.SEND_IMAGES, consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<ChatMessageResponse> sendMultipleImages(@PathVariable String conversationId,
            @RequestParam("images") MultipartFile[] images) {
        if (images == null || images.length == 0) {
            throw new IllegalArgumentException("No images provided");
        }
        if (images.length > 8) {
            throw new IllegalArgumentException("Maximum 8 images allowed");
        }

        try {
            List<String> urls = java.util.Arrays.stream(images)
                    .map(mediaStorageService::storeImage)
                    .toList();
            String mediaUrlJson = objectMapper.writeValueAsString(urls);
            ChatMessageResponse message = chatService.sendMediaMessage(conversationId, currentUserId(SecurityContextHolder.getContext().getAuthentication()), mediaUrlJson,
                    "image", MessageType.IMAGE);
            return ApiResponse.success(message, SuccessCode.MESSAGE_SEND_SUCCESS, "Multiple images sent");
        } catch (Exception e) {
            log.error("Failed to send images", e);
            throw new RuntimeException("Failed to send images", e);
        }
    }

    @GetMapping(ConversationPaths.MESSAGES)
    public ApiResponse<List<ChatMessageResponse>> getChatHistory(@PathVariable String conversationId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        String userId = currentUserId(SecurityContextHolder.getContext().getAuthentication());
        if (userId == null) {
            throw new IllegalArgumentException("User identification missing");
        }
        List<ChatMessageResponse> messages = chatService.getChatHistory(conversationId, page, size, userId);
        return ApiResponse.success(messages, SuccessCode.CONVERSATION_GET_SUCCESS, "Chat history retrieved");
    }

    @PostMapping(ConversationPaths.READ)
    public ApiResponse<Void> markAsRead(@PathVariable String conversationId) {
        String userId = currentUserId(SecurityContextHolder.getContext().getAuthentication());
        if (userId != null) {
            chatService.markMessagesAsRead(conversationId, userId);
        }
        return ApiResponse.success(null, SuccessCode.CONVERSATION_GET_SUCCESS, "Messages marked as read");
    }

    @GetMapping(ConversationPaths.UNREAD_COUNT)
    public ApiResponse<Integer> unreadCount(@PathVariable String conversationId) {
        String userId = currentUserId(SecurityContextHolder.getContext().getAuthentication());
        int unread = userId != null ? chatService.getUnreadMessageCount(conversationId, userId) : 0;
        return ApiResponse.success(unread, SuccessCode.CONVERSATION_GET_SUCCESS, "Unread count retrieved");
    }

    @PostMapping(ConversationPaths.BLOCK)
    public ApiResponse<Void> block(@PathVariable String conversationId) {
        String userId = currentUserId(SecurityContextHolder.getContext().getAuthentication());
        if (userId != null)
            chatService.blockUser(conversationId, userId);
        return ApiResponse.success(null, SuccessCode.CONVERSATION_GET_SUCCESS, "User blocked");
    }

    @PostMapping(ConversationPaths.UNBLOCK)
    public ApiResponse<Void> unblock(@PathVariable String conversationId) {
        String userId = currentUserId(SecurityContextHolder.getContext().getAuthentication());
        if (userId != null)
            chatService.unblockUser(conversationId, userId);
        return ApiResponse.success(null, SuccessCode.CONVERSATION_GET_SUCCESS, "User unblocked");
    }

    // ==================== WebSocket Handlers ====================
    @MessageMapping("/chat/{conversationId}/send")
    @SendTo("/topic/conversation/{conversationId}")
    public Map<String, Object> handleWebSocketMessage(@DestinationVariable String conversationId,
            Map<String, String> message,
            Authentication authentication) {
        try {
            String userId = currentUserId(authentication);

            if (userId == null) {
                return Map.of("error", true, "message", "User identification missing");
            }

            String content = message.get("content");
            MessageType type = MessageType.valueOf(message.getOrDefault("messageType", "TEXT"));
            ChatMessageResponse saved = chatService.sendMessage(conversationId, userId, content, type);

            // WS payload shape compatible with GreenLoop FE useWebSocket transform
            return Map.of(
                    "messageId", saved.getMessageId(),
                    "conversationId", saved.getConversationId(),
                    "content", saved.getContent(),
                    "messageType", saved.getMessageType(),
                    "sentAt", String.valueOf(saved.getSentAt()),
                    "mediaUrl", saved.getMediaUrl() != null ? saved.getMediaUrl() : "",
                    "senderId", saved.getSender() != null ? saved.getSender().getUserId() : userId,
                    "senderUsername", saved.getSender() != null ? saved.getSender().getFullName() : userId,
                    "senderEmail", saved.getSender() != null ? saved.getSender().getEmail() : "");
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
