package com.eduspace.roomservice.model.dto.response;

import com.eduspace.roomservice.common.enums.PropertyStatus;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PropertyResponse {

    Integer id;
    String ownerId;
    String name;
    String propertyType;
    String contactPhone;
    String contactEmail;
    String provinceCode;
    String districtCode;
    String wardCode;
    String addressDetail;
    String logo;
    String description;
    PropertyStatus status;
    String rejectionNote;
    LocalDateTime submittedAt;
    String approvedBy;
    LocalDateTime approvedAt;
}
