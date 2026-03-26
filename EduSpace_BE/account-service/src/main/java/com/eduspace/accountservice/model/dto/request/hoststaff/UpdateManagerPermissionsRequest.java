package com.eduspace.accountservice.model.dto.request.hoststaff;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateManagerPermissionsRequest {
    @NotNull
    private List<Long> permissionIds;
}

