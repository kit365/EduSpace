package com.eduspace.conversationservice.business.serviceimpl;

import com.eduspace.conversationservice.business.service.MediaStorageService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.util.UUID;

@Service
public class LocalMediaStorageServiceImpl implements MediaStorageService {

    private final Path root;
    private final String publicBaseUrl;

    public LocalMediaStorageServiceImpl(
            @Value("${app.media.storage-path}") String storagePath,
            @Value("${app.media.public-base-url}") String publicBaseUrl
    ) {
        this.root = Path.of(storagePath).toAbsolutePath().normalize();
        this.publicBaseUrl = publicBaseUrl;
    }

    @Override
    public String storeImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Image is empty");
        }

        String original = StringUtils.cleanPath(file.getOriginalFilename() == null ? "image" : file.getOriginalFilename());
        String ext = "";
        int dot = original.lastIndexOf('.');
        if (dot > -1 && dot < original.length() - 1) {
            ext = original.substring(dot).toLowerCase();
        }

        String filename = UUID.randomUUID() + ext;
        String dateDir = LocalDate.now().toString();
        Path targetDir = root.resolve("chat-images").resolve(dateDir);
        Path targetFile = targetDir.resolve(filename);

        try {
            Files.createDirectories(targetDir);
            Files.copy(file.getInputStream(), targetFile);
        } catch (IOException e) {
            throw new IllegalStateException("Failed to store image", e);
        }

        String base = publicBaseUrl.endsWith("/") ? publicBaseUrl.substring(0, publicBaseUrl.length() - 1) : publicBaseUrl;
        return base + "/media/chat-images/" + dateDir + "/" + filename;
    }
}

