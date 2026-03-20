package com.eduspace.conversationservice.model.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreateConversationRequest {
    @NotBlank
    String otherUserId; // Keycloak user id (JWT sub)

    @Builder.Default
    boolean isAdminConversation = false;
}

