package com.eduspace.roomservice.model.dto.request;

import com.eduspace.roomservice.common.enums.DurationMode;
import java.time.LocalDate;
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
public class RoomPricingQuoteRequest {
    Long slotId;
    LocalDate bookingDate;
    Integer durationValue;
    DurationMode durationUnit;
}
