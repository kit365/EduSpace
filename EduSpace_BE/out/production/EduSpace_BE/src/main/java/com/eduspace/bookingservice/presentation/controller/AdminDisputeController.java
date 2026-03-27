package com.eduspace.bookingservice.presentation.controller;

import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminDisputeController {

    @Data
    @Builder
    public static class DisputeResponse {
        private String id;
        private String bookingId;
        private String userId;
        private String hostId;
        private String reason;
        private String description;
        private String status;
        private String priority;
        private LocalDateTime createdAt;
        private LocalDateTime resolvedAt;
        private String resolution;
    }

    @Data
    @Builder
    public static class ReportResponse {
        private String id;
        private String userId;
        private String targetId;
        private String targetType;
        private String reason;
        private String description;
        private String status;
        private LocalDateTime createdAt;
    }

    @Data
    @Builder
    public static class ListResponse<T> {
        private List<T> items;
        private long total;
    }

    @GetMapping("/disputes")
    public ListResponse<DisputeResponse> getDisputes(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        List<DisputeResponse> mockDisputes = List.of(
            DisputeResponse.builder()
                .id("DSP-001")
                .bookingId("BK-9921")
                .userId("user_123")
                .hostId("host_456")
                .reason("Cơ sở vật chất không đúng mô tả")
                .status("PENDING")
                .priority("HIGH")
                .createdAt(LocalDateTime.now().minusDays(2))
                .build(),
            DisputeResponse.builder()
                .id("DSP-002")
                .bookingId("BK-8832")
                .userId("user_789")
                .hostId("host_012")
                .reason("Yêu cầu hoàn tiền dịch vụ")
                .status("IN_PROGRESS")
                .priority("MEDIUM")
                .createdAt(LocalDateTime.now().minusDays(5))
                .build()
        );

        return ListResponse.<DisputeResponse>builder()
                .items(mockDisputes)
                .total(mockDisputes.size())
                .build();
    }

    @GetMapping("/disputes/{id}")
    public DisputeResponse getDisputeById(@PathVariable String id) {
        return null; // Placeholder
    }

    @PostMapping("/disputes/{id}/resolve")
    public void resolveDispute(@PathVariable String id, @RequestBody Map<String, Object> data) {
        // Placeholder
    }

    @GetMapping("/reports")
    public ListResponse<ReportResponse> getReports(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        List<ReportResponse> mockReports = List.of(
            ReportResponse.builder()
                .id("REP-001")
                .userId("user_999")
                .targetId("room_888")
                .targetType("ROOM")
                .reason("Hình ảnh ảo, không có thực")
                .status("NEW")
                .createdAt(LocalDateTime.now().minusHours(4))
                .build()
        );

        return ListResponse.<ReportResponse>builder()
                .items(mockReports)
                .total(mockReports.size())
                .build();
    }

    @PatchMapping("/reports/{id}/status")
    public void updateReportStatus(@PathVariable String id, @RequestParam String status) {
        // Placeholder
    }
}
