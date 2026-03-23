package com.eduspace.roomservice.common.i18n;

public class TranslationUtil {

    public static String translate(String vi, String en) {
        String locale = LocaleContext.getLocale();
        if ("en".equalsIgnoreCase(locale)) {
            return (en != null && !en.isBlank()) ? en : vi;
        }
        return (vi != null && !vi.isBlank()) ? vi : en;
    }
}
