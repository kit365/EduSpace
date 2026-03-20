package com.eduspace.roomservice.model.dto.response;

import com.eduspace.roomservice.common.enums.ReviewStatus;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ReviewResponse {

    Integer id;
    Integer roomId;
    String authorId;
    Integer bookingId;
    Short rating;
    String comment;
    ReviewStatus status;
    String reply;
    LocalDateTime replyAt;
}
