package com.eduspace.roomservice.model.dto.response;

import com.eduspace.roomservice.common.enums.AdsPackageStatus;
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
public class AdsPackageResponse {

    Integer id;
    String name;
    String description;
    Integer durationDays;
    Long price;
    AdsPackageStatus status;
}
