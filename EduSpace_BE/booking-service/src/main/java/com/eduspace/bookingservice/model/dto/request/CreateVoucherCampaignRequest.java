package com.eduspace.bookingservice.model.dto.request;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class CreateVoucherCampaignRequest {

    @NotBlank
    private String name;

    private String description;

    @NotNull
    private LocalDateTime startDate;

    @NotNull
    @Future
    private LocalDateTime endDate;

    private Boolean isActive = true;
}
