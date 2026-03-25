package com.eduspace.accountservice.model.dto.request.permission;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PermissionCatalogRequest {
    String name;
    String description;
    String groupName;
}
