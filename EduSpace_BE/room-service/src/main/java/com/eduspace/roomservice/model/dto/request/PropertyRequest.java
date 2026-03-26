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

    @com.fasterxml.jackson.annotation.JsonAlias("name")
    String nameVi;

    String nameEn;

    String propertyType; // COMMERCIAL_BUILDING, CENTER_COWORKING, INDEPENDENT_SPACE
    String contactPhone;
    String contactEmail;
    String provinceCode;
    String districtCode;
    String wardCode;

    @com.fasterxml.jackson.annotation.JsonAlias("addressDetail")
    String addressDetailVi;

    String addressDetailEn;
    java.math.BigDecimal latitude;
    java.math.BigDecimal longitude;
    String logo;
    @com.fasterxml.jackson.annotation.JsonAlias("logoAlt")
    String logoAltVi;

    String logoAltEn;

    @com.fasterxml.jackson.annotation.JsonAlias("description")
    String descriptionVi;

    String descriptionEn;
}
