package com.eduspace.bookingservice.model.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class UserVoucherResponse {
    private Long id;
    private String userId;
    private Long voucherId;
    private String voucherCode;
    private LocalDateTime claimedAt;
    private Boolean isUsed;
    private LocalDateTime usedAt;
}
