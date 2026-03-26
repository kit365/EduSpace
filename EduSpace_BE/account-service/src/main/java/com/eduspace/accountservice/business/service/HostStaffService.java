package com.eduspace.accountservice.business.service;

import com.eduspace.accountservice.model.dto.request.hoststaff.InviteBranchManagerRequest;
import com.eduspace.accountservice.model.dto.request.hoststaff.ReplaceStaffPermissionsRequest;
import com.eduspace.accountservice.model.dto.response.hoststaff.HostStaffMemberResponse;

import java.util.List;

public interface HostStaffService {

    List<HostStaffMemberResponse> listStaff(String hostUserId);

    HostStaffMemberResponse inviteBranchManager(String hostUserId, InviteBranchManagerRequest request);

    HostStaffMemberResponse replacePermissions(
            String hostUserId, String staffUserId, ReplaceStaffPermissionsRequest request);

    void removeStaff(String hostUserId, String staffUserId);
}
