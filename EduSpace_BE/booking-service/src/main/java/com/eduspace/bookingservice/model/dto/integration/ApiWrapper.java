package com.eduspace.bookingservice.model.dto.integration;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ApiWrapper<T> {
    private boolean success;
    private String code;
    private String message;
    private T data;
}
