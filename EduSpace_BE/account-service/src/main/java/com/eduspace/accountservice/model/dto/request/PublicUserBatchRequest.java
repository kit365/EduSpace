package com.eduspace.accountservice.model.dto.request;

import jakarta.validation.constraints.NotEmpty;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PublicUserBatchRequest {
    @NotEmpty
    List<String> userIds; // internal user_id
}

