package com.eduspace.accountservice.model.dto.response.hoststaff;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InviteBranchManagerResult {
    private HostStaffMemberResponse member;
    /** true = created brand-new account; false = existing account got manager access */
    private boolean created;
}

