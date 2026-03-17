package com.eduspace.roomservice.persistence.repository;

import com.eduspace.roomservice.model.entity.ReviewEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReviewRepository extends JpaRepository<ReviewEntity, Integer> {

    List<ReviewEntity> findByRoom_Id(Integer roomId);
}
