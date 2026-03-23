package com.eduspace.roomservice.model.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoomCategoryRequest {
    private String nameVi;
    private String nameEn;
    private String descriptionVi;
    private String descriptionEn;
    private String image;
    private String imageAltVi;
    private String imageAltEn;
    private Boolean isFeatured;
    private Integer position;
}
