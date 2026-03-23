package com.eduspace.roomservice.model.dto.request;

import com.eduspace.roomservice.common.enums.AmenityType;
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
public class AmenityRequest {

    String nameVi;
    String nameEn;
    String icon;
    AmenityType type;
    Integer position;
}
