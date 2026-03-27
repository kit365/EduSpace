package com.eduspace.accountservice.persistence.repository;

import com.eduspace.accountservice.model.entity.ActivityLogEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLogEntity, Long>, JpaSpecificationExecutor<ActivityLogEntity> {
}
