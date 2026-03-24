package com.eduspace.conversationservice.presentation.controller;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.eduspace.conversationservice.business.service.MediaStorageService;
import com.eduspace.conversationservice.exception.SuccessCode;
import com.eduspace.conversationservice.model.dto.response.ApiResponse;
import com.eduspace.conversationservice.presentation.constants.MediaPaths;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping(MediaPaths.BASE_PATH)
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Media", description = "Upload và lưu trữ ảnh (local hoặc Cloudinary)")
public class MediaController {

    private final MediaStorageService mediaStorageService;
    private final Cloudinary cloudinary;

    @GetMapping(MediaPaths.TEST_CONNECTION)
    @Operation(summary = "Kiểm tra kết nối Cloudinary", description = "Chỉ có ý nghĩa khi app.media.storage-type=cloudinary và đã cấu hình CLOUDINARY_URL.")
    public ResponseEntity<Map<String, Object>> testConnection() {
        try {
            if (cloudinary.config.cloudName == null || cloudinary.config.cloudName.isBlank()) {
                return ResponseEntity.status(400).body(Map.of(
                        "status", "error",
                        "message", "CLOUDINARY_URL chưa được cấu hình hoặc không hợp lệ"));
            }
            cloudinary.api().resourceTypes(ObjectUtils.emptyMap());
            return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "message", "Kết nối Cloudinary thành công",
                    "cloud_name", cloudinary.config.cloudName));
        } catch (Exception e) {
            log.error("Cloudinary connection failed: {}", e.getMessage());
            return ResponseEntity.status(500).body(Map.of(
                    "status", "error",
                    "message", "Cloudinary connection failed: " + e.getMessage(),
                    "cloud_name", cloudinary.config.cloudName != null ? cloudinary.config.cloudName : ""));
        }
    }

    @PostMapping(MediaPaths.UPLOAD)
    @Operation(summary = "Upload ảnh", description = "Trả về URL công khai (Cloudinary secure_url hoặc URL qua gateway tới /media/... khi lưu local).")
    public ResponseEntity<ApiResponse<String>> uploadImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "folder", required = false) String folder) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error(400, "BAD_REQUEST", "Chưa chọn file ảnh."));
        }
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            return ResponseEntity.badRequest().body(ApiResponse.error(400, "BAD_REQUEST", "Chỉ chấp nhận file ảnh (image/*)."));
        }
        try {
            String url = folder != null && !folder.isBlank()
                    ? mediaStorageService.storeImage(file, folder.trim())
                    : mediaStorageService.storeImage(file);
            String message = "Upload thành công.";
            return ResponseEntity.ok(ApiResponse.success(url, SuccessCode.MEDIA_UPLOAD_SUCCESS, message));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(400, "BAD_REQUEST", e.getMessage()));
        } catch (Exception e) {
            log.error("Media upload error: {}", e.getMessage());
            String msg = e.getMessage() != null && e.getMessage().toLowerCase().contains("api_key")
                    ? "Hệ thống chưa cấu hình lưu trữ ảnh. Vui lòng liên hệ quản trị viên."
                    : "Tải ảnh lên thất bại. Vui lòng thử lại.";
            return ResponseEntity.internalServerError().body(ApiResponse.error(500, "MEDIA_UPLOAD_FAILED", msg));
        }
    }
}
