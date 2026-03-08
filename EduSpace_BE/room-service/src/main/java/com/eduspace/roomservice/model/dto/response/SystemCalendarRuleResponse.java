package com.eduspace.roomservice.model.dto.response;

import com.eduspace.roomservice.common.enums.BlockType;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SystemCalendarRuleResponse {

    Integer id;
    String name;
    LocalDate startDate;
    LocalDate endDate;
    BigDecimal commissionRate;
    BigDecimal priceModifierRate;
    BlockType blockType;
    Integer createdBy;
}
