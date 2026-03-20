package com.eduspace.conversationservice.presentation.constants;

public final class ApiPaths {

    private ApiPaths() {
    }

    public static final String API = "/api";
    public static final String VERSION = "/v1";
    public static final String BASE = API + VERSION;

    public static final class Chat {
        private Chat() {
        }

        public static final String BASE_PATH = BASE + "/conversations";
        public static final String ADMIN = "/admin";
        public static final String MESSAGES = "/{conversationId}/messages";
        public static final String READ = "/{conversationId}/read";
        public static final String UNREAD_COUNT = "/{conversationId}/unread-count";
        public static final String SEND_IMAGE = "/{conversationId}/messages/image";
        public static final String SEND_IMAGES = "/{conversationId}/messages/images";
        public static final String BLOCK = "/{conversationId}/block";
        public static final String UNBLOCK = "/{conversationId}/unblock";
    }

    public static final class Message {
        private Message() {
        }

        public static final String BASE_PATH = BASE + "/messages";
        public static final String BY_ID = "/{messageId}";
        public static final String REACTIONS = "/{messageId}/reactions";
    }
}

