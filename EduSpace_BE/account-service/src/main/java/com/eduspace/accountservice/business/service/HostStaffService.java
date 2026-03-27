package com.eduspace.accountservice.business.service;

import com.eduspace.accountservice.model.dto.request.hoststaff.InviteBranchManagerRequest;
import com.eduspace.accountservice.model.dto.request.hoststaff.UpdateManagerPermissionsRequest;
import com.eduspace.accountservice.model.dto.request.hoststaff.ReplaceStaffPermissionsRequest;
import com.eduspace.accountservice.model.dto.response.hoststaff.HostStaffMemberResponse;
import com.eduspace.accountservice.model.dto.response.hoststaff.HostManagerScopeResponse;
import com.eduspace.accountservice.model.dto.response.hoststaff.InviteBranchManagerResult;

import java.util.List;

public interface HostStaffService {

    List<HostStaffMemberResponse> listStaff(String hostUserId);

    HostManagerScopeResponse getManagerScope(String currentUserId);

    InviteBranchManagerResult inviteBranchManager(String hostUserId, InviteBranchManagerRequest request);

    HostStaffMemberResponse updateManagerPermissions(
            String hostUserId,
            String staffUserId,
            UpdateManagerPermissionsRequest request);

    HostStaffMemberResponse replacePermissions(
            String hostUserId, String staffUserId, ReplaceStaffPermissionsRequest request);

    void removeStaff(String hostUserId, String staffUserId);
}
