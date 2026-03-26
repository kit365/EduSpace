package com.eduspace.accountservice.model.dto.request.banks;

import jakarta.validation.constraints.NotNull;

public record SetDefaultBankInformationRequest(
        @NotNull(message = "isDefault là bắt buộc") Boolean isDefault) {}
