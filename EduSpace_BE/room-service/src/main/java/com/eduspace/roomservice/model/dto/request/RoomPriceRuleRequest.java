package com.eduspace.roomservice.model.dto.request;

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
public class RoomPriceRuleRequest {

    Integer minHours;
    Integer maxHours;
    BigDecimal pricePerHour;
    BigDecimal flatPrice;
    String label;
    /**
     * Null or empty: rule applies all days. Otherwise {@code day_of_week} values 2 (Monday) … 8 (Sunday).
     */
    List<Integer> applicableDayOfWeeks;
}
