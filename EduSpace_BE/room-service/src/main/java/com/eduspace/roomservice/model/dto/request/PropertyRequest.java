package com.eduspace.roomservice.model.dto.request;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PropertyRequest {

    String ownerId;
    String name;
    String propertyType; // COMMERCIAL_BUILDING, CENTER_COWORKING, INDEPENDENT_SPACE
    String contactPhone;
    String contactEmail;
    String provinceCode;
    String districtCode;
    String wardCode;
    String addressDetail;
    String logo;
    String description;
}
