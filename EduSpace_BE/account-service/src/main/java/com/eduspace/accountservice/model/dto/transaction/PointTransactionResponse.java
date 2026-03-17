package com.eduspace.accountservice.model.dto.transaction;

import com.eduspace.accountservice.common.enums.TransactionType;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PointTransactionResponse {
    Long id;
    String userId;
    String userFullName;
    String bookingId;
    Integer points;
    TransactionType transactionType;
    String reason;
    LocalDateTime createdAt;
}
