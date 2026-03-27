package com.eduspace.conversationservice.presentation.constants;

public final class ConversationPaths {

    private ConversationPaths() {
    }

    public static final String BASE_PATH = "/api/v1/conversations";
    /** POST: migrate support threads from guest id (header) to JWT subject after login */
    public static final String CLAIM_GUEST = "/claim-guest";
    public static final String ADMIN = "/admin";
    public static final String BY_ID = "/{conversationId}";
    public static final String MESSAGES = BY_ID + "/messages";
    public static final String READ = BY_ID + "/read";
    public static final String UNREAD_COUNT = BY_ID + "/unread-count";
    public static final String SEND_IMAGE = BY_ID + "/messages/image";
    public static final String SEND_IMAGES = BY_ID + "/messages/images";
    public static final String BLOCK = BY_ID + "/block";
    public static final String UNBLOCK = BY_ID + "/unblock";
    public static final String ACCEPT_ASSIGNMENT_OFFER = BY_ID + "/assignment-offers/{offerId}/accept";

    public static final class Message {
        private Message() {
        }

        public static final String BASE_PATH = "/api/v1/messages";
        public static final String BY_ID = "/{messageId}";
        public static final String REACTIONS = BY_ID + "/reactions";
    }
}
