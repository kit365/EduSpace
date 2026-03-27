package com.eduspace.accountservice.model.dto.request.ekyc;

import com.eduspace.accountservice.model.dto.response.ekyc.EkycVerifyResponse.OcrPayload;

/**
 * Kết quả eKYC từ FE sau khi gọi eduspace-ai trực tiếp. Trường {@code status} từ client không được tin cậy —
 * server tự tính pass/fail từ {@code faceDistance} + số CMND trong {@code ocrData}.
 */
public record EkycCommitRequest(
        String status,
        OcrPayload ocrData,
        /** Khoảng cách embedding DeepFace (càng nhỏ càng khớp) */
        double faceDistance,
        boolean faceVerified,
        /** 0..1 từ client; response dùng score chuẩn hoá từ server */
        Double faceMatchingScore) {
}
