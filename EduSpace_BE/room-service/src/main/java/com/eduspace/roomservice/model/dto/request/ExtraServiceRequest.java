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
public class ExtraServiceRequest {

    Integer propertyId;
    String name;
    String description;
    Long price;
    String priceUnit; // PER_DAY, PER_HOUR, PER_STAY
    String status;    // ACTIVE, INACTIVE
}
