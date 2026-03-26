package com.eduspace.roomservice.model.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RoomCategoryResponse {
    Integer id;
    String name;
    String slug;
    String description;
    String image;
    String imageAlt;
    Boolean isFeatured;
    Integer position;
}
