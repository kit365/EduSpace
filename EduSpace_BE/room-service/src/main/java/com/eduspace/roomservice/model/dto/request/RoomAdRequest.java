package com.eduspace.roomservice.model.dto.request;

import com.eduspace.roomservice.common.enums.RoomAdStatus;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RoomAdRequest {

    Integer roomId;
    Integer adsPackageId;
    String ownerId;
    Integer transactionId;
    LocalDate startDate;
    LocalDate endDate;
    Long paidAmount;
    RoomAdStatus status;
}
