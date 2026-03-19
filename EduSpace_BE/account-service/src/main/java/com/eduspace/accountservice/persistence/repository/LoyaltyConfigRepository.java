package com.eduspace.accountservice.persistence.repository;

import com.eduspace.accountservice.model.entity.LoyaltyConfigEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LoyaltyConfigRepository extends JpaRepository<LoyaltyConfigEntity, Long> {
}
