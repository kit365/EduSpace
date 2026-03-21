package com.eduspace.accountservice.business.service;

import com.eduspace.accountservice.model.dto.request.hostapplication.RejectHostPartnerApplicationRequest;
import com.eduspace.accountservice.model.dto.request.hostapplication.SubmitHostPartnerApplicationRequest;
import com.eduspace.accountservice.model.dto.response.hostapplication.HostPartnerApplicationAdminResponse;
import com.eduspace.accountservice.model.dto.response.hostapplication.MyHostApplicationStatusResponse;
import com.eduspace.accountservice.model.dto.response.hostapplication.PendingBranchUpdateResponse;
import org.springframework.security.oauth2.jwt.Jwt;

import java.util.List;
import java.util.UUID;

public interface HostPartnerApplicationService {

    MyHostApplicationStatusResponse getMyStatus(Jwt jwt);
    List<PendingBranchUpdateResponse> listMyPendingBranchUpdates(Jwt jwt);

    void submit(Jwt jwt, SubmitHostPartnerApplicationRequest request);

    List<HostPartnerApplicationAdminResponse> listPendingForAdmin();

    void approve(UUID applicationId, String adminKeycloakId);

    void reject(UUID applicationId, String adminKeycloakId, RejectHostPartnerApplicationRequest request);
}
