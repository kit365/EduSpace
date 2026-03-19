package com.eduspace.accountservice.persistence.repository;

import com.eduspace.accountservice.model.entity.RewardCatalogEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RewardCatalogRepository extends JpaRepository<RewardCatalogEntity, Long> {
}
