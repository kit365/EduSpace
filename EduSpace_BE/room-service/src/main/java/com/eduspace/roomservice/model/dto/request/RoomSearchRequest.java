package com.eduspace.roomservice.model.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RoomSearchRequest {
    String keyword;
    String categorySlug;
    Integer minCapacity;
    BigDecimal minPrice;
    BigDecimal maxPrice;
    List<Integer> amenityIds;
    String provinceCode;
    String districtCode;
    String wardCode;

    @Builder.Default
    int page = 1;

    @Builder.Default
    int size = 10;

    @Builder.Default
    String sortBy = "capacity";

    @Builder.Default
    String sortDir = "asc";
}
