package com.eduspace.accountservice.model.event;

public class SagaEventConstants {
    // Luồng gán Staff
    public static final String ASSIGN_STAFF_REQUEST = "ASSIGN_STAFF_REQUEST";
    public static final String ASSIGN_STAFF_SUCCESS = "ASSIGN_STAFF_SUCCESS";
    public static final String ASSIGN_STAFF_FAILED = "ASSIGN_STAFF_FAILED";
    
    // Luồng Chat (ví dụ)
    public static final String CHAT_MESSAGE_SENT = "CHAT_MESSAGE_SENT";
    
    // Luồng eKYC / Host Registration
    public static final String EKYC_VERIFICATION_SUCCESS = "EKYC_VERIFICATION_SUCCESS";
}
