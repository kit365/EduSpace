package com.eduspace.accountservice.business.service;

import com.eduspace.accountservice.model.dto.request.ekyc.EkycCommitRequest;
import com.eduspace.accountservice.model.dto.response.ekyc.EkycVerifyResponse;
import com.eduspace.accountservice.model.dto.response.ekyc.EkycVerifyResponse.OcrPayload;
import org.springframework.web.multipart.MultipartFile;

import java.util.Optional;

public interface EkycVerificationService {

    EkycVerifyResponse verify(String keycloakId, String email, 
                              MultipartFile front, MultipartFile back, MultipartFile selfie);

    EkycVerifyResponse commitFromClient(String keycloakId, String email, EkycCommitRequest request);

    Optional<OcrPayload> getLatestVerifiedOcrData(String userId);
}
