package com.eduspace.accountservice.exception;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

import static org.assertj.core.api.Assertions.assertThat;

class ExceptionTest {

    @Test
    void errorCode_PropertiesWork() {
        ErrorCode code = ErrorCode.USER_NOT_FOUND;
        assertThat(code.getHttpStatus()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(code.getCode()).isEqualTo("USER_NOT_FOUND");
        assertThat(code.getMessageKey()).isEqualTo("user.not-found");
    }

    @Test
    void appException_ConstructorWorks() {
        AppException exception = new AppException(ErrorCode.USER_NOT_FOUND);
        assertThat(exception.getErrorCode()).isEqualTo(ErrorCode.USER_NOT_FOUND);
    }
}
