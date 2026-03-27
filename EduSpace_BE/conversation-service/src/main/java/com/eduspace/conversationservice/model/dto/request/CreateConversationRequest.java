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

    public String getOtherUserId() {
        return otherUserId;
    }

    public void setOtherUserId(String otherUserId) {
        this.otherUserId = otherUserId;
    }

    public boolean isAdminConversation() {
        return adminConversation;
    }

    public void setAdminConversation(boolean adminConversation) {
        this.adminConversation = adminConversation;
    }
}
