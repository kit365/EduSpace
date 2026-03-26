package com.eduspace.roomservice.model.dto.response;

import java.math.BigDecimal;
import java.util.List;
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
public class RoomPriceRuleResponse {

    Integer id;
    Integer minHours;
    Integer maxHours;
    BigDecimal pricePerHour;
    BigDecimal flatPrice;
    String label;
    /** Empty = applies every day (not restricted). */
    List<Integer> applicableDayOfWeeks;
}
