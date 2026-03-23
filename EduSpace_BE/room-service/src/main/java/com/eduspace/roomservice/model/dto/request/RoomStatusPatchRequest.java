package com.eduspace.roomservice.model.dto.request;

import com.eduspace.roomservice.common.enums.RoomStatus;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RoomStatusPatchRequest {

    RoomStatus status;
}
