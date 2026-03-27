package com.eduspace.bookingservice.common.constants;

public final class BookingSagaConstants {

    public static final String TYPE_CREATE_BOOKING = "CREATE_BOOKING";

    public static final String STEP_VALIDATE_ROOM = "VALIDATE_ROOM";
    public static final String STEP_PERSIST_BOOKING = "PERSIST_BOOKING";
    public static final String STEP_SEND_EMAIL = "SEND_CONFIRMATION_EMAIL";

    private BookingSagaConstants() {}
}
