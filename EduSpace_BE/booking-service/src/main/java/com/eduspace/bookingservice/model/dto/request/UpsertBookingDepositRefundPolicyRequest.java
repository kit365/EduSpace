package com.eduspace.bookingservice.model.dto.request;

import com.eduspace.bookingservice.common.enums.BookingPolicyType;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpsertBookingDepositRefundPolicyRequest {

    @NotBlank
    private String policyName;

    private String description;

    @NotNull
    private BookingPolicyType policyType;

    @NotNull
    private BigDecimal depositPercentage;

    private Integer startHour;
    private Integer endHour;

    private Integer fullRefundHours;
    private BigDecimal fullRefundPercentage;
    private Integer partialRefundHours;
    private BigDecimal partialRefundPercentage;
    private Integer noRefundHours;
    private BigDecimal noRefundPercentage;

    @NotNull
    @JsonProperty("isDefault")
    private Boolean defaultPolicy;

    private String highlightText;

    @NotNull
    @JsonProperty("isActive")
    private Boolean active;
}
