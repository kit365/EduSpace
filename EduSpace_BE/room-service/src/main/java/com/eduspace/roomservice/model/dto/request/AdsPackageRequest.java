package com.eduspace.roomservice.model.dto.request;

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
public class AdsPackageRequest {

    String nameVi;
    String nameEn;
    String descriptionVi;
    String descriptionEn;
    Integer durationDays;
    Long price;
    AdsPackageStatus status;
}
