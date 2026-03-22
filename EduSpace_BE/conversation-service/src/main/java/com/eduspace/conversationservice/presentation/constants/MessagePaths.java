package com.eduspace.conversationservice.presentation.constants;

public final class MessagePaths {
    private MessagePaths() {
    }

    public static final String BASE_PATH = BaseApiPaths.BASE + "/messages";
    public static final String BY_ID = "/{messageId}";
    public static final String REACTIONS = "/{messageId}/reactions";

    // Paths nested under /conversations/{conversationId}
    public static final String MESSAGES = "/{conversationId}/messages";
    public static final String READ = "/{conversationId}/read";
    public static final String UNREAD_COUNT = "/{conversationId}/unread-count";
    public static final String SEND_IMAGE = "/{conversationId}/messages/image";
    public static final String SEND_IMAGES = "/{conversationId}/messages/images";
}
