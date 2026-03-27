package com.eduspace.conversationservice.model.event;

//Dành cho việc "Giao tiếp" ra bên ngoài (Kafka).
public class SagaEventConstants {
    // Luồng gán Staff
    public static final String ASSIGN_STAFF_REQUEST = "ASSIGN_STAFF_REQUEST";
    public static final String ASSIGN_STAFF_OFFERED = "ASSIGN_STAFF_OFFERED";
    public static final String ASSIGN_STAFF_ACCEPTED = "ASSIGN_STAFF_ACCEPTED";
    public static final String ASSIGN_STAFF_OFFER_EXPIRED = "ASSIGN_STAFF_OFFER_EXPIRED";
    public static final String ASSIGN_STAFF_DECLINED = "ASSIGN_STAFF_DECLINED";
    public static final String ASSIGN_STAFF_SUCCESS = "ASSIGN_STAFF_SUCCESS";
    public static final String ASSIGN_STAFF_FAILED = "ASSIGN_STAFF_FAILED";
    
    // Luồng Chat (ví dụ)
    public static final String CHAT_MESSAGE_SENT = "CHAT_MESSAGE_SENT";
}
