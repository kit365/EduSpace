package com.eduspace.roomservice.persistence.repository;

import com.eduspace.roomservice.model.entity.ExtraServiceEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ExtraServiceRepository extends JpaRepository<ExtraServiceEntity, Integer> {

    List<ExtraServiceEntity> findByProperty_Id(Integer propertyId);
}
