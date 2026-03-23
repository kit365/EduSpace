package com.eduspace.roomservice.model.dto.response;

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
public class AmenityResponse {

    Integer id;
    String name;
    String icon;
    AmenityType type;
    Integer position;
}
