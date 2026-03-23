package com.eduspace.roomservice.common.util;

import com.eduspace.roomservice.common.i18n.LocaleContext;

public class ImageAltUtil {

    public static String generate(String name) {
        String locale = LocaleContext.getLocale();
        if ("en".equalsIgnoreCase(locale)) {
            return "Illustration for " + name;
        }
        return "Hình ảnh minh họa cho " + name;
    }

    public static String generate(String name, String type) {
        String locale = LocaleContext.getLocale();
        if ("en".equalsIgnoreCase(locale)) {
            return type + " image: " + name;
        }
        return "Hình ảnh " + type.toLowerCase() + ": " + name;
    }

    public static String generateLogoAlt(String name, String lang) {
        return "vi".equalsIgnoreCase(lang) ? "Logo của " + name : "Logo of " + name;
    }

    public static String generateRoomAlt(String name, String lang) {
        return "vi".equalsIgnoreCase(lang) ? "Hình ảnh phòng " + name : "Image of room " + name;
    }

    public static String generatePolicyAlt(String name, String lang) {
        return "vi".equalsIgnoreCase(lang) ? "Biểu tượng chính sách " + name : "Policy icon for " + name;
    }
}
