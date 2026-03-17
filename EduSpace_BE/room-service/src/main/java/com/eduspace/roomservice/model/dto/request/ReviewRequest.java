package com.eduspace.roomservice.model.dto.request;

import com.eduspace.roomservice.common.enums.ReviewStatus;
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
public class ReviewRequest {

    Integer roomId;
    String authorId;
    Integer bookingId;
    Short rating;
    String comment;
    ReviewStatus status;
    String reply;
    java.time.LocalDateTime replyAt;
}
