package com.eduspace.conversationservice.model.event;

public class DomainEventConstants {
    
    // --- TÊN THỰC THỂ (AGGREGATE TYPES) ---
    public static final String AGGREGATE_CONVERSATION = "CONVERSATION";
    public static final String AGGREGATE_CHAT_MESSAGE = "CHAT_MESSAGE";

    // --- TÊN SỰ KIỆN (EVENT TYPES) ---
    public static final String CONVERSATION_CREATED = "CONVERSATION_CREATED";
    public static final String CONVERSATION_ASSIGNED = "CONVERSATION_ASSIGNED";
    public static final String CONVERSATION_CLOSED = "CONVERSATION_CLOSED";
    public static final String STAFF_TRANSFERRED = "STAFF_TRANSFERRED";
    public static final String CONVERSATION_BLOCKED = "CONVERSATION_BLOCKED";
    public static final String CONVERSATION_UNBLOCKED = "CONVERSATION_UNBLOCKED";
    
    public static final String MESSAGE_SENT = "MESSAGE_SENT";
    public static final String MESSAGE_READ = "MESSAGE_READ";
    public static final String MESSAGE_DELETED = "MESSAGE_DELETED";
    public static final String MESSAGE_EDITED = "MESSAGE_EDITED";
    public static final String REACTION_ADDED = "REACTION_ADDED";

    private DomainEventConstants() {
        // Prevent instantiation
    }
}
