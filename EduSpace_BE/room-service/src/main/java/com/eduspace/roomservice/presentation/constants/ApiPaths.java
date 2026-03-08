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
    }

    public static final class Facilities {
        private Facilities() {
        }

        public static final String BASE_PATH = BASE + "/facilities";
    }
}

