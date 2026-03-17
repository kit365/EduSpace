package com.eduspace.roomservice.model.dto.response;

import com.eduspace.roomservice.exception.SuccessCode;
import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.Instant;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiResponse<T>(
        boolean success,
        String timestamp,
        int status,
        String code,
        String message,
        T data) {

    public static <T> ApiResponse<T> success(T data, SuccessCode code, String translatedMessage) {
        return new ApiResponse<>(
                true,
                Instant.now().toString(),
                code.getHttpStatus().value(),
                code.getCode(),
                translatedMessage,
                data);
    }

    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(true, Instant.now().toString(), 200, "SUCCESS", "Thành công", data);
    }

    public static <T> ApiResponse<T> error(int status, String code, String message) {
        return new ApiResponse<>(false, Instant.now().toString(), status, code, message, null);
    }
}

