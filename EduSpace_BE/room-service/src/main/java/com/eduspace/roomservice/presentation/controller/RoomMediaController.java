package com.eduspace.roomservice.presentation.controller;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.eduspace.roomservice.model.dto.response.ApiResponse;
import com.eduspace.roomservice.presentation.constants.ApiPaths;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;
import java.util.regex.Pattern;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping(ApiPaths.Rooms.BASE_PATH + "/media")
@Tag(name = "Room Media", description = "Upload media cho room")
public class RoomMediaController {
    private static final Pattern SAFE_FOLDER = Pattern.compile("^[a-zA-Z0-9][a-zA-Z0-9._-]{0,63}$");

    private final Cloudinary cloudinary;

    @Value("${app.media.cloudinary.default-folder:eduspace-rooms}")
    private String defaultFolder;
    @Value("${app.media.storage-path:./data/media}")
    private String storagePath;
    @Value("${app.media.public-base-url:http://localhost:${GATEWAY_PORT:8080}}")
    private String publicBaseUrl;

    @PostMapping("/upload")
    @Operation(summary = "Upload ảnh room lên Cloudinary")
    public ResponseEntity<ApiResponse<String>> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "folder", required = false) String folder) {
        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error(400, "BAD_REQUEST", "Chưa chọn file ảnh."));
        }
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            return ResponseEntity.badRequest().body(ApiResponse.error(400, "BAD_REQUEST", "Chỉ chấp nhận file ảnh."));
        }
        try {
            String targetFolder = (folder != null && !folder.isBlank()) ? folder.trim() : defaultFolder;
            if (isCloudinaryReady()) {
                Map<?, ?> result = cloudinary.uploader().upload(
                        file.getBytes(),
                        ObjectUtils.asMap(
                                "resource_type", "image",
                                "folder", targetFolder));
                String secureUrl = String.valueOf(result.get("secure_url"));
                return ResponseEntity.ok(ApiResponse.success(secureUrl));
            }
            String localUrl = storeImageLocally(file, targetFolder);
            return ResponseEntity.ok(ApiResponse.success(localUrl));
        } catch (Exception e) {
            log.error("Room media upload failed: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error(500, "MEDIA_UPLOAD_FAILED", "Upload ảnh thất bại. Vui lòng thử lại."));
        }
    }

    @GetMapping("/local/{folder}/{date}/{filename:.+}")
    @Operation(summary = "Đọc ảnh room lưu local")
    public ResponseEntity<Resource> readLocal(
            @PathVariable String folder,
            @PathVariable String date,
            @PathVariable String filename) throws IOException {
        String safeFolder = sanitizeFolder(folder);
        Path root = Path.of(storagePath).toAbsolutePath().normalize();
        Path filePath = root.resolve(safeFolder).resolve(date).resolve(filename).normalize();
        if (!filePath.startsWith(root) || !Files.exists(filePath) || !Files.isRegularFile(filePath)) {
            return ResponseEntity.notFound().build();
        }
        Resource resource = toResource(filePath);
        String contentType = Files.probeContentType(filePath);
        if (contentType == null) {
            contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;
        }
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CACHE_CONTROL, "public, max-age=86400")
                .body(resource);
    }

    private boolean isCloudinaryReady() {
        return StringUtils.hasText(cloudinary.config.cloudName) && StringUtils.hasText(cloudinary.config.apiKey);
    }

    private String storeImageLocally(MultipartFile file, String folder) throws IOException {
        String safeFolder = sanitizeFolder(folder);
        String original = StringUtils.cleanPath(file.getOriginalFilename() == null ? "image" : file.getOriginalFilename());
        String ext = "";
        int dot = original.lastIndexOf('.');
        if (dot > -1 && dot < original.length() - 1) {
            ext = original.substring(dot).toLowerCase();
        }
        String dateDir = LocalDate.now().toString();
        String filename = UUID.randomUUID() + ext;
        Path root = Path.of(storagePath).toAbsolutePath().normalize();
        Path targetDir = root.resolve(safeFolder).resolve(dateDir);
        Files.createDirectories(targetDir);
        Path targetFile = targetDir.resolve(filename);
        Files.copy(file.getInputStream(), targetFile);

        String base = publicBaseUrl.endsWith("/") ? publicBaseUrl.substring(0, publicBaseUrl.length() - 1) : publicBaseUrl;
        return base + ApiPaths.Rooms.BASE_PATH + "/media/local/" + safeFolder + "/" + dateDir + "/" + filename;
    }

    private static String sanitizeFolder(String folder) {
        if (folder == null || folder.isBlank()) {
            return "eduspace-rooms";
        }
        String f = folder.trim();
        return SAFE_FOLDER.matcher(f).matches() ? f : "eduspace-rooms";
    }

    private static Resource toResource(Path path) throws MalformedURLException {
        return new UrlResource(path.toUri());
    }
}
