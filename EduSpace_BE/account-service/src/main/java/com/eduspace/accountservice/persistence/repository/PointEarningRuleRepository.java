package com.eduspace.accountservice.persistence.repository;

import com.eduspace.accountservice.model.entity.PointEarningRuleEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PointEarningRuleRepository extends JpaRepository<PointEarningRuleEntity, Long> {
    Optional<PointEarningRuleEntity> findByActionName(String actionName);
}
