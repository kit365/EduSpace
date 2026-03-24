package com.eduspace.conversationservice.business.serviceimpl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.eduspace.conversationservice.business.service.MediaStorageService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.Map;
import java.util.UUID;

@Service
@Slf4j
@ConditionalOnProperty(prefix = "app.media", name = "storage-type", havingValue = "cloudinary")
public class CloudinaryMediaStorageServiceImpl implements MediaStorageService {

    private final Cloudinary cloudinary;
    private final String defaultFolder;

    public CloudinaryMediaStorageServiceImpl(
            Cloudinary cloudinary,
            @Value("${app.media.cloudinary.default-folder:eduspace-chat}") String defaultFolder) {
        this.cloudinary = cloudinary;
        this.defaultFolder = defaultFolder;
    }

    @Override
    public String storeImage(MultipartFile file) {
        return storeImage(file, defaultFolder);
    }

    @Override
    public String storeImage(MultipartFile file, String folder) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Image is empty");
        }
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Only image/* files are allowed");
        }
        String folderName = StringUtils.hasText(folder) ? folder.trim() : defaultFolder;

        File tempFile = null;
        try {
            tempFile = File.createTempFile("upload_", "_" + file.getOriginalFilename());
            try (FileOutputStream out = new FileOutputStream(tempFile)) {
                out.write(file.getBytes());
            }
            Map<String, Object> params = ObjectUtils.asMap(
                    "folder", folderName,
                    "public_id", "eduspace_" + UUID.randomUUID().toString().replace("-", "").substring(0, 12),
                    "overwrite", false);
            @SuppressWarnings("unchecked")
            Map<String, Object> result = cloudinary.uploader().upload(tempFile, params);
            String url = (String) result.get("secure_url");
            if (url == null) {
                url = (String) result.get("url");
            }
            return url;
        } catch (IOException e) {
            log.error("Upload failed: {}", e.getMessage());
            throw new IllegalStateException("Failed to store image", e);
        } catch (Exception e) {
            log.error("Cloudinary upload error: {}", e.getMessage());
            throw new IllegalStateException("Cloudinary upload failed: " + e.getMessage(), e);
        } finally {
            if (tempFile != null && tempFile.exists()) {
                tempFile.delete();
            }
        }
    }
}
