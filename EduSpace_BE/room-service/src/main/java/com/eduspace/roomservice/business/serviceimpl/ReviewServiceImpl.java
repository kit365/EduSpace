package com.eduspace.roomservice.business.serviceimpl;

import com.eduspace.roomservice.business.service.ReviewService;
import com.eduspace.roomservice.exception.AppException;
import com.eduspace.roomservice.exception.ErrorCode;
import com.eduspace.roomservice.model.dto.request.ReviewRequest;
import com.eduspace.roomservice.model.dto.response.ReviewResponse;
import com.eduspace.roomservice.model.entity.ReviewEntity;
import com.eduspace.roomservice.model.entity.RoomEntity;
import com.eduspace.roomservice.model.mapper.ReviewMapper;
import com.eduspace.roomservice.persistence.repository.ReviewRepository;
import com.eduspace.roomservice.persistence.repository.RoomRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final RoomRepository roomRepository;
    private final ReviewMapper reviewMapper;

    @Override
    public List<ReviewResponse> getAll() {
        return reviewMapper.toResponseList(reviewRepository.findAll());
    }

    @Override
    public List<ReviewResponse> getByRoomId(Integer roomId) {
        return reviewMapper.toResponseList(reviewRepository.findByRoom_Id(roomId));
    }

    @Override
    public ReviewResponse getById(Integer id) {
        ReviewEntity entity = reviewRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.REVIEW_NOT_FOUND));
        return reviewMapper.toResponse(entity);
    }

    @Override
    @Transactional
    public ReviewResponse create(ReviewRequest request) {
        ReviewEntity entity = reviewMapper.toEntity(request);
        if (request.getRoomId() != null) {
            RoomEntity room = roomRepository.findByIdAndDeletedAtIsNull(request.getRoomId())
                    .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));
            entity.setRoom(room);
        }
        return reviewMapper.toResponse(reviewRepository.save(entity));
    }

    @Override
    @Transactional
    public ReviewResponse update(Integer id, ReviewRequest request) {
        ReviewEntity existing = reviewRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.REVIEW_NOT_FOUND));
        reviewMapper.updateEntity(request, existing);
        if (request.getRoomId() != null) {
            RoomEntity room = roomRepository.findByIdAndDeletedAtIsNull(request.getRoomId())
                    .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));
            existing.setRoom(room);
        }
        return reviewMapper.toResponse(reviewRepository.save(existing));
    }

    @Override
    @Transactional
    public void deleteById(Integer id) {
        if (!reviewRepository.existsById(id)) throw new AppException(ErrorCode.REVIEW_NOT_FOUND);
        reviewRepository.deleteById(id);
    }
}
