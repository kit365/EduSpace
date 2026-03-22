package com.eduspace.conversationservice.model.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
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

    /**
     * JSON key stays {@code isAdminConversation}. Field name avoids Jackson/Lombok confusion with
     * {@code boolean isX} properties that sometimes deserialize as false.
     */
    @Builder.Default
    @JsonProperty("isAdminConversation")
    boolean adminConversation = false;
}
