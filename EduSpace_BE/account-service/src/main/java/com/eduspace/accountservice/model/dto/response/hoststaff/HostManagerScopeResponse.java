package com.eduspace.accountservice.model.dto.response.hoststaff;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HostManagerScopeResponse {
    /** true when current user is MANAGER and must be restricted to one branch. */
    private boolean managerScoped;
    /** Assigned branch for current manager; null for HOST or unscoped users. */
    private Long branchPropertyId;
}

