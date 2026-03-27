package com.eduspace.roomservice.model.dto.request;

import com.eduspace.roomservice.common.enums.PriceUnit;
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
public class ExtraServiceRequest {

    Integer propertyId;
    String nameVi;
    String nameEn;
    String descriptionVi;
    String descriptionEn;
    Long price;
    PriceUnit priceUnit;
    String status;    // ACTIVE, INACTIVE
}
