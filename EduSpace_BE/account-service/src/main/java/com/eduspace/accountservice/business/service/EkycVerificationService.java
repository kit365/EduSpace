package com.eduspace.accountservice.business.service;

import com.eduspace.accountservice.model.dto.response.ekyc.EkycVerifyResponse;
import org.springframework.web.multipart.MultipartFile;

public interface EkycVerificationService {

    EkycVerifyResponse verify(String keycloakId, MultipartFile front, MultipartFile back, MultipartFile selfie);
}
