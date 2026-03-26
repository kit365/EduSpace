package com.eduspace.accountservice.model.dto.request.hoststaff;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.LinkedHashSet;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReplaceStaffPermissionsRequest {

    @Builder.Default
    private Set<String> permissionNames = new LinkedHashSet<>();
}
