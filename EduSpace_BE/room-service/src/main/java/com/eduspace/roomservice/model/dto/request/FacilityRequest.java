package com.eduspace.roomservice.model.dto.request;

import com.eduspace.roomservice.common.enums.FacilityStatus;
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
public class FacilityRequest {

    Integer ownerId;
    String name;
    String identityCode;
    String verificationImages;
    String contactPhone;
    String contactEmail;
    String address;
    String logo;
    String description;
    FacilityStatus status;
    String rejectionNote;
    LocalDateTime submittedAt;
    Integer approvedBy;
    LocalDateTime approvedAt;
}
