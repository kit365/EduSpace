package com.eduspace.bookingservice.model.dto.response;

import com.eduspace.bookingservice.common.enums.BookingPolicyType;
import java.math.BigDecimal;

public record BookingDepositRefundPolicyResponse(
        Long id,
        String policyName,
        String description,
        BookingPolicyType policyType,
        BigDecimal depositPercentage,
        Integer startHour,
        Integer endHour,
        Integer fullRefundHours,
        BigDecimal fullRefundPercentage,
        Integer partialRefundHours,
        BigDecimal partialRefundPercentage,
        Integer noRefundHours,
        BigDecimal noRefundPercentage,
        Boolean isDefault,
        String highlightText,
        Boolean isActive) {}
