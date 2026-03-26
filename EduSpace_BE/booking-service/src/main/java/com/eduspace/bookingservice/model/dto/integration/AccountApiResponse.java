package com.eduspace.bookingservice.model.dto.integration;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Getter;
import lombok.Setter;

/** Phản hồi tối giản từ account-service (Feign). */
@Getter
@Setter
@JsonIgnoreProperties(ignoreUnknown = true)
public class AccountApiResponse {
    private boolean success;

    public boolean isSuccess() {
        return success;
    }
}
