package com.eduspace.accountservice.business.service;

import com.eduspace.accountservice.model.dto.request.ekyc.EkycCommitRequest;
import com.eduspace.accountservice.model.dto.response.ekyc.EkycVerifyResponse;
import org.springframework.web.multipart.MultipartFile;

public interface EkycVerificationService {

    EkycVerifyResponse verify(String keycloakId, String email, MultipartFile front, MultipartFile back, MultipartFile selfie);

    /** Lưu kết quả sau khi FE đã gọi eduspace-ai trực tiếp (JSON). */
    EkycVerifyResponse commitFromClient(String keycloakId, String email, EkycCommitRequest request);
}
