package com.eduspace.roomservice.model.dto.response;

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
public class ExtraServiceResponse {

    Integer id;
    Integer propertyId;
    String name;
    String description;
    Long price;
    String priceUnit;
    String status;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
}
