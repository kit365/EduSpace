package com.eduspace.bookingservice;

import io.github.cdimascio.dotenv.Dotenv;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients(basePackages = "com.eduspace.bookingservice.infrastructure.client")
public class BookingServiceApplication {

    public static void main(String[] args) {
        loadEnvFromEduSpaceBeRoot();
        SpringApplication.run(BookingServiceApplication.class, args);
    }

    /**
     * Nạp {@code EduSpace_BE/.env} khi Working Directory là {@code booking-service}
     * (hoặc khi Spring chưa nhận biến môi trường từ IDE). Trùng cách conversation-service.
     */
    private static void loadEnvFromEduSpaceBeRoot() {
        Path cwd = Paths.get("").toAbsolutePath();
        Path envFile = cwd.resolve(".env");
        if (!Files.isRegularFile(envFile)) {
            envFile = cwd.resolve("../.env").normalize();
        }
        if (!Files.isRegularFile(envFile)) {
            return;
        }
        Dotenv dotenv = Dotenv.configure()
                .directory(envFile.getParent().toString())
                .ignoreIfMissing()
                .load();
        dotenv.entries().forEach(entry -> {
            String key = entry.getKey();
            if (System.getProperty(key) == null && System.getenv(key) == null) {
                System.setProperty(key, entry.getValue());
            }
        });
    }
}
