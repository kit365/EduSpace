package com.eduspace.bookingservice.web.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.Instant;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiResponse<T>(
        boolean success,
        String timestamp,
        int status,
        String code,
        String message,
        T data
) {
    public static <T> ApiResponse<T> ok(T data) {
        return new ApiResponse<>(true, Instant.now().toString(), 200, "SUCCESS", "Thành công", data);
    }

    public static <T> ApiResponse<T> ok(String message, T data) {
        return new ApiResponse<>(true, Instant.now().toString(), 200, "SUCCESS", message, data);
    }

    public static <T> ApiResponse<T> error(int httpStatus, String code, String message) {
        return new ApiResponse<>(false, Instant.now().toString(), httpStatus, code, message, null);
    }
}
