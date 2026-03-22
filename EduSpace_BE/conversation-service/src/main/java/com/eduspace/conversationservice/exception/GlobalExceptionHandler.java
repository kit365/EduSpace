package com.eduspace.conversationservice.exception;

import com.eduspace.conversationservice.model.dto.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
@Slf4j
@RequiredArgsConstructor
public class GlobalExceptionHandler {

    private final MessageSource messageSource;

    @ExceptionHandler(AppException.class)
    public ResponseEntity<ApiResponse<Object>> handleAppException(AppException ex) {
        log.warn("AppException: {} - {}", ex.getErrorCode().getCode(), ex.getMessage());
        ErrorCode errorCode = ex.getErrorCode();
        String message = messageSource.getMessage(errorCode.getMessageKey(), null, 
                errorCode.getCode(), LocaleContextHolder.getLocale());
        
        return ResponseEntity.status(errorCode.getHttpStatus())
                .body(ApiResponse.error(errorCode, message));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<Object>> handleBadRequest(IllegalArgumentException ex) {
        log.error("IllegalArgumentException: ", ex);
        return ResponseEntity.badRequest().body(ApiResponse.error(400, "BAD_REQUEST", ex.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Object>> handleValidation(MethodArgumentNotValidException ex) {
        log.warn("Validation failed: {}", ex.getMessage());
        String message = ex.getBindingResult().getAllErrors().stream()
                .findFirst()
                .map(err -> err.getDefaultMessage() == null ? "Validation error" : err.getDefaultMessage())
                .orElse("Validation error");
        return ResponseEntity.badRequest().body(ApiResponse.error(400, "VALIDATION_ERROR", message));
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ApiResponse<Object>> handleRuntime(RuntimeException ex) {
        log.error("Unhandled RuntimeException: ", ex);
        String message = messageSource.getMessage(ErrorCode.UNCATEGORIZED_EXCEPTION.getMessageKey(), null, 
                ex.getMessage(), LocaleContextHolder.getLocale());
        return ResponseEntity.status(ErrorCode.UNCATEGORIZED_EXCEPTION.getHttpStatus())
                .body(ApiResponse.error(ErrorCode.UNCATEGORIZED_EXCEPTION, message));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Object>> handleAny(Exception ex) {
        if (ex.getClass().getName().contains("FeignException")) {
             log.error("Feign communication error: ", ex);
             return ResponseEntity.status(502).body(ApiResponse.error(502, "BAD_GATEWAY", "Error communicating with downstream service"));
        }
        log.error("CRITICAL: Unhandled Exception: ", ex);
        String message = messageSource.getMessage(ErrorCode.UNCATEGORIZED_EXCEPTION.getMessageKey(), null, 
                "Internal server error", LocaleContextHolder.getLocale());
        return ResponseEntity.status(ErrorCode.UNCATEGORIZED_EXCEPTION.getHttpStatus())
                .body(ApiResponse.error(ErrorCode.UNCATEGORIZED_EXCEPTION, message));
    }
}

