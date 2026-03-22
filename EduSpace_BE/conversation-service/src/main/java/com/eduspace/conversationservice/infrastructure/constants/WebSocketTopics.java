package com.eduspace.conversationservice.infrastructure.constants;

public class WebSocketTopics {

    public static final String PREFIX = "/topic";
    
    // Base paths
    public static final String CONVERSATION = PREFIX + "/conversation/";
    public static final String USER = PREFIX + "/user/";
    public static final String VIDEO_CALL = PREFIX + "/video-call/notifications";

    // Action suffixes
    public static final String DELETED = "/deleted";
    public static final String EDITED = "/edited";
    public static final String REACTION = "/reaction";
    public static final String READ_RECEIPT = "/read-receipt";
    public static final String CONVERSATIONS = "/conversations";

    private WebSocketTopics() {

    }
}
