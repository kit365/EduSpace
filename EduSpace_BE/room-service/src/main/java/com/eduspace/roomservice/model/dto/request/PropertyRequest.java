package com.eduspace.roomservice.model.dto.request;

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
public class PropertyRequest {

    String ownerId;
    String name;
    String propertyType; // HOTEL, HOMESTAY, APARTMENT, PRIVATE_ROOM
    String contactPhone;
    String contactEmail;
    String address;
    String logo;
    String description;
    PropertyStatus status;
    String rejectionNote;
    LocalDateTime submittedAt;
    String approvedBy;
    LocalDateTime approvedAt;
}
