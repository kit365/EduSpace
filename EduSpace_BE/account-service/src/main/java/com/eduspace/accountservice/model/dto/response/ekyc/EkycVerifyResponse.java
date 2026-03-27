package com.eduspace.accountservice.model.dto.response.ekyc;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record EkycVerifyResponse(
        String status,
        OcrPayload ocrData,
        double faceMatchingScore,
        String message
) {
    public record OcrPayload(
            String name,
            String idNumber,
            String dob,
            String address,
            String expiryDate
    ) {
    }
}
