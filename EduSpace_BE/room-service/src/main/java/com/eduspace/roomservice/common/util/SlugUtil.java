package com.eduspace.roomservice.common.util;

import java.text.Normalizer;
import java.util.function.Predicate;
import java.util.regex.Pattern;

public final class SlugUtil {

    private static final Pattern NON_LATIN = Pattern.compile("[^\\p{ASCII}]");
    private static final Pattern NON_SLUG = Pattern.compile("[^a-z0-9]+");

    private SlugUtil() {
    }

    public static String slugify(String input) {
        if (input == null || input.isBlank()) {
            return "room";
        }
        String normalized = Normalizer.normalize(input.trim(), Normalizer.Form.NFD);
        normalized = NON_LATIN.matcher(normalized).replaceAll("");
        normalized = normalized.toLowerCase().replace("&", " and ");
        normalized = NON_SLUG.matcher(normalized).replaceAll("-");
        normalized = normalized.replaceAll("^-+", "").replaceAll("-+$", "");
        return normalized.isBlank() ? "room" : normalized;
    }

    /**
     * Slug duy nhất: thử base, rồi base-2, base-3… cho tới khi {@code occupied} trả false.
     *
     * @param occupied true nếu slug đã được phòng khác dùng
     */
    public static String uniqueSlug(String raw, Predicate<String> occupied) {
        String base = slugify(raw);
        String candidate = base;
        int n = 0;
        while (occupied.test(candidate)) {
            n++;
            candidate = base + "-" + n;
        }
        return candidate;
    }
}
