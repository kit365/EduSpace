package com.eduspace.accountservice.persistence.repository;

import com.eduspace.accountservice.model.entity.HostStaffLinkEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HostStaffLinkRepository extends JpaRepository<HostStaffLinkEntity, Long> {

    List<HostStaffLinkEntity> findAllByHostUserIdOrderByCreatedAtAsc(String hostUserId);

    Optional<HostStaffLinkEntity> findByStaffUserId(String staffUserId);

    boolean existsByStaffUserId(String staffUserId);
}
