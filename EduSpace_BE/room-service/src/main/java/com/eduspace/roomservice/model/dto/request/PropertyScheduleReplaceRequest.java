package com.eduspace.roomservice.model.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
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
public class PropertyScheduleReplaceRequest {

    @NotNull
    @Min(0)
    @Max(1440)
    Integer bufferMinutes;

    @NotNull
    Boolean isOverDay;

    @NotNull
    @Size(min = 7, max = 7)
    @Valid
    List<RoomScheduleItemRequest> schedules;
}
