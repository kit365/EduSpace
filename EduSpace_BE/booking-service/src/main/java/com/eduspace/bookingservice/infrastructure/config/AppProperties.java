package com.eduspace.bookingservice.infrastructure.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Getter
@Setter
@Configuration
@ConfigurationProperties(prefix = "app")
public class AppProperties {

    private final Media media = new Media();

    @Getter
    @Setter
    public static class Media {
        private final Cloudinary cloudinary = new Cloudinary();

        @Getter
        @Setter
        public static class Cloudinary {
            private String defaultFolder;
        }
    }
}
