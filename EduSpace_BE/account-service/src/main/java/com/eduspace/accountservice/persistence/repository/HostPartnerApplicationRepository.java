package com.eduspace.accountservice.persistence.repository;

import com.eduspace.accountservice.common.enums.HostPartnerApplicationStatus;
import com.eduspace.accountservice.model.entity.HostPartnerApplicationEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface HostPartnerApplicationRepository extends JpaRepository<HostPartnerApplicationEntity, UUID> {

    Optional<HostPartnerApplicationEntity> findByUserIdAndStatus(String userId, HostPartnerApplicationStatus status);

    List<HostPartnerApplicationEntity> findByStatusOrderByCreatedAtDesc(HostPartnerApplicationStatus status);

    List<HostPartnerApplicationEntity> findByUserIdAndStatusOrderByCreatedAtDesc(
            String userId, HostPartnerApplicationStatus status);
}
