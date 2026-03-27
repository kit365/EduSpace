package com.eduspace.roomservice.persistence.repository;

import com.eduspace.roomservice.model.entity.RoomCategoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoomCategoryRepository extends JpaRepository<RoomCategoryEntity, Integer> {
    Optional<RoomCategoryEntity> findByNameVi(String name);
    Optional<RoomCategoryEntity> findBySlug(String slug);
    boolean existsBySlug(String slug);
    List<RoomCategoryEntity> findByIsFeaturedTrue();
}
