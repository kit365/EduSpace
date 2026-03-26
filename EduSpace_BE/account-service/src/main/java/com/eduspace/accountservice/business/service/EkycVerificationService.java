package com.eduspace.accountservice.business.service;

import com.eduspace.accountservice.model.dto.response.ekyc.EkycVerifyResponse;
import org.springframework.web.multipart.MultipartFile;

public interface EkycVerificationService {

    EkycVerifyResponse verify(String keycloakId, 
                              String fullName, String dob, String phone, String address,
                              MultipartFile front, MultipartFile back, MultipartFile selfie);

    java.util.Optional<com.eduspace.accountservice.model.dto.response.ekyc.EkycVerifyResponse.OcrPayload> getLatestVerifiedOcrData(String userId);
}
