package com.eduspace.roomservice.business.service;

import com.eduspace.roomservice.model.dto.request.ReviewRequest;
import com.eduspace.roomservice.model.dto.response.ReviewResponse;
import java.util.List;

public interface ReviewService {

    List<ReviewResponse> getAll();

    List<ReviewResponse> getByRoomId(Integer roomId);

    ReviewResponse getById(Integer id);

    ReviewResponse create(ReviewRequest request);

    ReviewResponse update(Integer id, ReviewRequest request);

    void deleteById(Integer id);
}
