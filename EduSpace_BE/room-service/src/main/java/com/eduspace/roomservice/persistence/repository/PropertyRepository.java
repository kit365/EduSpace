package com.eduspace.roomservice.persistence.repository;

import com.eduspace.roomservice.model.entity.PropertyEntity;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PropertyRepository extends JpaRepository<PropertyEntity, Integer> {

    List<PropertyEntity> findAllByDeletedFalse();
}
