package com.eduspace.roomservice.persistence.repository;

import com.eduspace.roomservice.model.entity.FacilityEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FacilityRepository extends JpaRepository<FacilityEntity, Integer> {
}
