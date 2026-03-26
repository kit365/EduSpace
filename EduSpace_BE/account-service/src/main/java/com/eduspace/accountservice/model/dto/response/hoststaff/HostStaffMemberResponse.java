package com.eduspace.accountservice.model.dto.response.hoststaff;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HostStaffMemberResponse {
    private String id;
    private String email;
    private String fullName;
    private String phoneNumber;
    private Boolean isActive;
    /** MANAGER hoặc STAFF (nếu còn bản ghi cũ). */
    private String memberRole;
    /** Chi nhánh (property id) khi memberRole = MANAGER. */
    private Long branchPropertyId;
    private Set<String> permissionNames;
    private LocalDateTime createdAt;
}
