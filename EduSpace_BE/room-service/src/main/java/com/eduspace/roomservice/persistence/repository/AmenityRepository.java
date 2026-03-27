package com.eduspace.roomservice.persistence.repository;

import com.eduspace.roomservice.model.entity.AmenityEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AmenityRepository extends JpaRepository<AmenityEntity, Integer> {
    Optional<AmenityEntity> findByNameVi(String name);
}
