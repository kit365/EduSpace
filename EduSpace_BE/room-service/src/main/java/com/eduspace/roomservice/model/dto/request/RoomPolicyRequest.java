package com.eduspace.roomservice.model.dto.request;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
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
@JsonIgnoreProperties(ignoreUnknown = true)
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RoomPolicyRequest {
    String nameVi;
    String nameEn;
    String descriptionVi;
    String descriptionEn;
    String logo;
    String logoAltVi;
    String logoAltEn;
    Integer position;
}
