package com.eduspace.roomservice.persistence.repository;

import com.eduspace.roomservice.model.entity.RoomEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RoomRepository extends JpaRepository<RoomEntity, Integer> {

    List<RoomEntity> findByProperty_Id(Integer propertyId);

    Optional<RoomEntity> findBySlug(String slug);
}
