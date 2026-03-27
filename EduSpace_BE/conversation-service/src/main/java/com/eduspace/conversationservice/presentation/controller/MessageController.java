package com.eduspace.conversationservice.presentation.controller;

import com.eduspace.conversationservice.business.service.ChatService;
import com.eduspace.conversationservice.business.service.JwtConversationUserIdResolver;
import com.eduspace.conversationservice.exception.AppException;
import com.eduspace.conversationservice.exception.ErrorCode;
import com.eduspace.conversationservice.exception.SuccessCode;
import com.eduspace.conversationservice.model.dto.request.AddReactionRequest;
import com.eduspace.conversationservice.model.dto.request.EditMessageRequest;
import com.eduspace.conversationservice.model.dto.response.ApiResponse;
import com.eduspace.conversationservice.presentation.constants.ConversationPaths;
import jakarta.validation.Valid;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(ConversationPaths.Message.BASE_PATH)
public class MessageController {

    private final ChatService chatService;
    private final JwtConversationUserIdResolver jwtUserIdResolver;

    public MessageController(ChatService chatService, JwtConversationUserIdResolver jwtUserIdResolver) {
        this.chatService = chatService;
        this.jwtUserIdResolver = jwtUserIdResolver;
    }

    @DeleteMapping(ConversationPaths.Message.BY_ID)
    public ApiResponse<Void> deleteMessage(@PathVariable String messageId,
                                           @org.springframework.security.core.annotation.AuthenticationPrincipal Jwt jwt) {
        String uid = requireUserId(jwt);
        chatService.deleteMessage(messageId, uid);
        return ApiResponse.success(null, SuccessCode.MESSAGE_DELETE_SUCCESS, "Message deleted");
    }

    @PutMapping(ConversationPaths.Message.BY_ID)
    public ApiResponse<Void> editMessage(@PathVariable String messageId,
                                         @Valid @RequestBody EditMessageRequest request,
                                         @org.springframework.security.core.annotation.AuthenticationPrincipal Jwt jwt) {
        String uid = requireUserId(jwt);
        chatService.editMessage(messageId, request.getContent(), uid);
        return ApiResponse.success(null, SuccessCode.MESSAGE_EDIT_SUCCESS, "Message edited");
    }

    @PostMapping(ConversationPaths.Message.REACTIONS)
    public ApiResponse<Void> addReaction(@PathVariable String messageId,
                                         @Valid @RequestBody AddReactionRequest request,
                                         @org.springframework.security.core.annotation.AuthenticationPrincipal Jwt jwt) {
        String uid = requireUserId(jwt);
        chatService.addReactionToMessage(messageId, uid, request.getEmoji());
        return ApiResponse.success(null, SuccessCode.REACTION_ADD_SUCCESS, "Reaction added");
    }

    private String requireUserId(Jwt jwt) {
        String uid = jwtUserIdResolver.resolveUserId(jwt);
        if (uid == null) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        return uid;
    }
}

