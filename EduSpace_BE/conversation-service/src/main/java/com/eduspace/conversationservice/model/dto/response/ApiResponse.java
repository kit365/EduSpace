package com.eduspace.conversationservice.model.dto.response;

import com.eduspace.conversationservice.exception.ErrorCode;
import com.eduspace.conversationservice.exception.SuccessCode;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.experimental.FieldDefaults;

import java.time.Instant;

@JsonInclude(JsonInclude.Include.NON_NULL)
@Builder
public record ApiResponse<T>(
        boolean success,
        String timestamp,
        int status,
        String code,
        String message,
        T data
) {
    public static <T> ApiResponse<T> success(T data, SuccessCode successCode, String message) {
        return new ApiResponse<>(
                true,
                Instant.now().toString(),
                successCode.getHttpStatus().value(),
                successCode.getCode(),
                message,
                data
        );
    }

    // Overload for simple success
    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(
                true,
                Instant.now().toString(),
                200,
                "SUCCESS",
                "Operation successful",
                data
        );
    }

    public static <T> ApiResponse<T> error(ErrorCode errorCode, String message) {
        return new ApiResponse<>(
                false,
                Instant.now().toString(),
                errorCode.getHttpStatus().value(),
                errorCode.getCode(),
                message,
                null
        );
    }

    public static <T> ApiResponse<T> error(int status, String code, String message) {
        return new ApiResponse<>(
                false,
                Instant.now().toString(),
                status,
                code,
                message,
                null
        );
    }
}

