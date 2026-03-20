package com.eduspace.conversationservice.infrastructure.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;

@Configuration
public class MediaConfig implements WebMvcConfigurer {

    private final String storagePath;

    public MediaConfig(@Value("${app.media.storage-path}") String storagePath) {
        this.storagePath = storagePath;
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path root = Path.of(storagePath).toAbsolutePath().normalize();
        registry.addResourceHandler("/media/**")
                .addResourceLocations(root.toUri().toString());
    }
}

