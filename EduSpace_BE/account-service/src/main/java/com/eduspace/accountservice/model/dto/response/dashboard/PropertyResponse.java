package com.eduspace.accountservice.model.dto.response.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PropertyResponse {
    private Integer id;
    private String name;
    private String propertyType;
    private String address;
    private String ownerId;
    private String ownerName;
    private String ownerAvatar;
    private String status;
    private LocalDateTime submittedAt;
}
