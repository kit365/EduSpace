package com.eduspace.roomservice.exception;

import com.eduspace.roomservice.model.dto.response.ApiResponse;
import java.util.Objects;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@Slf4j
@ControllerAdvice
@RequiredArgsConstructor
public class GlobalExceptionHandler {

    private final MessageSource messageSource;

    @ExceptionHandler(value = AppException.class)
    public ResponseEntity<ApiResponse<?>> handlingAppException(AppException exception) {
        ErrorCode errorCode = exception.getErrorCode();
        String message = resolveMessage(errorCode.getMessageKey());
        ApiResponse<?> apiResponse = ApiResponse.error(
                errorCode.getHttpStatus().value(),
                errorCode.getCode(),
                message);
        return ResponseEntity.status(errorCode.getHttpStatus()).body(apiResponse);
    }

    @ExceptionHandler(value = Exception.class)
    public ResponseEntity<ApiResponse<?>> handlingRuntimeException(Exception exception) {
        log.error("Unhandled exception occurred: ", exception);
        String message = resolveMessage(ErrorCode.UNCATEGORIZED_EXCEPTION.getMessageKey());
        ApiResponse<?> apiResponse = ApiResponse.error(
                ErrorCode.UNCATEGORIZED_EXCEPTION.getHttpStatus().value(),
                ErrorCode.UNCATEGORIZED_EXCEPTION.getCode(),
                message);
        return ResponseEntity.status(ErrorCode.UNCATEGORIZED_EXCEPTION.getHttpStatus()).body(apiResponse);
    }

    @ExceptionHandler(value = MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<?>> handlingValidation(MethodArgumentNotValidException exception) {
        log.warn("Validation failed: {}", exception.getMessage());
        var fieldError = exception.getFieldError();
        String enumKey = Objects.requireNonNull(exception.getFieldError()).getDefaultMessage();
        String message;
        try {
            message = resolveMessage(enumKey);
        } catch (Exception e) {
            message = resolveMessage(ErrorCode.INVALID_KEY.getMessageKey());
        }
        ApiResponse<?> apiResponse = ApiResponse.error(
                ErrorCode.INVALID_KEY.getHttpStatus().value(),
                ErrorCode.INVALID_KEY.getCode(),
                message);
        return ResponseEntity.status(ErrorCode.INVALID_KEY.getHttpStatus()).body(apiResponse);
    }

    private String resolveMessage(String key) {
        return messageSource.getMessage(key, null, key, LocaleContextHolder.getLocale());
    }
}

