package com.eduspace.roomservice.persistence.repository;

import com.eduspace.roomservice.model.entity.AmenityEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AmenityRepository extends JpaRepository<AmenityEntity, Integer> {
}
