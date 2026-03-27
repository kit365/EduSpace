package com.eduspace.accountservice.exception;

import com.eduspace.accountservice.model.dto.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.Objects;

import org.springframework.util.StringUtils;

@Slf4j
@ControllerAdvice
@RequiredArgsConstructor
public class GlobalExceptionHandler {

    private final MessageSource messageSource;

    @ExceptionHandler(value = IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<?>> handlingIllegalArgument(IllegalArgumentException exception) {
        log.warn("Bad request: {}", exception.getMessage());
        ApiResponse<?> apiResponse =
                ApiResponse.error(HttpStatus.BAD_REQUEST.value(), "BAD_REQUEST", exception.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(apiResponse);
    }

    @ExceptionHandler(value = AccessDeniedException.class)
    public ResponseEntity<ApiResponse<?>> handlingAccessDenied(AccessDeniedException exception) {
        log.warn("Access denied: {}", exception.getMessage());
        ApiResponse<?> apiResponse =
                ApiResponse.error(HttpStatus.FORBIDDEN.value(), "FORBIDDEN", exception.getMessage());
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(apiResponse);
    }

    @ExceptionHandler(value = AppException.class)
    public ResponseEntity<ApiResponse<?>> handlingAppException(AppException exception) {
        ErrorCode errorCode = exception.getErrorCode();
        String message = StringUtils.hasText(exception.getDetailMessage())
                ? exception.getDetailMessage()
                : resolveMessage(errorCode.getMessageKey());
        ApiResponse<?> apiResponse = ApiResponse.error(
                errorCode.getHttpStatus().value(),
                errorCode.getCode(),
                message);
        return ResponseEntity.status(errorCode.getHttpStatus()).body(apiResponse);
    }

    @ExceptionHandler(value = AuthorizationDeniedException.class)
    public ResponseEntity<ApiResponse<?>> handlingAuthorizationDeniedException(AuthorizationDeniedException exception) {
        log.warn("Access denied: {}", exception.getMessage());
        ErrorCode errorCode = ErrorCode.FORBIDDEN;
        String message = resolveMessage(errorCode.getMessageKey());
        ApiResponse<?> apiResponse = ApiResponse.error(
                errorCode.getHttpStatus().value(),
                errorCode.getCode(),
                message);
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(apiResponse);
    }

    @ExceptionHandler(value = HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ApiResponse<?>> handlingMethodNotSupportedException(HttpRequestMethodNotSupportedException exception) {
        log.warn("Method not supported: {}", exception.getMessage());
        ApiResponse<?> apiResponse = ApiResponse.error(
                HttpStatus.METHOD_NOT_ALLOWED.value(),
                "METHOD_NOT_ALLOWED",
                exception.getMessage());
        return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED).body(apiResponse);
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
        return ResponseEntity.badRequest().body(apiResponse);
    }

    private String resolveMessage(String key) {
        return messageSource.getMessage(key, null, key, LocaleContextHolder.getLocale());
    }
}
