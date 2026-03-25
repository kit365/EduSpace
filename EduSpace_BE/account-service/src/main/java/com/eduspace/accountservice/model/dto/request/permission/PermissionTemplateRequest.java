package com.eduspace.accountservice.model.dto.request.permission;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PermissionTemplateRequest {
    String name;
    String description;
    List<Long> permissionIds;
}
