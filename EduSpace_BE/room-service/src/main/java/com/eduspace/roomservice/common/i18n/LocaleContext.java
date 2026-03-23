package com.eduspace.roomservice.common.i18n;

public class LocaleContext {
    private static final ThreadLocal<String> CURRENT_LOCALE = ThreadLocal.withInitial(() -> "vi");

    public static void setLocale(String locale) {
        CURRENT_LOCALE.set(locale != null && locale.equalsIgnoreCase("en") ? "en" : "vi");
    }

    public static String getLocale() {
        return CURRENT_LOCALE.get();
    }

    public static void clear() {
        CURRENT_LOCALE.remove();
    }
}
