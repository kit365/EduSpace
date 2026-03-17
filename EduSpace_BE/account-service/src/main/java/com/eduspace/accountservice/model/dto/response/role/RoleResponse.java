package com.eduspace.accountservice.model.dto.response.role;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RoleResponse {
    Long id;
    String name;
    Set<PermissionResponse> permissions;
    Integer userCount; // To match frontend Role type
}
