package com.eduspace.bookingservice.model.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ApplyVoucherRequest {

    @NotBlank
    private String voucherCode;

    @NotBlank
    private String userId;
}
