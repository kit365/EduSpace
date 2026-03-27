package com.eduspace.accountservice.persistence.repository;

import com.eduspace.accountservice.model.entity.HostPartnerApplicationEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface HostPartnerApplicationRepository extends JpaRepository<HostPartnerApplicationEntity, UUID> {

    Optional<HostPartnerApplicationEntity> findByUserIdAndStatus(String userId, com.eduspace.accountservice.common.enums.PartnerAppStatus status);

    List<HostPartnerApplicationEntity> findByStatusOrderByCreatedAtDesc(com.eduspace.accountservice.common.enums.PartnerAppStatus status);

    List<HostPartnerApplicationEntity> findByUserIdAndStatusOrderByCreatedAtDesc(
            String userId, com.eduspace.accountservice.common.enums.PartnerAppStatus status);

    Optional<HostPartnerApplicationEntity> findFirstByUserIdOrderByCreatedAtDesc(String userId);

    long countByStatus(com.eduspace.accountservice.common.enums.PartnerAppStatus status);
}
