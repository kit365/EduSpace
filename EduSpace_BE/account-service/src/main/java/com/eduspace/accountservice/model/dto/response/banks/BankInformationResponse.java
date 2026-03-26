package com.eduspace.accountservice.model.dto.response.banks;

import java.time.LocalDateTime;

public record BankInformationResponse(
        Long id,
        String accountNumber,
        String accountHolderName,
        String bankCode,
        String bankName,
        Boolean isVerify,
        Boolean isDefault,
        String note,
        Long bookingId,
        String orderId,
        String accountType,
        String userId,
        String userEmail,
        String vietqrImageUrl,
        LocalDateTime createdAt,
        LocalDateTime updatedAt) {}
