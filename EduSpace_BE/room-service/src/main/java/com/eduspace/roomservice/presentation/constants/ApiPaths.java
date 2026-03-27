package com.eduspace.roomservice.presentation.constants;

public final class ApiPaths {

    private ApiPaths() {
    }

    public static final String API = "/api";
    public static final String VERSION = "/v1";
    public static final String BASE = API + VERSION;

    public static final class Rooms {
        private Rooms() {
        }
        public static final String BASE_PATH = BASE + "/rooms";
        public static final String PUBLIC_PATH = BASE + "/public/rooms";
    }

    public static final class Properties {
        private Properties() {
        }
        public static final String BASE_PATH = BASE + "/properties";
        public static final String PUBLIC_PATH = BASE + "/public/properties";
    }

    public static final class Amenities {
        private Amenities() {
        }
        public static final String BASE_PATH = BASE + "/amenities";
    }

    public static final class RoomAmenities {
        private RoomAmenities() {
        }
        public static final String BASE_PATH = BASE + "/room-amenities";
    }

    public static final class Reviews {
        private Reviews() {
        }
        public static final String BASE_PATH = BASE + "/reviews";
    }

    public static final class SystemCalendarRules {
        private SystemCalendarRules() {
        }
        public static final String BASE_PATH = BASE + "/system-calendar-rules";
    }

    public static final class RoomBlocks {
        private RoomBlocks() {
        }
        public static final String BASE_PATH = BASE + "/room-blocks";
    }

    public static final class ExtraServices {
        private ExtraServices() {
        }
        public static final String BASE_PATH = BASE + "/extra-services";
    }

    public static final class RoomCategories {
        private RoomCategories() {
        }
        public static final String BASE_PATH = BASE + "/room-categories";
        public static final String PUBLIC_PATH = BASE + "/public/room-categories";
    }
}
