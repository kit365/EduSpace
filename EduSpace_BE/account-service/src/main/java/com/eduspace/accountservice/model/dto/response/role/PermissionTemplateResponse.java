package com.eduspace.accountservice.model.dto.response.role;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PermissionTemplateResponse {
    Long id;
    String name;
    String description;
    Set<PermissionResponse> permissions;
}
