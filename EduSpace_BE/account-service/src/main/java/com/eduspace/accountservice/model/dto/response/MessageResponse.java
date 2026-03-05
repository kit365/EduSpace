package com.eduspace.accountservice.model.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MessageResponse {

    String message;

    public static MessageResponse of(String message) {
        return MessageResponse.builder().message(message).build();
    }
}
